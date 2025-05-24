<template>
  <v-autocomplete
    v-model="selectedType"
    :items="invoiceTypes"
    item-title="name"
    item-value="id"
    label="نوع الفاتورة"
    prepend-inner-icon="ri-file-list-3-line"
    :rules="[v => !!v || 'حقل نوع الفاتورة مطلوب']"
    clearable
    required
    @update:model-value="emitType"
    :loading="isLoadingTypes"
    :no-data-text="noDataText"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getAll } from '@/services/api';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: [String, Number, Object, null],
});

const selectedType = ref(props.modelValue || null);
const invoiceTypes = ref([]);
const isLoadingTypes = ref(false);
const noDataText = ref('لا يوجد أنواع فواتير');

async function fetchInvoiceTypes() {
  isLoadingTypes.value = true;
  try {
    const res = await getAll('invoice-types');
    invoiceTypes.value = res.data || [];
    // إذا لم يكن هناك قيمة محددة مسبقاً، اختر أول نوع افتراضيًا
    if (!selectedType.value && invoiceTypes.value.length) {
      selectedType.value = invoiceTypes.value[0].id;
      emitType(selectedType.value);
    }
  } catch (e) {
    invoiceTypes.value = [];
  } finally {
    isLoadingTypes.value = false;
  }
}

function emitType(val) {
  emit('update:modelValue', val);
}

watch(
  () => props.modelValue,
  val => {
    selectedType.value = val;
  }
);

onMounted(fetchInvoiceTypes);
</script>
