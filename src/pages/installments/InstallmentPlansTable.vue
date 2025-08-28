<template>
  <!-- جدول خطط التقسيط -->
  <v-card class="pa-2">
    <v-data-table-server
      fixed-header
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      :headers="headers"
      :items="installmentPlans"
      :items-length="total"
      :loading="loading"
      hover
      show-current-page
      show-select
      item-selectable
      item-value="id"
      :row-props="getInstallmentRowProps"
      class="elevation-1"
      density="compact"
      loading-text="جاري تحميل البيانات..."
      no-data-text="لا توجد بيانات"
      items-per-page-text="عدد الصفوف في الصفحة"
      :items-per-page-options="[10, 25, 50, 100, 500, { value: -1, title: 'الكل' }]"
      @update:options="fetchInstallmentPlans"
      @click:row="handleRowClick"
    >
      <template #top>
        <v-toolbar>
          <v-text-field
            v-model="searchUser"
            label="ابحث باسم المستخدم"
            prepend-inner-icon="ri-search-line"
            hide-details
            clearable
            class="ma-10"
            max-width="200"
            rounded
            @input="onSearch"
            :rules="[v => (v && v.length >= 3) || 'ادخل 3 حروف على الاقل']"
          ></v-text-field>
        </v-toolbar>
      </template>
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
          <div class="d-flex flex-wrap">
            <v-chip v-for="product in item.invoice_items.slice(0, 2)" :key="product.id" size="small" color="info" variant="outlined">
              {{ product.name }}
            </v-chip>
            <v-chip class="text-grey px-1" v-if="item.invoice_items.length > 2">منتجات {{ item.invoice_items.length - 2 }} اخرين </v-chip>
          </div>
          <span v-if="!item.invoice_items || item.invoice_items.length === 0" class="text-grey-darken-1">لا توجد منتجات</span>
        </v-chip-group>
      </template>
      <template #no-data>
        <v-row class="pa-4">
          <v-col class="text-center text-grey">لا توجد بيانات خطط أقساط</v-col>
        </v-row>
      </template>
    </v-data-table-server>
  </v-card>
  <!-- Dialog الأقساط الخاصة بالخطة -->
  <v-dialog v-model="installmentsDialog" max-width="900px" scrollable persistent>
    <v-card>
      <v-card-title class="bg-primary text-white"> تفاصيل خطة التقسيط </v-card-title>

      <v-card-text style="max-height: 70vh; overflow-y: auto">
        <!-- ملخص الخطة -->
        <v-row class="px-4 pt-4" dense>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-user-line" label="المستخدم" :text="currentPlan.user?.nickname || 'غير متوفر'" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-file-text-line" label="الفاتورة" :text="currentPlan.invoice?.invoice_number || '—'" />
          </v-col>
          <v-col cols="12" sm="6">
            <InfoDisplay icon="ri-calendar-line" label="تاريخ الخطة" :text="formattedStartDate" />
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

        <!-- جدول الأقساط -->
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
            <v-chip :color="item.status === 'paid' ? 'success' : 'error'" dark>
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status !== 'paid'"
              :color="item.status === 'paid' ? 'grey' : 'success'"
              :disabled="item.status === 'paid'"
              density="compact"
              class="me-1"
              @click.stop="openPayDialog(item, true)"
            >
              دفع القسط
            </v-btn>
            <v-btn
              v-if="item.status !== 'paid'"
              :color="item.status === 'paid' ? 'grey' : 'warning'"
              :disabled="item.status === 'paid'"
              density="compact"
              @click.stop="openPayDialog(item, false)"
            >
              مبلغ مختلف
            </v-btn>
          </template>

          <template #no-data>
            <v-row class="pa-4">
              <v-col class="text-center text-grey"> لا توجد أقساط لهذه الخطة </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Footer actions (sticky) -->
      <v-card-actions class="bg-grey-lighten-4" style="position: sticky; bottom: 0; z-index: 1">
        <v-spacer></v-spacer>
        <v-btn prepend-icon="ri-close-line" text @click="installmentsDialog = false">إغلاق</v-btn>

        <!-- زر الطباعة تحت البيانات -->
        <div class="text-end mt-2 me-4">
          <v-btn prepend-icon="ri-printer-line" color="primary" @click="printInstallmentPlan(currentPlan)"> طباعة الخطة </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog الدفع -->
  <PayInstallmentDialog v-model="payDialog" :installment="selectedInstallment" :direct-pay="directPay" @update:installment="updateInstallments" />
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from 'vue';
import { createApp } from 'vue';
import PayInstallmentDialog from '@/components/Installments/PayInstallmentDialog.vue';
import { getAll } from '@/services/api';
import { useUserStore } from '@/stores/user';

