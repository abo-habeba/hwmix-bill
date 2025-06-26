// مسارات المستخدمين والصلاحيات
export default [
  {
    path: 'installments',
    component: () => import('@/pages/installments/installments.vue'),
    name: 'installments',
    meta: {
      title: ' الاقساط ',
      description: ' ادارة و تعديل الاقساط ',
      roles: ['admin.super', 'admin.company', 'installments.page'],
    },
  },
  {
    path: 'installment-plans',
    component: () => import('@/pages/installments/InstallmentPlansTable.vue'),
    name: 'installment-plans',
    meta: {
      title: 'خطط الأقساط',
      description: 'إدارة خطط الأقساط',
      roles: ['admin.super', 'admin.company', 'installment_plans.page'],
    },
  },
];
