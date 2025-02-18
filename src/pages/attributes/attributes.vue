<template>
  <v-container>
    <!-- Button to open the dialog -->
    <v-btn color="primary" @click="dialog = true">اضافة خاصية جديدة</v-btn>

    <!-- Attributes List -->
    <v-card class="mt-4 pa-3">
      <v-card-title> الخصائص</v-card-title>
      <v-divider></v-divider>
      <div class="d-flex flex-wrap gap-2 pa-3">
        <v-chip class="pa-1" v-for="attr in attributes" :key="attr.id" closable @click:close="confirmDelete(attr.id)">
          {{ attr.name }}
        </v-chip>
        <v-chip v-if="attributes.length === 0">لا توجد خصائص حتى الآن</v-chip>
      </div>
    </v-card>

    <!-- Add Attribute Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>اضافة خاصية جديدة</v-card-title>
        <v-card-text>
          <v-text-field v-model="attribute.name" label="الاسم"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">الغاء</v-btn>
          <v-btn color="blue darken-1" text @click="saveAttribute">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>تأكيد الحذف</v-card-title>
        <v-card-text>هل أنت متأكد من حذف هذه الخاصية؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">الغاء</v-btn>
          <v-btn color="red darken-1" text @click="deleteAttribute(confirmDeleteId)">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAll, saveItem, deleteOne } from '@/services/api';

const dialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const attribute = ref({ name: '' });
const attributes = ref([]);

function saveAttribute() {
  saveItem('attribute', attribute.value, false, true, true).then(() => {
    getAttributes();
    dialog.value = false;
    attribute.value = { name: '' };
  });
}

function confirmDelete(id) {
  confirmDeleteId.value = id;
  deleteDialog.value = true;
}

function deleteAttribute(id) {
  deleteOne('attribute', id).then(() => {
    getAttributes();
    deleteDialog.value = false;
  });
}

function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}

onMounted(() => {
  getAttributes();
});
</script>
