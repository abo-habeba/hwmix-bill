<template>
  <v-dialog :model-value="visible" @update:model-value="updateVisible" max-width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">إكمال بيانات التقسيط</span>
      </v-card-title>

      <v-card-text>
        <v-row dense class="my-2">
          <v-col cols="8">
            <div class="d-flex align-center flex-column justify-center" dark>
              <span class="text-center"> اجمالي الفاتورة </span>
              <span class="text-subtitle-1 font-weight-bold">{{ formatCurrency(form.total_amount) }}</span>
            </div>
          </v-col>
          <v-col cols="4">
            <v-text-field hide-details="auto" v-model="form.round_step" label="نسبة التقريب" type="number"
              @input="calculateInstallment" outlined />
          </v-col>
        </v-row>
        <v-row dense class="my-2">
          <v-col cols="12" class="pa-1">
            <v-text-field hide-details="auto" v-model="downPayment" label="المقدم المدفوع" type="number"
              @input="calculateInstallment" outlined dense />
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-text-field hide-details="auto" v-model="months" label="عدد الشهور" type="number"
              @input="calculateInstallment" outlined dense />
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-text-field hide-details="auto" v-model="startDate" label="تاريخ البدء" type="date" outlined dense />
          </v-col>
          <!-- <v-col cols="12" class="pa-1">
            <v-date-picker v-model="formattedStartDate" show-adjacent-months></v-date-picker>
          </v-col> -->

        </v-row>
        <v-row dense class="my-2">
          <v-col cols="6" sm="6" md="4" v-for="(item, index) in previewPlan" :key="index">
            <v-card :color="item.color" class="d-flex align-center flex-column justify-center elevation-6" dark>
              <div class="d-flex align-center mb-0">
                <v-icon class="ma-0 pa-0" size="default">{{ item.icon }}</v-icon>
                <span class="text-subtitle-1 font-weight-medium">{{ item.label }}</span>
              </div>
              <div class="text-h5 align-center font-weight-bold">
                <span class="text-center">
                  {{ item.format === 'currency' ? formatCurrency(item.value) : item.value }}
                </span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="d-flex justify-start ma-5">
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
// == Imports ==
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';

// == Props & Emits ==
const props = defineProps({
  form: { type: Object, required: true },
  visible: Boolean,
});
const emit = defineEmits(['installment-saved', 'update:visible']);
const formattedStartDate = computed({
  get: () => {
    return startDate.value ? new Date(startDate.value) : null
  },
  set: (val) => {
    startDate.value = val
  }
})

// == Reactive refs ==
const downPayment = ref(0);
const months = ref(12);
const monthlyInstallment = ref(0);
const totalAfterInstallment = ref(0);
const startDate = ref(dayjs().format('YYYY-MM-DD'));
const dueDate = ref(dayjs().format('YYYY-MM-DD'));
const maxDate = ref(dayjs().format('YYYY-MM-DD'));

// == Helper: تقريب لأعلى step ==
const ceilTo = (val, step = 10) => Math.ceil(val / step) * step;

// == Plan form (يستخدمه previewPlan) ==
const planForm = computed(() => ({
  round_step: props.form.round_step ?? 10,
  total_amount: props.form.total_amount ?? 0,
  down_payment: +downPayment.value || 0,
  number_of_installments: +months.value || 1,
  start_date: startDate.value,
}));

// == Preview plan (للعرض فقط) ==
const previewPlan = computed(() => {
  /* 1) الأساسيات */
  const step = +planForm.value.round_step || 10;
  const total = +totalAfterInstallment.value; // استخدم إجمالي سعر الفاتورة بعد حساب الفائدة
  const down = +planForm.value.down_payment;
  const n = +planForm.value.number_of_installments;
  const start = dayjs(planForm.value.start_date);

  /* 2) الحسابات الدقيقة */
  const remaining = +(total - down).toFixed(2);
  const avg = +(remaining / n).toFixed(2);
  const stdInst = +ceilTo(avg, step).toFixed(2);

  /* 3) توليد الأقساط للعرض */
  const installments = [];
  let paid = 0;
  for (let i = 1; i <= n; i++) {
    const left = +(remaining - paid).toFixed(2);
    if (left <= 0) break;
    const amount = stdInst > left || i === n ? left : stdInst;
    const due = start.add(i, 'month').format('YYYY-MM-DD');
    installments.push({ installment_number: i, due_date: due, amount: amount.toFixed(2) });
    paid = +(paid + amount).toFixed(2);
  }

  const lastInstallmentAmount = installments.at(-1)?.amount || null;
  const lastInstallmentDate = installments.at(-1)?.due_date || null;

  /* 4) Return preview object */
  return [
    {
      label: 'سعر التقسيط',
      value: total.toFixed(2),
      icon: 'ri-file-paper-2-line',
      color: 'blue-darken-2',
      format: 'currency',
    },
    {
      label: 'عدد الشهور',
      value: installments.length,
      icon: 'ri-hashtag',
      color: 'indigo-darken-2',
    },
    {
      label: 'القسط الشهري',
      value: stdInst.toFixed(2),
      icon: 'ri-money-dollar-box-line',
      color: 'green-darken-2',
      format: 'currency',
    },
    {
      label: 'آخر قسط',
      value: lastInstallmentAmount,
      icon: 'ri-calendar-check-line',
      color: 'teal-darken-2',
      format: 'currency',
    },
    // {
    //   label: 'المبلغ المتبقي بعد المقدم',
    //   value: remaining.toFixed(2),
    //   icon: 'ri-wallet-3-line',
    //   color: 'deep-orange-darken-2',
    //   format: 'currency',
    // },
    // {
    //   label: 'تاريخ أول قسط',
    //   value: start.format('YYYY-MM-DD'),
    //   icon: 'ri-calendar-line',
    //   color: 'cyan-darken-2',
    // },
    // {
    //   label: 'تاريخ آخر قسط',
    //   value: lastInstallmentDate,
    //   icon: 'ri-calendar-event-line',
    //   color: 'orange-darken-2',
    // },
  ];
});

// == Utils ==
function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(+v || 0);
}

// == Monthly calculation ==
function calculateInstallment() {
  const monthsCount = +months.value || 1;
  const remainingAmount = (+props.form.total_amount || 0) - (+downPayment.value || 0);
  const monthlyRate = 0.025; // 2.5% شهريًا
  const interest = remainingAmount * monthlyRate * monthsCount;
  const total = remainingAmount + interest;
  monthlyInstallment.value = +(total / monthsCount).toFixed(2);
  totalAfterInstallment.value = +(total + +downPayment.value).toFixed(2);
}

// == Actions ==
function saveInstallment() {
  const data = {
    ...props.form,
    installment_plan: {
      down_payment: downPayment.value,
      number_of_installments: months.value,
      installment_amount: monthlyInstallment.value,
      total_amount: totalAfterInstallment.value,
      start_date: startDate.value,
      due_date: dueDate.value,
    },
  };
  emit('installment-saved', data);
}

function validateStartDate() {
  const today = dayjs().format('YYYY-MM-DD');
  if (startDate.value < today) startDate.value = today;
}

function updateVisible(val) {
  emit('update:visible', !!val);
  if (!val) validateStartDate();
}

function closeDialog() {
  emit('update:visible', false);
}

// == Watchers ==
watch(
  [downPayment, months],
  () => {
    props.form.round_step = 10;
    calculateInstallment();
  },
  { immediate: true }
);
watch(() => props.form.total_amount, calculateInstallment);
</script>

<style scoped>
.text-h6 {
  font-size: 1.1rem;
}
</style>
