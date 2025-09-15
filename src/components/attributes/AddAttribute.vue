<template>
  <v-dialog v-model="localAddDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>{{ isEditMode ? 'تعديل خاصية' : 'اضافة خاصية جديدة' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="formValid">
          <v-text-field v-model="nameValue" label="اسم الخاصية" :rules="nameRules" required />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="closeDialog(null)">الغاء</v-btn>
        <v-btn color="blue darken-1" text :class="{ 'forbidden-cursor': !formValid }" @click="handleSubmit">
          {{ isEditMode ? 'تعديل' : 'حفظ' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed } from 'vue';
import { saveItem } from '@/services/api';

const props = defineProps({
  addDialog: Boolean,
  editAttribute: { type: Object, default: null }, // إذا كان هناك خاصية للتعديل
  attributes: { type: Array, default: () => [] }, // مصفوفة الخصائص الحالية
});

const emit = defineEmits(['update:addDialog', 'update:attributes']);
const localAddDialog = ref(props.addDialog);
const nameValue = ref('');
const errorMessage = ref('');
const isEditMode = computed(() => !!props.editAttribute);
const formRef = ref(null);
const formValid = ref(false);

watch(
  () => props.addDialog,
  newValue => {
    localAddDialog.value = newValue;
    if (newValue && isEditMode.value && props.editAttribute) {
      nameValue.value = props.editAttribute.name;
    } else if (newValue) {
      nameValue.value = '';
    }
    errorMessage.value = '';
  }
);

const nameRules = [
  v => !!v || 'اسم الخاصية مطلوب',
  v => (typeof v === 'string' && v.length <= 255) || 'اسم الخاصية يجب ألا يزيد عن 255 حرفًا',
  v =>
    !props.attributes.some(attr => attr.name === v && (!isEditMode.value || (props.editAttribute && attr.id !== props.editAttribute.id))) ||
    'اسم الخاصية موجود بالفعل',
];

const closeDialog = payload => {
  localAddDialog.value = false;
  emit('update:addDialog', { dialog: localAddDialog.value, data: payload });
};

async function handleSubmit() {
  errorMessage.value = '';

  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;
  const payload = { name: nameValue.value };
  let response;
  try {
    const editId = props.editAttribute?.id ?? false;
    response = await saveItem('attribute', payload, editId, false, true, true);
    emit('update:attributes', response.data);
    closeDialog(null);
  } catch (e) {
    errorMessage.value = e?.message || 'حدث خطأ أثناء حفظ الخاصية';
  }
}
</script>

<style>
.gap-2 {
  gap: 8px;
}
</style>
