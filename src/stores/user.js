// stores/user.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { getOne } from '@/services/api';
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userAll: null,
    isAuth: false,
    loadingApi: false,
  }),
  actions: {
    setAuthHeaderNew(token) {
      return new Promise((resolve, reject) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          let user = localStorage.user ? JSON.parse(localStorage.user) : 0;
          let userId = user ? user.id : 0;
          if (userId) {
            getOne(`user`, userId)
              .then(userRes => {
                this.user = userRes;
              })
              .catch(error => {
                if (error.response?.status === 401) {
                  delete axios.defaults.headers.common['Authorization'];
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  location.reload();
                } else {
                  console.log('Error message:', error.message);
                }
                reject(error);
              });
          }
        } else {
          delete axios.defaults.headers.common['Authorization'];
          this.isAuth = false;
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          router.push('/login'); // إعادة التوجيه إلى صفحة تسجيل الدخول
          reject(console.log('No token provided'));
        }
      });
    },
    can(permission) {
      const calculatePermissions = user => {
        const rolesPermissions = user.roles.map(role => role.permissions).flat();
        const permissions = user.permissions;
        return [...new Set([...rolesPermissions, ...permissions])];
      };
      console.log('run can', permission);

      return new Promise(async (resolve, reject) => {
        try {
          if (this.user?.permissions) {
            const allPermissions = calculatePermissions(this.user);

            const hasPermission = Array.isArray(permission)
              ? permission.some(perm => allPermissions.includes(perm))
              : allPermissions.includes(permission);
            console.log('resolve', hasPermission);

            resolve(hasPermission);
          } else {
            const userRes = await getOne('user', JSON.parse(localStorage.user).id);
            this.user = userRes;
            const allPermissions = calculatePermissions(this.user);

            const hasPermission = Array.isArray(permission)
              ? permission.some(perm => allPermissions.includes(perm))
              : allPermissions.includes(permission);
            console.log('resolve', hasPermission);
            resolve(hasPermission);
          }
        } catch (error) {
          reject(error);
        }
      });
    },
  },
});
