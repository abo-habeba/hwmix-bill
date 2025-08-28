<template>
  <v-autocomplete
    ref="productAutocomplete"
    v-model="selectedProduct"
    :items="products"
    :item-title="productTitle"
    item-value="id"
    return-object
    :label="label"
    :filter="() => true"
    no-filter
    prepend-inner-icon="ri-search-line"
    clearable
    :loading="isLoading"
    :no-data-text="noProductText"
    @update:search="onProductSearch"
    @update:model-value="onProductSelect"
    hide-details
  >
    <template v-slot:item="{ props, item }">
      <v-list-item class="px-2 py-0" v-bind="props" :prepend-avatar="item.raw?.imag" :title="item.raw.product_name">
        <template #subtitle>
          <AttributesDisplay v-if="item.raw.attributes.length" :attributes="item.raw.attributes" />
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed, nextTick } from 'vue';
import { getAll } from '@/services/api';
import AttributesDisplay from '@/components/products/AttributesDisplay.vue';

const props = defineProps({
  modelValue: [Number, String, Object, null],
  label: { type: String, default: 'ابحث عن منتج' },
});
const emit = defineEmits(['update:modelValue']);

const products = ref([]);
const isLoading = ref(false);
const searchText = ref('');
const productAutocomplete = ref(null);
const useCustomFilter = ref(false); // غير مستخدم حالياً، يمكن إزالته إذا لم يكن له استخدام آخر
const selectedProduct = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const page = ref(1);
const hasMore = ref(true);

const noProductText = computed(() => {
  if (searchText.value.length < 3) {
    return 'أدخل 3 أحرف على الأقل';
  }
  return isLoading.value ? 'جاري البحث...' : 'لا يوجد منتج';
});

function productTitle(item) {
  if (!item) return '';
  const _product_name = item.full_product_name || item.product_name || 'بدون اسم';
  // const _description = item.description ? `${item.description}` : ''; // ${_description}
  let _attributes = 'بدون خصائص';
  if (Array.isArray(item.attributes) && item.attributes.length) {
    // الحصول علي الخصائص والقيم الخاصه بها
    _attributes = item.attributes
      .map(attr => {
        // const attrproduct_name = attr.attribute?.product_name || '';
        const attrValue = attr.attribute_value?.product_name || ''; // attrproduct_name &&  // ${attrproduct_name}:
        return attrValue ? ` ${attrValue}` : ''; // | ${_attributes}
      })
      .filter(Boolean)
      .join(' | ');
  }
  // عرض التنسيق المناسب
  return `${_product_name}`.replace(/\s+/g, ' ').trim();
}

let searchTimeout = null;
function onProductSearch(val) {
  // لا تشغل البحث إذا كانت القيمة الجديدة هي المنتج المحدد بالفعل
  // هذا يمنع إعادة البحث بعد التحديد
  if (selectedProduct.value && val === productTitle(selectedProduct.value)) {
    return;
  }

  searchText.value = val;

  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProducts(true);
  }, 400);
}

async function loadProducts(reset = false) {
  if (searchText.value.length < 3) return;

  if (reset) {
    page.value = 1;
    products.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  isLoading.value = true;
  try {
    const params = { search: searchText.value, per_page: 20, page: page.value };
    const res = await getAll('product-variants/search-by-product', params, false, false, false);

    products.value = res.data;
  } catch (e) {
    console.error('فشل تحميل المنتجات:', e);
  } finally {
    isLoading.value = false;
  }
}

// هذه الدالة تُطلق عند اختيار قيمة من الـ Autocomplete (سواء يدوياً أو بواسطة النموذج)
function onProductSelect(val) {
  // نتحقق مما إذا كانت القيمة المختارة هي نفس القيمة الحالية لنص البحث
  // إذا كانت كذلك، فهذا يعني أن المستخدم قام بتحديد عنصر من القائمة،
  // ولا نرغب في تشغيل بحث جديد في هذه الحالة.
  // نقوم بتحديث searchText ليتطابق مع اسم المنتج المحدد لمنع البحث اللاحق إذا كان النص يتطابق
  if (val && typeof val === 'object' && val.id) {
    searchText.value = productTitle(val); // تحديث نص البحث ليتطابق مع المنتج المحدد
  }

  console.log('Selected product:', val);
  if (!val || typeof val !== 'object' || !val.id || !val.product_name) {
    console.error('Invalid product selected in ProductSearchInput:', val);
    return;
  }
  nextTick(() => {
    const input = productAutocomplete.value?.$el?.querySelector('input');
    if (input && typeof input.select === 'function') {
      input.select();
    }
  });
  // emit('update:modelValue', val);
}

// هذه الدالة ليست لها تأثير مباشر على المشكلة الحالية
const showInput = ref(false);
function handleBlur() {
  setTimeout(() => {
    showInput.value = false;
  }, 200);
}
</script>
