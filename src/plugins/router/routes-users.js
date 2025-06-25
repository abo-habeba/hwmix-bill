// مسارات المستخدمين والصلاحيات
export default [
  {
    path: 'users',
    component: () => import('@/pages/users/users.vue'),
    name: 'users',
    meta: {
      title: ' المستخدمين ',
      description: ' ادارة و تعديل المستخدمين ',
      roles: ['admin.super', 'company.owner', 'users.page'],
    },
  },
  {
    path: 'users/edit/:id?',
    component: () => import('@/pages/users/edit.vue'),
    name: 'edit-user',
    meta: {
      title: 'تعديل المستخدم',
      description: 'تعديل بيانات المستخدم',
      roles: ['admin.super', 'company.owner', 'users.create', 'users.update_any', 'users.update_children', 'users.update_self'],
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
        'company.owner',
        // أضف هنا الصلاحية المناسبة لمسار الأدوار إذا كان هناك صلاحية محددة مثل roles.page أو roles.view_any
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
        'company.owner',
        // أضف هنا الصلاحية المناسبة لمسار تعديل البروفايل إذا كان هناك صلاحية محددة مثل users.update_self
      ],
    },
  },
];
