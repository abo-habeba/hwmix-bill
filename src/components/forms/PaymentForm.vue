<template>
  <!-- <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="الطرف" prop="party_id">
      <el-select v-model="formData.party_id" filterable placeholder="اختر الطرف" :loading="loadingUsers">
        <el-option v-for="user in users" :key="user.id" :label="user.full_name || user.nickname" :value="user.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="طريقة الدفع" prop="method">
      <el-select v-model="formData.method" placeholder="اختر طريقة الدفع">
        <el-option value="cash" label="نقدي" />
        <el-option value="bank" label="بنك" />
        <el-option value="transfer" label="تحويل" />
      </el-select>
    </el-form-item>
    <el-form-item label="المبلغ" prop="amount">
      <el-input-number v-model="formData.amount" :min="0.01" />
    </el-form-item>
    <el-form-item label="التاريخ" prop="date">
      <el-date-picker v-model="formData.date" type="date" placeholder="اختر التاريخ" />
    </el-form-item>
    <el-form-item label="الحساب" prop="account_id">
      <el-input v-model="formData.account_id" placeholder="أدخل رقم الحساب أو اسم الحساب" />
    </el-form-item>
    <el-form-item label="ملاحظات" prop="note">
      <el-input v-model="formData.note" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">{{ mode === 'edit' ? 'تعديل' : 'حفظ' }}</el-button>
    </el-form-item>
  </el-form> -->
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getAll } from '@/services/api';

const props = defineProps({
  context: { type: Object, required: true },
});
const mode = computed(() => props.context.mode || 'create');
const formRef = ref();
const users = ref([]);
const loadingUsers = ref(false);

const formData = ref({
  party_id: '',
  method: '',
  amount: '',
  date: '',
  account_id: '',
  note: '',
});

const rules = {
  party_id: [{ required: true, message: 'الطرف مطلوب', trigger: 'change' }],
  method: [{ required: true, message: 'طريقة الدفع مطلوبة', trigger: 'change' }],
  amount: [{ required: true, message: 'المبلغ مطلوب', trigger: 'blur' }],
  date: [{ required: true, message: 'التاريخ مطلوب', trigger: 'change' }],
};

onMounted(async () => {
  await fetchUsers();
});

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const type = props.context.partyType || 'customer';
    const res = await getAll('users', { type });
    users.value = res.data;
  } finally {
    loadingUsers.value = false;
  }
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      ElMessage.success('تم الحفظ بنجاح');
    }
  });
}
</script>
