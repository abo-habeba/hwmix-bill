<template>
  <v-card class="w-100 h-100 py-4 px-0">
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex align-center">
        <v-icon class="me-2" size="28">ri-file-list-3-line</v-icon>
        <span class="text-h5">{{ form.id ? 'تعديل فاتورة' : 'فاتورة جديدة' }}</span>
      </div>

      <v-chip v-if="form.status" color="success" class="px-3">
        <v-icon left small>ri-checkbox-circle-line</v-icon>
        {{ form.status }}
      </v-chip>

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

    <v-card-text class="invoice-scrollable">
      <v-form ref="formRef" v-model="formValid" @submit.prevent="checkInvoiceTypeBeforeSave">
        <v-row class="ma-0">
          <v-col cols="12" sm="6" class="py-1 px-0">
            <UserSearchInput v-model="selectedUser" />
          </v-col>

          <v-col cols="12" sm="6" class="py-1 px-0">
            <InvoiceTypeSelect v-model="invoiceType" :invoiceContext="invoiceContext" @update:model-value="handleInvoiceTypeUpdate" />
          </v-col>

          <v-col cols="12" sm="6" class="py-1 px-0">
            <SerialOrBarcodeInput v-model="serialInput" @update:model-value="onSerialInputEnter" />
          </v-col>

          <v-col cols="12" sm="6" class="py-1 px-0">
            <ProductSearchInput v-model="productSearch" label="ابحث عن منتج" @update:model-value="onProductSelect" />
          </v-col>
        </v-row>

        <div v-if="itemsError" class="text-error text-center text-caption mt-1">{{ itemsError }}</div>

        <InvoiceItemsTable :items="form.items" @update-item="updateInvoiceItem" @remove-item="removeInvoiceItem" />

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.discount"
              label="خصم عام على الفاتورة"
              type="number"
              min="0"
              :max="form.total_amount"
              color="warning"
              prepend-inner-icon="ri-discount-percent-line"
              hide-details
              @input="clampDiscount"
            />
          </v-col>
          <v-col cols="12" md="6">
            <InfoDisplay icon="ri-calculator-line" label="الإجمالي بعد الخصم" :text="formatCurrency(finalTotalAmount)" />
          </v-col>

          <SelectedCashBox
            :cash-box-id="form.cash_box_id"
            :payment-type="form.payment_type"
            @update:cash-box-id="form.cash_box_id = $event"
            @update:payment-type="form.payment_type = $event"
          />

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.paid_amount"
              label="المبلغ المدفوع من العميل"
              type="number"
              min="0"
              :max="finalTotalAmount"
              color="success"
              prepend-inner-icon="ri-cash-line"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6" class="py-1 px-2 d-flex align-center">
            <InfoDisplay icon="ri-wallet-3-line" label="المتبقي" :text="formatCurrency(remainingAmount)" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
              v-model="form.notes"
              label="ملاحظات الفاتورة (اختياري)"
              auto-grow
              rows="2"
              prepend-inner-icon="ri-sticky-note-line"
              color="info"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6" class="py-1 px-2 d-flex align-center">
            <InfoDisplay icon="ri-user-3-line" label="اسم البائع" :text="sellerName" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="actions-sticky justify-start">
      <v-spacer />
      <v-btn color="primary" append-icon="ri-save-3-line" :loading="isSaving" :disabled="!formValid || isSaving" @click="checkInvoiceTypeBeforeSave"
        >حفظ</v-btn
      >
      <v-spacer />
      <v-btn color="info" append-icon="ri-printer-line" @click="printInvoice" :disabled="isSaving || !form.id">طباعة / معاينة</v-btn>
      <v-spacer />
      <v-btn color="error" append-icon="ri-close-line" @click="$emit('close')" :disabled="isSaving">إلغاء</v-btn>
      <v-spacer />
    </v-card-actions>

    <InstallmentDialog
      :form="form"
      :visible="showInstallmentDialog"
      @installment-saved="handleInstallmentSaved"
      @update:visible="showInstallmentDialog = $event"
    />
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { getAll, saveItem, getOne } from '@/services/api';
import UserSearchInput from '@/components/users/UserSearchInput.vue';
import InvoiceTypeSelect from '@/components/Invoice/InvoiceTypeSelect.vue';
import ProductSearchInput from '@/components/products/ProductSearchInput.vue';
import SerialOrBarcodeInput from '@/components/products/SerialOrBarcodeInput.vue';
import InstallmentDialog from '@/components/Invoice/InstallmentDialog.vue';
import InvoiceItemsTable from '@/components/Invoice/InvoiceItemsTable.vue';
import SelectedCashBox from '@/components/cashboxs/SelectedCashBox.vue';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['saved', 'close']);
const props = defineProps({
  invoiceId: { type: Number, default: null },
  modelValue: Object,
  invoiceContext: { type: Object, default: () => ({ context: 'sales', code: 'sales' }) },
});

