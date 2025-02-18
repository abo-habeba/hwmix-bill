<template>
  <!-- <v-btn class="ma-2" variant="text" @click="operationDialogd = true"> التحويل بين خزائنك </v-btn> -->
  <v-dialog v-model="operationDialogd" max-width="500px">
    <v-card class="pa-5">
      <!-- <div class="container"> -->
      <h2>تفاصيل العملية</h2>
      <div class="detail">
        <span class="label">نوع العملية</span>
        <span class="value">{{ transaction.type }}</span>
      </div>
      <div class="detail">
        <span class="label">المبلغ</span>
        <span class="value">{{ transaction.amount }}</span>
      </div>
      <div class="detail">
        <span class="label">التاريخ</span>
        <span class="value">{{ transaction.created_at }}</span>
      </div>
      <div class="detail">
        <span class="label">الرصيد قبل </span>
        <span class="value">{{ transaction.balance_before }}</span>
      </div>
      <div class="detail">
        <span class="label">الرصيد بعد </span>
        <span class="value">{{ transaction.balance_after }}</span>
      </div>
      <div class="detail">
        <span class="label">الوصف</span>
        <span class="value">{{ transaction.description }}</span>
      </div>
      <div class="detail">
        <span class="label">اسم الخزنة</span>
        <span class="value">{{ transaction.cashbox_name }}</span>
      </div>
      <h4>تفاصيل المستلم</h4>
      <div class="detail">
        <span class="label">اسم المستلم</span>
        <span class="value">{{ transaction.target_user.nickname }}</span>
      </div>
      <div class="detail">
        <span class="label">اسم الخزنة </span>
        <span class="value">{{ transaction.target_cashbox_name }}</span>
      </div>
      <hr />

      <div class="my-3">
        <h4>تفاصيل العملية</h4>
        <span class="value">{{ transaction.readable_description }}</span>
      </div>
      <v-btn class="pa-0" text="إغلاق" prepend-icon="ri-close-line" @click="operationDialogd = false"></v-btn>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { useUserStore } from '@/stores/user';
import { ref, defineProps, defineEmits, defineExpose } from 'vue';
const emit = defineEmits(['operation-success']);
const userStore = useUserStore();
const operationDialogd = ref(false);
// const transaction = ref(false);

const props = defineProps({
  transaction: {
    required: true,
  },
});
function operationDialog() {
  operationDialogd.value = true;
}
defineExpose({ operationDialog });
</script>
<style lang="scss">
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
}
// .container {
//   background: #fff;
//   border-radius: 8px;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//   padding: 20px;
//   max-width: 600px;
//   margin: auto;
// }
h2,
h4,
h5 {
  text-align: center;
  color: #333;
}
.detail {
  margin: 5px 0;
  border-bottom: 1px solid #ddd;
  padding: 5px 0;
}
.label {
  font-weight: bold;
  color: #555;
  display: inline-block;
  width: 45%;
  border-left: #bdb6b6 solid 2px;
  padding-right: 8px;
}
.value {
  color: #333;
  padding-right: 8px;
}
</style>
