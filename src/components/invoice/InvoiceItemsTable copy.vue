<template>
  <v-data-table :headers="headers" :items="items" class="elevation-1 my-3" item-key="product_id" hide-default-footer dense>
    <template #item.name="{ item }">
      <span style="color: #111">{{ item.name }}</span>
    </template>

    <template #item.quantity="{ item }">
      <input
        :value="item.quantity"
        @input="onInputChange($event, item, 'quantity')"
        type="number"
        min="1"
        class="flexible-input text-center"
        style="color: #111"
      />
    </template>

    <template #item.unit_price="{ item }">
      <span style="color: #111">{{ formatCurrency(item.unit_price) }}</span>
    </template>

    <template #item.unit_discount="{ item }">
      <input
        :value="item.unit_discount"
        @input="onInputChange($event, item, 'unit_discount')"
        type="number"
        min="0"
        :max="item.unit_price"
        class="flexible-input text-center"
        style="color: #111"
      />
    </template>

    <!-- سعر الوحدة بعد الخصم -->
    <template #item.unit_price_after_discount="{ item }">
      <span style="color: #111">
        {{ formatCurrency(item.unit_price - (item.unit_discount || 0)) }}
      </span>
    </template>

    <template #item.total_item_discount="{ item }">
      <input
        :value="item.total_item_discount"
        @input="onInputChange($event, item, 'total_item_discount')"
        type="number"
        min="0"
        :max="item.unit_price * item.quantity"
        class="flexible-input text-center"
        style="color: #111"
      />
    </template>

    <template #item.total="{ item }">
      <span style="color: #111">{{ formatCurrency(item.total) }}</span>
    </template>

    <template #item.actions="{ item }">
      <v-btn size="x-small" title="حذف" icon="ri-delete-bin-6-line" text color="error" @click="emitRemoveItem(item.product_id)" />
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

const headers = [
  { title: 'المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity', width: 70 },
  { title: 'سعر الوحدة', key: 'unit_price', width: 100 },
  { title: 'خصم الوحدة', key: 'unit_discount', width: 90 },
  { title: 'سعر الوحدة بعد الخصم', key: 'unit_price_after_discount', width: 110 },
  { title: 'خصم البند', key: 'total_item_discount', width: 90 },
  { title: 'الإجمالي', key: 'total', width: 120 },
  { title: 'إجراءات', key: 'actions', width: 80, sortable: false },
];

function onInputChange(event, item, field) {
  const value = Number(event.target.value);
  const updated = {
    product_id: item.product_id,
    [field]: isNaN(value) ? 0 : value,
  };

  emit('update-item', updated);
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
.flexible-input {
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 14px;
  height: 30px;
  box-sizing: border-box;
  min-width: 50px;
  width: 100%;
}
.text-center {
  text-align: center;
}
</style>
