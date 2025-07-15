<template>
  <v-data-table :headers="headers" :items="items" class="elevation-1 my-3" item-key="id" hide-default-footer dense>
    <template #item.name="{ item }">
      <span style="color: #111">{{ item.name }}</span>
    </template>
    <template #item.quantity="{ item }">
      <input
        v-model.number="item.quantity"
        type="number"
        min="0"
        lang="en"
        class="native-input very-small-input"
        style="color: #111"
        @change="emitUpdateItem(item)"
      />
    </template>
    <template #item.unit_price="{ item }">
      <span style="color: #111">{{ formatCurrency(item.unit_price) }}</span>
    </template>
    <template #item.discount="{ item }">
      <input
        v-model.number="item.discount"
        type="number"
        min="0"
        :max="item.unit_price"
        class="native-input very-small-input"
        style="color: #111"
        @change="emitUpdateItem(item)"
      />
    </template>
    <template #item.total="{ item }">
      <span style="color: #111">{{ formatCurrency(item.total) }}</span>
    </template>
    <template #item.actions="{ item }">
      <v-btn size="x-small" title="حذف" icon="ri-delete-bin-6-line" text color="error" @click="emitRemoveItem(item.id)"></v-btn>
    </template>
    <template #no-data>
      <div class="text-center text-grey">لا توجد منتجات مضافة</div>
    </template>
  </v-data-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  items: { type: Array, required: true },
});
const emit = defineEmits(['update-item', 'remove-item']);

// تعريف headers هنا مباشرة
const headers = [
  { title: 'المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity', width: 70 },
  { title: 'سعر الوحدة', key: 'unit_price', width: 100 },
  { title: 'الخصم', key: 'discount', width: 80 },
  { title: 'الإجمالي', key: 'total', width: 120 },
  { title: 'إجراءات', key: 'actions', width: 80, sortable: false },
];

function emitUpdateItem(item) {
  emit('update-item', item);
}
function emitRemoveItem(id) {
  emit('remove-item', id);
}
function formatCurrency(value) {
  const number = Number(value);
  if (isNaN(number)) return '';
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<style scoped>
.native-input {
  min-width: 60px;
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  text-align: center;
  background: #fff;
}
.very-small-input {
  width: 80px !important;
  /* min-width: 38px !important;
  max-width: 45px !important; */
  padding: 2px 3px !important;
  font-size: 13px !important;
  height: 28px !important;
}
</style>
