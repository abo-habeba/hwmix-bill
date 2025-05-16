<script setup>
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import { useUserStore } from '@/stores/user';
import { ref, watch } from 'vue';

const userStore = useUserStore();
const activeItem = ref(localStorage.getItem('activeNavItem') || '');

watch(activeItem, newValue => {
  if (newValue) {
    localStorage.setItem('activeNavItem', newValue);
  } else {
    localStorage.removeItem('activeNavItem');
  }
});

const navItems = [
  //users
  {
    type: 'link',
    permission: ['users', 'super_admin', 'company_owner'],
    item: {
      title: 'المستخدمين',
      to: { name: 'users' },
      icon: 'ri-group-line',
    },
  },
  //roles
  {
    type: 'link',
    permission: ['roles', 'super_admin', 'company_owner'],
    item: {
      title: 'الصلاحيات والادوار',
      to: { name: 'roles' },
      icon: 'ri-lock-unlock-line',
    },
  },
  //logs
  {
    type: 'link',
    permission: ['logs', 'super_admin', 'company_owner'],
    item: {
      title: 'سجل النظام',
      to: { name: 'logs' },
      icon: 'ri-file-list-2-line',
    },
  },
  //companys
  {
    type: 'link',
    permission: ['companys', 'super_admin', 'company_owner'],
    item: {
      title: 'الشركات',
      to: { name: 'companys' },
      icon: 'ri-community-line',
    },
  },
  // cashboxs
  {
    type: 'link',
    permission: ['cashbox', 'super_admin', 'company_owner'],
    item: {
      title: 'الخزن',
      to: { name: 'cashboxs' },
      icon: 'ri-currency-line',
    },
  },
  // group products
  {
    type: 'group',
    permission: ['products', 'super_admin', 'company_owner'],
    item: {
      title: 'المنتجات',
      icon: 'ri-shopping-bag-3-line',
      children: [
        { title: 'كل المنتجات', to: { name: 'products' }, icon: 'ri-box-3-line' },
        { title: 'نسخ المنتجات', to: { name: 'product-variants' }, icon: 'ri-file-copy-line' },
        { title: 'خصائص نسخ المنتجات', to: { name: 'product-variant-attributes' }, icon: 'ri-equalizer-line' },
        { title: 'الخصائص', to: { name: 'attributes' }, icon: 'ri-settings-3-line' },
        { title: 'قيم الخصائص', to: { name: 'attribute-values' }, icon: 'ri-list-settings-line' },
        { title: 'العلامات التجارية', to: { name: 'brands' }, icon: 'ri-brand-line' },
        { title: 'الاقسام', to: { name: 'categories' }, icon: 'ri-brand-line' },
      ],
    },
  },
  // group invoices
  {
    type: 'group',
    permission: ['super_admin', 'company_owner'],
    item: {
      title: 'الفواتير',
      // to: { path: '/invoice' },
      icon: 'ri-file-list-3-line',
      children: [
        { title: 'الفواتير', to: { name: 'invoice' }, icon: 'ri-file-list-3-line', permission: ['super_admin', 'company_owner'] },
        { title: 'أنواع الفواتير', to: { name: 'invoiceType' }, icon: 'ri-file-settings-line', permission: ['super_admin', 'company_owner'] },
      ],
    },
  },
  // {
  //   type: 'link',
  //   permission: ['warehouses', 'super_admin', 'company_owner'],
  //   item: { title: 'المخازن', to: { name: 'warehouses' }, icon: 'ri-building-line' },
  // },
  // {
  //   type: 'link',
  //   permission: ['stock', 'super_admin', 'company_owner'],
  //   item: { title: 'المخزون', to: { name: 'stock' }, icon: 'ri-archive-line' },
  // },
  // // روابط الفواتير والتقسيط
  // {
  //   type: 'link',
  //   permission: ['super_admin', 'company_owner'],
  //   item: {
  //     title: 'الفواتير',
  //     to: { path: '/invoice' },
  //     icon: 'ri-file-list-3-line',
  //   },
  // },
  // {
  //   type: 'link',
  //   permission: ['super_admin', 'company_owner'],
  //   item: {
  //     title: 'أنواع الفواتير',
  //     to: { path: '/invoiceType' },
  //     icon: 'ri-file-settings-line',
  //   },
  // },
  // {
  //   type: 'link',
  //   permission: ['super_admin', 'company_owner'],
  //   item: {
  //     title: 'المدفوعات',
  //     to: { path: '/payment' },
  //     icon: 'ri-bank-card-line',
  //   },
  // },
  // {
  //   type: 'link',
  //   permission: ['super_admin', 'company_owner'],
  //   item: {
  //     title: 'خطط التقسيط',
  //     to: { path: '/installmentPlan' },
  //     icon: 'ri-calendar-schedule-line',
  //   },
  // },
  // {
  //   type: 'link',
  //   permission: ['super_admin', 'company_owner'],
  //   item: {
  //     title: 'الأقساط',
  //     to: { path: '/installment' },
  //     icon: 'ri-money-dollar-circle-line',
  //   },
  // },
];
</script>

<template>
  <div>
    <template v-for="(navItem, index) in navItems" :key="index">
      <!-- روابط فردية -->
      <VerticalNavLink
        v-if="navItem.type === 'link' && userStore.user && userStore.can(navItem.permission)"
        :item="navItem.item"
        @update:activeItem="activeItem = $event"
      />

      <!-- مجموعات روابط -->
      <VerticalNavGroup v-if="navItem.type === 'group'" :item="navItem.item" :active-item="activeItem" @update:activeItem="activeItem = $event">
        <VerticalNavLink v-for="(child, childIndex) in navItem.item.children" :key="childIndex" :item="child" />
      </VerticalNavGroup>
    </template>
  </div>
</template>
