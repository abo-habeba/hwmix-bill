<template>
  <!-- جدول خطط التقسيط -->
  <v-data-table :headers="headers" :items="installmentPlans" item-value="id" class="elevation-1" density="compact" hide-default-footer>
    <template #item.actions="{ item }">
      <v-btn color="primary" density="compact" @click.stop="openInstallmentsDialog(item)">عرض الأقساط</v-btn>
    </template>
    <!-- قالب لعمود "النسبة المدفوعة" كشريط تقدم -->
    <template #item.paid_percentage="{ item }">
      <div class="progress-bar-container">
        <div
          class="progress-bar-fill"
          :style="{
            width: calculatePaidPercentage(item) + '%',
            backgroundColor: getPercentageBarColor(item),
          }"
        >
          {{ calculatePaidPercentage(item) }}%
        </div>
      </div>
    </template>
    <template #item.plan_products="{ item }">
      <v-chip-group column>
        <div>
          <v-chip v-for="product in item.invoice_items" :key="product.id" size="small" color="info" variant="outlined">
            {{ product.name }}
          </v-chip>
        </div>
        <span v-if="!item.invoice_items || item.invoice_items.length === 0" class="text-grey-darken-1">لا توجد منتجات</span>
      </v-chip-group>
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
          <!-- تم تعديل cols إلى cols="12" sm="6" -->
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-user-line" label="المستخدم" :text="currentPlan.user?.nickname || 'غير متوفر'" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-file-text-line" label="الفاتورة" :text="currentPlan.invoice?.invoice_number || '—'" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-calendar-line" label="تاريخ البدء" :text="formattedStartDate" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-money-dollar-box-line" label="إجمالي الفاتورة" :text="currentPlan.total_amount" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-wallet-line" label="إجمالي المتبقي" :text="currentPlan.total_installments_remaining" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-hand-coin-line" label="إجمالي المدفوع" :text="currentPlan.total_pay" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-hand-heart-line" label="المقدم" :text="currentPlan.down_payment" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-list-ordered" label="عدد الأقساط" :text="currentPlan.installments?.length || 0" />
          </v-col>
        </v-row>

        <!-- جدول الأقساط بدون ترقيم صفحات -->
        <v-data-table
          :row-props="getInstallmentRowProps"
          :headers="installmentsHeaders"
          :items="currentInstallments"
          item-value="id"
          class="elevation-1 mt-4"
          density="compact"
          :items-per-page="-1"
          hide-default-footer
        >
          <template #item.status="{ item }">
            <v-chip :color="item.status === 'تم الدفع' ? 'success' : 'error'" dark>{{ item.status }}</v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status !== 'تم الدفع'"
              :color="item.status === 'تم الدفع' ? 'grey' : 'success'"
              :disabled="item.status === 'تم الدفع'"
              density="compact"
              class="me-1"
              @click.stop="openPayDialog(item, true)"
              >دفع القسط</v-btn
            >
            <v-btn
              v-if="item.status !== 'تم الدفع'"
              :color="item.status === 'تم الدفع' ? 'grey' : 'warning'"
              :disabled="item.status === 'تم الدفع'"
              density="compact"
              @click.stop="openPayDialog(item, false)"
              >مبلغ مختلف</v-btn
            >
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
  <PayInstallmentDialog v-model="payDialog" :installment="selectedInstallment" :direct-pay="directPay" @update:installment="updateInstallments" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PayInstallmentDialog from '@/components/Installments/PayInstallmentDialog.vue';
import { getAll } from '@/services/api';

// رؤوس جدول الخطط
const headers = [
  { title: 'رقم الخطة', key: 'id' },
  { title: 'نسبه مئوية %', key: 'paid_percentage', sortable: false },
  { title: 'منتجات الخطة', key: 'plan_products', sortable: false },
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
// تستخدم في الجدول كده :row-props="getRowProps"
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

// دالة لحساب النسبة المئوية المدفوعة
function calculatePaidPercentage(item) {
  const paid = parseFloat(item.total_installments_pay) || 0;
  const total = parseFloat(item.total_installments_amount) || 1; // تجنب القسمة على صفر
  return Math.min(Math.round((paid / total) * 100), 100);
}

// دالة لتحديد لون شريط التقدم بناءً على النسبة المئوية (ألوان Hex)
function getPercentageBarColor(item) {
  const percent = calculatePaidPercentage(item);
  if (percent === 100) return '#4CAF50'; // أخضر (Success)
  if (percent >= 50) return '#2196F3'; // أزرق (Info)
  if (percent >= 20) return '#FFC107'; // أصفر/برتقالي (Warning)
  return '#F44336'; // أحمر (Error)
}

// computed: تنسيق التاريخ وحساب الإجماليات
const formattedStartDate = computed(() => {
  return currentPlan.value.start_date ? new Date(currentPlan.value.start_date).toLocaleDateString('ar-EG') : '—';
});

// دالة لتنسيق صف جدول الأقساط بناءً على حالة القسط
function getInstallmentRowProps({ item }) {
  const remainingAmount = parseFloat(item.remaining) || 0;
  const dueDate = new Date(item.due_date);
  const today = new Date();
  // لضمان مقارنة التواريخ فقط (تجاهل الوقت)
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (item.status === 'تم الدفع') {
    return { style: { backgroundColor: '#A5D6A7' } }; // أخضر أغمق قليلاً (Material Design Light Green 300)
  } else if (remainingAmount > 0 && dueDate < today) {
    return { style: { backgroundColor: '#EF9A9A' } }; // أحمر أغمق قليلاً (Material Design Red 200)
  } else if (remainingAmount > 0) {
    return { style: { backgroundColor: '#FFE082' } }; // أصفر/برتقالي أغمق قليلاً (Material Design Amber 200)
  }
  return {}; // لا يوجد تنسيق خاص
}

const totalRemaining = computed(() => {
  return currentInstallments.value.reduce((sum, i) => sum + (i.remaining || 0), 0);
});

const totalPaid = computed(() => {
  return currentInstallments.value.reduce((sum, i) => sum + (i.amount - (i.remaining || 0)), 0);
});

// جلب الخطط
function fetchInstallmentPlans() {
  getAll('installment-plans', { per_page: -1 }, true, true, false).then(res => {
    installmentPlans.value = res || [];
  });
}

function updateInstallments(installments) {
  installments.forEach(updated => {
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

/* تنسيقات شريط التقدم */
.progress-bar-container {
  width: 100%;
  min-width: 150px; /* لضمان عرض كافٍ للشريط */
  height: 25px; /* ارتفاع الشريط */
  border: 1px solid #ccc; /* حدود للشريط */
  border-radius: 5px; /* حواف دائرية */
  overflow: hidden; /* لإخفاء أي جزء زائد من الشريط الداخلي */
  background-color: #e0e0e0; /* لون خلفية الشريط عند عدم التقدم */
  display: flex; /* لجعل المحتوى الداخلي يتوسط */
  align-items: center; /* توسيط عمودي */
  justify-content: flex-start; /* يبدأ من اليسار */
  position: relative; /* لتموضع النص فوق الشريط */
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out; /* حركة سلسة */
  display: flex; /* لجعل النص يتوسط داخل الشريط الملون */
  align-items: center; /* توسيط عمودي للنص */
  justify-content: center; /* توسيط أفقي للنص */
  color: white; /* لون النص داخل الشريط الملون */
  font-weight: bold;
  font-size: 0.85rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* ظل للنص لتحسين القراءة */
}
</style>
