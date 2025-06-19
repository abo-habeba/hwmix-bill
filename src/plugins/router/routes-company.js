// مسارات الشركات
export default [
  {
    path: 'companys',
    component: () => import('@/pages/companys/companys.vue'),
    name: 'companys',
    meta: {
      title: ' الشركات ',
      description: 'ادارة الشركات',
      roles: ['companys', 'companys_all', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'company/edit/:id?',
    component: () => import('@/pages/companys/edit.vue'),
    name: 'edit-company',
    meta: {
      title: 'تعديل الشركة',
      description: 'تعديل بيانات الشركة',
      roles: ['companys', 'companys_all', 'super_admin', 'company_owner'],
    },
  },
];
