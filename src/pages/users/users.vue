<script setup>
import DataTable from '@/components/users/UsersDataTable.vue';
import UsersAddUser from '../../components/users/UsersAddUser.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
console.log(userStore.can(['users.create', 'admin.super', 'admin.company']));
</script>
<template>
  <UsersAddUser class="ma-3" v-if="userStore.can(['users.create', 'admin.super', 'admin.company'])" />
  <VCard class="pa-0" title="المستخدمين">
    <UsersDataTable />
  </VCard>
</template>
