<template>
  <v-card class="invoice-card">
    <v-card-title class="d-flex align-center justify-space-between pb-2">
      <div class="d-flex align-center">
        <v-icon class="me-2" size="28">ri-file-list-3-line</v-icon>
        <span class="text-h5">{{ form.id ? 'تعديل فاتورة' : 'فاتورة جديدة' }}</span>
      </div>

      <v-chip v-if="form.status" color="success" class="px-3">
        <v-icon left small>ri-checkbox-circle-line</v-icon>
        {{ form.status }}
      </v-chip>

      <InfoDisplay v-if="selectedUser?.balance" icon="ri-wallet-3-line" label="رصيد العميل" :text="formatCurrency(selectedUser.balance)" />
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

        <InvoiceItemsTable :items="form.items" @update-item="updateItemDetails" @remove-item="removeInvoiceItem" />

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="invoiceDiscountInput"
              label="خصم عام على الفاتورة"
              type="number"
              min="0"
              :max="form.total_amount_before_all_discounts"
              color="warning"
              prepend-inner-icon="ri-discount-percent-line"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <InfoDisplay icon="ri-calculator-line" label="الإجمالي بعد الخصم" :text="formatCurrency(form.final_total_amount)" />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.cash_box_id"
              :items="userStore.user.cashBoxes"
              item-title="name"
              item-value="id"
              label="المحفظة"
              prepend-inner-icon="ri-bank-card-line"
              color="primary"
              hide-details
              :menu-props="{ maxHeight: '300px' }"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.payment_type"
              :items="paymentTypes"
              disabled
              item-title="name"
              item-value="id"
              label="طريقة الدفع"
              prepend-inner-icon="ri-bank-card-line"
              color="primary"
              hide-details
              :menu-props="{ maxHeight: '300px' }"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.paid_amount"
              label="المبلغ المدفوع من العميل"
              type="number"
              min="0"
              :max="form.final_total_amount"
              color="success"
              prepend-inner-icon="ri-cash-line"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6" class="py-1 px-2 d-flex align-center">
            <InfoDisplay icon="ri-wallet-3-line" label="المتبقي" :text="formatCurrency(form.remaining_amount)" />
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
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['saved', 'close']);
const props = defineProps({
  invoiceId: { type: Number, default: null },
  modelValue: Object,
  invoiceContext: { type: Object, default: () => ({ context: 'sales', code: 'sales' }) },
});

// تعريف جميع المتغيرات ref في الأعلى لضمان توفرها
const isSaving = ref(false);
const invoiceType = ref(null);
const productSearch = ref(null);
const serialInput = ref('');
const selectedUser = ref(null);
const formRef = ref(null);
const formValid = ref(false);
const itemsError = ref(null);
const invoiceDiscountInput = ref(0); // حقل إدخال الخصم العام المرئي
const paymentTypes = ref([]);
const showInstallmentDialog = ref(false);

// أعلام التحكم في التحديثات لمنع الحلقات اللانهائية
const isUpdatingInvoiceDiscountInternally = ref(false);
const isUpdatingItemsInternally = ref(false);

// نموذج بيانات الفاتورة
const form = ref({
  id: null,
  invoice_type_id: null,
  invoice_type_code: null,
  status: null, // حالة الفاتورة (مثل: draft, completed)
  total_amount_before_all_discounts: 0, // مجموع السعر * الكمية لكل البنود قبل أي خصومات
  total_items_discount_amount: 0, // مجموع الخصومات المطبقة على البنود (سواء يدوية أو موزعة من العام)
  subtotal_after_item_discounts: 0, // الإجمالي بعد خصومات البنود (total_amount_before_all_discounts - total_items_discount_amount)
  total_invoice_discount: 0, // الخصم العام الذي أدخله المستخدم على الفاتورة ككل
  final_total_amount: 0, // الإجمالي النهائي بعد خصم البنود والخصم العام
  items: [],
  user_id: null,
  paid_amount: 0,
  remaining_amount: 0,
  notes: '',
  payment_type: '', // نوع الدفع
  cash_box_id: null, // صندوق النقد المستخدم
});

const userStore = useUserStore();
const sellerName = computed(() => userStore.user?.nickname || userStore.user?.name || '');

/**
 * تحميل بيانات الفاتورة من الـ API عند التعديل
 * @param {number} id - معرف الفاتورة
 */
