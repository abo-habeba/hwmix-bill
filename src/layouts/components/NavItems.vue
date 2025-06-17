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
  {
    type: 'group',
    permission: ['super_admin', 'company_owner'],
    item: {
      title: 'الفواتير',
      icon: 'ri-file-list-3-line',
      tooltip: 'كل أنواع الفواتير المرتبطة بالبيع والشراء',
      children: [
        {
          title: 'فواتير البيع والشراء',
          to: { name: 'invoices' },
          createRoute: 'invoice-create',
          icon: 'ri-file-copy-line',
          tooltip: 'عرض وإنشاء فواتير بيع أو شراء',
        },
        { title: 'فواتير الخدمة', to: { name: 'service-invoices' }, icon: 'ri-service-line', tooltip: 'فواتير للخدمات غير المرتبطة بمنتجات' },
        { title: 'عروض الأسعار', to: { name: 'invoices-quotation' }, icon: 'ri-price-tag-3-line', tooltip: 'إصدار أو مراجعة عروض الأسعار' },
        {
          title: 'طلبات الشراء',
          to: { name: 'invoices-purchase-order' },
          icon: 'ri-shopping-cart-2-line',
          tooltip: 'متابعة طلبات الشراء من الموردين',
        },
        { title: 'طلبات البيع', to: { name: 'invoices-sales-order' }, icon: 'ri-truck-line', tooltip: 'متابعة طلبات البيع للعملاء' },
        { title: 'فواتير الخصم', to: { name: 'invoices-discount' }, icon: 'ri-discount-percent-line', tooltip: 'تسجيل فواتير الخصومات والعروض' },
        { title: 'أنواع الفواتير', to: { name: 'invoiceType' }, icon: 'ri-settings-5-line', tooltip: 'إدارة أنواع الفواتير المختلفة' },
      ],
    },
  },
  {
    type: 'group',
    permission: ['super_admin', 'company_owner'],
    item: {
      title: 'إدارة الأقساط',
      icon: 'ri-file-list-line',
      children: [
        {
          title: 'الأقساط',
          to: '/installments',
        },
        {
          title: 'خطط الأقساط',
          to: '/installment-plans',
        },
      ],
    },
  },
  {
    type: 'group',
    permission: ['products', 'super_admin', 'company_owner'],
    item: {
      title: 'المنتجات',
      icon: 'ri-shopping-bag-3-line',
      tooltip: 'إدارة المنتجات وخصائصها وأقسامها',
      children: [
        { title: 'المنتجات', to: { name: 'products' }, icon: 'ri-box-3-line', tooltip: 'عرض وإدارة المنتجات' },
        {
          title: 'خيارات المنتج',
          to: { name: 'product-variants' },
          icon: 'ri-settings-3-line',
          tooltip: 'إضافة أو تعديل المتغيرات مثل الحجم واللون',
        },
        { title: 'الخصائص', to: { name: 'attributes' }, icon: 'ri-list-settings-line', tooltip: 'خصائص مخصصة للمنتجات' },
        { title: 'العلامات التجارية', to: { name: 'brands' }, icon: 'ri-price-tag-line', tooltip: 'إدارة الماركات والعلامات التجارية' },
        { title: 'الأقسام', to: { name: 'categories' }, icon: 'ri-folder-line', tooltip: 'تنظيم المنتجات داخل أقسام' },
      ],
    },
  },
  {
    type: 'group',
    permission: ['super_admin', 'company_owner'],
    item: {
      title: 'المخزون',
      icon: 'ri-archive-line',
      tooltip: 'إدارة حركة وتعديلات المخزون',
      children: [
        { title: 'المخازن', to: { name: 'warehouses' }, icon: 'ri-building-line', tooltip: 'عرض وإنشاء المخازن' },
        { title: 'تحويلات المخزون', to: { name: 'stock-transfers' }, icon: 'ri-repeat-line', tooltip: 'تحويل كميات المخزون بين الفروع' },
        {
          title: 'تسويات المخزون',
          to: { name: 'inventory-adjustments' },
          icon: 'ri-equalizer-line',
          tooltip: 'تعديل الكميات يدويًا في حالات النقص أو الزيادة',
        },
      ],
    },
  },
  {
    type: 'link',
    permission: ['cashbox', 'super_admin', 'company_owner'],
    item: {
      title: 'الخزن',
      to: { name: 'cashboxs' },
      icon: 'ri-currency-line',
      tooltip: 'إدارة حركة النقد داخل الخزن',
    },
  },
  {
    type: 'group',
    permission: ['super_admin', 'company_owner'],
    item: {
      title: 'الإشعارات',
      icon: 'ri-notification-3-line',
      tooltip: 'عرض الإشعارات المدينة والدائنة',
      children: [
        { title: 'إشعارات دائنة', to: { name: 'credit-notes' }, icon: 'ri-arrow-left-circle-line', tooltip: 'إشعارات لصالح العملاء أو الموردين' },
        { title: 'إشعارات مدينة', to: { name: 'debit-notes' }, icon: 'ri-arrow-right-circle-line', tooltip: 'إشعارات لصالح الشركة' },
      ],
    },
  },
  {
    type: 'link',
    permission: ['users', 'super_admin', 'company_owner'],
    item: {
      title: 'المستخدمين',
      to: { name: 'users' },
      icon: 'ri-group-line',
      tooltip: 'إدارة حسابات المستخدمين وصلاحياتهم',
    },
  },
  {
    type: 'link',
    permission: ['roles', 'super_admin', 'company_owner'],
    item: {
      title: 'الصلاحيات والادوار',
      to: { name: 'roles' },
      icon: 'ri-lock-unlock-line',
      tooltip: 'إنشاء وتعديل الأدوار وتحديد الصلاحيات',
    },
  },
  {
    type: 'link',
    permission: ['companys', 'super_admin', 'company_owner'],
    item: {
      title: 'الشركات',
      to: { name: 'companys' },
      icon: 'ri-community-line',
      tooltip: 'إدارة بيانات الشركات المرتبطة بالنظام',
    },
  },
  {
    type: 'link',
    permission: ['logs', 'super_admin', 'company_owner'],
    item: {
      title: 'سجل النظام',
      to: { name: 'logs' },
      icon: 'ri-file-list-2-line',
      tooltip: 'تتبع الأحداث التي تمت داخل النظام',
    },
  },
];
</script>

<template>
  <div>
    <template v-for="(navItem, index) in navItems" :key="index">
      <!-- روابط فردية -->
      <VerticalNavLink
        v-if="navItem.type === 'link' && userStore.user && userStore.can(navItem.permission)"
        :item="navItem.item"
        :title="navItem.item.tooltip"
        :active-item="activeItem"
        @update:activeItem="activeItem = $event"
      />

      <!-- للمجموعة -->
      <VerticalNavGroup
        v-if="navItem.type === 'group'"
        :item="navItem.item"
        :title="navItem.item.tooltip"
        :active-item="activeItem"
        @update:activeItem="activeItem = $event"
      >
        <VerticalNavLink
          v-for="(child, childIndex) in navItem.item.children"
          :key="childIndex"
          :item="child"
          :title="child.tooltip"
          :active-item="activeItem"
        />
      </VerticalNavGroup>
    </template>
  </div>
</template>
