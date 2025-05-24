<template>
  <v-card class="w-100 h-100 pa-4">
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex align-center">
        <v-icon class="me-2" size="28">ri-file-list-3-line</v-icon>
        <span class="text-h5">{{ form.id ? 'تعديل فاتورة' : 'فاتورة جديدة' }}</span>
      </div>
      <!-- invoice  status-->
      <v-chip v-if="form.status" color="success" class="px-3">
        <v-icon left small>ri-checkbox-circle-line</v-icon>
        {{ form.status }}
      </v-chip>
      <!-- selected User balance -->
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
    <!-- invoice form  -->
    <v-card-text class="overflow-y-auto" style="max-height: calc(100vh - 200px)">
      <v-form ref="formRef" v-model="formValid" @submit.prevent="save" id="invoice-form">
        <v-row class="ma-0">
          <!-- selected User -->
          <v-col class="py-0" cols="12" sm="6">
            <v-autocomplete
              class="ma-0"
              v-model="selectedUser"
              v-model:search="userSearchText"
              @update:search="onUserSearch"
              :items="users"
              return-object
              :item-title="
                item => {
                  const name = item.full_name || 'بدون اسم';
                  const nickname = item.nickname ? `(${item.nickname})` : '';
                  const phone = item.phone ? `📞 ${item.phone} ` : 'بدون هاتف';
                  const id = item.id ? `كود ${item.id}` : '';
                  return `${name} ${nickname} ${phone} ${id}`;
                }
              "
              item-value="id"
              :filter="() => true"
              label="ابحث عن عميل"
              prepend-inner-icon="ri-user-line"
              :rules="[v => !!v || 'حقل العميل مطلوب']"
              clearable
              :loading="isLoadingUsers"
              :no-data-text="userSearchText.length < 3 ? 'أدخل 3 أحرف على الأقل' : 'لا يوجد عميل'"
              required
            />
          </v-col>
          <!-- invoice type -->
          <v-col class="py-0" cols="12" sm="6">
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
          <!-- product Search -->
          <v-col class="py-0" cols="12" sm="6">
            <v-autocomplete
              class="ma-0"
              v-model="productSearch"
              v-model:search="productSearchText"
              :items="products"
              item-title="name"
              item-value="id"
              label="ابحث عن منتج"
              prepend-inner-icon="ri-search-line"
              clearable
              :loading="isLoadingProducts"
              :no-data-text="productSearchText && productSearchText.length < 3 ? 'أدخل 3 أحرف على الأقل' : 'لا يوجد منتج'"
              @update:search="onProductSearch"
              @update:model-value="onProductSelect"
            />
          </v-col>
          <!-- product Search Scanner -->
          <v-col class="py-0" cols="12" sm="6">
            <v-text-field class="ma-0" v-model="serialInput" label="أدخل السيريال أو امسح الباركود" clearable hide-details ref="serialInputField">
              <template #prepend>
                <v-tooltip text="فتح الكاميرا" location="top">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" class="cursor-pointer" @click="showScanner = true" size="40" color="#10B981"> ri-qr-scan-2-line </v-icon>
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <!-- Items Table -->
        <div v-if="itemsError" class="text-error text-center text-caption mt-1">{{ itemsError }}</div>
        <v-data-table :headers="headers" :items="form.items" item-key="id" class="elevation-1" hide-default-footer density="compact">
          <template #no-data>
            <v-row class="pa-1">
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

        <!-- Total  amount -->
        <v-row justify="end" class="ma-3">
          <v-chip color="primary" class="pa-3 text-h6">
            <v-icon left>ri-calculator-line</v-icon>
            المجموع الكلي: {{ formatCurrency(form.total_amount) }}
          </v-chip>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- show Scanner barcode Video -->
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
    <!-- Actions -->
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
// import { BrowserMultiFormatReader } from '@zxing/browser';
import { BrowserMultiFormatReader } from '@zxing/library';

const emit = defineEmits(['saved', 'close']);
const props = defineProps({
  invoiceId: { type: Number, default: null },
});

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
const scannerError = ref(null);
const barcodeVideo = ref(null);
const serialInput = ref('');
const serialInputField = ref(null);
const selectedUser = ref(null);
const formRef = ref(null);
const formValid = ref(false);
const itemsError = ref('');

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

// Ensure the video element is accessible
onMounted(() => {
  barcodeVideo.value = document.getElementById('barcodeVideo');
});
const codeReader = ref(null);

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
  const { data } = await getAll('users', { search: query });
  return data;
}

async function searchProducts(query, page = 1) {
  const { data } = await getAll('product-variants/search-by-product', { search: query, page });
  return data;
}