async function loadInvoice(id) {
  try {
    const res = await getOne('invoices', id);
    if (res?.data) {
      Object.assign(form.value, res.data);
      if (res.data.user) selectedUser.value = res.data.user;
      form.value.items.forEach(item => {
        item.unit_discount = item.unit_discount ?? 0;
        item.total_item_discount = item.total_item_discount ?? 0;
        item._manual_discount = item.total_item_discount > 0 || false;
        item.total = item.unit_price * item.quantity - item.total_item_discount;
      });
      calculateAllTotalsAndDiscounts();
    }
  } catch (e) {
    console.error('خطأ في تحميل الفاتورة:', e);
  }
}

/**
 * جلب أنواع صناديق النقد/الدفع من الـ API
 */
async function fetchPaymentTypes() {
  try {
    const data = await getAll('cashBoxTypes', { per_page: -1 });
    paymentTypes.value = data || [];
  } catch (e) {
    paymentTypes.value = [];
  }
}

// عند تحميل المكون
onMounted(() => {
  fetchPaymentTypes();
  if (props.invoiceId) {
    loadInvoice(props.invoiceId);
  } else if (props.modelValue) {
    Object.assign(form.value, props.modelValue);
    if (props.modelValue.user) selectedUser.value = props.modelValue.user;
    form.value.items.forEach(item => {
      item.unit_discount = item.unit_discount ?? 0;
      item.total_item_discount = item.total_item_discount ?? 0;
      item._manual_discount = item.total_item_discount > 0 || false;
      item.total = item.unit_price * item.quantity - item.total_item_discount;
    });
    calculateAllTotalsAndDiscounts();
  }
  // تعيين صندوق النقد الافتراضي إذا لم يكن محددًا
  if (!form.value.cash_box_id && userStore.user.cashBoxes?.length) {
    const defaultCashBox = userStore.user.cashBoxes.find(cb => cb.cash_type === 'نقدي');
    if (defaultCashBox) {
      form.value.cash_box_id = defaultCashBox.id;
      form.value.payment_type = defaultCashBox.cash_box_type_id;
    }
  }
});

// مزامنة ID المستخدم المحدد مع بيانات الفورم
watch(selectedUser, user => (form.value.user_id = user?.id || null));

// مزامنة payment_type مع cash_box_id المحدد
watch(
  () => form.value.cash_box_id,
  newId => {
    const selectedCashBox = userStore.user.cashBoxes.find(cb => cb.id === newId);
    if (selectedCashBox) {
      form.value.payment_type = selectedCashBox.cash_box_type_id;
    }
  }
);

// مراقبة المبلغ المدفوع والإجمالي النهائي لحساب المتبقي
watch([() => form.value.paid_amount, () => form.value.final_total_amount], ([paid, finalTotal]) => {
  form.value.remaining_amount = Math.max(finalTotal - (paid || 0), 0);
});

/**
 * تنسيق الأرقام كعملة (جنيه مصري)
 * @param {number} val - القيمة الرقمية
 * @returns {string} القيمة المنسقة كعملة
 */
function formatCurrency(val) {
  return new Intl.NumberFormat('EN-EG', { style: 'currency', currency: 'EGP' }).format(val || 0);
}

/**
 * دالة مركزية لحساب جميع إجماليات الفاتورة والخصومات
 */
