<template>
  <v-card class="w-100 h-100 pa-4">
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex align-center">
        <v-icon class="me-2" size="28">ri-file-list-3-line</v-icon>
        <span class="text-h5">{{ form.id ? 'تعديل فاتورة' : 'فاتورة جديدة' }}</span>
      </div>
      <v-chip v-if="form.status" color="success" class="px-3">
        <v-icon left small>ri-checkbox-circle-line</v-icon>
        {{ form.status }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text class="overflow-y-auto" style="max-height: calc(100vh - 200px)">
      <v-form @submit.prevent="save" id="invoice-form">
        <!-- Customer & Type -->
        <v-row dense class="my-4">
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="form.user_id"
              :items="users"
              item-title="full_name"
              item-value="id"
              label="ابحث عن عميل"
              prepend-inner-icon="ri-user-line"
              :rules="[v => !!v || 'حقل العميل مطلوب']"
              clearable
              :loading="isLoadingUsers"
              :no-data-text="userSearchText.length < 3 ? 'أدخل 3 أحرف على الأقل' : 'لا يوجد عميل'"
              @update:search-input="onUserSearch"
              required
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="form.invoice_type_id"
              :items="invoiceTypes"
              item-title="name"
              item-value="id"
              label="نوع الفاتورة"
              prepend-inner-icon="ri-file-list-3-line"
              :rules="[v => !!v || 'حقل نوع الفاتورة مطلوب']"
              clearable
              required
            />
          </v-col>
        </v-row>

        <!-- Product Search -->
        <v-row dense class="mb-4">
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="productSearch"
              :items="products"
              item-title="name"
              item-value="id"
              label="ابحث عن منتج"
              prepend-inner-icon="ri-search-line"
              clearable
              :loading="isLoadingProducts"
              :no-data-text="productSearchText && productSearchText.length < 3 ? 'أدخل 3 أحرف على الأقل' : 'لا يوجد منتج'"
              @update:search-input="onProductSearch"
              @update:model-value="addOrIncrement"
              @scroll.passive="handleScroll"
            />
          </v-col>
          <v-col cols="12" sm="6" class="d-flex align-center">
            <v-btn icon @click="showScanner = true">
              <v-icon>ri-qr-scan-2-line</v-icon>
            </v-btn>
            <span class="ms-2">بحث بالباركود</span>
          </v-col>
        </v-row>
        <v-dialog v-model="showScanner" max-width="400">
          <v-card class="pa-2">
            <QrcodeStream @decode="onBarcodeScanned" @init="onScannerInit" @error="onScannerError" />
            <v-alert v-if="scannerError" type="error" class="mt-2" dense border="start" border-color="error">
              {{ scannerError }}
            </v-alert>
          </v-card>
        </v-dialog>

        <!-- Items Table -->
        <v-data-table :headers="headers" :items="form.items" item-key="id" class="elevation-1" hide-default-footer density="compact">
          <template #no-data>
            <v-row class="pa-4">
              <v-col class="text-center text-grey"> لا توجد منتجات مضافة </v-col>
            </v-row>
          </template>

          <template #item.name="{ item }">
            {{ item.name }}
          </template>

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

          <template #item.unit_price="{ item }">
            {{ formatCurrency(item.unit_price) }}
          </template>

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

          <template #item.total="{ item }">
            {{ formatCurrency(item.total) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn icon color="error" @click="removeInvoiceItem(item.id)">
              <v-icon>ri-delete-bin-line</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!-- Total -->
        <v-row justify="end" class="mt-4">
          <v-chip color="primary" class="pa-3 text-h6">
            <v-icon left>ri-calculator-line</v-icon>
            المجموع الكلي: {{ formatCurrency(form.total_amount) }}
          </v-chip>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="actions-sticky justify-start">
      <v-spacer></v-spacer>
      <v-btn class="elevation-4 px-4" color="primary" append-icon="ri-save-3-line" type="submit" form="invoice-form" :loading="isSaving"> حفظ </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="elevation-4 px-4" color="error" append-icon="ri-close-line" @click="$emit('close')"> إلغاء </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAll, saveItem, getOne } from '@/services/api';
import { QrcodeStream } from 'vue-qrcode-reader';

const emit = defineEmits(['saved', 'close']);
const props = defineProps({
  invoiceId: { type: Number, default: null },
});

// Reactive state
const form = ref({
  id: null,
  user_id: null,
  invoice_type_id: null,
  items: [],
  total_amount: 0,
});

const headers = ref([
  { title: 'المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity', align: 'center' },
  { title: 'السعر', key: 'unit_price', align: 'center' },
  { title: 'الخصم', key: 'discount', align: 'center' },
  { title: 'الإجمالي', key: 'total', align: 'center' },
  { title: 'حذف', key: 'actions', align: 'center', sortable: false },
]);

const users = ref([]);
const products = ref([]);
const invoiceTypes = ref([]);
const isSaving = ref(false);
const isLoadingUsers = ref(false);
const isLoadingProducts = ref(false);
const productPage = ref(1);
const productHasMore = ref(true);
const productSearchText = ref('');
const productSearch = ref(null);
const userSearchText = ref('');
const showScanner = ref(false);
const scannerError = ref('');

// Computed
const totalAmount = computed(() => form.value.items.reduce((sum, item) => sum + (item.unit_price * item.quantity - item.discount), 0));

// Helpers
const formatCurrency = value => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    currencyDisplay: 'symbol',
  }).format(value || 0);
};

