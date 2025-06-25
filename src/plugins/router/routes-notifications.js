// مسارات الإشعارات
export default [
  {
    path: 'credit-notes',
    component: () => import('@/pages/credit-notes.vue'),
    name: 'credit-notes',
    meta: {
      title: 'إشعارات دائنة',
      description: 'قائمة الإشعارات الدائنة',
      roles: ['admin.super', 'company.owner', 'credit_notes.page'],
    },
  },
  {
    path: 'debit-notes',
    component: () => import('@/pages/debit-notes.vue'),
    name: 'debit-notes',
    meta: {
      title: 'إشعارات مدينة',
      description: 'قائمة الإشعارات المدينة',
      roles: ['admin.super', 'company.owner', 'debit_notes.page'],
    },
  },
];
