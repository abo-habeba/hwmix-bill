<script setup>
import { ref } from 'vue';

const items = ref(['Vue.js', 'React', 'Angular']);
const selectedValue = ref('');

// دالة تُنفذ عند النقر على الأيقونة
const handleAppendClick = event => {
  console.log('Append icon clicked', event);
  alert('تم النقر على الأيقونة!');
};
</script>

<template>
  <v-combobox v-model="selectedValue" :items="items" label="اختر إطار عمل" append-icon="ri-delete-bin-line" @click:append="handleAppendClick" />
</template>
