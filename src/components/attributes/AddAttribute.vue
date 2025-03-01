<template>
  <v-dialog v-model="localAddDialog" max-width="500px">
    <v-card>
      <v-card-title>اضافة خاصية جديدة</v-card-title>
      <v-card-text>
        <v-combobox
          class="my-2"
          v-model="selectedAttribute"
          :items="props.attributes"
          item-title="name"
          item-value="id"
          label="الخاصية"
          :return-object="true"
          @update:modelValue="handleAttributeSelection"
        ></v-combobox>

        <v-text-field v-model="nameValue" label="القيمة"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="closeDialog(null)">الغاء</v-btn>
        <v-btn color="blue darken-1" text @click="saveAttribute">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

// تعريف الـ props
const props = defineProps({
  addDialog: Boolean,
  attributes: Array, // تغير النوع إلى Array ليتناسب مع البيانات
});

const emit = defineEmits(['update:addDialog']);
const localAddDialog = ref(props.addDialog);

const selectedAttribute = ref(null);
const nameValue = ref('');
const valueValue = ref('');

// متابعة التغييرات في الـ props.addDialog
watch(
  () => props.addDialog,
  newValue => {
    localAddDialog.value = newValue;
  }
);

// إغلاق الديالوج
const closeDialog = payload => {
  localAddDialog.value = false;
  emit('update:addDialog', { dialog: localAddDialog.value, data: payload });
};

// اختيار الخاصية
function handleAttributeSelection(value) {
  if (!value || typeof value === 'string') {
    selectedAttribute.value = { name: value, id: null };
  }
}

// حفظ الخاصية
function saveAttribute() {
  const payload = selectedAttribute.value.id
    ? {
        attribute_id: selectedAttribute.value.id,
        name_value: nameValue.value,
        value: valueValue.value,
      }
    : {
        name: selectedAttribute.value.name,
        name_value: nameValue.value,
        value: valueValue.value,
      };

  // أضف الكود لحفظ البيانات في الـ API أو إجراء آخر حسب الحاجة

  closeDialog(payload);
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
