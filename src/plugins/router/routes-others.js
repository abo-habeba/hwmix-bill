// مسارات متفرقة (سجل النظام، إعدادات الحساب، صفحات الخطأ ...)
export default [
  {
    path: 'logs',
    component: () => import('@/pages/logs/logs.vue'),
    name: 'logs',
    meta: {
      title: ' سجل النظام ',
      description: 'متابعة حركات النظام',
      roles: ['logs', 'super_admin', 'company_owner'],
    },
  },
  {
    path: 'account-settings1',
    component: () => import('@/pages/account-settings.vue'),
    name: 'account-settings2',
    meta: {
      title: 'إعدادات الحساب',
      description: 'تعديل معلومات الحساب الشخصية',
    },
  },
  {
    path: 'account-settings',
    component: () => import('@/pages/account-settings.vue'),
    name: 'account-settings',
    meta: {
      title: 'إعدادات الحساب',
      description: 'تعديل معلومات الحساب الشخصية',
    },
  },
  {
    path: 'unauthorized/:title?',
    component: () => import('@/pages/unauthorized.vue'),
    name: 'unauthorized',
    meta: {
      title: '',
      description: '',
    },
  },
  {
    path: 'typography',
    component: () => import('@/pages/typography.vue'),
    name: 'typography',
    meta: {
      title: 'الطباعة',
      description: 'عرض عناصر الطباعة والتنسيقات',
    },
  },
  {
    path: 'icons',
    component: () => import('@/pages/icons.vue'),
    name: 'icons',
    meta: {
      title: 'الأيقونات',
      description: 'عرض الأيقونات المتاحة',
    },
  },
  {
    path: 'cards',
    component: () => import('@/pages/cards.vue'),
    name: 'cards',
    meta: {
      title: 'البطاقات',
      description: 'عرض أشكال وتصميمات البطاقات',
    },
  },
  {
    path: 'tables',
    component: () => import('@/pages/tables.vue'),
    name: 'tables',
    meta: {
      title: 'الجداول',
      description: 'عرض الجداول وتصميماتها',
    },
  },
  {
    path: 'form-layouts',
    component: () => import('@/pages/form-layouts.vue'),
    name: 'form-layouts',
    meta: {
      title: 'تصميم النماذج',
      description: 'عرض تنسيقات مختلفة للنماذج',
    },
  },
];
