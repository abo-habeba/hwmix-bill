<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="نوع الإشعار" prop="type">
      <el-select v-model="formData.type" placeholder="اختر نوع الإشعار">
        <el-option value="credit_note" label="إشعار دائن" />
        <el-option value="debit_note" label="إشعار مدين" />
      </el-select>
    </el-form-item>
    <el-form-item label="الطرف" prop="party_id">
      <el-select v-model="formData.party_id" filterable placeholder="اختر الطرف" :loading="loadingUsers">
        <el-option v-for="user in users" :key="user.id" :label="user.full_name || user.nickname" :value="user.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="المبلغ" prop="amount">
      <el-input-number v-model="formData.amount" :min="0.01" />
    </el-form-item>
    <el-form-item label="الوصف" prop="description">
      <el-input v-model="formData.description" type="textarea" />
    </el-form-item>
    <el-form-item label="التاريخ" prop="date">
      <el-date-picker v-model="formData.date" type="date" placeholder="اختر التاريخ" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">{{ mode === 'edit' ? 'تعديل' : 'حفظ' }}</el-button>
    </el-form-item>
  </el-form>
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
  type: props.context.type || '',
  party_id: '',
  amount: '',
  description: '',
  date: '',
});

const rules = {
  type: [{ required: true, message: 'نوع الإشعار مطلوب', trigger: 'change' }],
  party_id: [{ required: true, message: 'الطرف مطلوب', trigger: 'change' }],
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
