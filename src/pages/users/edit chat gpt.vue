<script setup>
import { getOne, saveItem, getAll } from '@/services/api';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const userCompanies = ref([]);
const userStore = useUserStore();
const companyIds = ref([]);
const user = ref({
  full_name: '',
  nickname: '',
  email: '',
  phone: '',
  username: '',
});

onMounted(() => {
  if (route.params.id) {
    loading.value = true;
    getOne('user', userId.value)
      .then(res => {
        user.value = res;
        userCompanies.value = res.companies;
        getAll('roles').then(data => {
          roles.value = data.data;
        });
      })
      .finally(() => {
        loading.value = false;
      });
  }
});

// Combine companies for regular users and sales users
const availableCompanies = computed(() => {
  return [
    ...userStore.user.companies, // The sales user's companies
    ...userCompanies.value, // The regular user's companies
  ];
});

// Disable selection of companies that do not belong to the current user (sales user restriction)
const isItemDisabled = item => {
  if (userStore.user.role === 'sales') {
    return !userStore.user.companies.some(company => company.id === item.id);
  }
  return false; // No restriction for regular users
};

function sendData() {
  companyIds.value = user.value.companies.map(company => company.id);
  user.value.company_id = companyIds.value.length <= 0 ? null : companyIds.value[0];
  user.value.company_ids = companyIds.value.length > 0 ? companyIds.value : null;

  saveItem('user', user.value, route.params.id).then(() => {
    router.go(-1);
  });
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
                <VForm class="mt-6">
                  <VRow>
                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.full_name" label="الاسم بالكامل" />
                    </VCol>

                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.nickname" label=" اسم الشهرة " />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <VTextField required v-model="user.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.phone" label=" رقم الهاتف " placeholder="0123456789" />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.username" label="اسم المستخدم" placeholder="اسم المستخدم" />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <v-select
                        v-model="userCompanies"
                        :items="availableCompanies"
                        label="حدد الشركة"
                        item-title="name"
                        item-value="id"
                        multiple
                        persistent-hint
                        :item-disabled="isItemDisabled"
                      ></v-select>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>
