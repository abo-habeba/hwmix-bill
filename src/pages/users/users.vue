<script setup>
import DataTable from '@/components/users/UsersDataTable.vue';
import UsersAddUser from '../../components/users/UsersAddUser.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
console.log(userStore.can(['users_create', 'super_admin', 'company_owner']));
</script>
<template>
  <UsersAddUser class="ma-3" v-if="userStore.can(['users_create', 'super_admin', 'company_owner'])" />
  <VCard class="pa-0" title="المستخدمين">
    <UsersDataTable />
  </VCard>
</template>
