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
                console.log('Authentication check failed:', error.message);
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
          console.log('No token provided, redirecting to login.');
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
      return new Promise((resolve, reject) => {
        if (this.user?.permissions) {
          return this.user.permissions.includes(permission);
        } else {
          getOne(`user`, JSON.parse(localStorage.user).id).then(userRes => {
            this.user = userRes;
            return this.user.permissions.includes(permission);
          });
        }
      });
    },
  },
});
