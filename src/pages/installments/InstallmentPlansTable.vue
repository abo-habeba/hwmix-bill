<template>
  <!-- جدول خطط التقسيط -->
  <v-data-table :headers="headers" :items="installmentPlans" item-value="id" class="elevation-1" density="compact"
    :row-props="getRowProps" hide-default-footer>
    <template #item.actions="{ item }">
      <v-btn color="primary" density="compact" @click.stop="openInstallmentsDialog(item)">عرض الأقساط</v-btn>
    </template>

    <template #no-data>
      <v-row class="pa-4">
        <v-col class="text-center text-grey">لا توجد بيانات خطط أقساط</v-col>
      </v-row>
    </template>
  </v-data-table>

  <!-- Dialog الأقساط الخاصة بالخطة -->
  <v-dialog v-model="installmentsDialog" max-width="900px" scrollable>
    <v-card>
      <v-card-title class="bg-primary text-white">تفاصيل خطة التقسيط</v-card-title>
      <v-card-text>
        <!-- ملخص الخطة -->
        <v-row class="px-4 pt-4" dense>
          <v-col cols="6"><strong>المستخدم:</strong> {{ currentPlan.user?.nickname || 'غير متوفر' }}</v-col>
          <v-col cols="6"><strong>الفاتورة:</strong> {{ currentPlan.invoice?.invoice_number || '—' }}</v-col>
          <v-col cols="6"><strong>تاريخ البدء:</strong> {{ formattedStartDate }}</v-col>
          <v-col cols="6"><strong>إجمالي الفاتورة:</strong> {{ currentPlan.total_amount }}</v-col>
          <v-col cols="6"><strong>إجمالي المتبقي:</strong> {{ currentPlan.total_remaining }}</v-col>
          <v-col cols="6"><strong>إجمالي المدفوع:</strong> {{ currentPlan.total_pay }}</v-col>
          <v-col cols="6"><strong>المقدم:</strong> {{ currentPlan.down_payment }}</v-col>
          <v-col cols="6"><strong>عدد الأقساط:</strong> {{ currentPlan.installments?.length || 0 }}</v-col>
        </v-row>

        <!-- جدول الأقساط بدون ترقيم صفحات -->
        <v-data-table :headers="installmentsHeaders" :items="currentInstallments" item-value="id"
          class="elevation-1 mt-4" density="compact" :items-per-page="-1" hide-default-footer>
          <template #item.status="{ item }">
            <v-chip :color="item.status === 'تم الدفع' ? 'success' : 'error'" dark>{{ item.status }}</v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn v-if="item.status !== 'تم الدفع'" :color="item.status === 'تم الدفع' ? 'grey' : 'success'"
              :disabled="item.status === 'تم الدفع'" density="compact" class="me-1"
              @click.stop="openPayDialog(item, true)">دفع القسط</v-btn>
            <v-btn v-if="item.status !== 'تم الدفع'" :color="item.status === 'تم الدفع' ? 'grey' : 'warning'"
              :disabled="item.status === 'تم الدفع'" density="compact" @click.stop="openPayDialog(item, false)">مبلغ
              مختلف</v-btn>
          </template>

          <template #no-data>
            <v-row class="pa-4">
              <v-col class="text-center text-grey">لا توجد أقساط لهذه الخطة</v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="installmentsDialog = false">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog الدفع -->
  <PayInstallmentDialog v-model="payDialog" :installment="selectedInstallment" :direct-pay="directPay"
    @update:installment="updateInstallments" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PayInstallmentDialog from '@/components/Installments/PayInstallmentDialog.vue';
import { getAll } from '@/services/api';

// رؤوس جدول الخطط
const headers = [
  { title: 'رقم الخطة', key: 'id' },
  { title: 'المستخدم', key: 'user.nickname', sortable: false },
  { title: 'المبلغ الإجمالي', key: 'total_amount' },
  { title: 'الدفعة الأولى', key: 'down_payment' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

// رؤوس جدول الأقساط
const installmentsHeaders = [
  { title: 'رقم القسط', key: 'installment_number' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'المبلغ', key: 'amount' },
  { title: 'المتبقي', key: 'remaining' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

// بيانات الريأكتيف
const installmentPlans = ref([]);
const currentInstallments = ref([]);
const currentPlan = ref({});
const installmentsDialog = ref(false);

// بيانات حوار الدفع
const selectedInstallment = ref(null);
const payDialog = ref(false);
const directPay = ref(true);
// دالة لتنسيق صف الجدول بناءً على حالة الدفع
function getRowProps({ item }) {
  const paid = item.total_pay || 0;
  const total = item.total_amount || 1; // تجنب القسمة على صفر
  const percent = Math.min(Math.round((paid / total) * 100), 100); // تقريب النسبة المئوية

  let color = '#4caf50'; // أخضر - جيد (50% أو أكثر)
  if (percent < 50) color = '#ff9800'; // برتقالي - متوسط (20% إلى 49%)
  if (percent < 20) color = '#f44336'; // أحمر - منخفض (أقل من 20%)

  // إرجاع كائن يحتوي على خاصية style مباشرة
  return {
    style: {
      // هنا نقوم بإنشاء سلسلة الـ linear-gradient وتطبيقها كخلفية مضمنة
      background: `linear-gradient(to right, ${color} ${percent}%, transparent ${percent}%)`,
    },
  };
}
// computed: تنسيق التاريخ وحساب الإجماليات
const formattedStartDate = computed(() => {
  return currentPlan.value.start_date ? new Date(currentPlan.value.start_date).toLocaleDateString('ar-EG') : '—';
});

const totalRemaining = computed(() => {
  return currentInstallments.value.reduce((sum, i) => sum + (i.remaining || 0), 0);
});

const totalPaid = computed(() => {
  return currentInstallments.value.reduce((sum, i) => sum + (i.amount - (i.remaining || 0)), 0);
});

// جلب الخطط
function fetchInstallmentPlans() {
  getAll('installment-plans', { per_page: -1 }, true, true, false)
    .then(res => {
      installmentPlans.value = res.data || [];
    })
}

function updateInstallments(updatedInstallments) {
  updatedInstallments.forEach(updated => {
    const index = currentInstallments.value.findIndex(i => i.id === updated.id);
    if (index !== -1) {
      currentInstallments.value[index] = { ...currentInstallments.value[index], ...updated };
    }
  });
}

// فتح/إغلاق حوار الأقساط
function openInstallmentsDialog(plan) {
  if (!plan || !Array.isArray(plan.installments)) return;
  currentPlan.value = plan;
  currentInstallments.value = plan.installments;
  installmentsDialog.value = true;
}

// فتح حوار الدفع
function openPayDialog(inst, isDirect) {
  selectedInstallment.value = inst;
  directPay.value = isDirect;
  payDialog.value = true;
}

onMounted(fetchInstallmentPlans);
</script>

<style scoped>
.v-chip {
  font-weight: bold;
  font-size: 0.8rem;
}
</style>
