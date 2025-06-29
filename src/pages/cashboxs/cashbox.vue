<script setup>
import CashBoxSwitcher from '@/components/cashboxs/CashBoxSwitcher.vue';
import DataTable from '@/components/cashboxs/transfer/DataTable.vue';
import TransactionDialog from '@/components/cashboxs/transfer/TransactionDialog.vue';
import { getAll, saveItem, updateItem } from '@/services/api';
import { toast } from 'vue3-toastify';

import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
const userStore = useUserStore();
const operationDialog = ref(false);
const searchText = ref('');
const showMenu = ref(false);
const loading = ref(false);
const selectedUser = ref(null);
const users = ref([]);
const selectedCashBox = ref(null);
const cashBoxs = ref(null);
const hasBoxCash = ref(false);
const commonCashBoxs = ref([]);
const showData = ref('لا توجد بيانات لعرضها ');
const tab = ref(null);
const step = ref(1);
const amount = ref(null);
const to_cashBox = ref('اختر خزنة');
const description = ref('');
const expand = ref(false);
const dataTable = ref(null);
function reloadTransactions() {
  if (dataTable.value) {
    dataTable.value.fetchUsers(); // 🔹 تشغيل الدالة داخل DataTable
  }
}
function onInputChange() {
  loading.value = true;
  getAll('users/search', { search: searchText.value })
    .then(res => {
      if (res.data.length) {
        users.value = res.data;
      } else {
        users.value = [];
        showData.value = `لم يتم العثور علي ${searchText.value}`;
      }
      loading.value = false;
    })
    .catch(error => {
      console.error('خطأ في طلب البيانات:', error);
      showData.value = 'حدث خطأ أثناء البحث، يرجى المحاولة لاحقًا.';
      loading.value = false;
    });
}
function selectItem(user, box) {
  // إيجاد الكاش بوكس المشتركة بناءً على الخاصية cash_type
  commonCashBoxs.value = user.cashBoxes.filter(selectedBox =>
    userStore.user.cashBoxes.some(existingBox => existingBox.cash_type === selectedBox.cash_type)
  );
  selectedUser.value = user;
  selectedCashBox.value = box;
  hasBoxCash.value = user.cashBoxes.some(b => b.cash_type === box.cash_type);
  to_cashBox.value = hasBoxCash.value ? selectedUser.value.cashBoxes[0] : 'اختر خزنة';
  operationDialog.value = true;
}
const hideShowMenu = () => {
  showMenu.value = true;
};
const handleNext = () => {
  step.value++;
};
function updatedSelecteCash() {
  hasBoxCash.value = true;
}
async function confirmOperation() {
  let data = {
    to_user_id: selectedUser.value.id,
    amount: amount.value,
    to_cashBoxId: to_cashBox.value.id,
    cashBoxId: tab.value,
    description: description.value,
  };

  try {
    await saveItem('cashBox/transfer', data, false, true, true).then(() => {
      // tab.value = 1;
      selectedUser.value = null;
      amount.value = null;
      to_cashBox.value = null;
      dataTable.value.fetchUsers(); // تأكد من تنفيذ هذه الدالة
    });
    await userStore.fetchUser();
  } catch (e) {
    console.log(e);
  } finally {
    operationDialog.value = false; // اغلاق الحوار في النهاية
  }
}

