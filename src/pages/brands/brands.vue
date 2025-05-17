<template>
  <v-container>
    <!-- Button to open the dialog -->
    <v-btn color="primary" @click="dialog = true">اضافة علامة تجارية جديدة</v-btn>

    <!-- Brands List -->
    <v-card class="mt-4 pa-3">
      <v-card-title> العلامات التجارية</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip class="pa-1" v-for="brand in brands" :key="brand.id" closable @click:close="confirmDelete(brand.id)">
          {{ brand.name }}
        </v-chip>
        <v-chip v-if="brands.length === 0">لا توجد علامات تجارية حتى الآن</v-chip>
      </div>
    </v-card>
    <!-- Add Brand Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>اضافة علامة تجارية جديدة</v-card-title>
        <v-card-text>
          <v-text-field v-model="brand.name" label="اسم العلامة التجارية"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveBrand">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد من حذف هذه العلامة التجارية؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">الغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteBrand(confirmDeleteId)">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
import { toast } from 'vue3-toastify';

const dialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const brand = ref({ name: '' });
const brands = ref([]);

function saveBrand() {
  if (!brand.value.name) {
    toast.error('اسم العلامة التجارية مطلوب');
    return;
  }
  saveItem('brand', brand.value, false, true, true)
    .then(() => {
      getBrands();
      dialog.value = false;
      toast.success('تم حفظ العلامة التجارية بنجاح');
      brand.value = { name: '' };
    })
    .catch(() => toast.error('حدث خطأ أثناء حفظ العلامة التجارية'));
}

function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

function deleteBrand(id) {
  deleteOne('brand', id)
    .then(() => {
      getBrands();
      deleteDialog.value = false;
      toast.success('تم حذف العلامة التجارية بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف العلامة التجارية'));
}

function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}

onMounted(() => {
  getBrands();
});
</script>
