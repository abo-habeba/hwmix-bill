<script setup>
import { getOne, saveItem, getAll } from '@/services/api';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import UsersEditUserRolse from '../../components/users/UsersEditUserRolse.vue';
import RoleDetails from '@/components/roles/RoleDetails.vue';
import { useUserStore } from '@/stores/user';
import PhoneNumberInput from '@/components/users/PhoneNumberInput.vue';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(null);
const roles = ref([]);
const companyIds = ref([]);
const selectedCompanies = ref([]);
const allCompanies = ref([]);
const userStore = useUserStore();
const roleDetail = ref(null);
const userForm = ref(null); // إضافة مرجع للقالب للوصول إلى مكون VForm
console.log('selectedCompanies init:', selectedCompanies.value);

const tabs = [
  { title: 'بيانات الحساب', icon: 'ri-group-line', tab: 'account' },
  { title: 'الادوار و الصلاحيات', icon: 'ri-lock-line', tab: 'role' },
];

const user = ref({
  full_name: '',
  nickname: '',
  email: '',
  phone: '',
  username: '',
  roles: [],
  companies: [],
  company_id: null,
  company_ids: [],
  password: '',
});

const tab = ref(route.params.tab || tabs[0].tab);
const userFormValid = ref(false); // حالة صحة النموذج

// قواعد التحقق
const nicknameRules = [v => !!v || 'اسم الشهرة مطلوب'];
const phoneRules = [v => !!v || 'رقم الهاتف مطلوب'];
const companiesRules = [v => (Array.isArray(v) && v.length > 0) || 'حدد شركة واحدة على الأقل'];
const emailRules = [v => !v || /.+@.+\..+/.test(v) || 'البريد الإلكتروني يجب أن يكون صالحًا'];
const passwordRules = [v => !!v || 'كلمة المرور مطلوبة', v => v.length >= 6 || 'كلمة المرور يجب أن لا تقل عن 6 أحرف'];
const selectedImage = ref(null);
const imagePreview = ref(null);

watch(
  () => userStore.user,
  val => {
    if (val) {
      mergedCompanies();
    }
  },
  { immediate: true }
);
watch(
  () => route.params.id,
  newId => {
    if (newId) {
      userId.value = newId;
      loadUserData();
    } else {
      user.value.password = '12345678';
      loading.value = false;
      user.value.customer_type = 'retail';
    }
  },
  { immediate: true }
);

function loadUserData() {
  loading.value = true;

  getAll('roles', { per_page: -1 }, false, false, false)
    .then(data => {
      roles.value = data;
      console.log('roles', roles.value);

      // loading.value = false; // لا حاجة لتعطيل هنا، سيتم تعطيله في finally
    })
    .catch(() => {
      roles.value = [];
    });

  getOne('user', userId.value)
    .then(res => {
      user.value = res.data;
      console.log('user ', res);
      console.log('user.value.companies:', user.value);
      if (user.value.avatar_url) {
        imagePreview.value = user.value.avatar_url;
      }
      mergedCompanies();
    })
    .finally(() => {
      loading.value = false;
    });
}

function mergedCompanies() {
  const currentUserCompanyIds = new Set((userStore.user?.companies || []).map(c => c.id));

  // أولًا: شركات المستخدم اللي بيتعدل، ونعلم الغير مملوكه بـ disabled: true
  const modifiedUserCompanies = (user.value.companies || []).map(c => ({
    ...c,
    disabled: !currentUserCompanyIds.has(c.id),
  }));

  // ثانيًا: شركات المستخدم الحالي، كلها متاحة (disabled: false)
  const currentUserCompanies = (userStore.user?.companies || []).map(c => ({
    ...c,
    disabled: false,
  }));

  // ندمج بحيث نسخة المستخدم الحالي تغلب
  const combined = [...modifiedUserCompanies, ...currentUserCompanies];

  // إزالة التكرار بناءً على ID (آخر نسخة تغلب = نسخة المستخدم الحالي)
  const uniqueCompanies = Array.from(new Map(combined.map(c => [c.id, c])).values());

  allCompanies.value = uniqueCompanies;

  // اختيار الشركات اللي كانت موجودة أصلًا عند المستخدم المعدل
  selectedCompanies.value = uniqueCompanies.filter(c => (user.value.companies || []).some(u => u.id === c.id));

  return uniqueCompanies;
}

function itemProps(item) {
  console.log('itemProps →', item);
  return {
    title: item.name,
    subtitle: item.field,
    disabled: item.disabled,
  };
}

