export function authGuard(to, from, next) {
  document.title = to.meta.title + ' | هونكس ' || 'HWNiX - هونكس'
  const isAuthenticated = !!localStorage.authToken // Check if token exists
  const isPublicRoute = ['/login', '/register'].includes(to.path) // Define public route

  // إذا كان المستخدم مصادقًا وحاول فتح صفحة عامة، يتم توجيهه إلى الصفحة الرئيسية
  if (isAuthenticated && isPublicRoute) {
    return next({ path: '/' })
  }

  // إذا لم يكن المستخدم مصادقًا وحاول فتح صفحة خاصة، يتم توجيهه إلى صفحة تسجيل الدخول
  if (!isAuthenticated && !isPublicRoute) {
    return next({ path: '/login' })
  }

  next() // Continue if no redirection is required
}
