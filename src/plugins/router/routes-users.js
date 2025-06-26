// مسارات المستخدمين والصلاحيات
export default [
  {
    path: 'users',
    component: () => import('@/pages/users/users.vue'),
    name: 'users',
    meta: {
      title: ' المستخدمين ',
      description: ' ادارة و تعديل المستخدمين ',
      roles: ['admin.super', 'admin.company', 'users.page'],
    },
  },
  {
    path: 'users/edit/:id?',
    component: () => import('@/pages/users/edit.vue'),
    name: 'edit-user',
    meta: {
      title: 'تعديل المستخدم',
      description: 'تعديل بيانات المستخدم',
      roles: ['admin.super', 'admin.company', 'users.update_any', 'users.update_children', 'users.update_self'],
    },
  },
  {
    path: 'roles',
    component: () => import('@/pages/role/role.vue'),
    name: 'roles',
    meta: {
      title: ' الادوار والصلاحيات',
      description: 'تعديل الادوار والصلاحيات',
      roles: [
        'admin.super',
        'admin.company',
        'roles.page',
      ],
    },
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('@/pages/users/EditProfile.vue'),
    meta: {
      roles: [
        'admin.super',
        'admin.company',
        'users.update_self',
      ],
    },
  },
];
