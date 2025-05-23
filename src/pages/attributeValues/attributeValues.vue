<template>
  <v-container>
    <!-- قائمة القيم -->
    <v-card class="mt-4 pa-3">
      <v-card-title>قائمة القيم</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip v-for="val in attributeValues" :key="val.id" class="d-flex align-center pa-1" :style="{ backgroundColor: val.color || '#e0e0e0' }">
          <span>{{ val.name }} ( {{ getAttributeName(val.attribute_id) }} )</span>
          <v-btn icon size="x-small" color="primary" class="ms-1" style="margin-inline-start: 4px" @click.stop="openEditDialog(val)" title="تعديل">
            <v-icon size="18">ri-edit-line</v-icon>
          </v-btn>
          <v-btn icon size="x-small" color="error" class="ms-1" style="margin-inline-start: 2px" @click.stop="confirmDelete(val.id)" title="حذف">
            <v-icon size="18">ri-delete-bin-line</v-icon>
          </v-btn>
        </v-chip>
        <v-chip v-if="attributeValues.length === 0">لا توجد قيم حتى الآن</v-chip>
      </div>
    </v-card>

    <!-- استدعاء مكون إضافة قيمة جديدة -->
    <add-attribute-values :attributes="attributes" @value-added="onValueAdded" />

    <!-- Dialog الإضافة/التعديل -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'تعديل قيمة' : 'اضافة قيمة جديدة' }}</v-card-title>
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
            :rules="[v => !!v || 'يجب اختيار الخاصية']"
            :error-messages="attributeError"
          ></v-select>

          <v-text-field
            class="pa-3"
            v-model="attributeValue.name"
            label="اسم القيمة"
            :rules="[v => !!v || 'اسم القيمة مطلوب']"
            :error-messages="nameError"
          ></v-text-field>

          <!-- Color Picker Button -->
          <v-btn class="ma-3" :style="{ backgroundColor: attributeValue.color || '' }" @click="colorPickerDialog = true"> اختر اللون </v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveValue">{{ isEditMode ? 'تعديل' : 'حفظ' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Color Picker Dialog -->
    <v-dialog v-model="colorPickerDialog" max-width="350px">
      <v-card>
        <v-card-title :style="{ backgroundColor: attributeValue.color || '', position: 'fixed', zIndex: '100', width: '100%' }">
          اختر اللون
        </v-card-title>
        <v-card-text class="mt-10">
          <v-color-picker v-model="attributeValue.color" class="ma-2" swatches-max-height="400px" show-swatches hide-inputs> </v-color-picker>
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
import { ref, onMounted, computed } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
import { toast } from 'vue3-toastify';
import AddAttributeValues from '@/components/attributes/addAttributeValues.vue';

const dialog = ref(false);
const colorPickerDialog = ref(false);
const deleteDialog = ref(false);
const attributeValues = ref([]);
const attributes = ref([]);
const attributeValue = ref({ name: '', color: '', attribute_id: null, id: null });
const attribute = ref(null);
const valueToDelete = ref(null);
const isEditMode = ref(false);
const nameError = ref('');
const attributeError = ref('');

function openAddDialog() {
  isEditMode.value = false;
  dialog.value = true;
  attributeValue.value = { name: '', color: '', attribute_id: null, id: null };
  attribute.value = null;
  nameError.value = '';
  attributeError.value = '';
}

function openEditDialog(val) {
  isEditMode.value = true;
  dialog.value = true;
  attributeValue.value = { ...val };
  attribute.value = val.attribute_id;
  nameError.value = '';
  attributeError.value = '';
}

function closeDialog() {
  dialog.value = false;
  attributeValue.value = { name: '', color: '', attribute_id: null, id: null };
  attribute.value = null;
  nameError.value = '';
  attributeError.value = '';
}

async function saveValue() {
  nameError.value = '';
  attributeError.value = '';
  // فاليديشن
  if (!attributeValue.value.name) {
    nameError.value = 'اسم القيمة مطلوب';
    return;
  }
  if (!attribute.value) {
    attributeError.value = 'يجب اختيار الخاصية';
    return;
  }
  attributeValue.value.attribute_id = attribute.value;
  try {
    let response;
    if (isEditMode.value && attributeValue.value.id) {
      response = await saveItem('attribute-value', attributeValue.value, false, true, true);
      // تحديث العنصر في القائمة
      const idx = attributeValues.value.findIndex(v => v.id === attributeValue.value.id);
      if (idx !== -1) attributeValues.value[idx] = response.data;
      toast.success('تم تعديل القيمة بنجاح');
    } else {
      response = await saveItem('attribute-value', attributeValue.value, false, true, true);
      attributeValues.value.push(response.data);
      toast.success('تم حفظ القيمة بنجاح');
    }
    closeDialog();
  } catch (e) {
    toast.error(e?.message || 'حدث خطأ أثناء حفظ القيمة');
  }
}

function confirmDelete(id) {
  valueToDelete.value = id;
  deleteDialog.value = true;
}

function deleteConfirmed() {
  deleteOne('attribute-value', valueToDelete.value)
    .then(() => {
      attributeValues.value = attributeValues.value.filter(v => v.id !== valueToDelete.value);
      deleteDialog.value = false;
      toast.success('تم حذف القيمة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف القيمة'));
}

function getValues() {
  getAll('attribute-values').then(res => {
    attributeValues.value = res.data;
  });
  console.log(attributeValues.value);
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

function onValueAdded(newValue) {
  attributeValues.value.push(newValue);
}

onMounted(() => {
  getAttributes();
  getValues();
});
</script>

<style scoped>
.pa-3 {
  padding: 1rem;
}
</style>
