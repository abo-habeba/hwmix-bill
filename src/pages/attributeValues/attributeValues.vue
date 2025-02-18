<template>
  <v-container>
    <!-- Button to open the dialog -->
    <v-btn color="primary" @click="dialog = true">اضافة قيمة جديدة</v-btn>

    <!-- Values List -->
    <v-card class="mt-4 pa-3">
      <v-card-title>قائمة القيم</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip
          v-for="val in attributeValues"
          :key="val.id"
          closable
          @click:close="confirmDelete(val.id)"
          :style="{ backgroundColor: val.color || '#e0e0e0' }"
        >
          {{ val.name }} ( {{ getAttributeName(val.attribute_id) }} )
        </v-chip>
        <v-chip v-if="attributeValues.length === 0">لا توجد قيم حتى الآن</v-chip>
      </div>
    </v-card>

    <!-- Add Value Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>اضافة قيمة جديدة</v-card-title>
        <v-card-text>
          <v-select
            class="pa-3"
            v-if="attributes"
            v-model="attribute"
            :items="attributes"
            item-value="id"
            item-title="name"
            label="اختر الخاصية"
            no-data-text="اضف خصائص منتج لتظهر هنا"
          ></v-select>

          <v-text-field class="pa-3" v-model="attributeValue.name" label="اسم القيمة"></v-text-field>

          <!-- Color Picker Button -->
          <v-btn class="ma-3" :style="{ backgroundColor: attributeValue.value || '' }" @click="colorPickerDialog = true"> اختر اللون </v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveValue">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Color Picker Dialog -->
    <v-dialog v-model="colorPickerDialog" max-width="350px">
      <v-card>
        <!-- <ColorPicker @colorSelected="handleColorSelected" /> -->
        <v-card-title :style="{ backgroundColor: attributeValue.value || '', position: 'fixed', zIndex: '100', width: '100%' }"
          >اختر اللون</v-card-title
        >
        <v-card-text class="mt-10">
          <v-color-picker v-model="attributeValue.value" class="ma-2" swatches-max-height="400px" show-swatches hide-inputs> </v-color-picker>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="colorPickerDialog = false">تم</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد من أنك تريد حذف هذه القيمة؟ لا يمكن التراجع عن هذا الإجراء.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">الغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteConfirmed">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
// import ColorPicker from '@/components/ColorPicker.vue';
// const selectedColor = ref(null);
// function handleColorSelected(color) {
//   selectedColor.value = color;
// }
const dialog = ref(false);
const colorPickerDialog = ref(false); // Dialog for color picker
const deleteDialog = ref(false);
const attributeValues = ref([]);
const attributes = ref([]);
const attributeValue = ref({ name: '', color: '', attribute_id: null });
const attribute = ref(null);
const valueToDelete = ref(null);

function saveValue() {
  attributeValue.value.attribute_id = attribute.value;
  saveItem('attribute-value', attributeValue.value, false, true, true).then(() => {
    getValues();
    dialog.value = false;
    attributeValue.value = { name: '', color: '', attribute_id: null };
  });
}

function confirmDelete(id) {
  valueToDelete.value = id;
  deleteDialog.value = true;
}

function deleteConfirmed() {
  deleteOne(`attribute-value`, valueToDelete.value).then(() => {
    getValues();
    deleteDialog.value = false;
  });
}

function getValues() {
  getAll('attribute-values').then(res => {
    attributeValues.value = res.data;
  });
}

function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}

function getAttributeName(attributeId) {
  const attr = attributes.value.find(attr => attr.id === attributeId);
  return attr ? attr.name : '';
}

onMounted(() => {
  getAttributes();
  getValues();
});
</script>

<style scoped>
.pa-3 {
  padding: 1rem;
  /* position: static; */
}
</style>
