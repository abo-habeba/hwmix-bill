<template>
  <v-btn class="ma-2" variant="text" @click="operationDialogd = true"> التحويل بين خزائنك </v-btn>
  <v-dialog v-model="operationDialogd" max-width="500px">
    <v-card class="pa-5">
      <v-card-title class="pa-0">التحويل بين خزائنك</v-card-title>
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto pa-2" max-width="500">
            <v-window v-model="step">
              <v-window-item :value="1">
                <!-- balance -->
                <v-col cols="12" class="text-center ma-0 pa-0">
                  <v-card-text class="pa-1">رصيدك الحالي </v-card-text>
                  <v-card-text class="pa-0">{{ selectedCashBox.balance }}</v-card-text>
                </v-col>
                <!-- select BoxCash To-->
                <v-col cols="12">
                  <v-select
                    v-if="userStore.user.cashBoxes"
                    rounded
                    label="الخزنة المحول إليها"
                    v-model="to_cashBox"
                    :items="cashBoxs"
                    @update:modelValue="updatedSelecteCash"
                    item-value="id"
                    item-title="name"
                    return-object
                  />
                </v-col>
                <!-- alert amount -->
                <v-col cols="12" class="ma-0 pa-0" v-if="selectedUser">
                  <v-alert class="py-1 my-3" v-if="Number(selectedCashBox.balance) < Number(amount)" border="start" type="error" variant="outlined">
                    الرصيد الحالي لا يكفي
                  </v-alert>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="amount" type="Number" label="المبلغ" rounded placeholder="ادخل المبلغ المراد تحويله"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="description" label="الوصف" rounded placeholder="ادخل ملاحظة او وصف او سبب للتحويل اختياري"></v-text-field>
                </v-col>
              </v-window-item>
              <v-window-item :value="2">
                <!-- from and to user -->
                <v-col cols="12" class="text-center">
                  <v-card-text class="pa-0">تحويل</v-card-text>
                  <v-card-title class="pa-0">{{ amount }}</v-card-title>
                  <v-card-text class="pa-0">من {{ selectedCashBox.name }}</v-card-text>
                  <v-card-text class="pa-0">الي {{ to_cashBox.name }}</v-card-text>
                </v-col>
              </v-window-item>
              <v-window-item :value="3">
                <div class="pa-4 text-center">تم التحويل</div>
              </v-window-item>
            </v-window>
            <!-- <v-divider class="mb-3"></v-divider> -->
            <v-card-actions>
              <v-btn class="mx-10" v-if="step > 1" variant="text" @click="step--"> السابق </v-btn>
              <v-spacer></v-spacer>
              <v-btn class="mx-10" v-if="step < 2" :disabled="isDisabled" variant="text" color="primary" @click="handleNext"> التالي </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-card-actions>
          <v-btn text="إغلاق" prepend-icon="ri-close-line" @click="operationDialogd = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn text="تأكيد" v-if="step > 1" prepend-icon="ri-check-line" @click="confirmOperation"></v-btn>
        </v-card-actions>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { ref, defineProps, defineEmits } from 'vue';
const emit = defineEmits(['operation-success']);
const userStore = useUserStore();
const operationDialogd = ref(false);
const selectedUser = ref(null);
const hasBoxCash = ref(false);
const step = ref(1);
const amount = ref(null);
const to_cashBox = ref('اختر خزنة');
const description = ref('');
const props = defineProps({
  box: {
    required: true,
  },
});
console.log(props.box);
const selectedCashBox = ref(props.box);

const cashBoxs = computed(() => {
  return userStore.user.cashBoxes.filter(b => b.id !== props.box.id);
});
const handleNext = () => {
  step.value++;
};
function updatedSelecteCash() {
  hasBoxCash.value = true;
}
async function confirmOperation() {
  let data = {
    to_user_id: userStore.user.id,
    amount: amount.value,
    to_cashBoxId: to_cashBox.value.id,
    cashBoxId: props.box.id,
    description: description.value,
  };
  try {
    await saveItem('cashBox/transfer', data, false, true, true);
    await userStore.fetchUser();
    emit('operation-success');
    operationDialogd.value = false;
  } catch (e) {
    console.log(e);
  }
}
const isDisabled = computed(() => {
  return !(
    amount.value &&
    Number(amount.value) > 0 &&
    Number(amount.value) <= Number(selectedCashBox.value?.balance || 0) &&
    to_cashBox.value !== 'اختر خزنة'
  );
});
</script>
