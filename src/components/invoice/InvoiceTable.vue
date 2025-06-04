<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAll, deleteOne } from '@/services/api';
import InvoiceForm from './InvoiceForm.vue';

const items = ref([]);
const loading = ref(false);
const dialog = ref(false);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => props.modelValue,
  newVal => {
    console.log('watch table', newVal);

    if (!newVal || !newVal.id) return;

    const index = items.value.findIndex(item => item.id === newVal.id);
    if (index !== -1) {
      // تحديث العنصر
      items.value[index] = { ...newVal };
    } else {
      // إضافة عنصر جديد
      items.value.push({ ...newVal });
    }
  },
  { deep: true }
);
const editedItem = ref({
  id: null,
  user_id: '',
  invoice_type_id: '',
  invoice_number: '',
  issue_date: '',
  due_date: '',
  total_amount: '',
  status: '',
  notes: '',
  items: [],
});

function fetchItems() {
  loading.value = true;
  getAll('invoices').then(res => {
    items.value = res.data;
    loading.value = false;
  });
}

function editItem(item) {
  editedItem.value = { ...item };
  dialog.value = true;
}

function addItem() {
  editedItem.value = {
    id: null,
    user_id: '',
    invoice_type_id: '',
    invoice_number: '',
    issue_date: '',
    due_date: '',
    total_amount: '',
    status: '',
    notes: '',
    items: [],
  };
  dialog.value = true;
}

function removeItem(item) {
  if (confirm('هل أنت متأكد من حذف الفاتورة؟')) {
    deleteOne('invoice', item.id).then(fetchItems);
  }
}

function onSaved() {
  dialog.value = false;
  fetchItems();
}

onMounted(fetchItems);
</script>

<template>
  <v-card>
    <v-card-title class="ma-1"> الفواتير </v-card-title>
    <!-- <v-btn class="ms-5 mb-5" color="primary" @click="addItem">إضافة فاتورة</v-btn> -->
    <v-data-table
      :items="items"
      :loading="loading"
      :headers="[
        { title: 'رقم الفاتورة', value: 'invoice_number' },
        { title: 'المستخدم', value: 'user_id' },
        { title: 'نوع الفاتورة', value: 'invoice_type_id' },
        { title: 'تاريخ الإصدار', value: 'issue_date' },
        { title: 'تاريخ الاستحقاق', value: 'due_date' },
        { title: 'المبلغ الإجمالي', value: 'total_amount' },
        { title: 'الحالة', value: 'status' },
        { title: 'تاريخ الإنشاء', value: 'created_at' },
        { title: 'إجراءات', value: 'actions', sortable: false },
      ]"
      :items-per-page-text="'عدد العناصر في الصفحة:'"
      :no-data-text="'لا توجد بيانات'"
    >
      <template #item.actions="{ item }">
        <v-btn icon @click="editItem(item)"><v-icon>ri-pencil-line</v-icon></v-btn>
        <v-btn icon color="error" @click="removeItem(item)"><v-icon>ri-delete-bin-line</v-icon></v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="700">
      <InvoiceForm :model-value="editedItem" @saved="onSaved" @close="dialog = false" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.no-wrap-table .v-data-table__td,
.no-wrap-table .v-data-table__th {
  white-space: nowrap;
}
</style>
