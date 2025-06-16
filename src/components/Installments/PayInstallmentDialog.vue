<template>
  <v-dialog v-model="payDialog" max-width="400px">
    <v-card>
      <v-card-title>سداد القسط</v-card-title>
      <v-card-text>
        <v-form ref="payForm" v-model="valid">
          <v-text-field
            label="مبلغ السداد"
            v-model="payData.amount"
            type="number"
            :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من صفر']"
            required
          ></v-text-field>

          <v-text-field label="تاريخ السداد" v-model="payData.paid_at" type="date"></v-text-field>

          <v-select
            label="طريقة الدفع"
            v-model="payData.payment_method_id"
            :items="paymentMethods"
            item-title="name"
            item-value="id"
            :rules="[v => !!v || 'اختر طريقة الدفع']"
            required
          ></v-select>

          <v-select
            label="صندوق النقدية"
            v-model="payData.cash_box_id"
            :items="cashboxes"
            item-title="name"
            item-value="id"
            :rules="[v => !!v || 'اختر صندوق النقدية']"
          ></v-select>

          <v-text-field label="ملاحظات" v-model="payData.notes"></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closePayDialog">إلغاء</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="submitPayment">دفع القسط</v-btn>
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
    const methods = await getAll('payment-methods');
    paymentMethods.value = methods;

    // اختيار طريقة الدفع الافتراضية (كاش)
    const cashMethod = methods.find(method => method.code?.trim().toLowerCase() === 'cash');
    if (cashMethod) {
      payData.value.payment_method_id = cashMethod.id;
    }

    const userStore = useUserStore();
    if (userStore.user?.cashBoxes) {
      cashboxes.value = userStore.user.cashBoxes || [];

      // اختيار الصندوق الافتراضي
      const defaultBox = cashboxes.value.find(box => box.is_default);
      if (defaultBox) {
        payData.value.cash_box_id = defaultBox.id;
      }
    }
  } catch (error) {
    console.error('Error fetching payment methods or cashboxes:', error);
  }
});

// عند تغيير القسط، إعداد القيم
watch(
  () => props.installment,
  newInstallment => {
    console.log('📥 استلام قسط جديد:', props.installment);
    console.log('🔄 تحديث القسط:', newInstallment);
    if (newInstallment) {
      payData.value.installment_ids = [newInstallment.id];
      payData.value.amount = newInstallment.remaining;
      // payData.value.remaining = newInstallment.remaining;
      payData.value.user_id = newInstallment.user.id;
      payData.value.installment_plan_id = newInstallment.installment_plan_id;
      payData.value.notes = '';
      payData.value.paid_at = new Date().toISOString().substr(0, 10);

      // // إعادة تعيين الافتراضيات
      const cashMethod = paymentMethods.value.find(method => method.code?.trim().toLowerCase() === 'cash');
      payData.value.payment_method_id = cashMethod?.id || '';

      const defaultBox = cashboxes.value.find(box => box.is_default);
      payData.value.cash_box_id = defaultBox?.id || null;
    }
  }
);

// التحكم في فتح/إغلاق الديالوج بناءً على modelValue
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
  if (!valid.value) return;

  // const payload = {
  //   installment_plan_id: props.installment.installment_plan_id,
  //   due_date: props.installment.due_date,
  //   amount: payData.value.amount,
  //   status: 'تم الدفع',
  //   paid_at: payData.value.paid_at,
  //   remaining: props.installment.remaining - payData.value.amount,
  // };

  // console.log('Submitting payment with payload:', payload);

  // إرسال الطلب
  saveItem('installment-payment/pay', payData.value)
    .then(newInstallments => {
      console.log('تم تحديث القسط:', newInstallments);
      // Object.assign(props.installment, newInstallments);
      emit('update:installment', newInstallments.installments);
      closePayDialog();
    })
    .catch(error => {
      console.error('Error submitting payment:', error);
    });
}
</script>
