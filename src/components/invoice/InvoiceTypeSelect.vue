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
    return-object
    @update:model-value="emitType"
    :loading="isLoadingTypes"
    :no-data-text="noDataText"
    hide-details="auto"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getAll } from '@/services/api';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: Object,
  invoiceContext: Object,
});

const selectedType = ref(props.modelValue || null);
const invoiceTypes = ref([]);
const isLoadingTypes = ref(false);
const noDataText = ref('لا يوجد أنواع فواتير');

async function fetchInvoiceTypes(context) {
  isLoadingTypes.value = true;
  try {
    const response = await getAll('invoice-types', { context });
    invoiceTypes.value = response.data || [];

    // اختر النوع المناسب تلقائيًا لو مش متحدد
    if (!selectedType.value && invoiceTypes.value.length && props.invoiceContext?.code) {
      const found = invoiceTypes.value.find(i => i.code === props.invoiceContext.code);
      if (found) {
        selectedType.value = found;
        emitType(found);
      }
    }
  } catch (e) {
    invoiceTypes.value = [];
  } finally {
    isLoadingTypes.value = false;
  }
}

function emitType(val) {
  if (val && typeof val === 'object' && val.id) {
    emit('update:modelValue', val);
  } else {
    console.warn('emitType: قيمة غير صالحة', val);
  }
}

// راقب التغيرات في القيمة من الكمبوننت الأب
watch(
  () => props.modelValue,
  newVal => {
    if (newVal && newVal.id !== selectedType.value?.id) {
      selectedType.value = newVal;
    }
  }
);

onMounted(() => {
  if (props.invoiceContext.context) {
    fetchInvoiceTypes(props.invoiceContext.context);
  }
});
</script>
