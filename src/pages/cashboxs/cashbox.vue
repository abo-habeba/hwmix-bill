<script setup>
import CashBoxSwitcher from '@/components/cashboxs/CashBoxSwitcher.vue';
import DataTable from '@/components/cashboxs/transfer/DataTable.vue';
import { getAll, saveItem, updateItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue3-toastify'; // تم إرجاعها لأنها ضرورية

const userStore = useUserStore();

const operationDialog = ref(false); // مربع حوار التحويل
const showMenu = ref(false);
const loading = ref(false);
const tab = ref(null);
const expand = ref(false);
const dataTable = ref(null);

const searchText = ref('');
const users = ref([]);
const showDataMessage = ref('ادخل رقم هاتف أو كود للبحث');

const selectedUser = ref(null);
const selectedCashBox = ref(null);
const amount = ref(null);
const to_cashBox = ref(null);
const description = ref('');
const step = ref(1);

// حالة مربع حوار إنشاء الخزنة الجديدة
const createCashBoxDialog = ref(false);
const newCashBox = ref({
  name: '',
  balance: null,
  cash_box_type_id: null,
});
const cashBoxTypes = ref([]); // أنواع الخزائن المتاحة من API
const creatingCashBox = ref(false); // حالة التحميل لإنشاء الخزنة

let searchTimeout = null;
function onSearchInput(query) {
  searchText.value = query;
  clearTimeout(searchTimeout);
  if (searchText.value) {
    searchTimeout = setTimeout(() => {
      searchUsers();
    }, 300);
  } else {
    users.value = [];
    loading.value = false;
    showDataMessage.value = 'ادخل رقم هاتف أو كود للبحث';
  }
}

async function searchUsers() {
  loading.value = true;
  users.value = [];
  showDataMessage.value = 'لا توجد بيانات لعرضها';

  try {
    const res = await getAll('users/search', { search: searchText.value }, false, false, false);
    if (res.data.length) {
      users.value = res.data;
    } else {
      showDataMessage.value = `لم يتم العثور علي "${searchText.value}"`;
    }
  } catch (error) {
    console.error('خطأ في البحث:', error);
    toast.error('حدث خطأ أثناء البحث، يرجى المحاولة لاحقًا.');
    showDataMessage.value = 'حدث خطأ أثناء البحث، يرجى المحاولة لاحقًا.';
  } finally {
    loading.value = false;
  }
}

watch(selectedUser, newUser => {
  if (newUser) {
    const currentSourceCashBox = userStore.user.cashBoxes.find(box => box.id === tab.value);
    if (currentSourceCashBox) {
      selectedCashBox.value = currentSourceCashBox;
      to_cashBox.value = newUser.cashBoxes.find(b => b.cash_type === currentSourceCashBox.cash_type) || newUser.cashBoxes[0];
      operationDialog.value = true;
      step.value = 1;
    }
  }
});

const hasMatchingCashBox = computed(() => {
  if (!selectedUser.value || !selectedCashBox.value) return false;
  return selectedUser.value.cashBoxes.some(box => box.cash_type === selectedCashBox.value.cash_type);
});

const isNextDisabled = computed(() => {
  if (!amount.value || Number(amount.value) <= 0) return true;
  if (Number(amount.value) > Number(selectedCashBox.value?.balance || 0)) return true;
  if (!to_cashBox.value) return true;
  return false;
});

async function confirmTransferOperation() {
  const data = {
    to_user_id: selectedUser.value.id,
    amount: amount.value,
    to_cashBoxId: to_cashBox.value.id,
    cashBoxId: tab.value,
    description: description.value,
  };

  try {
    await saveItem('cashBox/transfer', data, false, true, true);
    toast.success('تم التحويل بنجاح.');
    await userStore.fetchUser();
    reloadTransactions();
    step.value = 3;
    amount.value = null;
    description.value = '';
  } catch (e) {
    console.error('خطأ في التحويل:', e);
    toast.error('حدث خطأ أثناء التحويل، يرجى المحاولة لاحقًا.');
  }
}

async function setDefaultCashBox(id) {
  try {
    await updateItem(`user/${userStore.user.id}/cashbox/${id}/set-default`, true, true);
    userStore.user.cashBoxes.forEach(box => {
      box.is_default = box.id === id ? '1' : '0';
    });
    toast.success('تم تعيين الخزنة كافتراضية.');
  } catch (error) {
    console.error('خطأ في تعيين الافتراضي:', error);
    toast.error('حدث خطأ أثناء تعيين الخزنة كافتراضية.');
  }
}

function reloadTransactions() {
  if (dataTable.value && typeof dataTable.value.fetchTransactions === 'function') {
    dataTable.value.fetchTransactions();
  }
}

function closeOperationDialog() {
  operationDialog.value = false;
  step.value = 1;
  expand.value = false;
  searchText.value = '';
  users.value = [];
  selectedUser.value = null;
  selectedCashBox.value = null;
  amount.value = null;
  to_cashBox.value = null;
  description.value = '';
}

// *** منطق إضافة الخزنة الجديدة ***
function openCreateCashBoxDialog() {
  createCashBoxDialog.value = true;
  fetchCashBoxTypes(); // جلب الأنواع عند فتح الدايلوج
}

async function fetchCashBoxTypes() {
  try {
    const res = await getAll('cashBoxTypes', { per_page: -1 }, false, false, false); // نقطة النهاية لجلب الأنواع
    cashBoxTypes.value = res.map(type => ({
      id: type.id,
      title: type.name,
      value: type.name,
    }));

    // 🔹 البحث عن النوع اللي اسمه "نقدي"
    const defaultType = cashBoxTypes.value.find(type => type.title === 'نقدي');
    if (defaultType) {
      newCashBox.cash_box_type_id = defaultType.id;
    }
    console.log('defaultType', defaultType.id);

    newCashBox.value.cash_box_type_id = defaultType.value;
  } catch (error) {
    console.error('خطأ في جلب أنواع الخزائن:', error);
    toast.error('حدث خطأ أثناء جلب أنواع الخزائن.');
  }
}

async function saveNewCashBox() {
  creatingCashBox.value = true;
  try {
    await saveItem('cashBox', newCashBox.value, false, true, true); // نقطة النهاية لإنشاء الخزنة
    toast.success('تم إضافة الخزنة بنجاح.');
    await userStore.fetchUser(); // تحديث بيانات المستخدم لجلب الخزائن الجديدة
    closeCreateCashBoxDialog();
  } catch (e) {
    console.error('خطأ في إضافة الخزنة:', e);
    toast.error('حدث خطأ أثناء إضافة الخزنة، يرجى المحاولة لاحقًا.');
  } finally {
    creatingCashBox.value = false;
  }
}

function closeCreateCashBoxDialog() {
  createCashBoxDialog.value = false;
  newCashBox.value = { name: '', balance: null, cash_box_type_id: null }; // إعادة تعيين الحقول
}
// *** نهاية منطق إضافة الخزنة الجديدة ***

function userTitle(item) {
  if (!item) return '';
  const _name = item.full_name || 'بدون اسم';
  const _nickname = item.nickname ? `(${item.nickname})` : '';
  const _phone = item.phone ? `📞 ${item.phone}` : 'بدون هاتف';
  const _id = item.id ? `كود ${item.id}` : '';
  return `${_name} ${_nickname} ${_phone} ${_id}`.replace(/\s+/g, ' ').trim();
}

watch(
  () => userStore.user?.cashBoxes,
  newCashBoxes => {
    if (newCashBoxes && newCashBoxes.length > 0 && !tab.value) {
      tab.value = newCashBoxes[0].id;
    }
  },
  { immediate: true }
);
</script>

<template>
  <VCol cols="12">
    <VCard class="pa-2">
      <v-row class="align-center">
        <v-col cols="auto">
          <h2 class="text-h5">الخزائن</h2>
        </v-col>
        <v-col cols="auto" class="mr-auto my-6">
          <v-btn class="btn-add" color="primary" variant="text" prepend-icon="ri-add-line" @click="openCreateCashBoxDialog"> إضافة خزنة </v-btn>
        </v-col>
      </v-row>

      <VCard v-if="userStore.user?.cashBoxes?.length" class="pa-2">
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
                  <v-col cols="12">
                    <v-btn v-if="box.is_default !== '1'" variant="text" class="ma-0 py-0" @click="setDefaultCashBox(box.id)"> تعيين كافتراضي </v-btn>
                  </v-col>
                  <v-col cols="12">
                    <span style="font-size: 30px">{{ box.balance }}</span>
                    <span style="font-size: 30px"> ج </span>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn class="ma-1" :text="!expand ? 'تحويل نقود' : 'إلغاء التحويل'" @click="expand = !expand"></v-btn>
                <v-spacer></v-spacer>
                <CashBoxSwitcher v-if="userStore.user.cashBoxes.length > 1" :box="box" @operation-success="reloadTransactions" />
              </v-card-actions>
              <v-expand-transition class="pa-2">
                <div v-if="expand">
                  <v-col cols="12">
                    <v-autocomplete
                      :item-title="userTitle"
                      prepend-inner-icon="ri-search-line"
                      class="mx-auto"
                      density="comfortable"
                      placeholder="ادخل رقم الهاتف او كود المستخدم"
                      variant="solo"
                      rounded
                      v-model="selectedUser"
                      :items="users"
                      return-object
                      :loading="loading"
                      :no-data-text="showDataMessage"
                      @update:search="onSearchInput"
                      @focus="showMenu = true"
                      @blur="showMenu = false"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :title="item?.raw?.nickname" :subtitle="item?.raw?.phone"></v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </div>
              </v-expand-transition>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </VCard>
      <VCard v-else>
        <v-card-text class="text-center">
          <v-icon color="primary" size="100">ri-cash-line</v-icon>
          <div class="mt-2">لا توجد خزائن نقود متاحة</div>
        </v-card-text>
      </VCard>
      <DataTable ref="dataTable" :cashBoxId="tab" />
    </VCard>
  </VCol>

  <v-dialog v-model="operationDialog" max-width="500px" persistent>
    <v-card v-if="operationDialog" class="pa-5">
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto pa-2" max-width="500">
            <v-window v-model="step">
              <v-window-item :value="1">
                <v-col cols="12" class="text-center ma-0 pa-0">
                  <v-card-text class="pa-1">رصيدك الحالي</v-card-text>
                  <v-card-text class="pa-0">{{ selectedCashBox?.balance || 0 }} ج</v-card-text>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0" v-if="selectedUser">
                  <v-alert class="py-1 my-3" v-if="!hasMatchingCashBox" border="start" type="warning" variant="outlined">
                    {{ selectedUser.nickname }} ليس لديه خزنة من النوع {{ selectedCashBox?.cash_type }}، الرجاء اختيار خزنة أخرى.
                  </v-alert>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-if="selectedUser?.cashBoxes?.length"
                    rounded
                    label="الخزنة المحول إليها"
                    v-model="to_cashBox"
                    :items="selectedUser.cashBoxes"
                    item-value="id"
                    item-title="name"
                  >
                  </v-select>
                  <v-alert v-else type="info" variant="outlined" class="my-3"> المستخدم المحدد ليس لديه خزائن متاحة للتحويل إليها. </v-alert>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0">
                  <v-alert
                    class="py-1 my-3"
                    v-if="Number(selectedCashBox?.balance || 0) < Number(amount)"
                    border="start"
                    type="error"
                    variant="outlined"
                  >
                    الرصيد الحالي لا يكفي لإتمام هذا التحويل.
                  </v-alert>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="amount" type="Number" label="المبلغ" rounded placeholder="ادخل المبلغ المراد تحويله"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="description" label="الوصف" rounded placeholder="ادخل ملاحظة او وصف او سبب للتحويل (اختياري)"></v-text-field>
                </v-col>
              </v-window-item>

              <v-window-item :value="2">
                <v-col cols="12" class="text-center">
                  <v-card-text class="pa-0">تحويل مبلغ</v-card-text>
                  <v-card-title class="pa-0 text-h5">{{ amount }} ج</v-card-title>
                  <v-card-text class="pa-0">من {{ userStore.user.nickname }}</v-card-text>
                  <v-card-text class="pa-0">إلى {{ selectedUser?.nickname }}</v-card-text>
                  <v-card-text class="pa-0" v-if="to_cashBox">لخزنة: {{ to_cashBox.name }} </v-card-text>
                  <v-card-text class="pa-0" v-if="description">ملاحظة: {{ description }}</v-card-text>
                </v-col>
              </v-window-item>

              <v-window-item :value="3">
                <div class="pa-4 text-center">
                  <v-icon color="success" size="60">ri-checkbox-circle-fill</v-icon>
                  <p class="mt-2 text-h6">تم التحويل بنجاح!</p>
                </div>
              </v-window-item>
            </v-window>
            <v-card-actions>
              <v-btn class="mx-10" v-if="step > 1 && step < 3" variant="text" @click="step--"> السابق </v-btn>
              <v-spacer></v-spacer>
              <v-btn class="mx-10" v-if="step === 1" :disabled="isNextDisabled" variant="text" color="primary" @click="step++"> التالي </v-btn>
              <v-btn class="mx-10" v-if="step === 2" variant="text" color="primary" @click="confirmTransferOperation"> تأكيد التحويل </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-card-actions>
          <v-btn text="إغلاق" prepend-icon="ri-close-line" @click="closeOperationDialog"></v-btn>
        </v-card-actions>
      </v-row>
    </v-card>
  </v-dialog>

  <v-dialog v-model="createCashBoxDialog" max-width="500px" persistent>
    <v-card>
      {{ newCashBox }}
      <v-card-title class="text-h6">إضافة خزنة جديدة</v-card-title>
      <v-card-text>
        <v-text-field class="my-2" v-model="newCashBox.name" label="اسم الخزنة" required></v-text-field>
        <v-select class="my-2" v-model="newCashBox.cash_box_type_id" item-value="id" :items="cashBoxTypes" label="نوع الخزنة" required> </v-select>
        <v-text-field class="my-2" v-model="newCashBox.description" label="وصف الخزنة"></v-text-field>
        <v-text-field class="my-2" v-model="newCashBox.account_number" label="رقم الحساب او المحفظة"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="closeCreateCashBoxDialog" :disabled="creatingCashBox">إلغاء</v-btn>
        <v-btn color="primary" @click="saveNewCashBox" :loading="creatingCashBox" :disabled="!newCashBox.name || !newCashBox.cash_box_type_id"
          >حفظ</v-btn
        >
      </v-card-actions>
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
