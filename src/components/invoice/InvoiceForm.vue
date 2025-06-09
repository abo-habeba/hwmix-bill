<template>
  <v-card class="w-100 h-100 pa-4">
    <!-- رأس البطاقة مع عنوان الفاتورة وحالتها -->
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
      <v-form ref="formRef" v-model="formValid" @submit.prevent="checkInvoiceTypeBeforeSave" id="invoice-form">
        <v-row class="ma-0">
          <!-- اختيار العميل -->
          <v-col class="py-1" cols="12" sm="6">
            <UserSearchInput v-model="selectedUser" />
          </v-col>

          <!-- نوع الفاتورة -->
          <v-col class="py-1" cols="12" sm="6">
            <InvoiceTypeSelect v-model="invoiceType" :invoiceContext="invoiceContext" @update:model-value="handleInvoiceTypeUpdate" />
          </v-col>

          <!-- إدخال السيريال أو مسح الباركود -->
          <v-col class="py-1" cols="12" sm="6">
            <SerialOrBarcodeInput v-model="serialInput" @update:model-value="onSerialInputEnter" />
          </v-col>

          <!-- بحث المنتج -->
          <v-col class="py-1" cols="12" sm="6">
            <ProductSearchInput v-model="productSearch" label="ابحث عن منتج" @update:model-value="onProductSelect" />
          </v-col>
        </v-row>

        <!-- رسالة الخطأ -->
        <div v-if="itemsError" class="text-error text-center text-caption mt-1">{{ itemsError }}</div>

        <!-- جدول العناصر -->
        <InvoiceItemsTable :items="form.items" @update-item="updateItemQuantity" @remove-item="removeInvoiceItem" />

        <!-- المجموع الكلي -->
        <v-row justify="end" class="ma-3">
          <v-chip color="primary" class="pa-3 text-h6">
            <v-icon left>ri-calculator-line</v-icon>
            المجموع الكلي: {{ formatCurrency(form.total_amount) }}
          </v-chip>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- نافذة ماسح الباركود -->
    <v-dialog v-model="showScanner" max-width="400">
      <v-card>
        <v-alert v-if="scannerError" type="warning" dense border="start" border-color="error">
          {{ scannerError }}
        </v-alert>
        <video
          class="ma-2"
          ref="barcodeVideo"
          id="barcodeVideo"
          style="width: 100%; height: 240px; object-fit: cover"
          autoplay
          muted
          playsinline
        ></video>
        <p class="ma-auto">تاكد ان السريال واضح وان الكاميرا نظيفة</p>
      </v-card>
    </v-dialog>

    <!-- أزرار الحفظ والإلغاء -->
    <v-card-actions class="actions-sticky justify-start">
      <v-spacer></v-spacer>
      <v-btn
        class="elevation-4 px-4"
        color="primary"
        append-icon="ri-save-3-line"
        :class="{ 'forbidden-cursor': !formValid }"
        :loading="isSaving"
        :disabled="!formValid || isSaving"
        @click="checkInvoiceTypeBeforeSave"
      >
        حفظ
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="elevation-4 px-4" color="error" append-icon="ri-close-line" @click="$emit('close')" :disabled="isSaving"> إلغاء </v-btn>
      <v-spacer></v-spacer>
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

const emit = defineEmits(['saved', 'close']);

const props = defineProps({
  invoiceId: { type: Number, default: null },
  modelValue: Object,
  invoiceContext: { type: Object, default: { context: 'sales', code: 'sales' } },
});

// Reactive states
const isSaving = ref(false);
const invoiceType = ref(null);
const productSearch = ref(null);
const showScanner = ref(false);
const scannerError = ref(null);
const serialInput = ref('');
const selectedUser = ref(null);
const formRef = ref(null);
const formValid = ref(false);
const itemsError = ref(null);
const form = ref({
  id: null,
  invoice_type_id: null,
  status: null,
  total_amount: 0,
  items: [],
  user_id: null,
});

const showInstallmentDialog = ref(false);

async function loadInvoice(id) {
  try {
    const res = await getOne('invoices', id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (res.data.user) selectedUser.value = res.data.user;
    }
  } catch (error) {
    console.error('خطأ في تحميل الفاتورة:', error);
  }
}

async function searchProductBySerial(serial) {
  if (!serial) return;
  try {
    isSaving.value = true;
    const { data } = await getAll('products', { serial });
    let product = null;
    if (data && (Array.isArray(data) ? data.length : data.items?.length)) {
      product = Array.isArray(data) ? data[0] : data.items[0];
    }
    if (product) {
      addOrIncrement(product);
      itemsError.value = null;
    } else {
      itemsError.value = 'لم يتم العثور على منتج بهذا السيريال';
    }
  } catch (error) {
    itemsError.value = 'حدث خطأ أثناء البحث عن المنتج';
    console.error('searchProductBySerial error:', error);
  } finally {
    isSaving.value = false;
    serialInput.value = '';
  }
}

