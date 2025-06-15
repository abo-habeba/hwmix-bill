<template>
  <v-card class="w-100 h-100 pa-4">
    <!-- رأس البطاقة -->
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex align-center">
        <v-icon class="me-2" size="28">ri-file-list-3-line</v-icon>
        <span class="text-h5">{{ form.id ? 'تعديل فاتورة' : 'فاتورة جديدة' }}</span>
      </div>

      <!-- حالة الفاتورة -->
      <v-chip v-if="form.status" color="success" class="px-3">
        <v-icon left small>ri-checkbox-circle-line</v-icon>
        {{ form.status }}
      </v-chip>

      <!-- رصيد العميل -->
      <v-chip
        v-if="selectedUser && typeof selectedUser.balance !== 'undefined'"
        class="ms-2 px-4 py-2 text-h6 font-weight-bold"
        color="info"
        prepend-icon="ri-wallet-3-line"
        style="font-size: 1.1rem; min-width: 160px; direction: ltr"
      >
        <span class="me-1">رصيد العميل:</span>
        <span :class="{ 'text-error': selectedUser.balance < 0, 'text-success': selectedUser.balance >= 0 }">
          {{ formatCurrency(selectedUser.balance) }}
        </span>
      </v-chip>
    </v-card-title>

    <v-divider class="mb-3" />

    <!-- نموذج الفاتورة -->
    <v-card-text class="overflow-y-auto" style="max-height: calc(100vh - 200px)">
      <v-form ref="formRef" v-model="formValid" @submit.prevent="checkInvoiceTypeBeforeSave">
        <v-row class="ma-0">
          <!-- اختيار العميل -->
          <v-col cols="12" sm="6" class="py-1"><UserSearchInput v-model="selectedUser" /></v-col>

          <!-- نوع الفاتورة -->
          <v-col cols="12" sm="6" class="py-1">
            <InvoiceTypeSelect v-model="invoiceType" :invoiceContext="invoiceContext" @update:model-value="handleInvoiceTypeUpdate" />
          </v-col>

          <!-- إدخال سيريال / باركود -->
          <v-col cols="12" sm="6" class="py-1"><SerialOrBarcodeInput v-model="serialInput" @update:model-value="onSerialInputEnter" /></v-col>

          <!-- بحث المنتج -->
          <v-col cols="12" sm="6" class="py-1"
            ><ProductSearchInput v-model="productSearch" label="ابحث عن منتج" @update:model-value="onProductSelect"
          /></v-col>
        </v-row>

        <!-- رسالة الخطأ -->
        <div v-if="itemsError" class="text-error text-center text-caption mt-1">{{ itemsError }}</div>

        <!-- جدول العناصر -->
        <InvoiceItemsTable :items="form.items" @update-item="updateItemQuantity" @remove-item="removeInvoiceItem" />

        <!-- المجموع الكلي -->
        <v-row justify="end" class="ma-3">
          <v-chip color="primary" class="pa-3 text-h6"
            ><v-icon left>ri-calculator-line</v-icon> المجموع الكلي: {{ formatCurrency(form.total_amount) }}</v-chip
          >
        </v-row>
      </v-form>
    </v-card-text>

    <!-- أزرار الحفظ / الإلغاء -->
    <v-card-actions class="actions-sticky justify-start">
      <v-spacer />
      <v-btn color="primary" append-icon="ri-save-3-line" :loading="isSaving" :disabled="!formValid || isSaving" @click="checkInvoiceTypeBeforeSave"
        >حفظ</v-btn
      >
      <v-spacer />
      <v-btn color="error" append-icon="ri-close-line" @click="$emit('close')" :disabled="isSaving">إلغاء</v-btn>
      <v-spacer />
    </v-card-actions>

    <!-- حوار التقسيط -->
    <InstallmentDialog
      :form="form"
      :visible="showInstallmentDialog"
      @installment-saved="handleInstallmentSaved"
      @update:visible="showInstallmentDialog = $event"
    />
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAll, saveItem, getOne } from '@/services/api';
import UserSearchInput from '@/components/users/UserSearchInput.vue';
import InvoiceTypeSelect from '@/components/Invoice/InvoiceTypeSelect.vue';
import ProductSearchInput from '@/components/products/ProductSearchInput.vue';
import SerialOrBarcodeInput from '@/components/products/SerialOrBarcodeInput.vue';
import InstallmentDialog from '@/components/Invoice/InstallmentDialog.vue';
import InvoiceItemsTable from '@/components/Invoice/InvoiceItemsTable.vue';

const emit = defineEmits(['saved', 'close']);
const props = defineProps({
  invoiceId: { type: Number, default: null },
  modelValue: Object,
  invoiceContext: { type: Object, default: () => ({ context: 'sales', code: 'sales' }) },
});

/* ==================== State ==================== */
const isSaving = ref(false);
const invoiceType = ref(null);
const productSearch = ref(null);
const serialInput = ref('');
const selectedUser = ref(null);
const formRef = ref(null);
const formValid = ref(false);
const itemsError = ref(null);
const form = ref({ id: null, invoice_type_id: null, invoice_type_code: null, status: null, total_amount: 0, items: [], user_id: null });
const showInstallmentDialog = ref(false);

