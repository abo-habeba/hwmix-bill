// مسارات الشركات
export default [
  {
    path: 'companys',
    component: () => import('@/pages/companys/companys.vue'),
    name: 'companys',
    meta: {
      title: ' الشركات ',
      description: 'ادارة الشركات',
    },
  },
  {
    path: 'company/edit/:id?',
    component: () => import('@/pages/companys/edit.vue'),
    name: 'edit-company',
    meta: {
      title: 'تعديل الشركة',
      description: 'تعديل بيانات الشركة',
      roles: 'companys_update',
    },
  },
];
