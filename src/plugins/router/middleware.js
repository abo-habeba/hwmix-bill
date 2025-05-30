import { useUserStore } from '@/stores/user';

export async function authGuard(to, from, next) {
  document.title = 'هونكس | ' + (to.meta.title || 'HWNiX - هونكس');

  const isAuthenticated = !!localStorage.authToken;
  const isPublicRoute = ['/login', '/register'].includes(to.path);
  const userStore = useUserStore();
  const permission = to.meta.roles;

  if (!isAuthenticated && !isPublicRoute) {
    return next({ path: '/login' });
  }

  if (isAuthenticated && isPublicRoute) {
    return next({ path: '/' });
  }

  if (permission) {
    if (!userStore.user) {
      await userStore.fetchUser();
    }

    const hasPermission = await userStore.can(permission);

    if (hasPermission) {
      return next();
    } else {
      return next({ name: 'unauthorized', params: { title: to.meta.title } });
    }
  } else {
    return next();
  }
}
