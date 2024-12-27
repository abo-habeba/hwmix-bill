<script setup>
import { getOne, saveItem, getAll } from '@/services/api';
// import { permissionsFile } from '@/@core/utils/permissions';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import editUserRolse from './editUserRolse.vue';
import RoleDetails from '@/components/roles/RoleDetails.vue';
const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const roles = ref(null);

const roleDetail = ref(null);
const tabs = [
  {
    title: 'بيانات الحساب',
    icon: 'ri-group-line',
    tab: 'account',
  },
  {
    title: 'الادوار و الصلاحيات',
    icon: 'ri-lock-line',
    tab: 'role',
  },
];
const user = ref({
  full_name: '',
  nickname: '',
  email: '',
  phone: '',
  username: '',
  password: '',
});
const tab = ref(route.params.tab || tabs[0].tab);

onMounted(() => {
  if (route.params.id) {
    loading.value = true;
    getOne('user', userId.value, true)
      .then(res => {
        user.value = res;
        getAll('roles').then(data => {
          roles.value = data.data;
        });
      })
      .finally(e => {
        loading.value = false;
      });
  }
});
function sendData() {
  saveItem('user', user.value, route.params.id).then(() => {
    router.go(-1);
    // router.push({ name: 'users' });
  });
}

const userRole = ref({});
function openRoleDetails(role) {
  if (role) {
    userRole.value = role;
    roleDetail.value.openDialog();
  }
}
</script>

<template>
  <v-card>
    <v-tabs class="ma-5" v-model="tab" align-tabs="center" color="deep-purple-accent-4">
      <v-tab v-for="(t, i) in tabs" :key="i" :value="t.tab" :append-icon="t.icon"> {{ t.title }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="account">
        <VRow>
          <VCol cols="12">
            <VCard elevation="0" :loading="loading" :title="route.params.id ? 'تعديل المستخدم' : 'اضافة مستخدم'" class="ma-4">
              <VDivider />
              <VCardText>
                <!-- 👉 Form -->
                <VForm class="mt-6">
                  <VRow>
                    <!-- 👉 First Name -->
                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.full_name" label="الاسم بالكامل" />
                    </VCol>

                    <!-- 👉 Name -->
                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.nickname" label=" اسم الشهرة " />
                    </VCol>

                    <!-- 👉 Email -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField required v-model="user.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                    </VCol>
                    <!-- 👉 Phone -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.phone" label=" رقم الهاتف " placeholder="0123456789" />
                    </VCol>

                    <!-- 👉 username -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.username" label="اسم المستخدم" placeholder="اسم المستخدم" />
                    </VCol>

                    <!-- 👉 password -->
                    <VCol v-if="!route.params.id" cols="12" sm="6" md="4">
                      <VTextField required v-model="user.password" label=" الباسورد " placeholder="اسم المستخدم" />
                    </VCol>

                    <!-- 👉 Form Actions -->
                    <VCol cols="12" class="d-flex flex-wrap gap-4">
                      <VBtn @click="sendData"> حفظ </VBtn>
                      <!-- reset Form -->
                      <!-- <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="resetForm"> Reset </VBtn> -->
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </v-tabs-window-item>
      <v-tabs-window-item value="role">
        <v-card elevation="0" class="ma-4">
          <editUserRolse v-if="roles" v-model:user="user" :user="user" :roles="roles" />
          <v-card-title class="text-subtitle-1 py-1 px-4 bg-grey-lighten-4"> ادوار المستخدم </v-card-title>
          <v-card-text v-if="user?.roles.length > 0">
            <span v-for="(rol, index) in user.roles" :key="index">
              <v-chip @click="openRoleDetails(rol)" class="ma-2" variant="outlined">
                {{ rol.name }}
              </v-chip>
            </span>
          </v-card-text>
          <div v-else class="text-subtitle-1 py-1 px-4 bg-grey-lighten-4">لم يتم تعين اي ادوار للمستخدم</div>
        </v-card>
        <RoleDetails ref="roleDetail" :userRole="userRole" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>