// Lifecycle
onMounted(async () => {
  try {
    const res = await getAll('invoice-types');
    invoiceTypes.value = res.data;
    // إذا لم يكن هناك قيمة محددة مسبقاً، اختر أول نوع افتراضيًا
    if (!form.value.invoice_type_id && invoiceTypes.value.length) {
      form.value.invoice_type_id = invoiceTypes.value[0].id;
    }

    if (props.invoiceId) {
      const { data } = await getOne('invoices', props.invoiceId);
      form.value = { ...data, total_amount: totalAmount.value };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Search Handlers
async function searchUsers(query) {
  // عدل حسب مسار الـ API لديك
  const { data } = await getAll('users', { search: query });
  return data;
}

async function searchProducts(query, page = 1) {
  // عدل حسب مسار الـ API لديك
  const { data } = await getAll('products', { search: query, page });
  return data;
}

const onUserSearch = async val => {
  userSearchText.value = val || '';
  if (!val || val.length < 3) {
    users.value = [];
    return;
  }
  try {
    isLoadingUsers.value = true;
    users.value = await searchUsers(val);
  } catch (error) {
    users.value = [];
    console.error('Error searching users:', error);
  } finally {
    isLoadingUsers.value = false;
  }
};

const onProductSearch = async val => {
  productSearchText.value = val || '';

  if (!val || val.length < 3) {
    products.value = [];
    return;
  }

  try {
    isLoadingProducts.value = true;
    const data = await searchProducts(val, 1);
    products.value = data.items || data;
    productHasMore.value = data.meta ? data.meta.current_page < data.meta.last_page : false;
  } catch (error) {
    products.value = [];
    console.error('Error searching products:', error);
  } finally {
    isLoadingProducts.value = false;
  }
};

// Scroll Handler
const handleScroll = async e => {
  if (!productHasMore.value || !e.target) return;

  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    try {
      productPage.value++;
      const { data } = await searchProducts(productSearchText.value, productPage.value);
      products.value = [...products.value, ...data.items];
      productHasMore.value = data.meta.current_page < data.meta.last_page;
    } catch (error) {
      console.error('Error loading more products:', error);
    }
  }
};

// Items Management
const addOrIncrement = productId => {
  const product = products.value.find(p => p.id === productId);
  if (!product) return;

  const existingItem = form.value.items.find(i => i.id === productId);
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
};

const updateItemQuantity = item => {
  if (!item) return;
  item.quantity = Math.max(1, item.quantity);
  item.discount = Math.max(0, item.discount);
  item.total = item.unit_price * item.quantity - item.discount;
  updateTotal();
};

const removeInvoiceItem = id => {
  form.value.items = form.value.items.filter(i => i.id !== id);
  updateTotal();
};

const updateTotal = () => {
  form.value.total_amount = totalAmount.value;
};

// Barcode Scanner
function onScannerInit() {
  scannerError.value = '';
}

function onScannerError(error) {
  scannerError.value =
    error === 'NotAllowedError'
      ? 'تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا.'
      : error === 'NotFoundError'
      ? 'لم يتم العثور على كاميرا.'
      : 'حدث خطأ أثناء تشغيل الكاميرا.';
}

function onBarcodeScanned(serial) {
  showScanner.value = false;
  scannerError.value = '';
  if (serial) searchProductBySerial(serial);
}

async function searchProductBySerial(serial) {
  isLoadingProducts.value = true;
  try {
    alert(`تم العثور علي السيريال: ${serial}`);
    showScanner.value = false;
    return;
    const { data } = await getAll('products', { serial });
    if (data && data.length) {
      addOrIncrement(data[0].id);
    } else {
      scannerError.value = 'لم يتم العثور على منتج بهذا الباركود.';
    }
  } finally {
    isLoadingProducts.value = false;
  }
}

// Save Form
const save = async () => {
  try {
    isSaving.value = true;
    const payload = {
      ...form.value,
      total_amount: totalAmount.value,
    };

    await saveItem('invoices', payload, form.value.id);
    emit('saved');
    emit('close');
  } catch (error) {
    console.error('Error saving invoice:', error);
  } finally {
    isSaving.value = false;
  }
};
</script>
