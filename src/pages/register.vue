<script setup>
import { saveItem } from '@/services/api'
import logo from '@images/logo.svg?raw'

import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  first_name: '',
  email: '',
  password: '',
})

function registerd() {
  saveItem('register', form.value).then(data => {
    console.log(data)
    localStorage.setItem('authToken', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    router.push('/dashboard')
  })
}

const isPasswordVisible = ref(false)
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <RouterLink
          to="/"
          class="d-flex align-center gap-3"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="d-flex"
            v-html="logo"
          />
        </RouterLink>
      </VCardItem>
      <VCardText class="pt-2">
        <h4 class="text-h4 mb-1">انشئ حسابك الان 🚀</h4>
      </VCardText>

      <VForm>
        <VRow>
          <!-- first_name -->
          <VCol cols="12">
            <VTextField
              v-model="form.first_name"
              label="الاسم الاول"
              placeholder=" مثلا  ' هشام '  "
            />
          </VCol>
          <!-- email -->
          <VCol cols="12">
            <VTextField
              v-model="form.email"
              label="الايميل"
              placeholder="johndoe@email.com"
              type="email"
            />
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
            />
            <div class="d-flex align-center my-6">
              <VCheckbox
                id="privacy-policy"
                v-model="form.privacyPolicies"
                inline
              />
              <VLabel
                for="privacy-policy"
                style="opacity: 1"
              >
                <span class="me-1"> انا موافق على </span>
                <a
                  href="javascript:void(0)"
                  class="text-primary"
                >
                  سياسة الخصوصية & الشروط
                </a>
              </VLabel>
            </div>
            <!-- VBtn registerd -->
            <VBtn
              block
              @click="registerd"
            >
              انشاء حساب
            </VBtn>
          </VCol>

          <!-- login instead -->
          <VCol
            cols="12"
            class="text-center text-base"
          >
            <span> هل لديك حساب بالفعل ؟ </span>
            <RouterLink
              class="text-primary ms-2"
              to="login"
            >
              سجيل الدخول بدلا من ذلك
            </RouterLink>
          </VCol>

          <!-- <VCol
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <span class="mx-4">or</span>
              <VDivider />
            </VCol> -->

          <!-- auth providers -->
          <!-- <VCol
              cols="12"
              class="text-center"
            >
              <AuthProvider />
            </VCol> -->
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>
<style scoped>
.auth-wrapper {
  height: 100vh;
}
</style>
<!-- <style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style> -->
