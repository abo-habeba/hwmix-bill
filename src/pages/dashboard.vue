<script setup>
import InstallmentsDataTable from '@/components/Installments/InstallmentsDataTable.vue';
import AnalyticsAward from '@/views/dashboard/AnalyticsAward.vue';
import AnalyticsBarCharts from '@/views/dashboard/AnalyticsBarCharts.vue';
import AnalyticsDepositWithdraw from '@/views/dashboard/AnalyticsDepositWithdraw.vue';
import AnalyticsSalesByCountries from '@/views/dashboard/AnalyticsSalesByCountries.vue';
import AnalyticsTotalEarning from '@/views/dashboard/AnalyticsTotalEarning.vue';
import AnalyticsTotalProfitLineCharts from '@/views/dashboard/AnalyticsTotalProfitLineCharts.vue';
import AnalyticsTransactions from '@/views/dashboard/AnalyticsTransactions.vue';
import AnalyticsWeeklyOverview from '@/views/dashboard/AnalyticsWeeklyOverview.vue';
import CardStatisticsVertical from '@core/components/cards/CardStatisticsVertical.vue';
import { computed } from 'vue';

// دالة مساعدة لتحويل التاريخ إلى صيغة 'YYYY-MM-DD'
// يمكن نقل هذه الدالة إلى ملف 'helpers' أو 'utils' إذا كنت تستخدمها في أماكن أخرى
const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// حساب الفلاتر الديناميكية مباشرة داخل `computed`
const installmentFilters = computed(() => {
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 5);

  // تهيئة الوقت لضمان المقارنة باليوم فقط
  today.setHours(0, 0, 0, 0);
  threeDaysLater.setHours(0, 0, 0, 0);

  return {
    // due_date_from: formatDate(today),
    due_date_to: formatDate(threeDaysLater),
    status: 'pending', // فلتر افتراضي لعرض الأقساط غير المدفوعة فقط
  };
});

const hasInstallments = ref(true);
const hasShowInstallments = ref(false);

// دالة لمعالجة الحدث الصادر من InstallmentsDataTable
const handleTotalItemsUpdate = total => {
  hasInstallments.value = total > 0;
  hasShowInstallments.value = total > 0;
};

const totalProfit = {
  title: 'Total Profit',
  color: 'secondary',
  icon: 'ri-pie-chart-2-line',
  stats: '$25.6k',
  change: 42,
  subtitle: 'Weekly Project',
};

const newProject = {
  title: 'New Project',
  color: 'primary',
  icon: 'ri-file-word-2-line',
  stats: '862',
  change: -18,
  subtitle: 'Yearly Project',
};
</script>

<template>
  <!-- <v-card class="d-flex justify-center align-center h-screen">
    <v-card class="text-center pa-5" width="450" elevation="10" rounded="lg">
      <v-card-text class="pb-0">
        <v-icon size="64" color="primary">ri-dashboard-line</v-icon>
      </v-card-text>
      <v-card-title class="justify-center text-h5 font-weight-bold pb-2"> لوحة التحكم </v-card-title>
      <v-card-text class="text-subtitle-1 text-medium-emphasis">
        <p>
          مرحبًا بك في لوحة التحكم الخاصة بك!<br />
          هنا يمكنك العثور على نظرة عامة على تحليلاتك وإحصائياتك.
        </p>
      </v-card-text>
    </v-card>
  </v-card> -->
  <VRow class="match-height">
    <!-- <VCol cols="12" md="4">
      <AnalyticsAward />
    </VCol> -->

    <!-- <VCol cols="12" md="8">
      <AnalyticsTransactions />
    </VCol> -->

    <!-- <VCol cols="12" md="4">
      <AnalyticsWeeklyOverview />
    </VCol> -->

    <!-- <VCol cols="12" md="4">
      <AnalyticsTotalEarning />
    </VCol> -->

    <!-- <VCol cols="12" md="4">
      <VRow class="match-height">
        <VCol cols="12" sm="6">
          <AnalyticsTotalProfitLineCharts />
        </VCol>

        <VCol cols="12" sm="6">
          <CardStatisticsVertical v-bind="totalProfit" />
        </VCol>

        <VCol cols="12" sm="6">
          <CardStatisticsVertical v-bind="newProject" />
        </VCol>

        <VCol cols="12" sm="6">
          <AnalyticsBarCharts />
        </VCol>
      </VRow>
    </VCol> -->

    <!-- <VCol cols="12" md="4">
      <AnalyticsSalesByCountries />
    </VCol> -->

    <!-- <VCol cols="12" md="8">
      <AnalyticsDepositWithdraw />
    </VCol> -->

    <VCol cols="12" v-show="hasShowInstallments" v-if="hasInstallments">
      <VCard class="pa-0" title="الأقساط المستحقة قريباً">
        <InstallmentsDataTable
          :pagination="false"
          :filters="installmentFilters"
          :selected-headers="['installment_number', 'user.nickname', 'due_date', 'actions']"
          @update:totalItems="handleTotalItemsUpdate"
        />
      </VCard>
    </VCol>
  </VRow>
</template>
