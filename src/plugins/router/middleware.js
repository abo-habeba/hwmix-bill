import { useUserStore } from '@/stores/user';
export function authGuard(to, from, next) {
  // document.title = 'هونكس  | ' + to.meta.title || 'HWNiX - هونكس';
  // const userStore = useUserStore();

  // userStore.can()
  // const isAuthenticated = !!localStorage.authToken; // Check if token exists
  // const isPublicRoute = ['/login', '/register'].includes(to.path); // Define public route

  // if (isAuthenticated && isPublicRoute) {
  //   return next({ path: '/' });
  // }

  // if (!isAuthenticated && !isPublicRoute) {
  //   return next({ path: '/login' });
  // }

  // next(); // Continue if no redirection is required

  // تحديد العنوان
  document.title = 'هونكس  | ' + (to.meta.title || 'HWNiX - هونكس');
  // تحقق من حالة المصادقة
  const isAuthenticated = !!localStorage.authToken; // تحقق من وجود التوكن في الـ localStorage
  const isPublicRoute = ['/login', '/register'].includes(to.path); // تحديد المسارات العامة
  // إذا كان المستخدم مصادقًا ويحاول الوصول إلى مسار عام، قم بإعادة التوجيه إلى الصفحة الرئيسية
  if (isAuthenticated && isPublicRoute) {
    return next({ path: '/' });
  }

  // إذا لم يكن المستخدم مصادقًا ويحاول الوصول إلى مسار محمي، قم بإعادة التوجيه إلى صفحة تسجيل الدخول
  if (!isAuthenticated && !isPublicRoute) {
    return next({ path: '/login' });
  }

  if (to.meta.roles) {
    const userStore = useUserStore();
    console.log(to.meta.roles);
    const permission = to.meta.roles;
    if (userStore.can(permission)) {
      console.log('if can');
      return next();
    } else {
      console.log('else can');
      return next({ name: 'unauthorized', params: { title: to.meta.title } });
    }
  }

  next();
}
