<script setup>
import { ref, onMounted, watch, createApp, h, nextTick } from 'vue';
import { getAll, deleteOne } from '@/services/api';
import InvoiceForm from '@/components/Invoice/InvoiceForm.vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';

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
    if (!newVal || !newVal.id) return;

    const index = items.value.findIndex(item => item.id === newVal.id);
    if (index !== -1) {
      items.value[index] = { ...newVal };
    } else {
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
  invoice_type: {},
});

function fetchItems() {
  loading.value = true;
  getAll('invoices').then(res => {
    items.value = res.data;
    loading.value = false;
  });
}
// const invoiceId = ref(null);
function editItem(item) {
  editedItem.value = { ...item };

  dialog.value = true;
}
function removeItem(item) {
  if (confirm('هل أنت متأكد من حذف الفاتورة؟')) {
    deleteOne('invoice', item.id).then(fetchItems);
  }
}

function onSaved(data) {
  dialog.value = false;
  const index = items.value.findIndex(item => item.id === data.id);
  if (index !== -1) {
    items.value[index] = data;
  } else {
    items.value.push(data);
  }
}

// دالة لتحويل الحالة من إنجليزي لعربي
function statusText(status) {
  const map = {
    confirmed: 'مؤكد',
    pending: 'معلق',
    cancelled: 'ملغي',
  };
  return map[status] || status;
}

// دالة لتنسيق التاريخ
function formatDate(date) {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-';
}

function printItem(item) {
  if (item && item.id) {
    // جلب بيانات الشركة من user store
    const userStore = useUserStore();
    let companyName = 'اسم الشركة';
    if (userStore.user && userStore.user.companies && userStore.user.company_id) {
      const company = userStore.user.companies.find(c => c.id === userStore.user.company_id);
      if (company) companyName = company.name;
    }
    const invoiceData = item;
    const container = document.createElement('div');
    document.body.appendChild(container);
    import('@/pages/invoices/print/ThermalInvoicePrint.vue').then(module => {
      const ThermalInvoicePrint = module.default;
      const app = createApp({
        render() {
          return h(ThermalInvoicePrint, {
            invoice: invoiceData,
            companyName,
            ref: 'thermalRef',
          });
        },
        mounted() {
          nextTick(() => {
            this.$refs.thermalRef.printThermal && this.$refs.thermalRef.printThermal();
            setTimeout(() => {
              app.unmount();
              document.body.removeChild(container);
            }, 500);
          });
        },
      });
      app.mount(container);
    });
  }
}

onMounted(fetchItems);
</script>

<template>
  <v-card class="pa-2">
    <!-- <v-card-title class="ma-1"> الفواتير </v-card-title> -->

    <v-data-table
      :items="items"
      :loading="loading"
      class="no-wrap-table"
      :headers="[
        { title: 'رقم الفاتورة', value: 'invoice_number', sortable: true },
        { title: 'المستخدم', value: 'user.full_name', sortable: true },
        { title: 'نوع الفاتورة', value: 'invoice_type.name', sortable: true },
        // { title: 'اسم الشركة', value: 'company.name', sortable: true },
        // { title: 'تاريخ الإصدار', value: 'issue_date', sortable: true },
        // { title: 'تاريخ الاستحقاق', value: 'due_date', sortable: true },
        { title: 'المبلغ الإجمالي', value: 'total_amount', sortable: true },
        { title: 'الحالة', value: 'status', sortable: true },
        { title: 'تاريخ الإنشاء', value: 'created_at', sortable: true },
        { title: 'إجراءات', value: 'actions', sortable: false },
      ]"
      :items-per-page-text="'عدد العناصر في الصفحة:'"
      :no-data-text="'لا توجد بيانات'"
      item-value="id"
    >
      <template #item.user.full_name="{ item }">
        {{ item.user?.full_name || '-' }}
      </template>

      <template #item.invoice_type.name="{ item }">
        {{ item.invoice_type?.name || '-' }}
      </template>

      <template #item.company.name="{ item }">
        {{ item.company?.name || '-' }}
      </template>

      <template #item.issue_date="{ item }">
        {{ formatDate(item.issue_date) }}
      </template>

      <template #item.due_date="{ item }">
        {{ formatDate(item.due_date) }}
      </template>

      <template #item.total_amount="{ item }">
        {{ Number(item.total_amount).toLocaleString({ style: 'currency', currency: 'EGP' }) }}
      </template>

      <template #item.status="{ item }">
        {{ statusText(item.status) }}
      </template>

      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon @click="editItem(item)" :title="'تعديل ' + item.invoice_number">
          <v-icon>ri-pencil-line</v-icon>
        </v-btn>
        <v-btn icon color="info" @click="printItem(item)" :title="'طباعة ' + item.invoice_number">
          <v-icon>ri-printer-line</v-icon>
        </v-btn>
        <v-btn icon color="error" @click="removeItem(item)" :title="'حذف ' + item.invoice_number">
          <v-icon>ri-delete-bin-line</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="700">
      <InvoiceForm :model-value="editedItem" :isEdit="true" :invoiceContext="editedItem.invoice_type" @saved="onSaved" @close="dialog = false" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.no-wrap-table .v-data-table__td,
.no-wrap-table .v-data-table__th {
  white-space: nowrap;
}
</style>
