<template>
  <div>
    <!-- زر إضافة قيمة جديدة -->
    <v-btn class="ma-1" color="primary" @click="openAddDialog">اضافة قيمة</v-btn>

    <!-- Dialog الإضافة/التعديل -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'تعديل قيمة' : 'اضافة قيمة جديدة' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <!-- لا داعي لاختيار الخاصية هنا -->
            <v-text-field
              class="pa-3"
              v-model="attributeValue.name"
              label="اسم القيمة"
              :rules="[v => !!v || 'اسم القيمة مطلوب']"
              required
            ></v-text-field>

            <!-- Color Picker Button -->
            <v-btn class="ma-3" :style="{ backgroundColor: attributeValue.color || '' }" @click="colorPickerDialog = true"> اختر اللون </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">الغاء</v-btn>
          <v-btn color="blue darken-1" :class="{ 'forbidden-cursor': !formValid }" text @click="saveValue">{{ isEditMode ? 'تحديث' : 'حفظ' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Color Picker Dialog -->
    <v-dialog v-model="colorPickerDialog" max-width="500px">
      <v-card>
        <v-card-title :style="{ backgroundColor: attributeValue.color || '', position: 'fixed', zIndex: '100', width: '100%' }">
          اختر اللون
        </v-card-title>
        <v-card-text class="mt-10">
          <v-color-picker v-model="attributeValue.color" show-swatches hide-inputs> </v-color-picker>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" class="mx-auto my-2 elevated-5" @click="colorPickerDialog = false">
            <v-icon class="mx-3" size="18">ri-check-line</v-icon>
            تم
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineExpose } from 'vue';
import { saveItem } from '@/services/api';
import { toast } from 'vue3-toastify';

const props = defineProps({
  attributes: { type: Array, required: true },
  editValue: { type: Object, default: null },
});
const emit = defineEmits(['value-added', 'value-edited']);

const dialog = ref(false);
const colorPickerDialog = ref(false);
const attributeValue = ref({ name: '', color: '', attribute_id: null, id: null });
const nameError = ref('');
const isEditMode = ref(false);
const formRef = ref(null);
const formValid = ref(false);

function openAddDialog() {
  isEditMode.value = false;
  dialog.value = true;
  attributeValue.value = { name: '', color: '', attribute_id: null, id: null };
  nameError.value = '';
}

function openEditDialog(val) {
  isEditMode.value = true;
  dialog.value = true;
  attributeValue.value = { ...val };
  nameError.value = '';
}

defineExpose({ openEditDialog });

function closeDialog() {
  dialog.value = false;
  attributeValue.value = { name: '', color: '', attribute_id: null, id: null };
  nameError.value = '';
}

async function saveValue() {
  nameError.value = '';
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  // استخدم الخاصية الحالية مباشرة
  if (props.attributes && props.attributes[0] && props.attributes[0].id) {
    attributeValue.value.attribute_id = props.attributes[0].id;
  }
  try {
    const response = await saveItem('attribute-value', attributeValue.value, attributeValue.value.id, true);
    if (isEditMode.value && attributeValue.value.id) {
      emit('value-edited', response);
    } else {
      emit('value-added', response);
    }
    closeDialog();
  } catch (e) {
    toast.error(e?.message || 'حدث خطأ أثناء حفظ القيمة');
  }
}

// دعم التعديل من prop
watch(
  () => props.editValue,
  val => {
    if (val && val.id) {
      openEditDialog(val);
    }
  }
);
</script>
<style lang="scss">
.v-color-picker {
  max-width: none !important;
  width: auto !important;
}
</style>
