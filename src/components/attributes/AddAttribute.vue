<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>اضافة خاصية جديدة</v-card-title>
      <v-card-text>
        <v-combobox
          class="my-2"
          v-model="selectedAttribute"
          :items="attributes"
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
        <v-btn color="grey darken-1" text @click="closeDialog">الغاء</v-btn>
        <v-btn color="blue darken-1" text @click="saveAttribute">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  attributes: Array,
  modelValue: Boolean,
});

const emits = defineEmits(['update:modelValue', 'attribute-saved']);

const selectedAttribute = ref(null);
const nameValue = ref('');

function handleAttributeSelection(value) {
  if (!value || typeof value === 'string') {
    selectedAttribute.value = { name: value, id: null };
  }
}

function saveAttribute() {
  if (!nameValue.value) {
    alert('يجب إدخال قيمة للخاصية');
    return;
  }

  const payload = selectedAttribute.value.id
    ? {
        attribute_id: selectedAttribute.value.id,
        name_value: nameValue.value,
      }
    : {
        name: selectedAttribute.value.name,
        name_value: nameValue.value,
      };

  emits('attribute-saved', payload);
  closeDialog();
}

function closeDialog() {
  emits('update:modelValue', false);
  selectedAttribute.value = null;
  nameValue.value = '';
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
