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
const userStore = useUserStore(); // ✅ بدون ref
const companiesDialog = ref(false);
const router = useRouter();
const companyId = ref(null);
const errorResponse = ref(null);

function setCompanies(id) {
  companyId.value = id;
  saveItem('change-company', { company_id: companyId.value }, userStore.user.id)
    .then(res => {
      userStore.user = res; // ✅ بيتم استبدال الكائن بالكامل
      companiesDialog.value = false;
    })
    .catch(e => {
      if (e.response.data.message == 'The selected company id is invalid.') {
        errorResponse.value = ' ليس لديك حق الوصول لهذه الشركة او ربما تم حذفها ';
      }
    });
}

function openCompaniesDialog() {
  if (userStore.user.companies.length > 1 && userStore.can('companies.change_active_company')) {
    companiesDialog.value = true;
  } else {
    router.push({ name: 'home-redirect' });
  }
}
</script>

<template>
  <v-dialog v-model="companiesDialog" max-width="500">
    <VCard class="pa-5">
      <v-alert v-if="errorResponse" border="top" type="warning" variant="outlined" prominent>
        {{ errorResponse }}
      </v-alert>
      <v-list-item
        v-for="companie in userStore.user.companies"
        :key="companie.id"
        :prepend-avatar="companie.logo"
        :subtitle="companie.field"
        :title="companie.name"
        @click="setCompanies(companie.id)"
      />
    </VCard>
  </v-dialog>

  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn v-if="smAndDown" class="ms-n3 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <div class="d-flex align-center cursor-pointer" style="user-select: none">
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
        <IconBtn><VIcon icon="ri-notification-line" /></IconBtn>
        <UserProfile />
        <IconBtn to="/dashboard"><VIcon icon="ri-home-4-line" /></IconBtn>
      </div>
    </template>

    <!-- 👉 Vertical nav logo -->
    <template #vertical-nav-header="{ toggleIsOverlayNavActive }">
      <div class="app-logo app-title-wrapper">
        <div v-if="userStore.user?.company_logo" class="w-100 h-100 image-container" @click="openCompaniesDialog">
          <!-- ✅ استخدم :key و ?t= لكسر الكاش -->
          <img
            :src="userStore.user.company_logo + '?t=' + Date.now()"
            :key="userStore.user.company_logo"
            alt="Company Logo"
            class="responsive-image"
          />
        </div>

        <div v-else @click="openCompaniesDialog">
          <div class="d-flex" v-html="logo" />
        </div>
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
  column-gap: 0.75rem;
  width: 100%;
  height: 55px;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.75rem;
    text-transform: uppercase;
  }
}
</style>

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
