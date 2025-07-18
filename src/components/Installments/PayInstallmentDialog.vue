<template>
  <v-dialog v-model="payDialog" max-width="400px" persistent>
    <v-card>
      <v-card-title>سداد القسط</v-card-title>
      <v-card-text>
        <template v-if="payDialog && isLoading">
          <div class="d-flex flex-column align-center justify-center" style="height: 150px">
            <v-progress-circular indeterminate color="primary" class="mb-2"></v-progress-circular>
            <p>جاري الدفع...</p>
          </div>
        </template>

        <template v-else-if="payDialog && !isLoading && !alreadyPaid && !directPay">
          <v-form ref="payForm" v-model="valid">
            <v-text-field
              class="ma-1"
              label="مبلغ السداد"
              v-model="payData.amount"
              type="number"
              :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من صفر']"
              required
            ></v-text-field>

            <v-text-field class="ma-1" label="تاريخ السداد" v-model="payData.paid_at" type="date"></v-text-field>

            <v-select
              class="ma-1"
              label="طريقة الدفع"
              v-model="payData.payment_method_id"
              :items="paymentMethods"
              item-title="name"
              item-value="id"
              :rules="[v => !!v || 'اختر طريقة الدفع']"
              required
            ></v-select>

            <v-select
              class="ma-1"
              label="صندوق النقدية"
              v-model="payData.cash_box_id"
              :items="cashboxes"
              item-title="name"
              item-value="id"
              :rules="[v => !!v || 'اختر صندوق النقدية']"
            ></v-select>

            <v-text-field class="ma-1" label="ملاحظات" v-model="payData.notes"></v-text-field>
          </v-form>
        </template>

        <template v-else-if="payDialog && !isLoading && alreadyPaid && dataReturn">
          <div if="dataReturn" class="d-flex flex-column align-center justify-center py-1">
            <v-icon color="success" size="50" class="mb-1">ri-checkbox-circle-fill</v-icon>
            <h3 class="mb-2">تمت عملية الدفع بنجاح!</h3>
            <p class="text-h6 mb-2">المبلغ المدفوع : {{ dataReturn?.payment_record?.amount_paid }}</p>
            <p v-if="dataReturn?.payment_record?.excess_amount" class="d-flex flex-column align-center justify-center text-subtitle-1 success--text">
              <span>تم دفع الاقساط بنجاح،</span>
              <span>ولكن يوجد مبلغ متبقي بقيمة : {{ dataReturn?.payment_record?.excess_amount }}</span>
            </p>

            <v-divider class="my-4" style="width: 80%"></v-divider>

            <p class="k">الأقساط التي تم دفعها</p>
            <div dense class="w-100" v-if="dataReturn?.paid_installments?.length">
              <div v-for="installment in dataReturn.paid_installments" :key="installment.id">
                <div>
                  <span>قسط رقم </span>
                  <span style="font-weight: bold; font-size: 18px">{{ installment.installment_number }} </span> (
                  {{ installment.due_date.split(' ')[0] }} )
                  <span v-if="installment.remaining != '0.00'"> باقي {{ installment.remaining }}</span>
                  <span v-else> مدفوع بالكامل {{ installment.amount }}</span>
                </div>
              </div>
            </div>
            <p v-else>لا توجد أقساط مدفوعة لعرضها.</p>
          </div>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closePayDialog" v-if="!alreadyPaid">إلغاء</v-btn>
        <v-btn text @click="closePayDialog" v-else>إغلاق</v-btn>

        <v-btn v-if="payDialog && !isLoading && !alreadyPaid && !directPay" color="primary" :disabled="!valid" @click="submitPayment"
          >دفع القسط</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, onMounted } from 'vue';
import { getAll, saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  installment: Object,
  modelValue: Boolean,
  directPay: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'update:installment']);

const payDialog = ref(false); // التحكم في فتح وغلق الديالوج
const dataReturn = ref(null); // البيانات الراجعة من API (نتائج الدفع)
const isLoading = ref(false); // حالة التحميل (جاري الدفع)

const valid = ref(false); // صلاحية الفورم
const alreadyPaid = ref(false); // لتحديد ما إذا تمت عملية الدفع بنجاح

const payData = ref({
  amount: '',
  paid_at: new Date().toISOString().substr(0, 10),
  payment_method_id: '',
  cash_box_id: null,
  notes: '',
  installment_ids: [],
});

const paymentMethods = ref([]);
const cashboxes = ref([]);

// مرجع للفورم
const payForm = ref(null);