async function sendData() {
  const { valid } = await userForm.value.validate(); // تحقق من صحة النموذج قبل الإرسال
  if (!valid) return; // إذا لم يكن النموذج صالحًا، لا ترسل البيانات

  companyIds.value = Array.from(
    selectedCompanies.value.map(company => {
      if (typeof company === 'object' && company.id !== undefined) return company.id;
      return company;
    })
  );
  user.value.company_id = companyIds.value.length <= 0 ? userStore.user.company_id : companyIds.value[0];
  user.value.company_ids = companyIds.value.length > 0 ? companyIds.value : [];
  user.value.companies = null;
  delete user.value.roles;
  delete user.value.permissions;
  console.log('user to save:', user.value);
  console.log('selectedImageIds to save:', selectedImageIds.value);
  if (Array.isArray(selectedImageIds.value) && selectedImageIds.value.length > 0) {
    user.value.images_ids = selectedImageIds.value;
  } else {
    delete user.value.images_ids;
  }
  console.log('selectedImageIds to save:', selectedImageIds.value);
  console.log('user to save:', user.value);

  console.log('user to save:', user.value);
  saveItem('user', user.value, route.params.id).then(() => {
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
import ImagePickerDialog from '@/components/images/ImagePickerDialog.vue';
const showImageDialog = ref(false);
const selectedImageIds = ref([]);

const onImagesSelected = image => {
  if (image) {
    selectedImage.value = image;
    selectedImageIds.value = [image.id];
    imagePreview.value = image.url;
  } else {
    // في حالة عدم اختيار أي صورة
    selectedImage.value = null;
    selectedImageIds.value = null;
    // يمكنك هنا إبقاء الشعار القديم أو مسحه
    // imagePreview.value = null;
  }
};
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
                <VForm class="mt-6" ref="userForm" v-model="userFormValid">
                  <VRow>
                    <VCol sm="6" md="4" cols="12">
                      <VTextField v-model="user.full_name" label="الاسم بالكامل" />
                    </VCol>

                    <VCol sm="6" md="4" cols="12">
                      <VTextField required v-model="user.nickname" label=" اسم الشهرة " :rules="nicknameRules" />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <PhoneNumberInput
                        :label="'رقم الهاتف'"
                        :placeholder="'0123456789'"
                        :initialPhoneNumber="user.phone"
                        @update:phoneNumber="val => (user.phone = val)"
                        :rules="phoneRules"
                        required
                      />
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <VTextField v-model="user.username" label="اسم المستخدم" placeholder="اسم المستخدم" />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <v-select
                        v-model="user.customer_type"
                        :items="[
                          { value: 'retail', title: 'عميل قطاعي' },
                          { value: 'wholesale', title: 'عميل جملة ' },
                        ]"
                        label="نوع العميل"
                        item-title="title"
                        item-value="value"
                        clearable
                      />
                    </VCol>
                    <VCol cols="12">
                      <v-select
                        v-if="allCompanies"
                        v-model="selectedCompanies"
                        :items="allCompanies"
                        label="حدد شركة علي الاقل"
                        item-title="name"
                        item-value="id"
                        item-color="red"
                        chips
                        multiple
                        closable-chips
                        :item-props="itemProps"
                        return-object
                        required
                      ></v-select>
                    </VCol>

                    <VCol cols="12" sm="6" md="4">
                      <div v-if="imagePreview">
                        <v-img :src="imagePreview" class="mb-2" aspect-ratio="1" cover></v-img>
                      </div>
                      <v-col cols="12">
                        <ImagePickerDialog v-model="showImageDialog" @close="onImagesSelected" button-text="الصورة الشخصية " />
                      </v-col>
                    </VCol>
                    <v-divider style="width: 50%" :thickness="2" class="border-opacity-100" color="warning"></v-divider>
                    <VCol cols="12" sm="6" md="4">
                      <VTextField
                        :required="!route.params.id"
                        v-model="user.password"
                        label=" الباسورد "
                        :rules="!route.params.id ? passwordRules : []"
                      />
                    </VCol>
                    <VCol cols="12" class="d-flex flex-wrap gap-4">
                      <VBtn :disabled="!userFormValid" :class="{ 'forbidden-cursor': !userFormValid }" @click="sendData"> حفظ </VBtn>
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
  /* background-color: white !important; */
  color: #8c57ff47 !important;
}
</style>
