<template>
  <v-container>
    <!-- زر لإضافة فئة رئيسية جديدة -->
    <v-btn color="primary" class="mb-4" @click="openAddDialog(null)">اضافة فئة رئيسية جديدة</v-btn>

    <v-card class="mt-4 pa-3" outlined style="overflow-x: auto">
      <v-card-title>الفئات الهرمية</v-card-title>
      <v-divider></v-divider>
      <div style="width: max-content">
        <!-- v-treeview لعرض الشجرة -->
        <v-treeview v-if="treeCategories.length" :items="treeCategories" item-title="name" item-value="id" open-on-click
          :item-props="getItemProps" class="treeview-border ma-auto" max-width="unset">
          <template #append="{ item }">
            <v-btn icon="ri-add-line" variant="text" color="primary" @click.stop="openAddDialog(item)"
              title="إضافة فرعية" class="mx-1" />
            <v-btn icon="ri-edit-line" variant="text" color="primary" @click.stop="openEditDialog(item)"
              title="تعديل الفئة" class="mx-1" />
            <v-btn icon="ri-delete-bin-line" variant="text" color="error" @click.stop="deleteCategory(item.id)"
              title="حذف الفئة" class="mx-1" />
          </template>
        </v-treeview>
      </div>
    </v-card>

    <!-- حوار إضافة فئة جديدة -->
    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'تعديل فئة' : 'اضافة فئة جديدة' }}</v-card-title>
        <v-card-text>
          <v-text-field class="pa-2" v-model="newCategory.name" label="اسم الفئة" required></v-text-field>
          <v-textarea class="pa-2" v-model="newCategory.description" label="الوصف"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeAddDialog">الغاء</v-btn>
          <v-btn text color="blue darken-1" @click="saveCategory">{{ isEditMode ? 'تعديل' : 'حفظ' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { VTreeview } from 'vuetify/labs/VTreeview';
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';
import { toast } from 'vue3-toastify';

// قائمة الفئات المسترجعة من الـ API
const categories = ref([]);
// الشجرة الهرمية الناتجة
const treeCategories = ref([]);
// متغير لحالة حوار الإضافة
const addDialog = ref(false);
// بيانات الفئة الجديدة
const newCategory = ref({
  name: '',
  description: '',
  parent_id: null,
});
// متغير لوضعية التعديل
const isEditMode = ref(false);

function openAddDialog(parentCategory) {
  isEditMode.value = false;
  if (parentCategory) {
    newCategory.value.parent_id = parentCategory.id;
  } else {
    newCategory.value.parent_id = null;
  }
  newCategory.value.name = '';
  newCategory.value.description = '';
  addDialog.value = true;
}

function openEditDialog(category) {
  isEditMode.value = true;
  newCategory.value = { ...category };
  addDialog.value = true;
}

function closeAddDialog() {
  addDialog.value = false;
  isEditMode.value = false;
  newCategory.value = { name: '', description: '', parent_id: null };
}

function buildTree(categoriesList) {
  const map = {};
  categoriesList.forEach(category => {
    category.children = category.children || [];
    map[category.id] = category;
  });
  const tree = [];
  categoriesList.forEach(category => {
    if (category.parent_id) {
      if (map[category.parent_id]) {
        map[category.parent_id].children.push(category);
      }
    } else {
      tree.push(category);
    }
  });
  return tree;
}
function getCategories() {
  getAll('categories').then(res => {
    categories.value = res;
    console.log(categories.value);

    treeCategories.value = buildTree(categories.value);
    console.log(treeCategories.value);
  });
}

const getItemProps = item => ({
  expandIcon: item.children && item.children.length ? 'ri-folder-line' : 'ri-checkbox-blank-circle-line',
  collapseIcon: item.children && item.children.length ? 'ri-folder-open-line' : 'ri-checkbox-blank-circle-line',
});
onMounted(() => {
  getCategories();
});

// حفظ الفئة الجديدة أو تعديلها
function saveCategory() {
  if (!newCategory.value.name) {
    toast.error('اسم الفئة مطلوب');
    return;
  }
  const isEdit = isEditMode.value && newCategory.value.id;
  saveItem('category', newCategory.value, isEdit ? newCategory.value.id : false, true, true)
    .then(() => {
      getCategories();
      closeAddDialog();
      // toast.success(isEdit ? 'تم تعديل الفئة بنجاح' : 'تم حفظ الفئة بنجاح');
    })
    .catch(() => toast.error(isEdit ? 'حدث خطأ أثناء تعديل الفئة' : 'حدث خطأ أثناء حفظ الفئة'));
}

function deleteCategory(id) {
  if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
    deleteOne('category', id)
      .then(() => {
        getCategories();
        toast.success('تم حذف الفئة بنجاح');
      })
      .catch(() => toast.error('حدث خطأ أثناء حذف الفئة'));
  }
}
</script>
