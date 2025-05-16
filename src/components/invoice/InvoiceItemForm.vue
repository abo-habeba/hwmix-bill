<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { saveItem } from '@/services/api';

const props = defineProps({
  modelValue: Object,
  invoiceId: Number,
});
const emit = defineEmits(['saved', 'close']);

const form = ref({
  invoice_id: props.invoiceId,
  name: '',
  quantity: 1,
  unit_price: 0,
  discount: 0,
  total: 0,
});

watch(
  () => props.modelValue,
  val => {
    form.value = val ? { ...val } : { invoice_id: props.invoiceId, name: '', quantity: 1, unit_price: 0, discount: 0, total: 0 };
  },
  { immediate: true }
);

watch(
  () => [form.value.quantity, form.value.unit_price, form.value.discount],
  () => {
    form.value.total = form.value.quantity * form.value.unit_price - form.value.discount;
  }
);

function save() {
  saveItem('invoice-item', form.value, form.value.id).then(() => {
    emit('saved');
    emit('close');
  });
}
</script>

<template>
  <v-card>
    <v-card-title>{{ form.value.id ? 'تعديل عنصر' : 'إضافة عنصر' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="save">
        <v-text-field v-model="form.value.name" label="اسم العنصر" required />
        <v-text-field v-model.number="form.value.quantity" label="الكمية" type="number" min="1" required />
        <v-text-field v-model.number="form.value.unit_price" label="سعر الوحدة" type="number" min="0" required />
        <v-text-field v-model.number="form.value.discount" label="الخصم" type="number" min="0" />
        <v-text-field v-model.number="form.value.total" label="الإجمالي" type="number" readonly />
        <v-card-actions class="justify-end">
          <v-btn color="primary" type="submit">حفظ</v-btn>
          <v-btn color="secondary" @click="$emit('close')">إلغاء</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>