function calculateAllTotalsAndDiscounts() {
  // تفعيل العلم لمنع إعادة تشغيل الواتشر على البنود أثناء التحديثات الداخلية
  isUpdatingItemsInternally.value = true;

  let totalAmountBeforeAllDiscounts = 0; // إجمالي قيمة البنود قبل أي خصم
  let totalItemsManualDiscounts = 0; // مجموع الخصومات اليدوية المحددة على البنود
  const autoDiscountItems = []; // البنود التي ستستقبل خصمًا من الخصم العام

  form.value.items.forEach(item => {
    const itemTotalBeforeDiscount = item.unit_price * item.quantity;
    totalAmountBeforeAllDiscounts += itemTotalBeforeDiscount;

    // تطبيق القيود: التأكد أن خصم الوحدة والبند لا يتجاوز القيم الأصلية
    item.unit_discount = Math.max(0, Math.min(item.unit_discount ?? 0, item.unit_price));

    // إذا كان البند ليس يدوي الخصم، احسب total_item_discount من unit_discount
    // إذا كان يدوي، فإن total_item_discount و unit_discount يجب أن تكون قد حددت يدوياً سابقاً
    if (!item._manual_discount) {
      item.total_item_discount = +(item.unit_discount * item.quantity).toFixed(2);
    }
    // التأكد من أن خصم البند لا يتجاوز قيمته الكلية قبل الخصم
    item.total_item_discount = Math.max(0, Math.min(item.total_item_discount, itemTotalBeforeDiscount));

    // إذا كان البند لديه خصم يدوي، يُضاف إلى مجموع الخصومات اليدوية
    if (item._manual_discount) {
      totalItemsManualDiscounts += item.total_item_discount;
    } else {
      // وإلا، يُضاف البند إلى قائمة البنود التي ستستقبل خصمًا تلقائيًا من الخصم العام
      autoDiscountItems.push(item);
    }
    // تحديث الإجمالي الكلي للبند بعد خصمه الخاص به (إذا كان هناك خصم يدوي تم تطبيقه)
    item.total = itemTotalBeforeDiscount - item.total_item_discount;
    if (item.total < 0) item.total = 0;
  });

  // حساب المبلغ المتاح لتوزيع الخصم العام
  const distributableGlobalDiscount = Math.max(0, form.value.total_invoice_discount - totalItemsManualDiscounts);
  const totalAmountForAutoDiscount = autoDiscountItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // توزيع الخصم العام المتبقي على البنود التلقائية
  autoDiscountItems.forEach(item => {
    const itemOriginalTotal = item.unit_price * item.quantity;
    if (totalAmountForAutoDiscount > 0) {
      const ratio = itemOriginalTotal / totalAmountForAutoDiscount;
      // قم بتحديث خصم البند الإجمالي أولاً (الجزء الموزع من الخصم العام)
      item.total_item_discount = +(ratio * distributableGlobalDiscount).toFixed(2);
      // ثم قم بتحديث خصم الوحدة ليتزامن مع خصم البند الإجمالي الجديد
      item.unit_discount = item.quantity > 0 ? +(item.total_item_discount / item.quantity).toFixed(2) : 0;
    } else {
      item.total_item_discount = 0;
      item.unit_discount = 0;
    }
    // تحديث إجمالي البند بعد الخصم الموزع
    item.total = itemOriginalTotal - item.total_item_discount;
    if (item.total < 0) item.total = 0;
  });

  // إعادة حساب إجمالي خصومات البنود بعد توزيع الخصم العام (يشمل الآن جميع البنود)
  let finalAccumulatedTotalItemDiscounts = 0;
  form.value.items.forEach(item => {
    finalAccumulatedTotalItemDiscounts += item.total_item_discount;
  });

  // تحديث حقول الـ form بالإجماليات النهائية
  form.value.total_amount_before_all_discounts = totalAmountBeforeAllDiscounts; // مجموع أسعار * كميات البنود
  form.value.total_items_discount_amount = finalAccumulatedTotalItemDiscounts; // مجموع كل خصومات البنود (يدوية + موزعة)
  form.value.subtotal_after_item_discounts = form.value.total_amount_before_all_discounts - form.value.total_items_discount_amount; // الإجمالي بعد خصومات البنود

  // تأكد من أن total_invoice_discount لا يتجاوز total_amount_before_all_discounts
  form.value.total_invoice_discount = Math.min(form.value.total_invoice_discount, form.value.total_amount_before_all_discounts);

  // الإجمالي النهائي هو الإجمالي بعد خصومات البنود مطروحاً منه الخصم العام
  form.value.final_total_amount = Math.max(form.value.subtotal_after_item_discounts - form.value.total_invoice_discount, 0);

  // إيقاف العلم بعد انتهاء التحديثات الداخلية
  isUpdatingItemsInternally.value = false;
}

/**
 * تحديث تفاصيل بند معين في الفاتورة (الكمية، السعر، الخصم)
 * @param {object} updatedItem - البند المحدث مع الخصائص الجديدة
 */
