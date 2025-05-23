export const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    name: 'home-redirect',
    meta: {
      title: 'الصفحة الرئيسية',
      description: 'إعادة توجيه إلى لوحة التحكم',
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    name: 'default-layout',
    meta: {
      title: 'تخطيط افتراضي',
      description: 'هذا هو التخطيط الرئيسي للتطبيق',
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
        name: 'dashboard',
        meta: {
          title: 'لوحة التحكم',
          description: 'عرض الإحصائيات والبيانات الرئيسية',
        },
      },
      {
        path: 'companys',
        component: () => import('@/pages/companys/companys.vue'),
        name: 'companys',
        meta: {
          title: ' الشركات ',
          description: 'ادارة الشركات',
          // roles: 'company',
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
      {
        path: 'logs',
        component: () => import('@/pages/logs/logs.vue'),
        name: 'logs',
        meta: {
          title: ' سجل النظام ',
          description: 'متابعة حركات النظام',
          roles: 'logs',
        },
      },
      {
        path: 'users',
        component: () => import('@/pages/users/users.vue'),
        name: 'users',
        meta: {
          title: ' المستخدمين ',
          description: ' ادارة و تعديل المستخدمين ',
          roles: 'users',
        },
      },
      {
        path: 'users/edit/:id?',
        component: () => import('@/pages/users/edit.vue'),
        name: 'edit-user',
        meta: {
          title: 'تعديل المستخدم',
          description: 'تعديل بيانات المستخدم',
          roles: ['users_update', 'users_create'],
        },
      },
      {
        path: 'cashbox',
        component: () => import('@/pages/cashboxs/cashbox.vue'),
        name: 'cashboxs',
        meta: {
          title: 'الخزن',
          description: 'إدارة وتعديل الخزن',
          roles: 'cashbox',
        },
      },
      {
        path: 'cashboxs/edit/:id?',
        component: () => import('@/pages/cashboxs/edit.vue'),
        name: 'edit-cashbox',
        meta: {
          title: 'تعديل الخزن',
          description: 'تعديل بيانات الخزن',
          roles: ['cashbox_update', 'cashbox_create'],
        },
      },
      {
        path: 'roles',
        component: () => import('@/pages/role/role.vue'),
        name: 'roles',
        meta: {
          title: ' الادوار والصلاحيات',
          description: 'تعديل الادوار والصلاحيات',
          roles: 'roles',
        },
      },
      // Products Routes
      {
        path: 'products',
        component: () => import('@/pages/products/products.vue'),
        name: 'products',
        meta: {
          title: 'المنتجات',
          description: 'إدارة وتعديل المنتجات',
          // roles: 'products',
        },
      },
      {
        path: 'product-variants',
        component: () => import('@/pages/productVariants/productVariants.vue'),
        name: 'product-variants',
        meta: {
          title: 'نسخ المنتجات',
          description: 'إدارة نسخ المنتجات',
          // roles: 'productVariants',
        },
      },
      {
        path: 'product-variant-attributes',
        component: () => import('@/pages/productVariantAttributes/productVariantAttributes.vue'),
        name: 'product-variant-attributes',
        meta: {
          title: 'خصائص نسخ المنتجات',
          description: 'إدارة خصائص نسخ المنتجات',
          // roles: 'productVariantAttributes',
        },
      },
      {
        //src\pages\attributes\attributes.vue
        path: 'attributes',
        component: () => import('@/pages/attributes/attributes.vue'),
        name: 'attributes',
        meta: {
          title: 'الخصائص',
          description: 'إدارة وتعديل الخصائص',
          // roles: 'attributes',
        },
      },
      {
        path: 'attribute-values',
        component: () => import('@/pages/attributeValues/attributeValues.vue'),
        name: 'attribute-values',
        meta: {
          title: 'قيم الخصائص',
          description: 'إدارة وتعديل قيم الخصائص',
          // roles: 'attributeValues',
        },
      },
      {
        path: 'brands',
        component: () => import('@/pages/brands/brands.vue'),
        name: 'brands',
        meta: {
          title: 'قيم الخصائص',
          description: 'إدارة وتعديل قيم الخصائص',
          // roles: 'attributeValues',
        },
      },
      {
        path: 'categories',
        component: () => import('@/pages/Categories/Categories.vue'),
        name: 'categories',
        meta: {
          title: 'الاقسام',
          description: 'إدارة وتعديل الاقسام',
          // roles: 'categories',
        },
      },
      {
        path: 'warehouses',
        component: () => import('@/pages/warehouses/warehouses.vue'),
        name: 'warehouses',
        meta: {
          title: 'المخازن',
          description: 'إدارة المخازن',
          // roles: 'warehouses',
        },
      },
      {
        path: 'stock',
        component: () => import('@/pages/stock/stock.vue'),
        name: 'stock',
        meta: {
          title: 'المخزون',
          description: 'إدارة المخزون',
          // roles: 'stock',
        },
      },
      // Invoice & Installment & Payment
      {
        path: 'invoice',
        component: () => import('@/pages/invoice/index.vue'),
        name: 'invoice',
        meta: {
          title: 'الفواتير',
          description: 'إدارة الفواتير',
          roles: ['super_admin', 'company_owner'],
        },
      },
      {
        path: 'invoiceType',
        component: () => import('@/pages/invoiceType/index.vue'),
        name: 'invoiceType',
        meta: {
          title: 'أنواع الفواتير',
          description: 'إدارة أنواع الفواتير',
          roles: ['super_admin', 'company_owner'],
        },
      },
      {
        path: 'payment',
        component: () => import('@/pages/payment/index.vue'),
        name: 'payment',
        meta: {
          title: 'المدفوعات',
          description: 'إدارة المدفوعات',
          roles: ['super_admin', 'company_owner'],
        },
      },
      {
        path: 'installmentPlan',
        component: () => import('@/pages/installmentPlan/index.vue'),
        name: 'installmentPlan',
        meta: {
          title: 'خطط التقسيط',
          description: 'إدارة خطط التقسيط',
          roles: ['super_admin', 'company_owner'],
        },
      },
      {
        path: 'installment',
        component: () => import('@/pages/installment/index.vue'),
        name: 'installment',
        meta: {
          title: 'الأقساط',
          description: 'إدارة الأقساط',
          roles: ['super_admin', 'company_owner'],
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
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    name: 'blank-layout',
    meta: {
      title: 'تخطيط فارغ',
      description: 'تخطيط بسيط بدون قوائم أو عناوين',
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/login.vue'),
        meta: {
          title: 'تسجيل الدخول',
          description: 'قم بتسجيل الدخول إلى حسابك',
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/register.vue'),
        meta: {
          title: 'إنشاء حساب',
          description: 'قم بإنشاء حساب جديد',
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'error-page',
        component: () => import('@/pages/[...error].vue'),
        meta: {
          title: 'صفحة غير موجودة',
          description: 'الصفحة التي تبحث عنها غير متوفرة',
        },
      },
    ],
  },
];
