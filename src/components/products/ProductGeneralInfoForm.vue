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
        <ProductFreeTextInput v-model="modelValue.name" />
      </v-col>

      <v-col cols="12" sm="6">
        <SearchAndCreateSelect
          v-model="modelValue.category_id"
          :items="categories"
          entity="category"
          label="القسم"
          @item-created="handleNewItemAdded"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <SearchAndCreateSelect
          v-model="modelValue.brand_id"
          :items="brands"
          entity="brand"
          label="العلامة التجارية"
          @item-created="handleNewItemAdded"
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
import { defineProps, defineEmits, nextTick } from 'vue';
import ProductFreeTextInput from './ProductFreeTextInput.vue';
import SearchAndCreateSelect from './SearchAndCreateSelect.vue';

const props = defineProps({
  modelValue: Object,
  categories: Array,
  brands: Array,
  productRules: Object,
});

const emit = defineEmits(['update:modelValue', 'update:categories', 'update:brands']);

function handleNewItemAdded(newItem) {
  console.log('تم اطلاق الحدث الفرعي ', newItem);
  if (!newItem) return;

  if (newItem.entity === 'category') {
    // تحديث قائمة الأقسام في الأب
    emit('update:categories', [...props.categories, newItem]);

    // بعد أن تتحدث القائمة، نحدّد العنصر الجديد
    nextTick(() => {
      emit('update:modelValue', { ...props.modelValue, category_id: newItem.id });
    });
  } else if (newItem.entity === 'brand') {
    emit('update:brands', [...props.brands, newItem]);

    nextTick(() => {
      emit('update:modelValue', { ...props.modelValue, brand_id: newItem.id });
    });
  }
}
</script>

<style scoped>
/* أي أنماط إضافية يمكن إضافتها هنا */
</style>