/* =============== Lifecycle =============== */
async function loadInvoice(id) {
  try {
    const res = await getOne('invoices', id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (res.data.user) selectedUser.value = res.data.user;
    }
  } catch (e) {
    console.error('خطأ في تحميل الفاتورة:', e);
  }
}

onMounted(() => {
  if (props.invoiceId) {
    loadInvoice(props.invoiceId);
  } else if (props.modelValue) {
    Object.assign(form.value, props.modelValue);
    if (props.modelValue.user) selectedUser.value = props.modelValue.user;
  }
});

/* =============== Watchers =============== */
watch(selectedUser, user => (form.value.user_id = user?.id || null));
watch(
  () => form.value.items,
  () => updateTotal(),
  { deep: true }
);

/* ==================== Helpers ==================== */
function formatCurrency(val) {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}

function updateTotal() {
  form.value.total_amount = form.value.items.reduce((acc, item) => acc + (item.total || 0), 0);
}

function updateItemQuantity(item) {
  item.total = item.unit_price * item.quantity - (item.discount || 0);
  if (item.total < 0) item.total = 0;
  updateTotal();
}

function removeInvoiceItem(item) {
  if (!item || !item.product_id) {
    console.error('Invalid item passed to removeInvoiceItem:', item);
    return;
  }
  form.value.items = form.value.items.filter(i => i.product_id !== item.product_id);
  updateTotal();
}

function addOrIncrement(product) {
  if (!product || !product.id || !product.product_name) {
    console.error('Invalid product data:', product);
    return;
  }

  const userType = selectedUser.value?.user_type || 'retail';
  const price =
    userType === 'wholesale'
      ? Number(product.wholesale_price || product.retail_price || 0)
      : Number(product.retail_price || product.wholesale_price || 0);

  const existing = form.value.items.find(i => i.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
    existing.unit_price = price;
    updateItemQuantity(existing);
  } else {
    const newItem = {
      variant_id: product.id,
      product_id: product.product_id,
      name: product.product_name,
      quantity: 1,
      unit_price: price,
      discount: Number(product.discount || 0),
      total: price,
      attributes: product.attributes || [],
      stocks: product.stocks || [],
    };
    console.log('Adding new item:', newItem);
    form.value.items.push(newItem);
    console.log('form value:', form.value);
    updateTotal();
  }
}

function onSerialInputEnter(val) {
  if (val && val.length >= 3) searchProductBySerial(val);
}

async function searchProductBySerial(serial) {
  if (!serial) return;
  try {
    isSaving.value = true;
    const { data } = await getAll('products', { serial });
    const product = Array.isArray(data) ? data[0] : data.items?.[0];
    if (product) {
      addOrIncrement(product);
      itemsError.value = null;
    } else {
      itemsError.value = 'لم يتم العثور على منتج بهذا السيريال';
    }
  } catch (e) {
    itemsError.value = 'حدث خطأ أثناء البحث عن المنتج';
    console.error(e);
  } finally {
    isSaving.value = false;
    serialInput.value = '';
  }
}

function onProductSelect(prod) {
  if (!prod || typeof prod !== 'object') {
    console.error('Invalid product selected:', prod);
    return;
  }
  productSearch.value = prod;
  addOrIncrement(prod);
}

/* ============ التعامل مع نوع الفاتورة ============ */
function handleInvoiceTypeUpdate(type) {
  console.log('handleInvoiceTypeUpdate:', type);
  form.value.invoice_type_id = type?.id || null;
  form.value.invoice_type_code = type?.code || null;
  // if (type?.code === 'installment_sale') openInstallmentDialog();
}

function openInstallmentDialog() {
  showInstallmentDialog.value = true;
}

function handleInstallmentSaved(payload) {
  saveInvoice(payload);
}

/* ============ حفظ الفاتورة ============ */
function checkInvoiceTypeBeforeSave() {
  form.value.invoice_type_id = invoiceType.value?.id || null;
  form.value.invoice_type_code = invoiceType.value?.code || null;
  form.value.user_id = selectedUser.value?.id || form.value.user_id;

  if (!form.value.invoice_type_id) return (itemsError.value = 'يرجى اختيار نوع الفاتورة أولاً');
  if (!form.value.items.length) return (itemsError.value = 'يجب إضافة منتجات إلى الفاتورة');

  // تحقق من أن جميع العناصر تحتوي على الحقول المطلوبة
  const invalidItem = form.value.items.find(item => !item.product_id || !item.name);
  if (invalidItem) return (itemsError.value = 'يرجى التأكد من أن جميع المنتجات تحتوي على الحقول المطلوبة');

  if (form.value.invoice_type_code === 'installment_sale') openInstallmentDialog();
  else saveInvoice(form.value);
}

async function saveInvoice(payload) {
  console.log('Saving invoice:', JSON.stringify(payload, null, 2));
  console.log('Saving form:', JSON.stringify(form.value, null, 2));
  try {
    isSaving.value = true;
    itemsError.value = null;
    console.log('حفظ الفاتورة:', payload);
    const res = form.value.id ? await saveItem('invoice', payload, form.value.id, true, true) : await saveItem('invoice', payload, false, true, true);
    console.log('تم حفظ الفاتورة بنجاح:', res);
    emit('saved', res.data);
    emit('close');
  } catch (e) {
    itemsError.value = 'حدث خطأ أثناء الحفظ';
    console.error(e);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.actions-sticky {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  padding: 12px 0;
}
</style>
