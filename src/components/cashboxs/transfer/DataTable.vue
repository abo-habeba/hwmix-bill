<template>
  <v-container id="dataTable" style="position: relative !important">
    <v-data-table-server style="white-space: nowrap" item-value="id" v-model:items-per-page="itemsPerPage"
      v-model:options="options" :headers="headers" :items="transactions" :items-length="total" :loading="loading" hover
      show-current-page :row-props="getRowProps" v-model="selectedTransactions" loading-text="جاري تحميل البيانات"
      no-data-text="لا توجد بيانات" items-per-page-text="عدد الصفوف في الصفحة" @update:options="fetchTransactions"
      @contextmenu:row="showContextMenu" @click:row="openTransactionDialog">
      <template #item.index="{ index }">
        {{ index + 1 }}
      </template>

      <template #item.action="{ item }">
        <v-btn density="compact" variant="text" color="#0086CD" prepend-icon="ri-more-2-fill"
          @click.stop="event => showContextMenu(event, { item })">
        </v-btn>
      </template>
    </v-data-table-server>
    <TransactionDialog ref="transactionDialogRef" :transaction="currentTransaction" />
    <ContextMenu ref="contextMenuRef" :actions="contextActions" />
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'; // إزالة onMounted المباشر
import { getAll } from '@/services/api';

const props = defineProps({
  cashBoxId: {
    type: [Number, String],
    required: false,
  },
});

const selectedTransactions = ref([]);
const total = ref(0);
const transactions = ref([]);
const currentTransaction = ref(null);
const loading = ref(false);
const itemsPerPage = ref(10);

const options = ref({
  page: 1,
  sortBy: [],
  itemsPerPage: 10,
});

const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'نوع العملية', key: 'type', align: 'start' },
  { title: 'المبلغ', key: 'amount', align: 'start' },
  { title: 'التاريخ', key: 'created_at', align: 'center' },
  { title: 'الوصف', key: 'description', sortable: false, align: 'center' },
  { title: 'إجراءات', key: 'action', sortable: false, align: 'end' },
]);
onMounted(() => {

  fetchTransactions();

});
const transactionDialogRef = ref(null);
const contextMenuRef = ref(null);

async function fetchTransactions() {
  if (!props.cashBoxId) {
    console.warn('cashBoxId غير موجود، لا يمكن جلب المعاملات.');
    transactions.value = [];
    total.value = 0;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const { page, itemsPerPage, sortBy } = options.value;
    const sortField = sortBy.length ? sortBy[0].key : 'id';
    const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';
    const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;

    const response = await getAll(`transactions/user/${props.cashBoxId}`, {
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_order: sortOrder,
    });

    transactions.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('خطأ في جلب المعاملات:', error);
    transactions.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// مراقبة تغييرات cashBoxId وخيارات الجدول
watch(
  [() => props.cashBoxId, options],
  ([newCashBoxId, newOptions], [oldCashBoxId, oldOptions]) => {
    // جلب البيانات فقط إذا تغير cashBoxId أو خيارات الجدول
    if (newCashBoxId !== oldCashBoxId || JSON.stringify(newOptions) !== JSON.stringify(oldOptions)) {
      fetchTransactions();
    }
  },
  { deep: true, immediate: true } // immediate: true لضمان الجلب الأولي
);

const openTransactionDialog = (event, { item }) => {
  currentTransaction.value = item;
  if (transactionDialogRef.value) {
    transactionDialogRef.value.operationDialog();
  }
};

const showContextMenu = (event, { item }) => {
  currentTransaction.value = item;
  event.preventDefault();
  if (contextMenuRef.value) {
    contextMenuRef.value.showContextMenu(event);
  }
};

const contextActions = ref([
  {
    title: 'عرض التفاصيل',
    color: '#17a2b8',
    icon: 'ri-eye-line',
    callback: () => {
      if (currentTransaction.value) {
        openTransactionDialog(null, { item: currentTransaction.value });
      }
      closeContextMenu();
    },
  },
]);

const closeContextMenu = () => {
  if (contextMenuRef.value) {
    contextMenuRef.value.colsContextMenu();
  }
};

function getRowProps({ item, index }) {
  return {
    class: item.status === 'completed' ? 'success-row' : (item.status === 'failed' ? 'error-row' : 'default-row'),
    'data-index': index,
  };
}

defineExpose({ fetchTransactions });
</script>

<style>
.default-row {
  background-color: transparent;
}

.success-row {
  background-color: #d4edda;
}

.error-row {
  background-color: #f8d7da;
}
</style>
