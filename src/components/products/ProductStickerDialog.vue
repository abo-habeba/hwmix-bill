<script setup>
import ProductSticker from '@/pages/invoices/print/ProductSticker.vue';
const props = defineProps({
  dialog: Boolean,
  product: Object,
});
const emit = defineEmits(['update:dialog']);
function close() {
  emit('update:dialog', false);
}
</script>

<template>
  <v-dialog :model-value="props.dialog" @update:model-value="val => emit('update:dialog', val)" max-width="200" @click:outside="close" persistent>
    <ProductSticker v-if="props.product" :product="props.product" />
  </v-dialog>
</template>
