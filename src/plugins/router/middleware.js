import { useUserStore } from '@/stores/user';

export function authGuard(to, from, next) {
  document.title = 'هونكس | ' + (to.meta.title || 'HWNiX - هونكس');

  const isAuthenticated = !!localStorage.authToken; // تحقق من وجود التوكن في localStorage
  const isPublicRoute = ['/login', '/register'].includes(to.path); // تحديد المسارات العامة
  const userStore = useUserStore();
  const permission = to.meta.roles;

  if (!isAuthenticated && !isPublicRoute) {
    return next({ path: '/login' });
  }

  if (isAuthenticated && isPublicRoute) {
    return next({ path: '/' });
  }

  if (permission) {
    userStore
      .can(permission)
      .then(data => {
        if (data) {
          return next();
        } else {
          return next({ name: 'unauthorized', params: { title: to.meta.title } });
        }
      })
      .catch(error => {
        console.error('Error in permission check:', error);
        return next({ name: 'error' });
      });
  } else {
    return next();
  }
}
