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
      <v-form ref="formRef" v-model="formValid" @submit.prevent="save" id="invoice-form">
        <v-row class="ma-0">
          <!-- اختيار العميل -->
          <v-col class="py-0" cols="12" sm="6">
            <UserSearchInput v-model="selectedUser" />
          </v-col>
          <!-- نوع الفاتورة -->
          <v-col class="py-0" cols="12" sm="6">
            <InvoiceTypeSelect v-model="form.invoice_type_id" />
          </v-col>
          <!-- بحث المنتج -->
          <v-col class="py-0" cols="12" sm="6">
            <ProductSearchInput v-model="productSearch" :label="'ابحث عن منتج'" @update:model-value="onProductSelect" />
          </v-col>
          <!-- إدخال السيريال أو مسح الباركود -->
          <v-col class="py-0" cols="12" sm="6">
            <SerialOrBarcodeInput v-model="serialInput" @update:model-value="onSerialInputEnter" />
          </v-col>
        </v-row>

        <!-- عرض رسالة خطأ في حال وجودها -->
        <div v-if="itemsError" class="text-error text-center text-caption mt-1">{{ itemsError }}</div>

        <!-- جدول العناصر -->
        <v-data-table :headers="headers" :items="form.items" item-key="id" class="elevation-1 ma-3" hide-default-footer density="compact">
          <template #no-data>
            <v-row class="pa-1">
              <v-col class="text-center text-grey"> لا توجد منتجات مضافة </v-col>
            </v-row>
          </template>

          <template #item.name="{ item }">{{ item.name }}</template>

          <template #item.quantity="{ item }">
            <v-text-field
              v-model.number="item.quantity"
              type="number"
              min="1"
              dense
              hide-details
              style="max-width: 60px"
              @input="updateItemQuantity(item)"
            />
          </template>

          <template #item.unit_price="{ item }">{{ formatCurrency(item.unit_price) }}</template>

          <template #item.discount="{ item }">
            <v-text-field
              v-model.number="item.discount"
              type="number"
              min="0"
              :max="item.unit_price"
              dense
              hide-details
              style="max-width: 60px"
              @input="updateItemQuantity(item)"
            />
          </template>

          <template #item.total="{ item }">{{ formatCurrency(item.total) }}</template>

          <template #item.actions="{ item }">
            <v-btn icon color="error" @click="removeInvoiceItem(item.id)">
              <v-icon>ri-delete-bin-line</v-icon>
            </v-btn>
          </template>
        </v-data-table>

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
        type="submit"
        form="invoice-form"
        :class="{ 'forbidden-cursor': !formValid }"
        :loading="isSaving"
      >
        حفظ
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="elevation-4 px-4" color="error" append-icon="ri-close-line" @click="$emit('close')"> إلغاء </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getAll, saveItem, getOne } from '@/services/api';
import { BrowserMultiFormatReader } from '@zxing/library';
import UserSearchInput from '@/components/users/UserSearchInput.vue';
import InvoiceTypeSelect from '@/components/invoice/InvoiceTypeSelect.vue';
import ProductSearchInput from '@/components/products/ProductSearchInput.vue';
import SerialOrBarcodeInput from '@/components/products/SerialOrBarcodeInput.vue';

// استقبال الأحداث من الكمبوننت الأب
const emit = defineEmits(['saved', 'close']);

// استقبال الخصائص (ID الفاتورة في حالة التعديل)
const props = defineProps({
  invoiceId: { type: Number, default: null },
});

// --- Reactive States ---
const isSaving = ref(false);
const isLoadingProducts = ref(false);
const productSearch = ref(null);
const showScanner = ref(false);
const scannerError = ref(null);
const barcodeVideo = ref(null);
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
  customer_id: null,
});

// --- التعريفات الثابتة ---
const headers = [
  { title: 'المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity', width: 70 },
  { title: 'سعر الوحدة', key: 'unit_price', width: 100 },
  { title: 'الخصم', key: 'discount', width: 80 },
  { title: 'الإجمالي', key: 'total', width: 120 },
  { title: 'إجراءات', key: 'actions', width: 80, sortable: false },
];

//  * تحميل بيانات الفاتورة عند وجود ID (تعديل)

async function loadInvoice(id) {
  try {
    const res = await getOne('invoices', id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (res.data.customer) {
        selectedUser.value = res.data.customer;
      }
    }
  } catch (error) {
    console.error('خطأ في تحميل الفاتورة:', error);
  }
}
// --- البحث عن منتج بالسيريال ---
async function searchProductBySerial(serial) {
  try {
    if (!serial) return;
    isLoadingProducts.value = true;
    // ابحث عن المنتج بالسيريال عبر API
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
    isLoadingProducts.value = false;
    serialInput.value = '';
  }
}

// --- إضافة أو زيادة كمية المنتج في الفاتورة ---
function addOrIncrement(product) {
  if (!product) return;
  const existingItem = form.value.items.find(i => i.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    form.value.items.push({
      id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: product.price,
      discount: 0,
      total: product.price,
    });
  }
  updateTotal();
}

// --- استقبال السيريال من SerialOrBarcodeInput ---
function onSerialInputEnter(serial) {
  if (!serial) return;
  searchProductBySerial(serial);
}

// --- تنسيق العملة ---
function formatCurrency(value) {
  const number = Number(value);
  if (isNaN(number)) return '';
  return number.toLocaleString('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// --- حفظ الفاتورة ---
async function save() {
  if (!formValid.value) return;
  try {
    isSaving.value = true;
    // احفظ الفاتورة عبر API
    const res = await saveItem('invoices', form.value);
    emit('saved', res.data);
  } catch (error) {
    console.error('خطأ في حفظ الفاتورة:', error);
  } finally {
    isSaving.value = false;
  }
}

// --- تحديث إجمالي الفاتورة ---
function updateTotal() {
  const total = form.value.items.reduce((sum, item) => {
    return sum + (item.unit_price * item.quantity - item.discount);
  }, 0);
  form.value.total_amount = total;
}

// --- مراقبة تغييرات السيريال ---
watch(serialInput, newVal => {
  if (!newVal) return;
  const timer = setTimeout(() => {
    searchProductBySerial(newVal);
  }, 300);
  return () => clearTimeout(timer);
});

// --- تحميل بيانات الفاتورة وأنواع الفواتير عند التMount ---
onMounted(() => {
  if (props.invoiceId) {
    loadInvoice(props.invoiceId);
  }
});

// --- معالجة اختيار المنتج من ProductSearchInput ---
function onProductSelect(product) {
  if (product) {
    addOrIncrement(product);
  }
}
</script>

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
