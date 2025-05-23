<template>
  <v-container>
    <v-btn @click="openDialog">فتح الديالوج</v-btn>
    <ChildDialog :dialog="dialog" @update:dialog="updateDialog" />
  </v-container>
</template>

<script setup>
import ChildDialog from '@/components/attributes/ChildDialog.vue';
import { ref } from 'vue';
const dialog = ref(false);

const openDialog = () => {
  dialog.value = true;
};

const updateDialog = data => {
  dialog.value = data.dialog;
};
</script>
