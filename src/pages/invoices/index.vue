<template>
  <div>
    <h2>الفواتير</h2>
    <div class="d-flex justify-space-evenly flex-wrap justify-center align-center mb-2 w-100">
      <v-btn class="px-1" color="primary" prepend-icon="ri-file-list-3-line"
        @click="handleAdd({ code: 'sale', context: 'sales' })">
        فاتورة بيع </v-btn>
      <v-btn class="px-1" color="primary" prepend-icon="ri-shopping-cart-line"
        @click="handleAdd({ code: 'purchase', context: 'purchases' })">
        فاتورة شراء
      </v-btn>
      <v-btn class="px-1" color="primary" prepend-icon="ri-money-dollar-circle-line"
        @click="handleAdd({ code: 'installment_sale', context: 'sales' })">
        فاتورة تقسيط
      </v-btn>
    </div>
    <!-- أزرار إضافة فواتير بأنواع مختلفة -->

    <!-- جدول الفواتير -->
    <InvoiceTable :model-value="invoice" @edit="handleEdit" @show="handleShow" />

    <!-- نموذج إضافة / تعديل الفاتورة -->
    <v-dialog v-model="showForm" max-width="900">
      <InvoiceForm v-if="showForm" :model-value="formModel" :invoiceContext="dialogContext" @saved="onFormSaved"
        @close="closeForm" />
    </v-dialog>

    <!-- تفاصيل الفاتورة -->
    <InvoiceDetails :invoice="selectedInvoice" :visible="showDetails" @close="showDetails = false"
      @saveItem="handleSaved" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import InvoiceTable from '@/components/Invoice/InvoiceTable.vue';
import InvoiceForm from '@/components/Invoice/InvoiceForm.vue';
import InvoiceDetails from '@/components/Invoice/InvoiceDetails.vue';

const showForm = ref(false);
const showDetails = ref(false);
const selectedInvoice = ref(null);
const formModel = ref({});
const dialogContext = ref(null);
const invoice = ref({});

/* --------------------------------------------------
   دوال مساعدة
-------------------------------------------------- */
function closeForm() {
  showForm.value = false;
}

function handleEdit(inv) {
  formModel.value = { ...inv };
  dialogContext.value = inv.invoice_type || { code: 'sale', context: 'sales' };
  showForm.value = true;
}

function handleSaved(data) {
  invoice.value = data; // لتحديث الجدول
}

function onFormSaved(data) {
  handleSaved(data);
  closeForm();
}

function handleShow(inv) {
  selectedInvoice.value = inv;
  showDetails.value = true;
}

function handleAdd(context) {
  formModel.value = {};
  dialogContext.value = context;
  showForm.value = true;
}

/* --------------------------------------------------
   فتح النموذج مباشرةً لو المسار يساوي invoice-create
-------------------------------------------------- */
const route = useRoute();
watch(
  () => route.name,
  name => {
    if (name === 'invoice-create') showForm.value = true;
  },
  { immediate: true }
);
</script>

<style scoped>
.ma-3 {
  margin: 1rem !important;
}
</style>
