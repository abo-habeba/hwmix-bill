<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="العميل" prop="customer_id">
      <el-select v-model="formData.customer_id" filterable placeholder="اختر العميل" :loading="loadingUsers">
        <el-option v-for="user in users" :key="user.id" :label="user.full_name || user.nickname" :value="user.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="الخدمات" prop="services">
      <el-table :data="formData.services" style="width: 100%">
        <el-table-column prop="name" label="اسم الخدمة" />
        <el-table-column prop="price" label="السعر">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :min="0" />
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="الكمية">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="الخصم" prop="discount">
      <el-input-number v-model="formData.discount" :min="0" />
    </el-form-item>
    <el-form-item label="الضريبة" prop="tax">
      <el-input-number v-model="formData.tax" :min="0" />
    </el-form-item>
    <el-form-item label="الإجمالي" prop="total">
      <el-input-number v-model="formData.total" :min="0" disabled />
    </el-form-item>
    <el-form-item label="التاريخ" prop="date">
      <el-date-picker v-model="formData.date" type="date" placeholder="اختر التاريخ" />
    </el-form-item>
    <el-form-item label="ملاحظات" prop="note">
      <el-input v-model="formData.note" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">{{ mode === 'edit' ? 'تعديل' : 'حفظ' }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
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
  customer_id: '',
  services: [],
  discount: 0,
  tax: 0,
  total: 0,
  date: '',
  note: '',
});

const rules = {
  customer_id: [{ required: true, message: 'العميل مطلوب', trigger: 'change' }],
  services: [{ required: true, message: 'الخدمات مطلوبة', trigger: 'change' }],
  date: [{ required: true, message: 'التاريخ مطلوب', trigger: 'change' }],
};

onMounted(async () => {
  await fetchUsers();
});

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const res = await getAll('users', { type: 'customer' });
    users.value = res.data;
  } finally {
    loadingUsers.value = false;
  }
}

watch(
  () => [formData.value.services, formData.value.discount, formData.value.tax],
  () => {
    let subtotal = formData.value.services.reduce((sum, s) => sum + Number(s.price) * Number(s.quantity), 0);
    let total = subtotal - Number(formData.value.discount) + Number(formData.value.tax);
    formData.value.total = total;
  },
  { deep: true }
);

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      ElMessage.success('تم الحفظ بنجاح');
    }
  });
}
</script>
