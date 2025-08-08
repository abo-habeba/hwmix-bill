<template>
  <v-dialog v-model="localDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="headline">مرحباً</v-card-title>
      <v-card-actions>
        <v-btn text @click="closeDialog">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  dialog: Boolean,
});

const emit = defineEmits(['update:dialog']);

const localDialog = ref(props.dialog);
const datares = ref(null);

// Watch the prop and update local state
watch(
  () => props.dialog,
  newValue => {
    localDialog.value = newValue;
  }
);

const closeDialog = () => {
  localDialog.value = false;
  emit('update:dialog', { dialog: localDialog.value, data: datares.value });
};
</script>
