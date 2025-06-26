// مسارات الخزن والسندات المالية
export default [
  {
    path: 'cashbox',
    component: () => import('@/pages/cashboxs/cashbox.vue'),
    name: 'cashboxs',
    meta: {
      title: 'الخزن',
      description: 'إدارة وتعديل الخزن',
      roles: [
        'admin.super',
        'admin.company',
        'cash_boxes.page',
        'cash_boxes.view_any',
        'cash_boxes.view',
      ],
    },
  },
  {
    path: 'cashboxs/edit/:id?',
    component: () => import('@/pages/cashboxs/edit.vue'),
    name: 'edit-cashbox',
    meta: {
      title: 'تعديل الخزن',
      description: 'تعديل بيانات الخزن',
      roles: [
        'admin.super',
        'admin.company',
        'cash_boxes.create',
        'cash_boxes.update_any',
      ],
    },
  },
  {
    path: 'receipts',
    component: () => import('@/pages/receipts.vue'),
    name: 'receipts',
    meta: {
      title: 'سندات القبض',
      description: 'قائمة سندات القبض',
      roles: [
        'admin.super',
        'admin.company',
        'payments.page',
        'payments.view_any',
        'payments.view',
      ],
    },
  },
  {
    path: 'payments',
    component: () => import('@/pages/payments.vue'),
    name: 'payments',
    meta: {
      title: 'سندات الصرف',
      description: 'قائمة سندات الصرف',
      roles: [
        'admin.super',
        'admin.company',
        'payments.page',
        'payments.view_any',
        'payments.view',
      ],
    },
  },
];
