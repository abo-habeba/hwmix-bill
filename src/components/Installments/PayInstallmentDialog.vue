<template>
  <v-dialog v-model="payDialog" max-width="400px">
    <v-card>
      <v-card-title>سداد القسط</v-card-title>
      <v-card-text>
        <template v-if="directPay">
          <div class="d-flex flex-column align-center justify-center" style="height: 150px">
            <v-progress-circular indeterminate color="primary" class="mb-2"></v-progress-circular>
            <p>جاري الدفع...</p>
          </div>
        </template>
        <template v-else>
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
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closePayDialog">إلغاء</v-btn>
        <v-btn v-if="!directPay" color="primary" :disabled="!valid" @click="submitPayment">دفع القسط</v-btn>
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

const payDialog = ref(false);
const valid = ref(false);
const payData = ref({
  amount: '',
  // remaining: '',
  paid_at: new Date().toISOString().substr(0, 10),
  payment_method_id: '',
  cash_box_id: null,
  notes: '',
  installment_ids: [],
});

const paymentMethods = ref([]);
const cashboxes = ref([]);

onMounted(async () => {
  try {
    const methods = await getAll('payment-methods', { per_page: -1 }, true, false, false);
    paymentMethods.value = methods || [];

    // اختيار طريقة الدفع الافتراضية (كاش)
    const cashMethod = methods.find(method => method.code?.trim().toLowerCase() === 'cash');
    if (cashMethod) {
      payData.value.payment_method_id = cashMethod.id;
    }

    const userStore = useUserStore();
    if (userStore.user?.cashBoxes) {
      cashboxes.value = userStore.user.cashBoxes || [];
      // اختيار الصندوق الافتراضي
      if (cashboxes.value.length) {
        const defaultBox = cashboxes.value.find(box => box.is_default);
        if (defaultBox) {
          payData.value.cash_box_id = defaultBox.id;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching payment methods or cashboxes:', error);
  }
});

const installmentReady = ref(false);
// مراقبة القسط وتحديث البيانات
watch(
  () => props.installment,
  newInstallment => {
    if (newInstallment) {
      console.log('📥 استلام قسط جديد:', newInstallment);
      console.log('installmentReady', installmentReady.value);
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

      // البيانات جاهزة
      installmentReady.value = true;
    }
  }
);
// تنفيذ الدفع تلقائي لما تكون البيانات جاهزة والشروط مكتملة
watch(
  () => installmentReady.value,
  ready => {
    console.log('🔄 مراقبة جاهزية القسط:', ready);
    if (ready && props.directPay) {
      console.log('🚀 البيانات جاهزة والدفع مباشر، جاري التنفيذ...');
      submitPayment();
    }
  }
);

// فتح الديالوج فقط
watch(
  () => props.modelValue,
  newVal => {
    payDialog.value = newVal;
  }
);

function closePayDialog() {
  payDialog.value = false;
  emit('update:modelValue', false);
}

function submitPayment() {
  if (!props.directPay && !valid.value) return;
  // إرسال الطلب
  saveItem('installment-payment/pay', payData.value, false, false)
    .then(newInstallments => {
      console.log('تم تحديث القسط:', newInstallments);
      emit('update:installment', newInstallments);
      closePayDialog();
    })
    .catch(error => {
      closePayDialog();

      console.error('Error submitting payment:', error);
    });
}
</script>
