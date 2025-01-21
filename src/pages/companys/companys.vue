<script setup>
import AddCompany from '@/components/companys/addCompany.vue';
import DataTable from '@/components/companys/DataTable.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>
<template>
  <VCol style="position: relative" cols="12">
    <VCard class="pa-0" title=" الشركات ">
      <DataTable />
    </VCard>
    <AddCompany v-if="userStore.can(['companys_create', 'super_admin', 'company_owner'])" />
  </VCol>
</template>
