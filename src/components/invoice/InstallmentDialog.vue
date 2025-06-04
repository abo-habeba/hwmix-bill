<template>
  <v-dialog :model-value="visible" @update:model-value="updateVisible" max-width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">إكمال بيانات التقسيط</span>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-chip color="primary" class="pa-3 text-h6">
              <v-icon left>ri-calculator-line</v-icon>
              إجمالي الفاتورة: {{ formatCurrency(form.total_amount) }}
            </v-chip>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="downPayment" label="المقدم المدفوع" type="number" @input="calculateInstallment" outlined dense />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="months" label="عدد الشهور" type="number" @input="calculateInstallment" outlined dense />
          </v-col>
          <v-col cols="12">
            <v-chip color="info" class="pa-3 text-h6">
              <v-icon left>ri-money-dollar-circle-line</v-icon>
              المبلغ الشهري: {{ formatCurrency(monthlyInstallment) }}
            </v-chip>
          </v-col>
          <v-col cols="12">
            <v-chip color="success" class="pa-3 text-h6">
              <v-icon left>ri-calculator-line</v-icon>
              سعر الفاتورة بعد القسط: {{ formatCurrency(totalAfterInstallment) }}
            </v-chip>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="startDate" label="تاريخ البدء" type="date" :max="maxDate" @input="validateStartDate" outlined dense />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" @click="saveInstallment" elevation="2" rounded>
          <v-icon left>ri-save-line</v-icon>
          حفظ
        </v-btn>
        <v-btn color="error" @click="closeDialog" elevation="2" rounded>
          <v-icon left>ri-close-circle-line</v-icon>
          إلغاء
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  form: Object,
  visible: Boolean,
});

const downPayment = ref(0);
const months = ref(12);
const monthlyInstallment = ref(0);
const totalAfterInstallment = ref(0);
const startDate = ref(new Date().toISOString());
const maxDate = ref(new Date().toISOString().split('T')[0]);

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value || 0);
}

function calculateInstallment() {
  const monthlyInterestRate = 0.025; // 2.5% شهريًا
  const monthsCount = Number(months.value) || 1; // تأمين ضد القسمة على صفر

  const remainingAmount = Number(props.form.total_amount) - Number(downPayment.value);
  const interest = remainingAmount * monthlyInterestRate * monthsCount;

  const total = remainingAmount + interest;
  monthlyInstallment.value = +(total / monthsCount).toFixed(2);
  totalAfterInstallment.value = +(total + Number(downPayment.value)).toFixed(2);
}

function saveInstallment() {
  // console.log(props.form);
  let data = {
    ...props.form,
    installment_plan: {
      down_payment: downPayment.value,
      number_of_installments: months.value,
      installment_amount: monthlyInstallment.value,
      total_amount: totalAfterInstallment.value,
      start_date: startDate.value, // تاريخ البدء يحدده المستخدم
    },
  };
  emit('installment-saved', data);
}

function validateStartDate() {
  const today = new Date().toISOString().split('T')[0];
  if (startDate.value < today) {
    startDate.value = today;
  }
}

// Ensure proper handling of the `onUpdate:modelValue` event
function updateVisible(newValue) {
  if (typeof newValue === 'boolean') {
    emit('update:visible', newValue);
  } else {
    console.warn('Invalid value for updateVisible:', newValue);
  }
}

function closeDialog() {
  emit('update:visible', false);
}

const emit = defineEmits(['installment-saved', 'update:visible']);

watch([downPayment, months], calculateInstallment);

// Watch for changes in props.form.total_amount and trigger calculateInstallment
watch(
  () => props.form.total_amount,
  () => {
    calculateInstallment();
  }
);
</script>

<style scoped>
.text-h6 {
  font-size: 1.1rem;
}
</style>
