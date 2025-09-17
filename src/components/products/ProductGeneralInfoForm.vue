<template>
  <v-container>
    <div class="mb-2 d-flex space-between flex-wrap justify-center align-center w-100">
      <div>
        <v-switch v-model="modelValue.active" label="نشط" color="primary" hide-details="auto"></v-switch>
      </div>

      <div>
        <v-switch v-model="modelValue.featured" label="مميز" color="primary" hide-details="auto"></v-switch>
      </div>

      <div>
        <v-switch v-model="modelValue.returnable" label="قابل للإرجاع" color="primary" hide-details="auto"></v-switch>
      </div>
    </div>
    <v-row dense>
      <v-col cols="12" sm="12">
        <v-text-field v-model="modelValue.name" label="اسم المنتج" :rules="productRules.name" required hide-details="auto" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select v-model="modelValue.category_id" :items="categories" item-value="id" item-title="name" label="القسم" required hide-details="auto" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="modelValue.brand_id"
          :items="brands"
          item-value="id"
          item-title="name"
          label="العلامة التجارية"
          required
          hide-details="auto"
        />
      </v-col>
      <v-col cols="12" sm="12">
        <v-text-field v-model="modelValue.desc" label="الوصف" :rules="productRules.description" hide-details="auto" />
      </v-col>
      <v-col cols="12" sm="12">
        <v-text-field v-model="modelValue.desc_long" label="الوصف المفصل" :rules="productRules.description_long" hide-details="auto" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Object,
  categories: Array,
  brands: Array,
  productRules: Object,
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Add any specific styles here */
</style>
