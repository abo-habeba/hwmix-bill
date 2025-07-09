<template>
  <v-data-table-server
    item-value="id"
    v-model:options="options"
    :headers="headers"
    :items="installments"
    :items-length="totalItems"
    :loading="loading"
    hover
    show-current-page
    @update:options="fetchInstallments"
    :row-props="getInstallmentRowProps"
    loading-text="جاري تحميل البيانات"
    no-data-text="لا توجد بيانات"
    items-per-page-text="عدد الصفوف في الصفحة"
  >
    <template #item.index="{ index }">
      {{ index + 1 }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        :color="item.status === 'تم الدفع' ? 'grey' : 'primary'"
        :disabled="item.status === 'تم الدفع'"
        density="compact"
        @click="openPayDialog(item)"
      >
        {{ item.status === 'تم الدفع' ? 'تم الدفع' : 'دفع القسط' }}
      </v-btn>
    </template>
  </v-data-table-server>

  <v-pagination
    v-model="currentPage"
    :length="Math.ceil(totalItems / itemsPerPage)"
    class="mt-4"
    :show-first-last="true"
    :total-visible="5"
  ></v-pagination>

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
// دالة لتنسيق صف جدول الأقساط بناءً على حالة القسط
function getInstallmentRowProps({ item }) {
  const remainingAmount = parseFloat(item.remaining) || 0;
  const dueDate = new Date(item.due_date);
  const today = new Date();
  // لضمان مقارنة التواريخ فقط (تجاهل الوقت)
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (item.status === 'تم الدفع') {
    return { style: { backgroundColor: '#A5D6A7' } }; // أخضر أغمق قليلاً (Material Design Light Green 300)
  } else if (remainingAmount > 0 && dueDate < today) {
    return { style: { backgroundColor: '#EF9A9A' } }; // أحمر أغمق قليلاً (Material Design Red 200)
  } else if (remainingAmount > 0) {
    return { style: { backgroundColor: '#FFE082' } }; // أصفر/برتقالي أغمق قليلاً (Material Design Amber 200)
  }
  return {}; // لا يوجد تنسيق خاص
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
