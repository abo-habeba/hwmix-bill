<script setup>
import { login } from '@/services/api';
import logo from '@images/logo.svg?raw';
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.query.sessionExpired === '1') {
    toast.error('انتهت صلاحية الجلسة الحالية. الرجاء تسجيل الدخول من جديد.');
  }
});

const form = ref({
  login: '',
  password: '',
  remember: false,
});
const errMessages = ref(false);

function logind() {
  errMessages.value = false;
  if (!form.value.login || !form.value.password) {
    toast.error('جميع الحقول مطلوبة');
    errMessages.value = 'جميع الحقول مطلوبة';
    return;
  }
  login('login', form.value, true)
    .then(() => {
      router.push('/dashboard');
    })
    .catch(e => {
      console.log(e);

      let msg = e?.message || 'فشل تسجيل الدخول، تحقق من البيانات';
      if (e?.response?.status === 422) {
        msg = 'بيانات الدخول غير صحيحة';
      } else if (e?.response?.status === 429) {
        msg = 'عدد محاولات الدخول كبير، يرجى المحاولة لاحقاً';
      } else if (e?.response?.status === 500) {
        msg = 'خطأ في الخادم، حاول لاحقاً';
      }
      errMessages.value = msg;
      toast.error(msg);
    });
}

const isPasswordVisible = ref(false);
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <RouterLink to="/" class="d-flex align-center gap-3">
          <!-- eslint-disable vue/no-v-html -->
          <div class="d-flex" v-html="logo" />
        </RouterLink>
      </VCardItem>

      <VCardText class="pt-2">
        <h4 class="text-h4 mb-1 text-center">مرحبا بك في هونكس 👋🏻</h4>
        <p class="mb-0 text-center">قم بتسجيل الدخول لبدا الاستخدام</p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- login -->
            <VCol cols="12">
              <v-alert v-if="errMessages" color="#C51162" theme="dark" border>
                {{ errMessages }}
              </v-alert>
            </VCol>
            <VCol cols="12">
              <VTextField v-model="form.login" label="الهاتف او الايميل" />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="الباسورد"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                @keyup.enter="logind"
              />

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap my-6">
                <VCheckbox v-model="form.remember" label=" تذكرني " />

                <a class="text-primary" href="javascript:void(0)"> هل نسيت كلمة السر ؟ </a>
              </div>

              <!-- login button -->
              <VBtn block type="submit" @click="logind"> دخول </VBtn>
            </VCol>

            <!-- create account -->
            <VCol cols="12" class="text-center text-base">
              <span> لسة جديد ؟</span>
              <RouterLink class="text-primary ms-2" to="/register"> اعمل حساب من هنا </RouterLink>
            </VCol>

            <VCol cols="12" class="d-flex align-center">
              <!-- <VDivider />
              <span class="mx-4">or</span>
              <VDivider /> -->
            </VCol>

            <!-- auth providers -->
            <VCol cols="12" class="text-center">
              <!-- <AuthProvider /> -->
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>
<style scoped>
.auth-wrapper {
  height: 100vh;
}
</style>
<!-- <style lang="scss">
/* stylelint-disable-next-line @stylistic/string-quotes */
@use '@core/scss/template/pages/page-auth';
</style> -->
