// مسارات الشركات
export default [
  {
    path: 'companys',
    component: () => import('@/pages/companys/companys.vue'),
    name: 'companys',
    meta: {
      title: ' الشركات ',
      description: 'ادارة الشركات',
      roles: [
        'admin.super',
        'admin.company',
        'companies.page',
        'companies.view_all',
        'companies.view_children',
        'companies.view_self',
        'companies.view',
      ],
    },
  },
  {
    path: 'company/edit/:id?',
    component: () => import('@/pages/companys/edit.vue'),
    name: 'edit-company',
    meta: {
      title: 'تعديل الشركة',
      description: 'تعديل بيانات الشركة',
      roles: [
        'admin.super',
        'admin.company',
        'companies.create',
        'companies.update_any',
        'companies.update_children',
        'companies.update_self',
      ],
    },
  },
];
