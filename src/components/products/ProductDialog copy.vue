<script setup>
import { ref, watch, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { getAll, saveItem } from '@/services/api';

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const defaultProduct = {
  name: '',
  slug: '',
  is_active: true,
  featured: false,
  is_returnable: true,
  description: '',
  description_long: '',
  category_id: null,
  brand_id: null,
  warehouse_id: null,
  variants: [
    {
      attributes: [
        {
          attribute_id: null,
          attribute_value_id: null,
        },
      ],
      dimensions: '',
      discount: null,
      expiry_date: '',
      image_url: '',
      status: 'active',
      tax_rate: null,
    },
  ],
};

const props = defineProps({
  dialog: Boolean,
  product: Object,
  isEditMode: Boolean,
});
const emit = defineEmits(['update:dialog', 'saved', 'close']);
const { xs } = useDisplay();
const dialog = ref(props.dialog);
const productForm = ref(null);
const productFormValid = ref(false);
const localProduct = ref({ ...defaultProduct });
const brands = ref([]);
const warehouses = ref([]);
const categories = ref([]);
const attributes = ref([]); // هنا هنخزن الخصائص

const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
};

watch(
  () => props.dialog,
  val => {
    dialog.value = val;
    if (val) {
      // عند فتح الدايالوج، إذا كنا في وضع إضافة منتج جديد
      if (!props.isEditMode) {
        localProduct.value = JSON.parse(JSON.stringify(defaultProduct));
      }
    }
  }
);

watch(dialog, val => emit('update:dialog', val));

watch(
  () => props.product,
  val => {
    if (val && Object.keys(val).length) {
      // دمج عميق بين الافتراضي والقادم
      localProduct.value = deepMerge(JSON.parse(JSON.stringify(defaultProduct)), JSON.parse(JSON.stringify(val)));
    } else if (props.dialog && !props.isEditMode) {
      // منتج جديد: استخدم القيم الافتراضية عند فتح الدايالوج
      localProduct.value = JSON.parse(JSON.stringify(defaultProduct));
    }
  }
);

onMounted(() => {
  getBrands();
  getAttributes();
  getWarehouses();
  getCategories();
});

function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}
function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data; // صححت هنا
  });
}
function getWarehouses() {
  getAll('warehouses').then(res => {
    warehouses.value = res.data;
  });
}
function getCategories() {
  getAll('categories').then(res => {
    categories.value = res.data;
  });
}

function getAttributeValues(attributeId) {
  if (!attributeId) return [];
  const attr = attributes.value.find(a => a.id === attributeId);
  return attr ? attr.values : [];
}

function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  // إزالة # إذا موجودة
  const c = hexcolor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // حساب اللمعان
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  return luma > 186 ? '#000' : '#fff'; // إذا فاتح اعمل النص اسود، غير كده ابيض
}

function addAttribute(variantIndex) {
  localProduct.value.variants[variantIndex].attributes.push({
    attribute_id: null,
    attribute_value_id: null,
  });
}

function removeAttribute(variantIndex, attrIndex) {
  localProduct.value.variants[variantIndex].attributes.splice(attrIndex, 1);
}

function closeDialog() {
  emit('close');
  dialog.value = false;
}

function addVariant() {
  localProduct.value.variants.push({
    attributes: [{ attribute_id: null, attribute_value_id: null }],
    dimensions: '',
    discount: null,
    expiry_date: '',
    image_url: '',
    status: 'active',
    tax_rate: null,
  });
}
function removeVariant(index) {
  localProduct.value.variants.splice(index, 1);
}

function saveProduct() {
  if (!productForm.value) return;
  productForm.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    try {
      const res = await saveItem('product', localProduct.value, localProduct.value.id || false);
      emit('saved', res.data);
      closeDialog();
    } catch (e) {
      // يمكن إضافة إشعار خطأ هنا
    }
  });
}
</script>