function addOrIncrement(product) {
  if (!product) {
    console.warn('addOrIncrement: المنتج غير موجود', product);
    return;
  }
  let userType = selectedUser.value?.user_type || 'retail';
  let price = 0;
  if (userType === 'wholesale') {
    price =
      Number(product.wholesale_price) ||
      Number(product.retail_price) ||
      Number(product.price) ||
      Number(product.unit_price) ||
      Number(product.purchase_price) ||
      0;
  } else {
    price =
      Number(product.retail_price) ||
      Number(product.wholesale_price) ||
      Number(product.price) ||
      Number(product.unit_price) ||
      Number(product.purchase_price) ||
      0;
  }
  const existingItem = form.value.items.find(i => i.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.unit_price = price; // تحديث السعر في حال تغير
    updateItemQuantity(existingItem);
  } else {
    const newItem = {
      product_id: productSearch.value.id,
      name: product.name,
      quantity: 1,
      unit_price: price,
      discount: 0,
      total: price,
    };
    form.value.items.push(newItem);
    updateTotal();
  }
}

function updateItemQuantity(item) {
  if (!item) return;
  item.total = item.unit_price * item.quantity - (item.discount || 0);
  if (item.total < 0) item.total = 0;
  updateTotal();
}

function removeInvoiceItem(item) {
  form.value.items = form.value.items.filter(i => i.id !== item.id);
  updateTotal();
}

function updateTotal() {
  form.value.total_amount = form.value.items.reduce((acc, i) => acc + (i.total || 0), 0);
}

function onSerialInputEnter(value) {
  if (value && value.length >= 3) {
    searchProductBySerial(value);
  }
}

function onProductSelect(product) {
  productSearch.value = product;
  addOrIncrement(product);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(value || 0);
}

function checkInvoiceTypeBeforeSave() {
  form.value.invoice_type_id = invoiceType.value?.id || null;
  let typeCode = invoiceType.value?.code || null;
  form.value.invoice_type_code = typeCode;
  form.value.user_id = selectedUser.value?.id;
  if (!form.value.invoice_type_id) {
    itemsError.value = 'يرجى اختيار نوع الفاتورة أولاً';
    return;
  }
  if (!form.value.user_id && selectedUser.value?.id) {
    form.value.user_id = selectedUser.value.id;
  }
  if (form.value.items.length === 0) {
    itemsError.value = 'يجب إضافة منتجات إلى الفاتورة';
    return;
  }
  if (typeCode === 'installment_sale') {
    openInstallmentDialog(form.value);
  } else {
    console.log('else installment_sale');

    saveInvoice(form.value);
  }

  // saveInvoice();
}

async function saveInvoice(data) {
  isSaving.value = true;
  itemsError.value = null;
  try {
    // إرسال بيانات الفاتورة إلى API
    if (form.value.id) {
      await saveItem('invoice', data, form.value.id, true, true).then(res => {
        console.log('saveInvoice', res);
        emit('saved', res.data);
      });
    } else {
      await saveItem('invoice', data, false, true, true).then(res => {
        console.log('saveInvoice local', res);
        emit('saved', res.data);
      });
    }

    emit('close');
  } catch (error) {
    itemsError.value = 'حدث خطأ أثناء الحفظ';
    console.error('saveInvoice error:', error);
  } finally {
    isSaving.value = false;
  }
}

function handleInvoiceTypeUpdate(type) {
  return console.log('run handleInvoiceTypeUpdate typeId'.type);

  const selectedType = (form.value.invoice_type_id = typeId);
  const typeCode = invoiceTypes.find(type => type.id === typeId)?.code;
  form.value.invoice_type_code = typeCode;

  if (typeCode === 'installment_sale') {
    if (installmentDialogRef.value && typeof installmentDialogRef.value.openDialog === 'function') {
      installmentDialogRef.value.openDialog(form.value);
    } else {
      console.error('InstallmentDialog reference or openDialog method is invalid:', installmentDialogRef.value);
    }
  } else {
    console.log('Invoice type code:', typeCode);
  }
}
function openInstallmentDialog() {
  showInstallmentDialog.value = true;
}

function handleInstallmentSaved(data) {
  // console.log('da', data);
  saveInvoice(data);
}

onMounted(() => {
  if (props.invoiceId) {
    loadInvoice(props.invoiceId);
  } else if (props.modelValue) {
    Object.assign(form.value, props.modelValue);
    if (props.modelValue.user) {
      selectedUser.value = props.modelValue.user;
    }
  }
});

// Watch selectedUser to update form.user_id accordingly
watch(selectedUser, newUser => {
  form.value.user_id = newUser?.id || null;
});

// Watch items changes to update total automatically
watch(
  () => form.value.items,
  () => updateTotal(),
  { deep: true }
);
</script>

<style scoped>
.actions-sticky {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  padding-top: 12px;
  padding-bottom: 12px;
}
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
