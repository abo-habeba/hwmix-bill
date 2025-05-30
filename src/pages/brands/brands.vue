<template>
  <v-container>
    <!-- Button to open the dialog -->
    <v-btn prepend-icon="ri-add-line" color="primary" @click="openBrandDialog">اضافة علامة تجارية جديدة</v-btn>

    <!-- Brands List -->
    <v-card class="mt-4 pa-3">
      <v-card-title> العلامات التجارية</v-card-title>
      <v-divider class="ma-1"></v-divider>
      <v-row class="flex-wrap ma-2" style="gap: 16px">
        <v-col
          v-for="brand in brands"
          :key="brand.id"
          cols="12"
          sm="auto"
          class="d-flex align-center elevation-2 pa-1 rounded"
          style="background: white; min-width: 280px"
        >
          <v-avatar variant="text" icon="ri-price-tag-3-line" color="primary" size="32" class="me-3" />
          <div class="text-lg fw-medium">
            {{ brand.name }}
          </div>
          <v-spacer />
          <v-btn icon="ri-edit-line" variant="text" color="success" @click.stop="editBrand(brand)" title="تعديل العلامة التجارية" class="mx-1" />
          <v-btn
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            @click.stop="confirmDelete(brand.id)"
            title="حذف العلامة التجارية"
            class="mx-1"
          />
        </v-col>

        <v-col v-if="brands.length === 0" cols="12">
          <v-alert type="info" border="start" class="text-center"> لا توجد علامات تجارية حتى الآن </v-alert>
        </v-col>
      </v-row>
    </v-card>
    <!-- Add/Edit Brand Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ brand?.id ? 'تعديل العلامة التجارية' : 'اضافة علامة تجارية جديدة' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="brand.name" label="اسم العلامة التجارية"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeBrandDialog">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveBrand">{{ brand.id ? 'تعديل' : 'حفظ' }}</v-btn>
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

function openBrandDialog() {
  brand.value = { name: '' };
  dialog.value = true;
}

function closeBrandDialog() {
  dialog.value = false;
  brand.value = { name: '' };
}

function saveBrand() {
  if (!brand.value.name) {
    toast.error('اسم العلامة التجارية مطلوب');
    return;
  }
  const isEdit = !!brand.value.id;
  saveItem('brand', brand.value, isEdit ? brand.value.id : false, true, true)
    .then(() => {
      getBrands();
      dialog.value = false;
      toast.success(isEdit ? 'تم تعديل العلامة التجارية بنجاح' : 'تم حفظ العلامة التجارية بنجاح');
      brand.value = { name: '' };
    })
    .catch(e => {
      const msg = e || (isEdit ? 'حدث خطأ أثناء تعديل العلامة التجارية' : 'حدث خطأ أثناء حفظ العلامة التجارية');
      toast.error(msg);
    });
}

function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

function deleteBrand(id) {
  deleteOne('brand/delete', id, true, true)
    .then(() => {
      getBrands();
      deleteDialog.value = false;
      toast.success('تم حذف العلامة التجارية بنجاح');
    })
    .catch(msg => {
      toast.error(msg);
    });
}

function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}

// إضافة دالة editBrand
function editBrand(b) {
  brand.value = { ...b };
  console.log(b);
  dialog.value = true;
  return;

  if (!brand.value.name) brand.value.name = '';
}

onMounted(() => {
  getBrands();
});
</script>
