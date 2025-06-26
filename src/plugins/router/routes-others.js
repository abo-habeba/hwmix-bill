// مسارات متفرقة (سجل النظام، إعدادات الحساب، صفحات الخطأ ...)
export default [
  {
    path: 'logs',
    component: () => import('@/pages/logs/logs.vue'),
    name: 'logs',
    meta: {
      title: ' سجل النظام ',
      description: 'متابعة حركات النظام',
      roles: ['admin.super', 'admin.company', 'activity_logs.page'],
    },
  },
  {
    path: 'account-settings1',
    component: () => import('@/pages/account-settings.vue'),
    name: 'account-settings2',
    meta: {
      title: 'إعدادات الحساب',
      description: 'تعديل معلومات الحساب الشخصية',
      roles: ['admin.super', 'admin.company', 'users.update_self'],
    },
  },
  {
    path: 'account-settings',
    component: () => import('@/pages/account-settings.vue'),
    name: 'account-settings',
    meta: {
      title: 'إعدادات الحساب',
      description: 'تعديل معلومات الحساب الشخصية',
      roles: ['admin.super', 'admin.company', 'users.update_self'],
    },
  },
  {
    path: 'unauthorized/:title?',
    component: () => import('@/pages/unauthorized.vue'),
    name: 'unauthorized',
    meta: {
      title: '',
      description: '',
      roles: ['admin.super', 'admin.company'],
    },
  },
  {
    path: 'typography',
    component: () => import('@/pages/typography.vue'),
    name: 'typography',
    meta: {
      title: 'الطباعة',
      description: 'عرض عناصر الطباعة والتنسيقات',
      roles: ['admin.super', 'admin.company'],
    },
  },
  {
    path: 'icons',
    component: () => import('@/pages/icons.vue'),
    name: 'icons',
    meta: {
      title: 'الأيقونات',
      description: 'عرض الأيقونات المتاحة',
      roles: ['admin.super', 'admin.company'],
    },
  },
  {
    path: 'cards',
    component: () => import('@/pages/cards.vue'),
    name: 'cards',
    meta: {
      title: 'البطاقات',
      description: 'عرض البطاقات',
      roles: ['admin.super', 'admin.company'],
    },
  },
  {
    path: 'tables',
    component: () => import('@/pages/tables.vue'),
    name: 'tables',
    meta: {
      title: 'الجداول',
      description: 'عرض الجداول وتصميماتها',
      roles: ['admin.super', 'admin.company'],
    },
  },
  {
    path: 'form-layouts',
    component: () => import('@/pages/form-layouts.vue'),
    name: 'form-layouts',
    meta: {
      title: 'تصميم النماذج',
      description: 'عرض تنسيقات مختلفة للنماذج',
      roles: ['admin.super', 'admin.company'],
    },
  },
];