const setDefaultCashBox = id => {
  updateItem(`user/${userStore.user.id}/cashbox/${id}/set-default`, true, true).then(res => {
    userStore.user.cashBoxes.map(box => {
      box.is_default = !box.is_default;
    });
  });
};
const isDisabled = computed(() => {
  return !(
    amount.value &&
    Number(amount.value) > 0 &&
    Number(amount.value) <= Number(selectedCashBox.value?.balance || 0) &&
    to_cashBox.value !== 'اختر خزنة'
  );
});
function saveCashbox() {
  if (!cashbox.value.name) {
    toast.error('اسم الخزنة مطلوب');
    return;
  }
  saveItem('cashBox/transfer', data, false, true, true)
    .then(() => {
      toast.success('تم حفظ الخزنة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حفظ الخزنة'));
}
function deleteCashbox(id) {
  deleteOne('cashbox', id)
    .then(() => {
      toast.success('تم حذف الخزنة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف الخزنة'));
}
</script>
<template>
  <VCol cols="12">
    <VCard class="pa-2">
      <VCard v-if="userStore.user.cashBoxes" class="pa-2">
        <v-tabs v-model="tab" align-tabs="center">
          <v-tab v-for="box in userStore.user.cashBoxes" :key="box.id" :value="box.id">
            {{ box.name }}
          </v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item class="ma-2 pa-2" v-for="box in userStore.user.cashBoxes" :key="box.id" :value="box.id">
            <v-card class="text-center mx-auto ma-2 pa-2" max-width="368">
              <v-card-text>
                <v-row>
                  <v-col cols="12" v-if="box.is_default == '0'">
                    <v-btn variant="text" class="ma-0 py-0"
                      :style="{ opacity: box.is_default == '1' ? '0.3' : '1', padding: '0px 5px' }"
                      :disabled="box.is_default == '1'" @click="setDefaultCashBox(box.id)">تعين ك افتراضي</v-btn>
                  </v-col>
                  <v-col cols="12">
                    <span style="font-size: 30px">{{ box.balance }}</span>
                    <span style="font-size: 30px"> ج </span>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn class="ma-1" :text="!expand ? 'تحويل نقود' : 'X'" @click="expand = !expand"></v-btn>
                <v-spacer></v-spacer>
                <CashBoxSwitcher v-if="userStore.user.cashBoxes.length > 1" :box="box"
                  @operation-success="reloadTransactions" />
              </v-card-actions>
              <v-expand-transition class="pa-2">
                <div v-if="expand">
                  <!-- search by phone or id -->
                  <v-col cols="12">
                    <v-text-field prepend-inner-icon="ri-search-line" class="mx-auto" density="comfortable"
                      placeholder="ادخل رقم الهاتف او كود" variant="solo" rounded @focus="hideShowMenu"
                      v-model="searchText" @input="onInputChange"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <!-- Dropdown menu with users and loading state -->
                    <div style="border-radius: 36px" v-if="showMenu">
                      <v-progress-linear v-if="loading" color="primary" indeterminate></v-progress-linear>
                      <v-list class="ma-0 pa-0" v-else>
                        <div v-if="users.length">
                          <v-list-item style="border-bottom: 1px solid #c3c4c8" v-for="user in users" :key="user.id"
                            @click="selectItem(user, box)" class="cursor-pointer">
                            <v-list-item-title>{{ user.nickname }}</v-list-item-title>
                          </v-list-item>
                        </div>
                        <v-list-item v-else class="cursor-pointer">
                          <v-list-item-title>{{ showData }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>
                  </v-col>
                </div>
              </v-expand-transition>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>

      </VCard>
      <VCard v-else="userStore.user.cashBoxes">
        <v-card-text class="text-center">
          <v-icon color="primary" size="100">ri-cash-line</v-icon>
          <div class="mt-2">لا توجد خزائن نقود متاحة</div>
        </v-card-text>
      </VCard>
      <DataTable ref="dataTable" />
    </VCard>
  </VCol>
  <v-dialog v-model="operationDialog" max-width="500px">
    <v-card v-if="operationDialog" class="pa-5">
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
                <!-- alert not has BoxCash -->
                <v-col cols="12" class="ma-0 pa-0" v-if="selectedUser">
                  <v-alert class="py-1 my-3" v-if="!hasBoxCash" border="start" type="warning" variant="outlined">
                    {{ selectedUser.nickname }} ليس لديه خزنة من النوع {{ selectedCashBox.cash_type }}، اختر خزنة أخرى.
                  </v-alert>
                </v-col>
                <!-- select BoxCash To-->
                <v-col cols="12">
                  <v-select v-if="selectedUser && selectedUser.cashBoxes" rounded label="الخزنة المحول إليها"
                    v-model="to_cashBox" :items="selectedUser.cashBoxes" @update:modelValue="updatedSelecteCash"
                    item-value="id" item-title="name" />
                </v-col>
                <!-- alert amount -->
                <v-col cols="12" class="ma-0 pa-0" v-if="selectedUser">
                  <v-alert class="py-1 my-3" v-if="Number(selectedCashBox.balance) < Number(amount)" border="start"
                    type="error" variant="outlined">
                    الرصيد الحالي لا يكفي
                  </v-alert>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="amount" type="Number" label="المبلغ" rounded
                    placeholder="ادخل المبلغ المراد تحويله"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="description" label="الوصف" rounded
                    placeholder="ادخل ملاحظة او وصف او سبب للتحويل اختياري"></v-text-field>
                </v-col>
              </v-window-item>
              <v-window-item :value="2">
                <!-- from and to user -->
                <v-col cols="12" class="text-center">
                  <v-card-text class="pa-0">تحويل</v-card-text>
                  <v-card-title class="pa-0">{{ amount }}</v-card-title>
                  <v-card-text class="pa-0">من {{ userStore.user.nickname }}</v-card-text>
                  <v-card-text class="pa-0">الي {{ selectedUser?.nickname }}</v-card-text>
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
              <v-btn class="mx-10" v-if="step < 2" :disabled="isDisabled" variant="text" color="primary"
                @click="handleNext"> التالي </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-card-actions>
          <v-btn text="إغلاق" prepend-icon="ri-close-line" @click="operationDialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn text="تأكيد" v-if="step > 1" prepend-icon="ri-check-line" @click="confirmOperation"></v-btn>
        </v-card-actions>
      </v-row>
    </v-card>
  </v-dialog>
</template>
<style lang="scss" scoped>
.btn-add {
  position: absolute;

  @media (max-width: 599px) {
    bottom: 20px;
    top: auto;
    right: 20px;
  }

  @media (min-width: 600px) {
    top: 20px;
    bottom: auto;
    left: 20px;
  }
}
</style>
