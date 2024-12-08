// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userAll: null,
    isAuth: false,
    isLoader: false,
    loadengApi: false,
    errorMessag: null,
  }),
})
