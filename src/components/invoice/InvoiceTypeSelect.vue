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

onMounted(fetchTypes);

async function fetchTypes() {
  loading.value = true;
  try {
    const { data } = await getAll('invoice-types', {
      context: props.invoiceContext?.context,
    });

    types.value = Array.isArray(data) ? data : data.items || [];

    // 🟢 تعيين النوع المناسب حسب الـ context بعد تحميل الأنواع
    if (!props.modelValue && props.invoiceContext?.code) {
      const match = types.value.find(type => type.code === props.invoiceContext.code);
      if (match) {
        localValue.value = match;
        // emit('update:modelValue', match);
      }
    }
  } catch (e) {
    console.error('خطأ فى تحميل أنواع الفواتير:', e);
  } finally {
    loading.value = false;
  }
}
</script>
