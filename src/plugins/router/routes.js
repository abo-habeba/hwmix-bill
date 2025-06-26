import dashboardRoutes from './routes-dashboard';
import companyRoutes from './routes-company';
import usersRoutes from './routes-users';
import productsRoutes from './routes-products';
import invoicesRoutes from './routes-invoices';
import stockRoutes from './routes-stock';
import cashboxRoutes from './routes-cashbox';
import notificationsRoutes from './routes-notifications';
import othersRoutes from './routes-others';
import installmentsRoutes from './routes-installments';

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
      ...dashboardRoutes,
      ...companyRoutes,
      ...usersRoutes,
      ...productsRoutes,
      ...invoicesRoutes,
      ...stockRoutes,
      ...cashboxRoutes,
      ...notificationsRoutes,
      ...othersRoutes,
      ...installmentsRoutes,
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
