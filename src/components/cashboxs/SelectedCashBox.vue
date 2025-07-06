<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="selectedCashBoxId"
        :items="userStore.user.cashBoxes"
        item-title="name"
        item-value="id"
        label="المحفظة"
        prepend-inner-icon="ri-bank-card-line"
        color="primary"
        hide-details
      />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="selectedPaymentType"
        :items="paymentTypes"
        readonly
        item-title="name"
        item-value="id"
        label="طريقة الدفع"
        prepend-inner-icon="ri-bank-card-line"
        color="primary"
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { getAll } from '@/services/api';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['update:cashBoxId', 'update:paymentType']);
const props = defineProps({
  cashBoxId: { type: Number, default: null },
  paymentType: { type: [Number, String], default: null },
});

/* ==================== State ==================== */
const paymentTypes = ref([]);
const userStore = useUserStore();

// استخدام ref داخلي لمزامنة القيم مع الـ props
const selectedCashBoxId = ref(props.cashBoxId);
const selectedPaymentType = ref(props.paymentType);

/* =============== Lifecycle =============== */
// جلب أنواع الدفع عند تحميل المكون
async function fetchPaymentTypes() {
  try {
    const res = await getAll('cashBoxTypes');

    paymentTypes.value = res.data || [];
    console.log('paymentTypes.value', paymentTypes.value);

    const defaultCashBox = userStore.user.cashBoxes.find(cb => cb.cash_type === 'نقدي');
    if (defaultCashBox) {
      selectedCashBoxId.value = defaultCashBox.id;
    }
  } catch (e) {
    paymentTypes.value = [];
    console.error('خطأ في جلب أنواع الدفع:', e);
  }
}

onMounted(() => {
  fetchPaymentTypes();
});

/* =============== Watchers =============== */
// مزامنة cash_box_id مع المحفظة المختارة
watch(selectedCashBoxId, newId => {
  emit('update:cashBoxId', newId);
  const selectedCashBox = userStore.user.cashBoxes.find(cb => cb.id === newId);
  if (selectedCashBox) {
    selectedPaymentType.value = selectedCashBox.cash_box_type_id;
  } else {
    selectedPaymentType.value = null;
  }
});

// مزامنة payment_type مع النوع المحدد
watch(selectedPaymentType, newType => {
  emit('update:paymentType', newType);
});

// مراقبة props الخارجية لتحديث الـ refs الداخلية
watch(
  () => props.cashBoxId,
  newVal => {
    selectedCashBoxId.value = newVal;
  }
);
watch(
  () => props.paymentType,
  newVal => {
    selectedPaymentType.value = newVal;
  }
);
</script>
