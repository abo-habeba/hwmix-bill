// مسارات الخزن والسندات المالية
export default [
  {
    path: 'cashbox',
    component: () => import('@/pages/cashboxs/cashbox.vue'),
    name: 'cashboxs',
    meta: {
      title: 'الخزن',
      description: 'إدارة وتعديل الخزن',
      roles: ['cashbox', 'cashbox_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'cashboxs/edit/:id?',
    component: () => import('@/pages/cashboxs/edit.vue'),
    name: 'edit-cashbox',
    meta: {
      title: 'تعديل الخزن',
      description: 'تعديل بيانات الخزن',
      roles: ['cashbox_update', 'cashbox_create'],
    },
  },
  {
    path: 'receipts',
    component: () => import('@/pages/receipts.vue'),
    name: 'receipts',
    meta: {
      title: 'سندات القبض',
      description: 'قائمة سندات القبض',
      roles: ['super_admin', 'company_owner'],
    },
  },
  {
    path: 'payments',
    component: () => import('@/pages/payments.vue'),
    name: 'payments',
    meta: {
      title: 'سندات الصرف',
      description: 'قائمة سندات الصرف',
      roles: ['super_admin', 'company_owner'],
    },
  },
];