<template>
  <v-dialog :fullscreen="xs" v-model="dialog">
    <v-card>
      <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line" @click="closeDialog"></v-btn>
      <v-card-title class="ma-5 text-center">
        <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
      </v-card-title>
      <v-card-text :class="xs ? 'px-2' : 'px-5'">
        <v-form ref="productForm" v-model="productFormValid">
          <v-row class="my-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="localProduct.name" label="اسم المنتج" :rules="productRules.name" required hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-switch v-model="localProduct.is_active" label="نشط" :color="localProduct.is_active ? 'primary' : 'grey'" hide-details="auto" />
                </v-col>
                <v-col>
                  <v-switch v-model="localProduct.featured" label="مميز" :color="localProduct.featured ? 'primary' : 'grey'" hide-details="auto" />
                </v-col>
                <v-col>
                  <v-switch
                    v-model="localProduct.is_returnable"
                    label="قابل للإرجاع"
                    :color="localProduct.is_returnable ? 'primary' : 'grey'"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-combobox
                    v-model="localProduct.category_id"
                    item-value="id"
                    item-title="name"
                    :items="categories || []"
                    label="الفئة"
                    :rules="[v => !!v || 'الفئة مطلوبة']"
                    required
                    hide-details="auto"
                  />
                </v-col>
                <v-col class="px-0">
                  <v-combobox
                    v-model="localProduct.brand_id"
                    item-value="id"
                    item-title="name"
                    :items="brands || []"
                    label="العلامة التجارية"
                    hide-details="auto"
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-if="warehouses.length"
                    v-model="localProduct.warehouse_id"
                    item-value="id"
                    item-title="name"
                    :items="warehouses || []"
                    label="المخزن"
                    required
                    hide-details="auto"
                  />
                  <v-select
                    v-else
                    :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
                    label="المخزن"
                    item-title="name"
                    :value="null"
                    required
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-textarea
                rows="1"
                auto-grow
                v-model="localProduct.description"
                label="الوصف القصير"
                :rules="productRules.description"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                rows="2"
                auto-grow
                v-model="localProduct.description_long"
                label="الوصف المفصل"
                :rules="productRules.description_long"
                hide-details="auto"
              />
            </v-col>
          </v-row>
          <!-- خيارات المنتج الإضافية -->
          <v-card>
            <v-card-title> خيارات المنتج </v-card-title>
            <v-row v-for="(variant, vIndex) in localProduct.variants" :key="vIndex">
              <!-- بيانات variant الأساسية -->
              <v-col cols="12">
                <v-row>
                  <v-col cols="4">
                    <v-text-field v-model="variant.purchase_price" label="سعر الشراء" type="number" hide-details="auto" />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="variant.retail_price" label="سعر التجزئة" type="number" hide-details="auto" />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="variant.wholesale_price" label="سعر الجملة" type="number" hide-details="auto" />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-row>
                  <v-col cols="6">
                    <v-text-field v-model="variant.tax_rate" label="نسبة الضريبة" type="number" hide-details="auto" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="variant.discount" label="الخصم" type="number" hide-details="auto" />
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="py-0" cols="12">
                <v-row>
                  <v-col cols="6">
                    <v-text-field v-model="variant.expiry_date" label="تاريخ الانتهاء" type="date" hide-details="auto" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="variant.image_url" label="رابط الصورة" hide-details="auto" />
                  </v-col>
                </v-row>
              </v-col>

              <!-- قسم الـ attributes لكل variant -->
              <v-col cols="12" class="mt-4">
                <v-card-subtitle>الخصائص (Attributes)</v-card-subtitle>
                <v-row dense v-for="(attr, aIndex) in variant.attributes" :key="aIndex" class="d-flex align-center">
                  <v-col cols="5">
                    <v-select
                      v-model="attr.attribute_id"
                      :items="attributes"
                      item-title="name"
                      item-value="id"
                      label="اختر الخاصية"
                      dense
                      outlined
                      hide-details="auto"
                      @change="() => (attr.attribute_value_id = null)"
                    />
                  </v-col>
                  <v-col cols="5">
                    <v-select
                      v-model="attr.attribute_value_id"
                      :items="getAttributeValues(attr.attribute_id)"
                      item-title="name"
                      item-value="id"
                      label="اختر القيمة"
                      dense
                      outlined
                      :disabled="!attr.attribute_id"
                      :return-object="false"
                      hide-details="auto"
                      :style="
                        (() => {
                          const selected = getAttributeValues(attr.attribute_id).find(v => v.id === attr.attribute_value_id);
                          return selected && selected.color
                            ? `background:${selected.color};color:${getContrastColor(selected.color)};border-radius:6px;`
                            : '';
                        })()
                      "
                    >
                      <template #item="{ item, props: itemProps }">
                        <v-list-item
                          v-bind="itemProps"
                          :style="item.raw.color ? `background:${item.raw.color};color:${getContrastColor(item.raw.color)};border-radius:6px;` : ''"
                        >
                        </v-list-item>
                      </template>
                      <template #selection="{ item }">
                        <span
                          :style="
                            item.raw.color
                              ? `background:${item.raw.color};color:${getContrastColor(
                                  item.raw.color
                                )};padding:2px 8px;border-radius:6px;display:inline-block`
                              : ''
                          "
                        >
                          {{ item.raw.name }}
                        </span>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col cols="2">
                    <v-btn class="my-a" icon="ri-delete-bin-line" color="error" @click="removeAttribute(vIndex, aIndex)"> </v-btn>
                  </v-col>
                </v-row>
                <v-btn class="my-2" text color="primary" small @click="addAttribute(vIndex)">+ إضافة خاصية جديدة</v-btn>
              </v-col>

              <v-col cols="12">
                <v-btn variant="text" color="error" @click="removeVariant(vIndex)">حذف</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn variant="text" color="primary" @click="addVariant">+ اضافة خيار جديد </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="6">
              <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
            </v-col>
            <v-col cols="6" class="text-center">
              <v-btn prepend-icon="ri-save-line" color="success" :class="{ 'forbidden-cursor': !productFormValid }" @click="saveProduct">
                {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.forbidden-cursor {
  cursor: not-allowed !important;
}
</style>
