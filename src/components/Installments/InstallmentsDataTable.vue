<template>
  <v-data-table-server item-value="id" v-model:options="options" :headers="headers" :items="installments"
    :items-length="totalItems" :loading="loading" hover show-current-page @update:options="fetchInstallments"
    :row-props="getRowProps" loading-text="جاري تحميل البيانات" no-data-text="لا توجد بيانات"
    items-per-page-text="عدد الصفوف في الصفحة">
    <template #item.index="{ index }">
      {{ index + 1 }}
    </template>

    <template #item.actions="{ item }">
      <v-btn :color="item.status === 'تم الدفع' ? 'grey' : 'primary'" :disabled="item.status === 'تم الدفع'"
        density="compact" @click="openPayDialog(item)">
        {{ item.status === 'تم الدفع' ? 'تم الدفع' : 'دفع القسط' }}
      </v-btn>
    </template>
  </v-data-table-server>

  <v-pagination v-model="currentPage" :length="Math.ceil(totalItems / itemsPerPage)" class="mt-4"
    :show-first-last="true" :total-visible="5"></v-pagination>

  <!-- Dialog دفع القسط -->
  <PayInstallmentDialog v-model="payDialog" :installment="currentInstallment" @update:installment="updateInstallment" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAll } from '@/services/api';
import PayInstallmentDialog from './PayInstallmentDialog.vue';

const headers = [
  { title: 'رقم القسط', key: 'installment_number' },
  { title: 'العميل', key: 'user.nickname', sortable: false },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'قيمة القسط', key: 'amount' },
  { title: 'الحالة', key: 'status' },
  { title: 'المتبقي', key: 'remaining' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const installments = ref([]);
const payDialog = ref(false);
const currentInstallment = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const loading = ref(false);

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: ['due_date'],
  sortDesc: [false],
});

function openPayDialog(item) {
  currentInstallment.value = item;
  payDialog.value = true;
}

function updateInstallment(newInstallments) {
  newInstallments.forEach(newInstallment => {
    const index = installments.value.findIndex(i => i.id === newInstallment.id);
    if (index !== -1) {
      installments.value[index] = newInstallment;
    }
  });
}

async function fetchInstallments() {
  loading.value = true;

  const { page, itemsPerPage, sortBy } = options.value;

  const sortField = sortBy.length ? sortBy[0].key : 'due_date';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'asc';

  const params = {
    page: page || 1,
    limit: itemsPerPage || 10,
    sort_by: sortField,
    sort_order: sortOrder,
  };

  try {
    const res = await getAll('installments', params, true, true, true);
    installments.value = res.data;
    totalItems.value = res.total;
  } catch (error) {
    console.error('فشل في جلب الأقساط:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // fetchInstallments();
});

watch(
  () => options.value.page,
  () => {
    fetchInstallments();
  }
);

function getRowProps({ item, index }) {
  return {
    class: item.status === 'تم الدفع' ? 'paid-row' : 'unpaid-row',
    'data-index': index,
  };
}
</script>

<style scoped>
.paid-row {
  background-color: #d4edda;
}

.unpaid-row {
  background-color: #f8d7da;
}
</style>
