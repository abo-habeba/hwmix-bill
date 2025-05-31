<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="نوع العملية" prop="type">
      <el-select v-model="formData.type" placeholder="نوع العملية">
        <el-option value="stock_transfer" label="تحويل مخزني" />
        <el-option value="inventory_adjustment" label="تسوية مخزون" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.type === 'stock_transfer'" label="من المخزن" prop="from_warehouse_id">
      <el-select v-model="formData.from_warehouse_id" filterable placeholder="من المخزن" :loading="loadingWarehouses">
        <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.type === 'stock_transfer'" label="إلى المخزن" prop="to_warehouse_id">
      <el-select v-model="formData.to_warehouse_id" filterable placeholder="إلى المخزن" :loading="loadingWarehouses">
        <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.type === 'inventory_adjustment'" label="المخزن" prop="warehouse_id">
      <el-select v-model="formData.warehouse_id" filterable placeholder="المخزن" :loading="loadingWarehouses">
        <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="المنتجات" prop="products">
      <el-table :data="formData.products" style="width: 100%">
        <el-table-column prop="name" label="المنتج" />
        <el-table-column prop="quantity" label="الكمية">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item v-if="formData.type === 'inventory_adjustment'" label="نوع التسوية" prop="adjustment_type">
      <el-select v-model="formData.adjustment_type" placeholder="نوع التسوية">
        <el-option value="increase" label="زيادة" />
        <el-option value="decrease" label="نقص" />
      </el-select>
    </el-form-item>
    <el-form-item label="التاريخ" prop="date">
      <el-date-picker v-model="formData.date" type="date" placeholder="التاريخ" />
    </el-form-item>
    <el-form-item label="السبب" prop="reason">
      <el-input v-model="formData.reason" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">{{ mode === 'edit' ? 'تحديث' : 'إنشاء' }}</el-button>
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
const warehouses = ref([]);
const loadingWarehouses = ref(false);

const formData = ref({
  type: props.context.type || '',
  from_warehouse_id: '',
  to_warehouse_id: '',
  warehouse_id: '',
  products: [],
  adjustment_type: '',
  date: '',
  reason: '',
});

const rules = {
  type: [{ required: true, message: 'نوع العملية مطلوب', trigger: 'change' }],
  date: [{ required: true, message: 'التاريخ مطلوب', trigger: 'change' }],
  products: [{ required: true, message: 'المنتجات مطلوبة', trigger: 'change' }],
};

onMounted(async () => {
  await fetchWarehouses();
});

async function fetchWarehouses() {
  loadingWarehouses.value = true;
  try {
    const res = await getAll('warehouses');
    warehouses.value = res.data;
  } finally {
    loadingWarehouses.value = false;
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
