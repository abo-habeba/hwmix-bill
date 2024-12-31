<script setup>
import DataTable from '@/components/users/DataTable.vue';
import AddUser from '../../components/users/addUser.vue';
</script>
<template>
  <VCol style="position: relative" cols="12">
    <VCard class="pa-0" title="المستخدمين">
      <DataTable />
    </VCard>
    <AddUser />
  </VCol>
</template>
