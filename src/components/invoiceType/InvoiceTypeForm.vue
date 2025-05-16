<script setup>
import { ref, watch, defineProps, defineEmits, computed } from 'vue';
import { saveItem } from '@/services/api';

const props = defineProps({ modelValue: Object });
const emit = defineEmits(['saved', 'close']);
const form = ref({ name: '', description: '', id: null });

watch(
  () => props.modelValue,
  val => {
    form.value = val.id ? val : { name: '', description: '', id: null };
  },
  { immediate: true }
);

const dialogTitle = computed(() => (form.value?.id ? 'تعديل نوع فاتورة' : 'إضافة نوع فاتورة'));

function save() {
  const id = form.value.id ?? undefined;
  saveItem('invoice-type', form.value, id, true, true).then(() => {
    emit('saved');
    emit('close');
  });
}
</script>

<template>
  <v-card>
    <v-card-title>{{ dialogTitle }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="save">
        <v-text-field class="my-2" v-model="form.name" label="اسم النوع" required />
        <v-textarea v-model="form.description" label="الوصف" />
        <v-card-actions class="justify-end">
          <v-btn color="primary" type="submit">حفظ</v-btn>
          <v-btn color="secondary" @click="$emit('close')">إلغاء</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>
