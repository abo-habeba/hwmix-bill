<script setup>
import { ref, watch, onMounted } from 'vue';
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

function handleEdit(invoice) {
  formModel.value = { ...invoice };
  dialogContext.value = invoice.invoice_type || 'sales'; // ضبط السياق على نوع الفاتورة لو متوفر
  showForm.value = true;
}

function handleSaved(data) {
  invoice.value = data;
  console.log('handleSaved', data);
}

function handleShow(invoice) {
  selectedInvoice.value = invoice;
  showDetails.value = true;
}

function handleAdd(context) {
  formModel.value = {};
  dialogContext.value = context;
  showForm.value = true;
}

const route = useRoute();

// فتح نموذج الإضافة مباشرةً لو الرابط هو 'invoice-create'
watch(
  () => route.name,
  val => {
    if (val === 'invoice-create') {
      showForm.value = true;
    }
  },
  { immediate: true }
);

// مراقبة القيم للتأكد من صحتها (للتنبيه فقط)
watch(showForm, val => {
  if (typeof val !== 'boolean') console.error('Invalid value for showForm:', val);
});

// watch(dialogContext, val => {
//   if (val && typeof val !== 'string') console.error('Invalid value for dialogContext:', val);
// });

watch(formModel, val => {
  if (!val || typeof val !== 'object') console.error('Invalid value for formModel:', val);
});
</script>

<template>
  <div>
    <h2>الفواتير</h2>
    <v-btn color="primary" class="ma-2" prepend-icon="ri-file-list-3-line" @click="handleAdd({ code: 'sale', context: 'sales' })"> فاتورة بيع </v-btn>
    <v-btn color="primary" class="ma-2" prepend-icon="ri-shopping-cart-line" @click="handleAdd({ code: 'purchase', context: 'purchases' })">
      فاتورة شراء
    </v-btn>
    <v-btn color="primary" class="ma-2" prepend-icon="ri-money-dollar-circle-line" @click="handleAdd({ code: 'installment_sale', context: 'sales' })">
      فاتورة تقسيط
    </v-btn>

    <InvoiceTable :model-value="invoice" @edit="handleEdit" @show="handleShow" />

    <v-dialog v-model="showForm" :fullscreen="$vuetify.display.xs" max-width="900" scrollable>
      <!-- <InvoiceForm v-if="showForm" :model-value="formModel" :invoiceContext="dialogContext" @saved="showForm = false" @close="showForm = false" /> -->
      <InvoiceForm
        v-if="showForm"
        :model-value="formModel"
        :invoiceContext="dialogContext"
        @saved="
          data => {
            handleSaved(data);
            showForm = false;
          }
        "
        @close="showForm = false"
      />
    </v-dialog>

    <InvoiceDetails @saveItem="handleSaved" :invoice="selectedInvoice" :visible="showDetails" @close="showDetails = false" />
  </div>
</template>

<style scoped>
.ma-3 {
  margin: 1rem !important;
}
</style>
