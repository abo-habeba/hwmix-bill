<template>
  <v-container>
    <v-btn color="primary" @click="dialog = true">اضافة خاصية جديدة</v-btn>

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

    <AddAttribute v-model="dialog" :attributes="attributes" @attribute-saved="saveAttribute" />

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
import AddAttribute from '@/components/attributes/AddAttribute.vue';
AddAttribute;

const dialog = ref(false);
const deleteDialog = ref(false);
const confirmDeleteId = ref(null);
const attributes = ref([]);

function saveAttribute(payload) {
  saveItem('attribute', payload, false, true, true).then(() => {
    getAttributes();
    dialog.value = false;
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

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
