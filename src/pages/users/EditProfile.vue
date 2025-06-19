<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title> تعديل الملف الشخصي </v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="user.full_name" label="الاسم الكامل" outlined dense required />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="user.nickname" label="الاسم المستعار" outlined dense />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="user.email" label="البريد الإلكتروني" outlined dense required type="email" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="user.phone" label="رقم الهاتف" outlined dense required type="tel" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="user.username" label="اسم المستخدم" outlined dense />
            </v-col>
            <v-col cols="12" sm="12">
              <v-btn color="primary" @click="togglePasswordEdit" elevation="2" rounded>
                {{ isEditingPassword ? 'عدم تغير كلمة المرور' : 'تعديل كلمة المرور' }}
              </v-btn>
            </v-col>
            <v-divider style="width: 50%" :thickness="2" class="border-opacity-100" color="warning"></v-divider>
            <v-col cols="12" sm="12" style="min-height: 88px">
              <v-col cols="12" sm="12" v-if="isEditingPassword">
                <v-text-field
                  v-model="password"
                  label="كلمة المرور"
                  outlined
                  dense
                  autocomplete="new-password"
                  :rules="[v => !v || v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل']"
                />
              </v-col>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" :disabled="!formValid" @click="saveProfile" elevation="2" rounded> حفظ </v-btn>
        <v-btn color="error" @click="cancelEdit" elevation="2" rounded> إلغاء </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const user = ref({ ...userStore.user });
const password = ref('');
const formRef = ref(null);
const formValid = ref(false);
const isEditingPassword = ref(false);

onMounted(() => {
  user.value = { ...userStore.user };
});

function saveProfile() {
  if (!formRef.value) return;
  formRef.value.validate();
  if (!formValid.value) return;

  const payload = { ...user.value };
  if (password.value) {
    payload.password = password.value;
  }

  saveItem('user', payload, payload.id)
    .then(res => {
      userStore.user = { ...res.data };
    })
    .catch(error => {
      console.error('Error saving user:', error);
    });
}

function cancelEdit() {
  user.value = {
    full_name: '',
    nickname: '',
    email: '',
    phone: '',
    username: '',
  };
}

function togglePasswordEdit() {
  isEditingPassword.value = !isEditingPassword.value;
}
</script>

<style scoped>
.v-container {
  max-width: 800px;
  margin: auto;
}
</style>
