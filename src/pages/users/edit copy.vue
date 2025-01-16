<script setup>
import { getOne, saveItem, getAll } from '@/services/api';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import editUserRolse from '../../components/users/editUserRolse.vue';
import RoleDetails from '@/components/roles/RoleDetails.vue';
import { useUserStore } from '@/stores/user';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const roles = ref(null);
const companyIds = ref([]);
const userCompanies = ref([]);
const userStore = useUserStore();
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
        userCompanies.value = user.value.companies;
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
  companyIds.value = user.value.companies.map(company => company.id);
  user.value.company_id = companyIds.value.length <= 0 ? null : companyIds.value[0];
  user.value.company_ids = companyIds.value.length > 0 ? companyIds.value : null;

  saveItem('user', user.value, route.params.id).then(() => {
    router.go(-1);
  });
}

const userRole = ref({});
function openRoleDetails(role) {
  if (role) {
    userRole.value = role;
    roleDetail.value.openDialog();
  }
}

// إنشاء قائمة مُصفاة تجمع بين الشركات
const filteredCompanies = computed(() => {
  const allCompanies = [...userCompanies.value, ...userStore.user.companies];
  const uniqueCompanies = allCompanies.filter((company, index, self) => self.findIndex(c => c.id === company.id) === index);
  return uniqueCompanies;
});

// تحديد الشركات القابلة للتعديل
const isCompanyEditable = company => {
  return userStore.user.companies.some(c => c.id === company.id);
};

// تحديث v-model ليعكس الشركات المحددة
const selectedCompanies = computed({
  get: () => userCompanies.value,
  set: value => {
    userCompanies.value = value.filter(company => userStore.user.companies.some(c => c.id === company.id));
  },
});
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

                    <VCol cols="12" sm="6" md="4">
                      <v-select
                        v-model="selectedCompanies"
                        :items="filteredCompanies"
                        label="حدد الشركة"
                        item-title="name"
                        item-value="id"
                        multiple
                        persistent-hint
                        :readonly="!isCompanyEditable(company)"
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