function debounceRequest(endpoint, value, delay = 500) {
  return new Promise(resolve => {
    if (!debounceRequest.timer) debounceRequest.timer = null;

    clearTimeout(debounceRequest.timer);

    debounceRequest.timer = setTimeout(async () => {
      try {
        const { data } = await getAll(endpoint, { search: value });
        resolve(data);
      } catch (error) {
        console.error('Debounced request error:', error);
        resolve(null);
      }
    }, delay);
  });
}

const onUserSearch = async val => {
  if (!val || val.length < 3) {
    users.value = [];
    return;
  }
  isLoadingUsers.value = true;
  const data = await debounceRequest('users', val, 1000);
  if (data) users.value = data;
  isLoadingUsers.value = false;
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
  } finally {
    isLoadingProducts.value = false;
  }
};

// عند اختيار منتج من البحث اليدوي
const onProductSelect = productId => {
  const product = products.value.find(p => p.id === productId);
  if (product) {
    addOrIncrement(product);
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
const addOrIncrement = product => {
  if (!product) return;
  // البحث عن المنتج في الفاتورة حسب id أو حسب id وvariant_id إذا كان لديك متغيرات
  const existingItem = form.value.items.find(i => i.id === product.id && (!product.variant_id || i.variant_id === product.variant_id));
  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 1) + 1;
    existingItem.total = existingItem.unit_price * existingItem.quantity - existingItem.discount;
    playBeep('success');
  } else {
    form.value.items.push({
      id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: product.price,
      discount: 0,
      total: product.price,
      ...(product.variant_id ? { variant_id: product.variant_id } : {}),
    });
    playBeep('success');
  }
  itemsError.value = '';
  updateTotal();
  setTimeout(() => {
    const searchInput = document.querySelector('input[aria-label="ابحث عن منتج"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, 100);
};

// عند البحث بالسيريال
async function searchProductBySerial(serial) {
  try {
    // عدل حسب مسار الـ API لديك
    const { data } = await getAll('products', { serial });
    const product = Array.isArray(data) ? data[0] : data;
    if (product) {
      addOrIncrement(product);
      playBeep('success'); // صوت عند النجاح
      scannerError.value = null;
    } else {
      // scannerError.value = 'لم يتم العثور على منتج بهذا السيريال';
      console.log('لم يتم العثور على منتج بهذا السيريال');

      playBeep('error');
    }
  } catch (error) {
    scannerError.value = 'خطأ في البحث عن المنتج';
    playBeep('error');
    console.error('خطأ في البحث عن المنتج', error);
  }
}

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
function startBarcodeScanner() {
  console.log('تشغيل الماسح الضوئي');
  scannerError.value = null;
  if (!codeReader.value) {
    codeReader.value = new BrowserMultiFormatReader();
  }
  codeReader.value.decodeFromVideoDevice(null, barcodeVideo.value, (result, err) => {
    if (result) {
      const serial = result.getText();
      console.log('تم قراءة السيريال:', serial);
      searchProductBySerial(serial);
      // showScanner.value = false;
      // stopBarcodeScanner();
    } else if (err && err.name !== 'NotFoundException') {
      scannerError.value = '';
      // playBeep('error'); // صوت عند الخطأ
    }
  });
}

function stopBarcodeScanner() {
  console.log('إيقاف الماسح الضوئي');
  if (codeReader.value) {
    codeReader.value.reset();
    codeReader.value = null;
  }
}

watch(showScanner, val => {
  console.log('تغيير حالة الماسح:', val);
  if (val) {
    setTimeout(startBarcodeScanner, 300); // انتظر حتى يظهر الفيديو
  } else {
    stopBarcodeScanner();
  }
});

watch(formValid, (newVal, oldVal) => {
  itemsError.value = '';
});

// Save Form
const save = async () => {
  itemsError.value = '';
  if (!formRef.value) return;
  if (!form.value.items || form.value.items.length < 1) {
    itemsError.value = 'أضف منتج واحد على الأقل';
    return;
  }
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  try {
    isSaving.value = true;
    const payload = {
      ...form.value,
      total_amount: totalAmount.value,
      user_id: selectedUser.value?.id,
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

// عند الضغط على Enter في حقل السيريال
const onSerialInputEnter = async () => {
  if (!serialInput.value) return;
  await searchProductBySerial(serialInput.value);
  serialInput.value = '';
  focusSerialInput();
};

const focusSerialInput = () => {
  setTimeout(() => {
    if (serialInputField.value && serialInputField.value.focus) {
      serialInputField.value.focus();
    }
  }, 100);
};

function playBeep(type) {
  let freq = type === 'success' ? 880 : 220;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.1;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.15);
    o.onended = () => ctx.close();
  } catch (e) {
    // ignore if browser blocks audio
  }
}
</script>

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
