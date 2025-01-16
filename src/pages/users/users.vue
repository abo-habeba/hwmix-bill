<script setup>
import DataTable from '@/components/users/DataTable.vue';
import AddUser from '../../components/users/addUser.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
console.log(userStore.can(['users.create', 'super.admin', 'company.owner']));
</script>
<template>
  <VCol style="position: relative" cols="12">
    <VCard class="pa-0" title="المستخدمين">
      <DataTable />
    </VCard>
    <AddUser v-if="userStore.can(['users.create', 'super.admin', 'company.owner'])" />
  </VCol>
</template>
