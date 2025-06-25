<script setup>
import { getOne, saveItem, getAll } from '@/services/api';
// import { permissionsFile } from '@/@core/utils/permissions';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import UsersEditUserRolse from '../../components/users/UsersEditUserRolse.vue';
import RoleDetails from '@/components/roles/RoleDetails.vue';
import { useUserStore } from '@/stores/user';
import PhoneNumberInput from '@/components/users/PhoneNumberInput.vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import translateErrors from '@/utils/translateErrors';
const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const roles = ref([]);
const companyIds = ref([]);
const userCompanies = ref([]);
const selectedCompanies = ref([]);
const allCompanies = ref([]);
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
  roles: [],
  companies: [],
  password: '',
});

const tab = ref(route.params.tab || tabs[0].tab);
const userFormValid = ref(false);

const nicknameRules = [v => !!v || 'اسم الشهرة مطلوب'];
const phoneRules = [v => !!v || 'رقم الهاتف مطلوب'];

onMounted(() => {
  mergedCompanies();
  if (route.params.id) {
    loading.value = true;
    getAll('roles')
      .then(data => {
        roles.value = data.data;
        console.log('roles', roles.value);
      })
      .catch(e => {
        roles.value = [];
      });
    getOne('user', userId.value, true)
      .then(res => {
        user.value = res;
        selectedCompanies.value = res.companies;
      })
      .finally(e => {
        loading.value = false;
      });
  } else {
    // وضع قيمة افتراضية للباسورد في حالة الإضافة فقط
    user.value.password = '12345678';
  }
});

// جمع الشركات من مصدرين مع إضافة خاصية disabled:
function mergedCompanies() {
  const allComp = [
    ...user.value.companies.map(company => ({ ...company, disabled: false })),
    ...userStore.user?.companies.map(company => ({ ...company, disabled: true })),
  ];
  const uniqueCompanies = Array.from(new Map(allComp.map(company => [company.id, company])).values());
  allCompanies.value = uniqueCompanies;
  selectedCompanies.value = allCompanies.value.filter(c => c.id === userStore.user.company_id);
  return uniqueCompanies;
}

function itemProps(item) {
  return {
    title: item.name,
    subtitle: item.field,
    disabled: !item.disabled,
    // class: item.disabled ? '' : 'disabled-item',
  };
}

function sendData() {
  console.log('selectedCompanies', selectedCompanies.value);
  companyIds.value = Array.from(
    selectedCompanies.value.map(company => {
      // إذا كان العنصر كائنًا يحتوي على خاصية id، أرجع قيمة id
      if (typeof company === 'object' && company.id !== undefined) {
        return company.id;
      }
      // إذا كان العنصر رقمًا، أرجع الرقم مباشرة
      return company;
    })
  );
  console.log('companyIds', companyIds.value);
  // return;
  user.value.company_id = companyIds.value.length <= 0 ? null : companyIds.value[0];
  user.value.company_ids = companyIds.value.length > 0 ? companyIds.value : null;
  user.value.companies = null;

  saveItem('user', user.value, route.params.id).then(() => {
    // toast.success(route.params.id ? 'تم تعديل المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
    // تاخير الانتقال للصفحة السابقة
    setTimeout(() => {
      router.go(-1);
    }, 1200);
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
            <VCard elevation="0" :loading="loading" :title="route.params.id ? 'تعديل المستخدم' : 'اضافة مستخدم'"
              class="ma-4">
              <VDivider />
              <VCardText>
                <!-- 👉 Form -->
                <VForm class="mt-6" ref="userForm" v-model="userFormValid">
                  <VRow>
                    <!-- 👉 First Name -->
                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.full_name" label="الاسم بالكامل" />
                    </VCol>

                    <!-- 👉 Name -->
                    <VCol sm="6" md="4" cols="12">
                      <VTextField required v-model="user.nickname" label=" اسم الشهرة " :rules="nicknameRules" />
                    </VCol>

                    <!-- 👉 Email -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                    </VCol>
                    <!-- 👉 Phone -->
                    <VCol cols="12" sm="6" md="4">
                      <PhoneNumberInput :label="'رقم الهاتف'" :placeholder="'0123456789'"
                        :initialPhoneNumber="user.phone" @update:phoneNumber="val => (user.phone = val)"
                        :rules="phoneRules" required />
                    </VCol>

                    <!-- 👉 username -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.username" label="اسم المستخدم" placeholder="اسم المستخدم" />
                    </VCol>
                    <!-- 👉 نوع المستخدم -->
                    <VCol cols="12" sm="6" md="4">
                      <v-select v-model="user.customer_type" :items="[
                        { value: 'retail', title: 'عميل قطاعي' },
                        { value: 'wholesale', title: 'عميل جملة ' },
                      ]" label="نوع العميل" item-title="title" item-value="value" clearable />
                    </VCol>

                    <VCol cols="12">
                      <v-select v-model="selectedCompanies" :items="allCompanies" label="حدد الشركة" item-title="name"
                        item-value="id" item-color="red" chips closable-chips multiple :item-props="itemProps"
                        return-object></v-select>
                    </VCol>

                    <v-divider style="width: 50%" :thickness="2" class="border-opacity-100" color="warning"></v-divider>
                    <!-- 👉 password -->
                    <VCol cols="12" sm="6" md="4">
                      <VTextField required v-model="user.password" label=" الباسورد " placeholder="اسم المستخدم" />
                    </VCol>
                    <!-- 👉 Form Actions -->
                    <VCol cols="12" class="d-flex flex-wrap gap-4">
                      <VBtn :disabled="!userFormValid" :class="{ 'forbidden-cursor': !userFormValid }"
                        @click="sendData"> حفظ </VBtn>
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
          <UsersEditUserRolse v-if="roles && user" v-model:user="user" :user="user" :roles="roles" />
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

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
