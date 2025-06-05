<template>
  <v-data-table :headers="headers" :items="installments || []" item-key="id" class="elevation-1" hide-default-footer density="compact">
    <template #item.actions="{ item }">
      <v-btn color="primary" small @click="openPayDialog(item)">دفع القسط</v-btn>
    </template>

    <template #no-data>
      <v-row class="pa-4">
        <v-col class="text-center text-grey">لا توجد بيانات مستخدمين</v-col>
      </v-row>
    </template>
  </v-data-table>

  <!-- Dialog دفع القسط -->
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

          <v-text-field label="تاريخ السداد" v-model="payData.paid_at" type="date" :rules="[v => !!v || 'التاريخ مطلوب']" required></v-text-field>

          <v-select
            label="طريقة الدفع"
            v-model="payData.payment_method"
            :items="paymentMethods"
            :rules="[v => !!v || 'اختر طريقة الدفع']"
            required
          ></v-select>
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
import { ref, onMounted } from 'vue';
import { getAll } from '@/services/api';

const installments = ref([]);
const payDialog = ref(false);
const valid = ref(false);
const currentInstallment = ref(null);

const payData = ref({
  amount: '',
  paid_at: new Date().toISOString().substr(0, 10), // اليوم بالتاريخ yyyy-mm-dd
  payment_method: null,
});

const paymentMethods = ['نقدي', 'تحويل بنكي', 'بطاقة ائتمان', 'شبكة الدفع الإلكتروني'];

let headers = [
  { title: 'ID', key: 'id' },
  { title: 'installment_number', key: 'رقم' },
  { title: 'قيمة القسط', key: 'amount' },
  { title: 'الحالة', key: 'status' },
  { title: 'المتبقي', key: 'remaining' },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

onMounted(() => {
  getAll('installments', null, true, true, true).then(res => {
    installments.value = res.data;
  });
});

function openPayDialog(installment) {
  currentInstallment.value = installment;
  // نحدد المبلغ الافتراضي ليكون المتبقي
  payData.value.amount = installment.remaining;
  payData.value.paid_at = new Date().toISOString().substr(0, 10);
  payData.value.payment_method = null;
  payDialog.value = true;
}

function closePayDialog() {
  payDialog.value = false;
  currentInstallment.value = null;
  payData.value = {
    amount: '',
    paid_at: new Date().toISOString().substr(0, 10),
    payment_method: null,
  };
  valid.value = false;
}

async function submitPayment() {
  if (!valid.value) return;

  // تحقق من عدم تجاوز المبلغ للمتبقي
  if (Number(payData.value.amount) > Number(currentInstallment.value.remaining)) {
    alert('مبلغ السداد لا يمكن أن يكون أكبر من المتبقي');
    return;
  }

  try {
    // مثال: endpoint الدفع عندك يكون /installments/{id}/pay
    // const response = await postData(`installments/${currentInstallment.value.id}/pay`, {
    //   amount: payData.value.amount,
    //   paid_at: payData.value.paid_at,
    //   payment_method: payData.value.payment_method,
    // });

    alert('جاري العمل علي سداد القسط ');

    // تحديث قائمة الأقساط
    // const index = installments.value.findIndex(i => i.id === currentInstallment.value.id);
    // if (index !== -1) {
    //   installments.value[index] = response.data; // افترض أنك ترجع القسط بعد التحديث من السيرفر
    // }

    closePayDialog();
  } catch (error) {
    alert('حدث خطأ أثناء عملية الدفع');
    console.error(error);
  }
}
</script>

<style scoped>
/* تحسينات بسيطة */
</style>
