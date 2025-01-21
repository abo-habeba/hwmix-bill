<script setup>
import DataTable from '@/components/cashboxs/DataTable.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>
<template>
  <VCol style="position: relative" cols="12">
    <VCard class="pa-0" title="الخزن">
      <DataTable />
    </VCard>
    <v-btn
      class="text-center btn-add"
      density="compact"
      variant="flat"
      v-if="userStore.can(['cashbox_create', 'super_admin', 'company_owner'])"
      :to="{ name: 'edit-user' }"
      style="background-color: #28a745 !important; color: white; z-index: 10"
      prepend-icon="ri-add-line"
    >
    </v-btn>
  </VCol>
</template>
<style lang="scss" scoped>
.btn-add {
  position: absolute;

  @media (max-width: 599px) {
    bottom: 20px;
    top: auto;
    right: 20px;
  }

  @media (min-width: 600px) {
    top: 20px;
    bottom: auto;
    left: 20px;
  }
}
</style>