/* ==================== State & Refs ==================== */
const isSaving = ref(false);
const invoiceType = ref(null);
const productSearch = ref(null);
const serialInput = ref('');
const selectedUser = ref(null);
const formRef = ref(null);
const formValid = ref(false);
const itemsError = ref(null);
const showInstallmentDialog = ref(false);

const form = ref({
  id: null,
  invoice_type_id: null,
  invoice_type_code: null,
  status: null,
  total_amount: 0,
  items: [],
  user_id: null,
  paid_amount: 0,
  remaining_amount: 0,
  notes: '',
  discount: 0,
  cash_box_id: null,
  payment_type: '',
});

const userStore = useUserStore();
const sellerName = computed(() => userStore.user?.nickname || userStore.user?.name || '');

/* ==================== Computed Properties ==================== */

// الإجمالي الكلي لعناصر الفاتورة
const totalInvoiceAmount = computed(() => {
  return form.value.items.reduce((acc, item) => acc + (item.total || 0), 0);
});

// الإجمالي بعد الخصم
const finalTotalAmount = computed(() => {
  return Math.max(totalInvoiceAmount.value - (form.value.discount || 0), 0);
});

// المبلغ المتبقي
const remainingAmount = computed(() => {
  return Math.max(finalTotalAmount.value - (form.value.paid_amount || 0), 0);
});

/* =============== Lifecycle Hooks =============== */

onMounted(() => {
  if (props.invoiceId) {
    loadInvoice(props.invoiceId);
  } else if (props.modelValue) {
    Object.assign(form.value, props.modelValue);
    if (props.modelValue.user) selectedUser.value = props.modelValue.user;
  }
});

/* =============== Watchers =============== */

// تحديث معرف المستخدم عند تغيير العميل المحدد
watch(selectedUser, user => {
  form.value.user_id = user?.id || null;
});

// تحديث الإجمالي الكلي عند تغيير عناصر الفاتورة
watch(
  () => form.value.items,
  () => {
    form.value.total_amount = totalInvoiceAmount.value; // تحديث total_amount في الفورم
  },
  { deep: true }
);

// تحديث المبلغ المتبقي تلقائياً
// لم تعد هناك حاجة لـ watcher منفصل لـ remaining_amount لأنه computed property
// سيتم تحديثه تلقائيًا عند تغيير paid_amount أو finalTotalAmount

/* ==================== Helper Functions ==================== */

// تنسيق العملة
function formatCurrency(val) {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}

// تعديل كمية المنتج وحساب الإجمالي الفرعي
function updateInvoiceItem(item) {
  item.total = item.unit_price * item.quantity - (item.discount || 0);
  if (item.total < 0) item.total = 0;
  // totalInvoiceAmount computed property سيتكفل بتحديث total_amount
}

// إزالة المنتج من الفاتورة
function removeInvoiceItem(itemToRemove) {
  if (!itemToRemove || !itemToRemove.product_id) {
    console.error('Invalid item passed to removeInvoiceItem:', itemToRemove);
    return;
  }
  form.value.items = form.value.items.filter(item => item.product_id !== itemToRemove.product_id);
  // totalInvoiceAmount computed property سيتكفل بتحديث total_amount
}

// إضافة أو زيادة كمية المنتج
function addOrIncrementProduct(product) {
  if (!product || !product.id || !product.product_name) {
    console.error('بيانات المنتج غير صالحة:', product);
    return;
  }

  const userType = selectedUser.value?.user_type || 'retail';
  const price =
    userType === 'wholesale'
      ? Number(product.wholesale_price || product.retail_price || 0)
      : Number(product.retail_price || product.wholesale_price || 0);

  const existingItem = form.value.items.find(item => item.product_id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.unit_price = price;
    updateInvoiceItem(existingItem);
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
    form.value.items.push(newItem);
    updateInvoiceItem(newItem); // تحديث الإجمالي للعنصر الجديد
  }
  itemsError.value = null; // مسح رسالة الخطأ عند إضافة منتج بنجاح
}

