export const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    name: 'home-redirect',
    meta: {
      title: 'الصفحة الرئيسية',
      description: 'إعادة توجيه إلى لوحة التحكم',
      rules: [], // يمكن إضافة القواعد هنا
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    name: 'default-layout',
    meta: {
      title: 'تخطيط افتراضي',
      description: 'هذا هو التخطيط الرئيسي للتطبيق',
      rules: [], // يمكن تطبيق قواعد عامة على التخطيط
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
        name: 'dashboard',
        meta: {
          title: 'لوحة التحكم',
          description: 'عرض الإحصائيات والبيانات الرئيسية',
          rules: ['auth'],
        },
      },
      {
        path: 'users',
        component: () => import('@/pages/users/users.vue'),
        name: 'users',
        meta: {
          title: ' المستخدمين ',
          description: ' ادارة وتعديل المستخدمين ',
          rules: ['auth'],
        },
      },
      {
        path: 'account-settings',
        component: () => import('@/pages/account-settings.vue'),
        name: 'account-settings',
        meta: {
          title: 'إعدادات الحساب',
          description: 'تعديل معلومات الحساب الشخصية',
          rules: ['auth'], // يتطلب تسجيل الدخول
        },
      },
      {
        path: 'typography',
        component: () => import('@/pages/typography.vue'),
        name: 'typography',
        meta: {
          title: 'الطباعة',
          description: 'عرض عناصر الطباعة والتنسيقات',
          rules: [],
        },
      },
      {
        path: 'icons',
        component: () => import('@/pages/icons.vue'),
        name: 'icons',
        meta: {
          title: 'الأيقونات',
          description: 'عرض الأيقونات المتاحة',
          rules: [],
        },
      },
      {
        path: 'cards',
        component: () => import('@/pages/cards.vue'),
        name: 'cards',
        meta: {
          title: 'البطاقات',
          description: 'عرض أشكال وتصميمات البطاقات',
          rules: [],
        },
      },
      {
        path: 'tables',
        component: () => import('@/pages/tables.vue'),
        name: 'tables',
        meta: {
          title: 'الجداول',
          description: 'عرض الجداول وتصميماتها',
          rules: [],
        },
      },
      {
        path: 'form-layouts',
        component: () => import('@/pages/form-layouts.vue'),
        name: 'form-layouts',
        meta: {
          title: 'تصميم النماذج',
          description: 'عرض تنسيقات مختلفة للنماذج',
          rules: [],
        },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    name: 'blank-layout',
    meta: {
      title: 'تخطيط فارغ',
      description: 'تخطيط بسيط بدون قوائم أو عناوين',
      rules: [],
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/login.vue'),
        meta: {
          title: 'تسجيل الدخول',
          description: 'قم بتسجيل الدخول إلى حسابك',
          rules: ['guest'], // يتطلب أن يكون المستخدم غير مسجل الدخول
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/register.vue'),
        meta: {
          title: 'إنشاء حساب',
          description: 'قم بإنشاء حساب جديد',
          rules: ['guest'], // يتطلب أن يكون المستخدم غير مسجل الدخول
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'error-page',
        component: () => import('@/pages/[...error].vue'),
        meta: {
          title: 'صفحة غير موجودة',
          description: 'الصفحة التي تبحث عنها غير متوفرة',
          rules: [],
        },
      },
    ],
  },
]
