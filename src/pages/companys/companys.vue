<script setup>
import AddCompany from '@/components/companys/addCompany.vue';
import CompanysDataTable from '@/components/companys/CompanysDataTable.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>
<template>
  <VCol style="position: relative" cols="12">
    <VCard class="pa-0" title=" الشركات ">
      <CompanysDataTable />
    </VCard>
    <AddCompany v-if="userStore.can(['companies.create', 'admin.super', 'company.owner'])" />
  </VCol>
</template>
