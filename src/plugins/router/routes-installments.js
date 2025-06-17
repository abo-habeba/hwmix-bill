// مسارات المستخدمين والصلاحيات
export default [
  {
    path: 'installments',
    component: () => import('@/pages/installments/installments.vue'),
    name: 'installments',
    meta: {
      title: ' الاقساط ',
      description: ' ادارة و تعديل الاقساط ',
    },
  },
  // {
  //   path: 'installments/edit/:id?',
  //   component: () => import('@/pages/installments/edit.vue'),
  //   name: 'edit-user',
  //   meta: {
  //     title: '',
  //     description: '  ',
  //     roles: ['installments_update', 'installments_create'],
  //   },
  // },
  {
    path: 'installment-plans',
    component: () => import('@/pages/installments/InstallmentPlansTable.vue'),
    name: 'installment-plans',
    meta: {
      title: 'خطط الأقساط',
      description: 'إدارة خطط الأقساط',
    },
  },
];
