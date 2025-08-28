<template>
  <v-select
    v-model="localValue"
    :items="types"
    item-title="name"
    item-value="id"
    return-object
    :loading="loading"
    :disabled="loading || !types.length"
    label="نوع الفاتورة"
  />
</template>

<script setup>
import { ref, watchEffect, onMounted, watch } from 'vue';
import { getAll } from '@/services/api';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
  invoiceContext: { type: Object, default: () => ({ context: 'sales', code: 'sales' }) },
});

const localValue = ref(props.modelValue || null);
const types = ref([]);
const loading = ref(false);

watchEffect(() => {
  localValue.value = props.modelValue;
});

watch(localValue, newVal => {
  emit('update:modelValue', newVal);
});

onMounted(() => {
  console.log(props.isEdit);

  if (props.isEdit) {
    types.value = [props.invoiceContext];
    const match = types.value.find(type => type.code === props.invoiceContext.code);
    if (match) {
      localValue.value = match;
    }
  } else {
    fetchTypes();
  }
});

async function fetchTypes() {
  loading.value = true;
  try {
    const { data } = await getAll('invoice-types', {
      context: props.invoiceContext?.context,
      per_page: -1,
    });
    types.value = data || [];
    console.log('types.value', types.value);
    console.log('props.invoiceContext', props.invoiceContext);

    const match = types.value.find(type => type.code === props.invoiceContext.code);
    if (match) {
      localValue.value = match;
      // emit('update:modelValue', match);
    }
  } catch (e) {
    console.error('خطأ فى تحميل أنواع الفواتير:', e);
  } finally {
    loading.value = false;
  }
}
</script>