// البحث عن منتج بالسيريال
async function searchProductBySerial(serial) {
  if (!serial) return;
  isSaving.value = true;
  try {
    const { data } = await getAll('products', { serial });
    const product = Array.isArray(data) ? data[0] : data.items?.[0];
    if (product) {
      addOrIncrementProduct(product);
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

// التعامل مع إدخال السيريال
function onSerialInputEnter(val) {
  if (val && val.length >= 3) searchProductBySerial(val);
}

// التعامل مع اختيار المنتج من البحث
function onProductSelect(product) {
  if (!product || typeof product !== 'object') {
    console.error('منتج غير صالح:', product);
    return;
  }
  productSearch.value = product; // يمكن إزالة هذا السطر إذا لم يكن له تأثير مرئي
  addOrIncrementProduct(product);
}

// التحكم في قيمة الخصم لضمان أنها ضمن النطاق
function clampDiscount() {
  if (form.value.discount < 0) form.value.discount = 0;
  if (form.value.discount > totalInvoiceAmount.value) form.value.discount = totalInvoiceAmount.value;
}

/* ============ Invoice Type & Dialogs ============ */

// تحديث نوع الفاتورة
function handleInvoiceTypeUpdate(type) {
  form.value.invoice_type_id = type?.id || null;
  form.value.invoice_type_code = type?.code || null;
}

// فتح حوار التقسيط
function openInstallmentDialog() {
  showInstallmentDialog.value = true;
}

// التعامل مع حفظ التقسيط
function handleInstallmentSaved(payload) {
  saveInvoice(payload);
}

/* ============ Invoice Saving Logic ============ */

// التحقق قبل حفظ الفاتورة
function checkInvoiceTypeBeforeSave() {
  form.value.invoice_type_id = invoiceType.value?.id || null;
  form.value.invoice_type_code = invoiceType.value?.code || null;
  form.value.user_id = selectedUser.value?.id || form.value.user_id;

  if (!form.value.invoice_type_id) {
    itemsError.value = 'يرجى اختيار نوع الفاتورة أولاً';
    return;
  }
  if (!form.value.items.length) {
    itemsError.value = 'يجب إضافة منتجات إلى الفاتورة';
    return;
  }

  const invalidItem = form.value.items.find(item => !item.product_id || !item.name);
  if (invalidItem) {
    itemsError.value = 'يرجى التأكد من أن جميع المنتجات تحتوي على الحقول المطلوبة';
    return;
  }

  itemsError.value = null; // مسح أي أخطاء سابقة

  if (form.value.invoice_type_code === 'installment_sale') {
    openInstallmentDialog();
  } else {
    saveInvoice(form.value);
  }
}

// تحميل الفاتورة من الـ API
async function loadInvoice(id) {
  try {
    const res = await getOne('invoices', id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (res.data.user) selectedUser.value = res.data.user;
    }
  } catch (e) {
    console.error('خطأ في تحميل الفاتورة:', e);
    itemsError.value = 'حدث خطأ أثناء تحميل الفاتورة.';
  }
}

// حفظ الفاتورة
async function saveInvoice(payload) {
  isSaving.value = true;
  itemsError.value = null;
  try {
    const apiCall = form.value.id ? saveItem('invoice', payload, form.value.id, true, true) : saveItem('invoice', payload, false, true, true);
    const res = await apiCall;
    emit('saved', res.data);
    emit('close');
  } catch (e) {
    itemsError.value = 'حدث خطأ أثناء الحفظ. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
    console.error('خطأ في حفظ الفاتورة:', e);
  } finally {
    isSaving.value = false;
  }
}

// دالة طباعة/معاينة الفاتورة
function printInvoice() {
  if (form.value.id) {
    sessionStorage.setItem('print_invoice', JSON.stringify(form.value));
    window.open(`/invoices/print/${form.value.id}`, '_blank');
  }
}
</script>

<style scoped>
.invoice-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.invoice-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.actions-sticky {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 10;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
</style>
