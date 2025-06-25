// مسارات لوحة التحكم والصفحات العامة
export default [
  {
    path: 'dashboard',
    component: () => import('@/pages/dashboard.vue'),
    name: 'dashboard',
    meta: {
      title: 'لوحة التحكم',
      description: 'عرض الإحصائيات والبيانات الرئيسية',
      roles: ['admin.super', 'company.owner'],
    },
  },
];
