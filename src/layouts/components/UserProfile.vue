<script setup>
import { logOut } from '@/services/api';
import { useUserStore } from '@/stores/user';
import avatar1 from '@images/avatars/avatar-1.png';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import { useTheme } from 'vuetify';
import { computed } from 'vue';

const userStore = useUserStore();
function logout() {
  logOut('logout', true, true);
}
const themes = [
  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
];

// استخدم Vuetify theme controller
const theme = useTheme();

// لتتبع الثيم الحالي
const currentThemeIndex = ref(theme.global.name.value === 'dark' ? 1 : 0);

const currentThemeName = computed(() => themes[currentThemeIndex.value].name);
function changeTheme() {
  currentThemeIndex.value = currentThemeIndex.value === 0 ? 1 : 0;
  theme.global.name.value = themes[currentThemeIndex.value].name;
}
</script>

<template>
  <VBadge class="ma-3" v-if="userStore.user" dot location="bottom right" offset-x="3" offset-y="3" color="success" bordered>
    <VAvatar class="cursor-pointer" color="primary" variant="tonal">
      <VImg :src="userStore.user.avatar_url" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem to="/edit-profile">
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                  <VAvatar color="primary" variant="tonal">
                    <VImg :src="userStore.user.avatae_url" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold"> <span class="pl-5"> الكود </span> {{ userStore.user.id }} </VListItemTitle>
            <VListItemTitle class="font-weight-semibold"> {{ userStore.user.nickname }} </VListItemTitle>
            <VListItemSubtitle>{{ userStore.user.email }}</VListItemSubtitle>
            <VListItemTitle> <span>الرصيد </span>{{ userStore.user.balance }}</VListItemTitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Theme Switcher -->
          <VListItem link @click="changeTheme">
            <template #prepend>
              <VIcon class="me-2" :icon="themes[currentThemeIndex].icon" size="22" />
            </template>

            <VListItemTitle>
              <VTooltip activator="parent" open-delay="1000" scroll-strategy="close">
                <span class="text-capitalize">{{ currentThemeName }}</span>
              </VTooltip>
            </VListItemTitle>
          </VListItem>

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon class="me-2" icon="ri-user-line" size="22" />
            </template>

            <VListItemTitle>Profile</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon class="me-2" icon="ri-settings-4-line" size="22" />
            </template>

            <VListItemTitle>Settings</VListItemTitle>
          </VListItem>

          <!-- 👉 Pricing -->
          <VListItem link>
            <template #prepend>
              <VIcon class="me-2" icon="ri-money-dollar-circle-line" size="22" />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
          </VListItem>

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon class="me-2" icon="ri-question-line" size="22" />
            </template>

            <VListItemTitle>FAQ</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem to="/login">
            <template #prepend>
              <VIcon class="me-2" icon="ri-logout-box-r-line" size="22" />
            </template>

            <VListItemTitle @click="logout">تسجيل خروج</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
