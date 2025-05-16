<script setup>
import DataTable from '@/components/users/DataTable.vue';
import AddUser from '../../components/users/addUser.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
console.log(userStore.can(['users_create', 'super_admin', 'company_owner']));
</script>
<template>
  <AddUser class="ma-3" v-if="userStore.can(['users_create', 'super_admin', 'company_owner'])" />
  <VCard class="pa-0" title="المستخدمين">
    <DataTable />
  </VCard>
</template>
