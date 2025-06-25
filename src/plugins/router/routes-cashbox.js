// مسارات الخزن والسندات المالية
export default [
  {
    path: 'cashbox',
    component: () => import('@/pages/cashboxs/cashbox.vue'),
    name: 'cashboxs',
    meta: {
      title: 'الخزن',
      description: 'إدارة وتعديل الخزن',
      roles: ['admin.super', 'company.owner', 'cash_boxes.page'],
    },
  },
  {
    path: 'cashboxs/edit/:id?',
    component: () => import('@/pages/cashboxs/edit.vue'),
    name: 'edit-cashbox',
    meta: {
      title: 'تعديل الخزن',
      description: 'تعديل بيانات الخزن',
      roles: ['admin.super', 'company.owner', 'cash_boxes.create', 'cash_boxes.update_any'],
    },
  },
  {
    path: 'receipts',
    component: () => import('@/pages/receipts.vue'),
    name: 'receipts',
    meta: {
      title: 'سندات القبض',
      description: 'قائمة سندات القبض',
      roles: ['admin.super', 'company.owner', 'payments.page'],
    },
  },
  {
    path: 'payments',
    component: () => import('@/pages/payments.vue'),
    name: 'payments',
    meta: {
      title: 'سندات الصرف',
      description: 'قائمة سندات الصرف',
      roles: ['admin.super', 'company.owner', 'payments.page'],
    },
  },
];