// ✅ رؤوس جدول الخطط
const headers = [
  { title: 'رقم الخطة', key: 'id' },
  { title: 'نسبه مئوية %', key: 'paid_percentage', sortable: false },
  { title: 'منتجات الخطة', key: 'plan_products', sortable: false },
  { title: 'المستخدم', key: 'user.nickname', sortable: false },
  { title: 'المبلغ الإجمالي', key: 'total_amount' },
  { title: 'الدفعة الأولى', key: 'down_payment' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const selectedRowId = ref(null);
function handleRowClick(event, row) {
  selectedRowId.value = row?.item?.id;
  console.log('Selected Row ID:', selectedRowId.value);
}
function getRowClass(item) {
  return item.id === selectedRowId.value ? 'active-row' : '';
}

// ✅ رؤوس جدول الأقساط
const installmentsHeaders = [
  { title: 'رقم القسط', key: 'installment_number' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'المبلغ', key: 'amount' },
  { title: 'المتبقي', key: 'remaining' },
  { title: 'الحالة', key: 'status_label' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

/**
 * ✅ طباعة خطة أقساط حرارية
 */
function printInstallmentPlan(item) {
  if (item && item.id) {
    const userStore = useUserStore();
    let companyName = 'اسم الشركة';
    if (userStore.user && userStore.user.companies && userStore.user.company_id) {
      const company = userStore.user.companies.find(c => c.id === userStore.user.company_id);
      if (company) companyName = company.name;
    }

    const installmentData = item;
    const container = document.createElement('div');
    document.body.appendChild(container);

    import('@/pages/installments/print/ThermalInstallmentPrint.vue').then(module => {
      const ThermalInstallmentPrint = module.default;
      const app = createApp({
        render() {
          return h(ThermalInstallmentPrint, {
            installment: installmentData,
            companyName,
            ref: 'thermalRef',
          });
        },
        mounted() {
          nextTick(() => {
            this.$refs.thermalRef.printThermal && this.$refs.thermalRef.printThermal();
            setTimeout(() => {
              app.unmount();
              document.body.removeChild(container);
            }, 500);
          });
        },
      });
      app.mount(container);
    });
  }
}

// ✅ بيانات الريأكتيف
const installmentPlans = ref([]);
const currentInstallments = ref([]);
const currentPlan = ref({});
const installmentsDialog = ref(false);
const selectedInstallment = ref(null);
const payDialog = ref(false);
const directPay = ref(true);

// ✅ الباجينيشن والـ options
const itemsPerPage = ref(10);
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: [],
});
const total = ref(0);
const loading = ref(false);

const searchUser = ref(null);
const onSearch = () => {
  if (!searchUser.value || searchUser.value.length < 3) {
    return;
  }
  options.value.page = 1; // نرجع لأول صفحة عند البحث
  fetchInstallmentPlans();
};
// ✅ دالة تنسيق صف الجدول الرئيسي
function getRowProps({ item }) {
  const paid = item.total_pay || 0;
  const totalAmount = item.total_amount || 1;
  const percent = Math.min(Math.round((paid / totalAmount) * 100), 100);

  let color = '#4caf50';
  if (percent < 50) color = '#ff9800';
  if (percent < 20) color = '#f44336';

  return {
    style: {
      background: `linear-gradient(to right, ${color} ${percent}%, transparent ${percent}%)`,
    },
  };
}

// ✅ حساب النسبة المئوية المدفوعة
function calculatePaidPercentage(item) {
  const paid = parseFloat(item.total_installments_pay) || 0;
  const totalAmount = parseFloat(item.total_installments_amount) || 1;
  return Math.min(Math.round((paid / totalAmount) * 100), 100);
}

// ✅ لون شريط التقدم
function getPercentageBarColor(item) {
  const percent = calculatePaidPercentage(item);
  if (percent === 100) return '#4CAF50';
  if (percent >= 50) return '#2196F3';
  if (percent >= 20) return '#FFC107';
  return '#F44336';
}

// ✅ تنسيق التاريخ
const formattedStartDate = computed(() => {
  return currentPlan.value.start_date ? new Date(currentPlan.value.start_date).toLocaleDateString('ar-EG') : '—';
});

// ✅ تنسيق صف جدول الأقساط
function getInstallmentRowProps({ item }) {
  const remainingAmount = parseFloat(item.remaining) || 0;
  const dueDate = new Date(item.due_date);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (item.status === 'paid') {
    return { style: { backgroundColor: '#A5D6A7' } };
  } else if (remainingAmount > 0 && dueDate < today) {
    return { style: { backgroundColor: '#EF9A9A' } };
  } else if (remainingAmount > 0) {
    return { style: { backgroundColor: '#FFE082' } };
  } else if (calculatePaidPercentage(item) == '100') {
    return { style: { backgroundColor: '#E8F5E9' } };
  }
  return {};
}

// ✅ جلب الخطط مع دعم الباجينيشن
async function fetchInstallmentPlans() {
  loading.value = true;
  try {
    const res = await getAll('installment-plans', {
      page: options.value.page,
      per_page: options.value.itemsPerPage,
      search: searchUser.value,
    });
    installmentPlans.value = res.data || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('حدث خطأ أثناء جلب الخطط', error);
  } finally {
    loading.value = false;
  }
}

// ✅ تحديث الأقساط بعد الدفع
function updateInstallments(data) {
  data.paid_installments.forEach(updated => {
    const index = currentInstallments.value.findIndex(i => i.id === updated.id);
    if (index !== -1) {
      currentInstallments.value[index] = { ...currentInstallments.value[index], ...updated };
    }
  });
}

// ✅ فتح حوار الأقساط
function openInstallmentsDialog(plan) {
  if (!plan || !Array.isArray(plan.installments)) return;
  currentPlan.value = plan;
  currentInstallments.value = plan.installments;
  installmentsDialog.value = true;
}

// ✅ فتح حوار الدفع
function openPayDialog(inst, isDirect) {
  selectedInstallment.value = inst;
  directPay.value = isDirect;
  payDialog.value = true;
}

// ✅ جلب البيانات عند التثبيت
onMounted(fetchInstallmentPlans);
</script>

<style scoped>
.v-chip {
  font-weight: bold;
  font-size: 0.8rem;
}

.active-row {
  background-color: #e0f7fa !important; /* اللون اللي تحبه */
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