function updateItemDetails(updatedItem) {
  const index = form.value.items.findIndex(i => i.product_id === updatedItem.product_id);
  if (index !== -1) {
    const currentItem = form.value.items[index];

    isUpdatingItemsInternally.value = true; // تفعيل العلم قبل التغيير

    if (updatedItem.hasOwnProperty('quantity')) {
      currentItem.quantity = updatedItem.quantity;
    }
    if (updatedItem.hasOwnProperty('unit_price')) {
      currentItem.unit_price = updatedItem.unit_price;
    }

    const itemTotalBeforeDiscount = currentItem.unit_price * currentItem.quantity;

    if (updatedItem.hasOwnProperty('unit_discount')) {
      // إذا تم تحديث خصم الوحدة، فاجعله خصماً يدوياً
      currentItem.unit_discount = Math.max(0, Math.min(updatedItem.unit_discount ?? 0, currentItem.unit_price));
      currentItem.total_item_discount = +(currentItem.unit_discount * currentItem.quantity).toFixed(2);
      currentItem._manual_discount = true;
    } else if (updatedItem.hasOwnProperty('total_item_discount')) {
      // إذا تم تحديث خصم البند الإجمالي، فاجعله خصماً يدوياً
      currentItem.total_item_discount = Math.max(0, Math.min(updatedItem.total_item_discount ?? 0, itemTotalBeforeDiscount));
      currentItem.unit_discount = currentItem.quantity > 0 ? +(currentItem.total_item_discount / currentItem.quantity).toFixed(2) : 0;
      currentItem._manual_discount = true;
    } else {
      // إذا تغيرت الكمية أو السعر فقط، وليس الخصم يدوياً، أعد حساب خصم البند الإجمالي
      // إذا كان الخصم يدوياً، حافظ على خصمه الحالي وأعد حساب total_item_discount بناءً على الكمية الجديدة
      if (currentItem._manual_discount) {
        currentItem.total_item_discount = +(currentItem.unit_discount * currentItem.quantity).toFixed(2);
      }
    }

    // بعد تحديث البند، يجب إعادة حساب الإجماليات
    calculateAllTotalsAndDiscounts();

    isUpdatingItemsInternally.value = false; // إيقاف العلم بعد اكتمال التحديث الداخلي
  }
}

/**
 * إزالة بند من الفاتورة
 * @param {number} itemToRemoveId - معرف المنتج المراد إزالته
 */
function removeInvoiceItem(itemToRemoveId) {
  isUpdatingItemsInternally.value = true;
  form.value.items = form.value.items.filter(i => i.product_id !== itemToRemoveId);
  calculateAllTotalsAndDiscounts();
  isUpdatingItemsInternally.value = false;
}

/**
 * إضافة منتج جديد إلى الفاتورة أو زيادة كميته إذا كان موجوداً
 * @param {object} product - بيانات المنتج المراد إضافته
 */
function addOrIncrement(product) {
  if (!product || !product.id || !product.product_name) return;

  const userType = selectedUser.value?.user_type || 'retail';
  const price =
    userType === 'wholesale'
      ? Number(product.wholesale_price || product.retail_price || 0)
      : Number(product.retail_price || product.wholesale_price || 0);

  isUpdatingItemsInternally.value = true;

  const existing = form.value.items.find(i => i.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
    existing.unit_price = price;
  } else {
    const newItem = {
      variant_id: product.id,
      product_id: product.product_id,
      name: product.product_name,
      quantity: 1,
      unit_price: price,
      unit_discount: 0,
      total_item_discount: 0,
      total: price,
      attributes: product.attributes || [],
      stocks: product.stocks || [],
      _manual_discount: false, // افتراض أن الخصم ليس يدويًا عند الإضافة
    };
    form.value.items.push(newItem);
  }
  calculateAllTotalsAndDiscounts();
  isUpdatingItemsInternally.value = false;
}

/**
 * معالجة إدخال السيريال أو الباركود
 * @param {string} val - قيمة السيريال أو الباركود
 */
function onSerialInputEnter(val) {
  if (val && val.length >= 3) searchProductBySerial(val);
}

/**
 * البحث عن منتج بالسيريال أو الباركود
 * @param {string} serial - السيريال أو الباركود
 */
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

/**
 * معالجة اختيار منتج من البحث
 * @param {object} prod - المنتج المختار
 */
function onProductSelect(prod) {
  if (!prod || typeof prod !== 'object') return;
  productSearch.value = prod;
  addOrIncrement(prod);
}

/**
 * تحديث نوع الفاتورة
 * @param {object} type - كائن نوع الفاتورة
 */
function handleInvoiceTypeUpdate(type) {
  form.value.invoice_type_id = type?.id || null;
  form.value.invoice_type_code = type?.code || null;
}

/**
 * فتح نافذة حوار الأقساط
 */
function openInstallmentDialog() {
  showInstallmentDialog.value = true;
}

/**
 * معالجة بيانات الأقساط المحفوظة
 * @param {object} payload - بيانات الأقساط
 */
function handleInstallmentSaved(payload) {
  saveInvoice(payload);
}

/**
 * التحقق من نوع الفاتورة قبل الحفظ
 */
function checkInvoiceTypeBeforeSave() {
  form.value.invoice_type_id = invoiceType.value?.id || null;
  form.value.invoice_type_code = invoiceType.value?.code || null;
  form.value.user_id = selectedUser.value?.id || form.value.user_id;

  if (!form.value.invoice_type_id) return (itemsError.value = 'يرجى اختيار نوع الفاتورة أولاً');
  if (!form.value.items.length) return (itemsError.value = 'يجب إضافة منتجات إلى الفاتورة');

  const invalidItem = form.value.items.find(item => !item.product_id || !item.name);
  if (invalidItem) return (itemsError.value = 'يرجى التأكد من أن جميع المنتجات تحتوي على الحقول المطلوبة');

  if (props.invoiceContext.code === 'sales' && form.value.invoice_type_code === 'installment_sale') {
    openInstallmentDialog();
  } else {
    saveInvoice(form.value);
  }
}

