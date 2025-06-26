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
{
}
const navItems = [
  {
    type: 'group',
    permission: [
      'admin.super',
      'admin.company',
      'invoices.page',
    ],
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
          permission: [
            'admin.super',
            'admin.company',
            'invoices.page',
            'invoices.view_any',
            'invoices.view_children',
            'invoices.view_self',
            'invoices.view',
          ],
        },
        {
          title: 'فواتير الخدمة',
          to: { name: 'service-invoices' },
          icon: 'ri-service-line',
          tooltip: 'فواتير للخدمات غير المرتبطة بمنتجات',
          permission: [
            'admin.super',
            'admin.company',
            'invoices.view',
          ],
        },
        {
          title: 'عروض الأسعار',
          to: { name: 'invoices-quotation' },
          icon: 'ri-price-tag-3-line',
          tooltip: 'إصدار أو مراجعة عروض الأسعار',
          permission: [
            'admin.super',
            'admin.company',
            'invoices.view',
          ],
        },
        {
          title: 'طلبات الشراء',
          to: { name: 'invoices-purchase-order' },
          icon: 'ri-shopping-cart-2-line',
          tooltip: 'متابعة طلبات الشراء من الموردين',
          permission: [
            'admin.super',
            'admin.company',
            'invoices.view',
          ],
        },
        {
          title: 'طلبات البيع',
          to: { name: 'invoices-sales-order' },
          icon: 'ri-truck-line',
          tooltip: 'متابعة طلبات البيع للعملاء',
          permission: [
            'admin.super',
            'admin.company',
            'invoices.view',
          ],
        },
        {
          title: 'فواتير الخصم',
          to: { name: 'invoices-discount' },
          icon: 'ri-discount-percent-line',
          tooltip: 'تسجيل فواتير الخصومات والعروض',
          permission: [
            'admin.super',
            'admin.company',
            'invoices.view',
          ],
        },
        {
          title: 'أنواع الفواتير',
          to: { name: 'invoiceType' },
          icon: 'ri-settings-5-line',
          tooltip: 'إدارة أنواع الفواتير المختلفة',
          permission: [
            'admin.super',
            'admin.company',
            'invoice_types.page',
          ],
        },
      ],
    },
  },
  {
    type: 'group',
    permission: ['installments.page', 'admin.super', 'admin.company'],
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
    permission: ['products.page', 'admin.super', 'admin.company'],
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
    permission: ['warehouses.page', 'admin.super', 'admin.company'],
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
    permission: ['cash_boxes.page', 'admin.super', 'admin.company'],
    item: {
      title: 'الخزن',
      to: { name: 'cashboxs' },
      icon: 'ri-currency-line',
      tooltip: 'إدارة حركة النقد داخل الخزن',
    },
  },
  {
    type: 'group',
    permission: ['notifications.page', 'admin.super', 'admin.company'],
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
    permission: ['users.page', 'admin.super', 'admin.company'],
    item: {
      title: 'المستخدمين',
      to: { name: 'users' },
      icon: 'ri-group-line',
      tooltip: 'إدارة حسابات المستخدمين وصلاحياتهم',
    },
  },
  {
    type: 'link',
    permission: ['roles.page', 'admin.super', 'admin.company'],
    item: {
      title: 'الصلاحيات والادوار',
      to: { name: 'roles' },
      icon: 'ri-lock-unlock-line',
      tooltip: 'إنشاء وتعديل الأدوار وتحديد الصلاحيات',
    },
  },
  {
    type: 'link',
    permission: ['companies.page', 'admin.super', 'admin.company'],
    item: {
      title: 'الشركات',
      to: { name: 'companys' },
      icon: 'ri-community-line',
      tooltip: 'إدارة بيانات الشركات المرتبطة بالنظام',
    },
  },
  {
    type: 'link',
    permission: ['activity_logs.page', 'admin.super', 'admin.company'],
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
      <VerticalNavLink v-if="navItem.type === 'link' && userStore.user && userStore.can(navItem.permission)"
        :item="navItem.item" :title="navItem.item.tooltip" :active-item="activeItem"
        @update:activeItem="activeItem = $event" />

      <!-- للمجموعة -->
      <VerticalNavGroup v-if="navItem.type === 'group' && userStore.user && userStore.can(navItem.permission)"
        :item="navItem.item" :title="navItem.item.tooltip" :active-item="activeItem"
        @update:activeItem="activeItem = $event">
        <VerticalNavLink v-for="(child, childIndex) in navItem.item.children" :key="childIndex" :item="child"
          :title="child.tooltip" :active-item="activeItem" />
      </VerticalNavGroup>
    </template>
  </div>
</template>