onMounted(async () => {
  try {
    const methods = await getAll('payment-methods', { per_page: -1 }, true, false, false);
    paymentMethods.value = methods || [];

    const cashMethod = methods.find(method => method.code?.trim().toLowerCase() === 'cash');
    if (cashMethod) {
      payData.value.payment_method_id = cashMethod.id;
    }

    const userStore = useUserStore();
    if (userStore.user?.cashBoxes) {
      cashboxes.value = userStore.user.cashBoxes || [];
      const defaultBox = cashboxes.value.find(box => box.is_default);
      if (defaultBox) {
        payData.value.cash_box_id = defaultBox.id;
      }
    }
  } catch (error) {
    console.error('Error fetching payment methods or cashboxes:', error);
  }
});

const installmentReady = ref(false);

watch(
  () => props.installment,
  newInstallment => {
    if (newInstallment) {
      console.log('📥 استلام قسط جديد:', newInstallment);

      payData.value.installment_ids = [newInstallment.id];
      payData.value.amount = newInstallment.remaining;
      payData.value.user_id = newInstallment.user_id;
      payData.value.installment_plan_id = newInstallment.installment_plan_id;
      payData.value.notes = '';
      payData.value.paid_at = new Date().toISOString().substr(0, 10);

      const cashMethod = paymentMethods.value.find(method => method.code?.trim().toLowerCase() === 'cash');
      payData.value.payment_method_id = cashMethod?.id || '';

      const defaultBox = cashboxes.value.find(box => box.is_default);
      payData.value.cash_box_id = defaultBox?.id || null;

      // ✅ فقط لما تكون كل البيانات موجودة
      if (payData.value.payment_method_id && payData.value.cash_box_id) {
        installmentReady.value = true;
      } else {
        console.warn('⚠️ بيانات ناقصة تمنع تنفيذ الدفع التلقائي.');
      }
    }
  },
  { immediate: true } // لتشغيل الـ watcher فورًا عند تحميل المكون
);

watch(
  () => installmentReady.value,
  ready => {
    console.log('🔄 مراقبة جاهزية القسط:', ready);
    // إذا كانت البيانات جاهزة، props.directPay صحيحة، ولم يتم الدفع بعد، ولم نكن في حالة تحميل
    if (ready && props.directPay && !alreadyPaid.value && !isLoading.value) {
      console.log('🚀 البيانات جاهزة والدفع مباشر، جاري التنفيذ...');
      submitPayment();
    }
  }
);

watch(
  () => props.modelValue,
  newVal => {
    payDialog.value = newVal;
    // عند فتح الديالوج، قم بتهيئة بيانات الفورم إذا لم تكن عملية دفع قد تمت بالفعل
    if (newVal && !alreadyPaid.value) {
      // إذا كان الديالوج يفتح لأول مرة (وليس بعد عرض نتائج دفع سابقة)
      // قد تحتاج لتعيين payData.value.amount بناءً على props.installment هنا
      if (props.installment) {
        payData.value.amount = props.installment.remaining || props.installment.amount;
      }
    }
  }
);

function closePayDialog() {
  // إعادة تعيين جميع المتغيرات إلى حالتها الأولية عند الإغلاق
  payData.value = {
    amount: '',
    paid_at: new Date().toISOString().substr(0, 10),
    payment_method_id: '',
    cash_box_id: null,
    notes: '',
    installment_ids: [],
  };
  installmentReady.value = false;
  alreadyPaid.value = false;
  isLoading.value = false; // إعادة تعيين حالة التحميل
  dataReturn.value = null; // مسح بيانات النتائج

  // إغلاق الديالوج
  payDialog.value = false;
  emit('update:modelValue', false);

  // إعادة تعيين صلاحية الفورم إذا كان موجودًا
  if (payForm.value) {
    payForm.value.resetValidation();
  }
}

async function submitPayment() {
  // إذا لم يكن الدفع مباشر، يجب التحقق من صلاحية الفورم
  if (!props.directPay) {
    const { valid: formValid } = await payForm.value.validate();
    if (!formValid) return;
  }

  isLoading.value = true; // بدء التحميل

  try {
    const response = await saveItem('installment-payment/pay', payData.value, false, false);
    dataReturn.value = response; // تخزين البيانات الكاملة من الاستجابة
    alreadyPaid.value = true; // تم الدفع بنجاح
    isLoading.value = false; // إيقاف التحميل

    emit('update:installment', response); // إرسال البيانات المحدثة
  } catch (error) {
    console.error('❌ Error submitting payment:', error);
    isLoading.value = false; // إيقاف التحميل حتى في حالة الخطأ
    // إظهار رسالة خطأ للمستخدم
    alert('حدث خطأ أثناء عملية الدفع: ' + (error.response?.data?.message || error.message));
    alreadyPaid.value = false; // إعادة تعيين لتمكين المحاولة مرة أخرى
    dataReturn.value = null; // مسح البيانات
  }
}
</script>

<style scoped>
/* أضف أي تنسيقات خاصة بالمكون هنا */
</style>
