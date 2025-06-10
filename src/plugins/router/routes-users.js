// مسارات المستخدمين والصلاحيات
export default [
  {
    path: 'users',
    component: () => import('@/pages/users/users.vue'),
    name: 'users',
    meta: {
      title: ' المستخدمين ',
      description: ' ادارة و تعديل المستخدمين ',
      roles: ['users', 'users_all', 'users_show', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'users/edit/:id?',
    component: () => import('@/pages/users/edit.vue'),
    name: 'edit-user',
    meta: {
      title: 'تعديل المستخدم',
      description: 'تعديل بيانات المستخدم',
      roles: ['users_update', 'users_create', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'roles',
    component: () => import('@/pages/role/role.vue'),
    name: 'roles',
    meta: {
      title: ' الادوار والصلاحيات',
      description: 'تعديل الادوار والصلاحيات',
      roles: ['roles', 'roles_all', 'roles_show', 'super_admin', 'company_owner'],
    },
  },
];
