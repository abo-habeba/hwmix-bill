<template>
  <v-autocomplete
    :items="products"
    :loading="isLoading"
    :search="searchText"
    item-title="name"
    item-value="id"
    label="اسم المنتج"
    clearable
    hide-no-data
    no-filter
    hide-details
    :model-value="searchText"
    return-object
    @update:search="onSearch"
    @update:model-value="onAutocompleteSelect"
    @click:clear="onClear"
  >
    <template v-slot:item="{ item }">
      <v-list-item :title="item.raw.name" class="text-medium-emphasis cursor-default" :style="{ pointerEvents: 'none' }" />
    </template>

    <template #no-data>
      <v-list-item v-if="searchText" :title="searchText" />
    </template>
  </v-autocomplete>
</template>

<script setup>
import { getAll } from '@/services/api';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: [String, null],
});

const products = ref([]);
const isLoading = ref(false);
const searchText = ref(props.modelValue || '');
let searchTimeout = null;

// 🆕 المتغير الجديد: لتحديد ما إذا كنا في وضع كتابة اسم جديد بدون نتائج
const isLikelyNewName = ref(false);

// 1. مراقبة modelValue الخارجي لتحديث searchText الداخلي
watch(
  () => props.modelValue,
  val => {
    if (typeof val === 'string' && val !== searchText.value) {
      searchText.value = val;
    } else if (val === null) {
      searchText.value = '';
      // 💡 عند المسح، نعيد ضبط حالة البحث لتمكين البحث مجدداً
      isLikelyNewName.value = false;
    }
  },
  { immediate: true }
);

async function onSearch(val) {
  // التحديث الفوري: أرسل النص مباشرة إلى الأب
  emit('update:modelValue', val);
  searchText.value = val;

  if (searchTimeout) clearTimeout(searchTimeout);

  //  المنطق الجديد لتجنب البحث إذا كنا في وضع اسم جديد
  if (isLikelyNewName.value && val.length > 0 && products.value.length === 0) {
    // 💡 لا تفعل شيئاً سوى إرسال القيمة، وتجنب طلب السيرفر
    // نضع timeout صغير للحظات، فقط لإلغائه إذا استمر المستخدم في الكتابة بسرعة
    searchTimeout = setTimeout(() => {
      /* لا شيء */
    }, 400);
    return;
  }
  // ----------------------------------------------------

  // نأجل الطلب عشان المستخدم يخلص كتابة
  searchTimeout = setTimeout(async () => {
    if (!val || val.length < 2) {
      products.value = [];
      // 💡 عند إزالة النص، نعيد تفعيل البحث
      isLikelyNewName.value = false;
      return;
    }

    // 💡 إعادة تفعيل البحث قبل الطلب (لأن المستخدم كتب شيئاً جديداً)
    isLikelyNewName.value = false;
    isLoading.value = true;

    try {
      const res = await getAll(
        'product-variants/search-by-product',
        {
          search: val,
          per_page: 20,
        },
        false,
        false,
        false
      );

      const newProducts =
        res.data?.map(p => ({
          id: p.id,
          name: p.full_product_name || p.product_name || 'بدون اسم',
          ...p,
        })) || [];

      products.value = newProducts;

      // 🛑 المنطق الجديد لتحديد ما إذا كان اسمًا جديدًا 🛑
      if (newProducts.length === 0) {
        // لم نجد أي نتائج، نعتبر أن المستخدم يكتب اسمًا جديدًا
        isLikelyNewName.value = true;
      }
      // ---------------------------------------------------
    } catch (e) {
      console.error(e);
      products.value = [];
      isLikelyNewName.value = true; // عند الفشل، نعتبر أنه اسم جديد لتخفيف الضغط
    } finally {
      isLoading.value = false;
    }
  }, 400);
}

// دالة منع الاختيار (لا تغيير)
function onAutocompleteSelect(value) {
  console.log('Selection prevented:', value);
}

// دالة المسح (تعديل لإعادة ضبط isLikelyNewName)
function onClear() {
  emit('update:modelValue', '');
  searchText.value = '';
  products.value = [];
  isLikelyNewName.value = false; // 💡 إعادة الضبط
}
</script>
