<script setup>
import Footer from '@/layouts/components/Footer.vue';
import { useRouter } from 'vue-router';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavItems from '@/layouts/components/NavItems.vue';
import UserProfile from '@/layouts/components/UserProfile.vue';
import { saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import logo from '@images/logo.svg?raw';
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue';
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
const { smAndDown } = useDisplay();
const userStore = ref(useUserStore());
const companiesDialog = ref(false);
const router = useRouter();
const companyId = ref(null);
const errorResponse = ref(companiesDialog.value);
function setCompanies(id) {
  companyId.value = id;
  console.log(id);
  saveItem('change-company', { company_id: companyId.value }, userStore.value.user.id)
    .then(res => {
      location.reload();
    })
    .catch(e => {
      console.log(e.response.data.message);
      if (e.response.data.message == 'The selected company id is invalid.') {
        errorResponse.value = ' ليس لديك حق الوصول لهذه الشركة او ربما تم حذفها ';
      }
    });
}
function openCompaniesDialog() {
  if (userStore.value.user.companies.length >= 1) {
    console.log('if');
    companiesDialog.value = true;
  } else {
    console.log('else');
    router.push({ name: 'home-redirect' });
  }
}
</script>

<template>
  <v-dialog v-model="companiesDialog" max-width="500">
    <VCard class="pa-5">
      <v-alert v-if="errorResponse" border="top" type="warning" variant="outlined" prominent> {{ errorResponse }} </v-alert>
      <v-list-item
        v-for="companie in userStore.user.companies"
        :key="companie.id"
        :prepend-avatar="companie.logo"
        :subtitle="companie.field"
        :title="companie.name"
        @click="userStore.user.companies.length > 1 ? setCompanies(companie.id) : ''"
      ></v-list-item>
    </VCard>
  </v-dialog>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- 👉 Vertical nav toggle in overlay mode -->
        <IconBtn v-if="smAndDown" class="ms-n3 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <!-- 👉 Search -->
        <div class="d-flex align-center cursor-pointer" style="user-select: none">
          <!-- 👉 Search Trigger button -->
          <IconBtn>
            <VIcon icon="ri-search-line" />
          </IconBtn>

          <span class="d-none d-md-flex align-center text-disabled">
            <span class="me-3">Search</span>
          </span>
        </div>

        <VSpacer />
        <IconBtn style="width: fit-content" :to="{ name: 'cashboxs' }">
          <span v-if="userStore.user?.balance" class="d-md-flex align-center">
            <span class="me-3">{{ userStore.user?.balance }}</span>
          </span>
        </IconBtn>
        <VSpacer />
        <IconBtn>
          <VIcon icon="ri-notification-line" />
        </IconBtn>

        <NavbarThemeSwitcher class="me-2" />

        <UserProfile />
      </div>
    </template>

    <template #vertical-nav-header="{ toggleIsOverlayNavActive }">
      <!-- eslint-disable vue/no-v-html -->
      <div class="app-logo app-title-wrapper">
        <div v-if="userStore.user?.company_logo" class="w-100 h-100 image-container">
          <div class="w-100 h-100" @click="openCompaniesDialog">
            <img :src="userStore.user.company_logo" alt="Company Logo" class="responsive-image" />
          </div>
        </div>

        <!-- <RouterLink to="/"> -->
        <div @click="openCompaniesDialog">
          <div v-if="!userStore.user?.company_logo" class="d-flex" v-html="logo" />
        </div>
        <!-- eslint-enable -->
        <!-- </RouterLink> -->
      </div>
      <IconBtn class="d-block d-lg-none" @click="toggleIsOverlayNavActive(false)">
        <VIcon icon="ri-close-line" />
      </IconBtn>
    </template>

    <template #vertical-nav-content>
      <NavItems />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden;
  .responsive-image {
    max-width: 100%;
    max-height: 100%;
    height: auto;
    width: auto;
    object-fit: contain;
  }
}

.app-logo {
  * {
    cursor: pointer;
  }
  display: flex;
  align-items: center;
  // background-color: transparent;
  column-gap: 0.75rem;
  width: 100%;
  height: 55px;

  .app-logo-title {
    // background-color: transparent;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.75rem;
    text-transform: uppercase;
  }
}
</style>
