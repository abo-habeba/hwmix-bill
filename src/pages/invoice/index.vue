<script setup>
import { ref } from 'vue';
import InvoiceTable from '@/components/invoice/InvoiceTable.vue';
import InvoiceForm from '@/components/invoice/InvoiceForm.vue';
import InvoiceDetails from '@/components/invoice/InvoiceDetails.vue';

const showForm = ref(false);
const showDetails = ref(false);
const selectedInvoice = ref(null);
const formModel = ref({});

function handleEdit(invoice) {
  formModel.value = { ...invoice };
  showForm.value = true;
}
function handleShow(invoice) {
  selectedInvoice.value = invoice;
  showDetails.value = true;
}
function handleAdd() {
  formModel.value = {};
  showForm.value = true;
}
</script>

<template>
  <div>
    <h2>الفواتير</h2>
    <v-btn color="primary" class="mb-4" @click="handleAdd">إضافة فاتورة</v-btn>
    <InvoiceTable @edit="handleEdit" @show="handleShow" />
    <v-dialog v-model="showForm" :fullscreen="$vuetify.display.xs" max-width="900">
      <InvoiceForm v-if="showForm" :model-value="formModel" @saved="showForm = false" @close="showForm = false" />
    </v-dialog>
    <InvoiceDetails :invoice="selectedInvoice" :visible="showDetails" @close="showDetails = false" />
  </div>
</template>
