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
    async initializeUser() {
      if (!this.isAuth) {
        await this.fetchUser();
      }
    },

    async fetchUser() {
      this.loadingApi = true;
      try {
        const token = localStorage.getItem('authToken');
        if (!axios.defaults.headers.common['Authorization'] && token) {
          this.setAuthHeader(token);
        }
        const userId = this.getUserId();
        if (!userId) throw new Error('User ID not found');
        const userRes = await getOne('user', userId);
        this.user = userRes;
        this.isAuth = true;
        this.loadingApi = false;
      } catch (error) {
        this.loadingApi = false;

        if (error.response?.status === 401) {
          this.logout();
        } else {
          console.error('Error fetching user:', error);
        }
        this.loadingApi = false;
      }
    },

    getUserId() {
      const user = localStorage.user ? JSON.parse(localStorage.user) : null;
      return user?.id || null;
    },

    setAuthHeader(token) {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
        this.logout();
      }
    },

    logout() {
      delete axios.defaults.headers.common['Authorization'];
      this.isAuth = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      location.reload();
    },

    calculatePermissions(user) {
      const rolesPermissions = user.roles.map(role => role.permissions).flat();
      const permissions = user.permissions;
      return [...new Set([...rolesPermissions, ...permissions])];
    },

    async can(permission) {
      try {
        if (!this.user) {
          await this.fetchUser();
        }
        const allPermissions = this.calculatePermissions(this.user);
        if (Array.isArray(permission)) {
          console.log(permission.some(perm => allPermissions.includes(perm)));
          return permission.some(perm => allPermissions.includes(perm));
        } else {
          console.log(allPermissions.includes(permission));

          return allPermissions.includes(permission);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
      }
    },
  },

  persist: true, // To persist the state even after refresh

  // Use this to trigger the action when the store is first used
  persistStore(store) {
    store.$onAction(() => {
      store.initializeUser(); // Automatically call initializeUser when any action is triggered
    });
  },
});
