<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>

<template>
  <!-- 👉 NavGroup -->
  <!-- <VerticalNavGroup
    :item="{
      title: 'المستخدمين',
      badgeContent: '0',
      badgeClass: 'bg-error',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'المستخدمين',
        to: 'users',
        badgeContent: '0',
        badgeClass: 'bg-error',
        icon: 'ri-group-line',
      }"
    />
  </VerticalNavGroup> -->

  <!-- 👉 Apps & Pages -->

  <!-- <VerticalNavSectionTitle
    :item="{
      heading: 'المستخدمين',
    }"
  /> 
 -->

  <VerticalNavLink
    v-if="userStore.user && userStore.can(['users', 'super_admin', 'company_owner'])"
    :item="{
      title: 'المستخدمين',
      to: { name: 'users' },
      icon: 'ri-group-line',
    }"
  />
  <VerticalNavLink
    v-if="userStore.user && userStore.can(['roles', 'super_admin', 'company_owner'])"
    :item="{
      title: 'الصلاحيات والادوار',
      to: { name: 'roles' },
      icon: 'ri-lock-unlock-line',
    }"
  />
  <VerticalNavLink
    v-if="userStore.user && userStore.can(['logs', 'super_admin', 'company_owner'])"
    :item="{
      title: 'سجل النظام',
      to: { name: 'logs' },
      icon: 'ri-file-list-2-line',
    }"
  />
  <VerticalNavLink
    v-if="userStore.user && userStore.can(['companys', 'super_admin', 'company_owner'])"
    :item="{
      title: 'الشركات',
      to: { name: 'companys' },
      icon: 'ri-community-line',
      // icon: 'ri-building-line',
      // icon: 'ri-bank-line',
    }"
  />
  <VerticalNavLink
    v-if="userStore.user && userStore.can(['cashbox', 'super_admin', 'company_owner'])"
    :item="{
      title: 'الخزن',
      to: { name: 'cashboxs' },
      icon: 'ri-currency-line',
    }"
  />
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Account Settings',
      icon: 'ri-user-settings-line',
      to: '/account-settings',
    }"
  /> -->
  <!-- 
  <VerticalNavLink
    :item="{
      title: 'Login',
      icon: 'ri-login-box-line',
      to: '/login',
    }"
  /> -->
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Register',
      icon: 'ri-user-add-line',
      to: '/register',
    }"
  /> -->
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Error',
      icon: 'ri-information-line',
      to: '/no-existence',
    }"
  /> -->

  <!-- 👉 User Interface -->
  <!--    
  <VerticalNavSectionTitle
    :item="{
      heading: 'User Interface',
    }"
  /> -->
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Typography',
      icon: 'ri-text',
      to: '/typography',
    }"
  /> -->
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Icons',
      icon: 'ri-remixicon-line',
      to: '/icons',
    }"
  /> -->
  <!--   
  <VerticalNavLink
    :item="{
      title: 'Cards',
      icon: 'ri-bar-chart-box-line',
      to: '/cards',
    }"
  /> -->

  <!-- 👉 Forms & Tables -->
  <!--    
  <VerticalNavSectionTitle
    :item="{
      heading: 'Forms & Tables',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Form Layouts',
      icon: 'ri-layout-4-line',
      to: '/form-layouts',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Tables',
      icon: 'ri-table-alt-line',
      to: '/tables',
    }"
  /> -->

  <!-- 👉 Others -->
  <!--    
  <VerticalNavSectionTitle
    :item="{
      heading: 'Others',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Documentation',
      icon: 'ri-article-line',
      href: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/',
      target: '_blank',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Raise Support',
      href: 'https://github.com/themeselection/materio-vuetify-vuejs-admin-template-free/issues',
      icon: 'ri-lifebuoy-line',
      target: '_blank',
    }"
  /> -->
</template>
<style lang="scss">
.nav-link {
  a {
    border-bottom: 2px solid #ffffff;
  }
}
</style>
