<template>
  <v-container>
    <!-- زر لإضافة فئة رئيسية جديدة -->
    <v-btn color="primary" class="mb-4" @click="openAddDialog(null)">اضافة فئة رئيسية جديدة</v-btn>

    <v-card class="mt-4 pa-3" outlined>
      <v-card-title>الفئات الهرمية</v-card-title>
      <v-divider></v-divider>
      <!-- v-treeview لعرض الشجرة -->
      <v-treeview
        v-if="treeCategories.length"
        :items="treeCategories"
        item-title="name"
        item-value="id"
        open-on-click
        :item-props="getItemProps"
        class="treeview-border ma-auto"
        max-width="500px"
      >
        <!-- إضافة أزرار لكل فئة -->
        <template #append="{ item }">
          <v-icon small class="ma-3" @click.stop="openAddDialog(item)">{{ 'ri-add-line' }}</v-icon>
          <v-icon class="ma-3" small color="red" @click.stop="deleteCategory(item.id)">{{ 'ri-delete-bin-6-line' }}</v-icon>
        </template>
      </v-treeview>
    </v-card>

    <!-- حوار إضافة فئة جديدة -->
    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title>اضافة فئة جديدة</v-card-title>
        <v-card-text>
          <v-text-field class="pa-2" v-model="newCategory.name" label="اسم الفئة" required></v-text-field>
          <v-textarea class="pa-2" v-model="newCategory.description" label="الوصف"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeAddDialog">الغاء</v-btn>
          <v-btn text color="blue darken-1" @click="saveCategory">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { VTreeview } from 'vuetify/labs/VTreeview';
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';

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

// دالة لبناء الشجرة الهرمية من القائمة المسطحة
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
    categories.value = res.data;
    console.log(categories.value);

    treeCategories.value = buildTree(categories.value);
    console.log(treeCategories.value);
  });
}

const getItemProps = item => ({
  expandIcon: item.children && item.children.length ? 'ri-add-line' : 'ri-checkbox-blank-circle-line',
  collapseIcon: item.children && item.children.length ? 'ri-subtract-line' : 'ri-checkbox-blank-circle-line',
});
onMounted(() => {
  getCategories();
});

// فتح حوار إضافة فئة جديدة وتعيين الفئة الأب إن وجدت
function openAddDialog(parentCategory) {
  if (parentCategory) {
    newCategory.value.parent_id = parentCategory.id;
  } else {
    newCategory.value.parent_id = null;
  }
  addDialog.value = true;
}
// إغلاق حوار الإضافة وإعادة تعيين بيانات الفئة الجديدة
function closeAddDialog() {
  addDialog.value = false;
  newCategory.value = { name: '', description: '', parent_id: null };
}
// حفظ الفئة الجديدة
function saveCategory() {
  saveItem('category', newCategory.value, false, true, true).then(() => {
    getCategories();
    closeAddDialog();
  });
}
// حذف الفئة
function deleteCategory(id) {
  if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
    deleteOne('category', id).then(() => {
      getCategories();
    });
  }
}
</script>
