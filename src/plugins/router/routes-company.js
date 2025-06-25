// مسارات الشركات
export default [
  {
    path: 'companys',
    component: () => import('@/pages/companys/companys.vue'),
    name: 'companys',
    meta: {
      title: ' الشركات ',
      description: 'ادارة الشركات',
      roles: ['admin.super', 'company.owner', 'companies.page'],
    },
  },
  {
    path: 'company/edit/:id?',
    component: () => import('@/pages/companys/edit.vue'),
    name: 'edit-company',
    meta: {
      title: 'تعديل الشركة',
      description: 'تعديل بيانات الشركة',
      roles: ['admin.super', 'company.owner', 'companies.create', 'companies.update_any', 'companies.update_children', 'companies.update_self'],
    },
  },
];
