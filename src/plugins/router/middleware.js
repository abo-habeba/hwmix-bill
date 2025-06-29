import { useUserStore } from '@/stores/user';

export async function authGuard(to, from, next) {
  document.title = 'هونكس | ' + (to.meta.title || 'HWNiX - هونكس');

  const isAuthenticated = !!localStorage.authToken;
  const isPublicRoute = ['/login', '/register'].includes(to.path);
  const userStore = useUserStore();
  // const cleanPath = to.path.replace(/^\//, '');
  // const matchedPermissions = (userStore.user?.permissions || []).filter(p => p.includes(cleanPath));
  // console.log('Permissions matching path', cleanPath, JSON.stringify(matchedPermissions, null, 2));
  const permission = to.roles?.roles;
  if (!isAuthenticated && !isPublicRoute) {
    return next({ path: '/login' });
  }
  if (isAuthenticated && isPublicRoute) {
    return next({ path: '/' });
  }
  if (Array.isArray(permission) && permission.length > 0) {
    if (!userStore.user) {
      await userStore.fetchUser();
    }
    // console.log('Checking permissions for route:', to.path, 'permission:', permission);
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