/**
 * حفظ الفاتورة
 * @param {object} payload - بيانات الفاتورة للحفظ
 */
async function saveInvoice(payload) {
  try {
    isSaving.value = true;
    itemsError.value = null;

    // تحويل جميع القيم الرقمية إلى أرقام صريحة قبل الإرسال للـ API
    payload.total_amount_before_all_discounts = +payload.total_amount_before_all_discounts || 0;
    payload.total_items_discount_amount = +payload.total_items_discount_amount || 0;
    payload.subtotal_after_item_discounts = +payload.subtotal_after_item_discounts || 0;
    payload.total_invoice_discount = +payload.total_invoice_discount || 0;
    payload.final_total_amount = +payload.final_total_amount || 0;
    payload.paid_amount = +payload.paid_amount || 0;
    payload.remaining_amount = +payload.remaining_amount || 0;

    payload.items.forEach(item => {
      item.quantity = +item.quantity || 0;
      item.unit_price = +item.unit_price || 0;
      item.unit_discount = +item.unit_discount || 0;
      item.total_item_discount = +item.total_item_discount || 0;
      item.total = +item.total || 0;
      // حذف العلم المؤقت _manual_discount قبل الإرسال للـ DB
      delete item._manual_discount;
    });

    const res = form.value.id ? await saveItem('invoice', payload, form.value.id, true, true) : await saveItem('invoice', payload, false, true, true);
    emit('saved', res.data);
    emit('close');
  } catch (e) {
    itemsError.value = 'حدث خطأ أثناء الحفظ: ' + (e.response?.data?.message || e.message);
    console.error(e);
  } finally {
    isSaving.value = false;
  }
}

// Watcher 1: تحديث حقل الخصم العام المرئي (invoiceDiscountInput) ليعكس قيمة total_invoice_discount
watch(
  () => form.value.total_invoice_discount,
  newVal => {
    // تحديث الحقل المرئي فقط إذا لم يكن التغيير ناتجًا عن إدخال المستخدم نفسه
    if (!isUpdatingInvoiceDiscountInternally.value) {
      invoiceDiscountInput.value = newVal;
    }
  },
  { immediate: true } // يتم تشغيله فوراً عند تهيئة المكون
);

// Watcher 2: معالجة إدخال المستخدم في حقل الخصم العام (invoiceDiscountInput)
watch(invoiceDiscountInput, newVal => {
  // تفعيل العلم لمنع الواتشر الآخر من الاستجابة فورًا لهذا التغيير
  isUpdatingInvoiceDiscountInternally.value = true;

  let value = parseFloat(newVal);
  if (isNaN(value)) {
    value = 0;
  }

  // تطبيق القيود: الخصم العام لا يمكن أن يكون سالبًا، ولا يتجاوز الإجمالي قبل الخصومات
  value = Math.max(0, Math.min(value, form.value.total_amount_before_all_discounts));

  form.value.total_invoice_discount = value;

  // إعادة حساب الإجماليات بعد تغيير الخصم العام
  calculateAllTotalsAndDiscounts();

  // إيقاف العلم بعد اكتمال العملية
  isUpdatingInvoiceDiscountInternally.value = false;
});

// Watcher 3: يراقب أي تغيير في خصائص البنود (كمية، سعر، خصم وحدة، خصم بند إجمالي، _manual_discount)
// هذا الواتشر هو الأكثر أهمية في كسر حلقة التحديث اللانهائية للبنود
watch(
  () =>
    form.value.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_discount: item.unit_discount,
      total_item_discount: item.total_item_discount,
      _manual_discount: item._manual_discount,
    })),
  () => {
    // الواتشر لن يعمل إذا كان التغيير قادمًا من تحديثات داخلية (مثل calculateAllTotalsAndDiscounts)
    // هذا الشرط يكسر الحلقة ويمنع التكرار اللانهائي
    if (!isUpdatingItemsInternally.value) {
      calculateAllTotalsAndDiscounts();
    }
  },
  { deep: true } // مراقبة التغييرات العميقة داخل مصفوفة البنود
);

/**
 * طباعة الفاتورة (فتح نافذة جديدة)
 */
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
