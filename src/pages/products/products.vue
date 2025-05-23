<script setup>
import { deleteOne, getAll, saveItem } from '@/services/api';
import { ref, nextTick, watch, onMounted, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { toast } from 'vue3-toastify';

const { xs } = useDisplay();
// الحالة الرئيسية
const dialog = ref(false);
const products = ref([]);
const editIndex = ref(null);
const attributes = ref([]);
const warehouses = ref([]);
const brands = ref([]);
const categories = ref([]);
const searchCategory = ref('');
const searchBrand = ref('');
const attributeValues = ref('');
const productVariants = ref('');

const newProduct = ref({
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
});

// تحديد ما إذا كان المستخدم في وضع التعديل
const isEditMode = computed(() => editIndex.value !== null);

// استرجاع المنتجات والخصائص عند تحميل الصفحة

onMounted(() => {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products.value = JSON.parse(storedProducts);
  }
  getProducts();
  getAttributes();
  getWarehouse();
  getBrands();
  getCategories();
  getProductVariants();
});

function getProducts() {
  getAll('products').then(res => {
    attributes.value = res.data;
  });
}
function getAttributes() {
  getAll('attributes').then(res => {
    attributes.value = res.data;
  });
}
function getProductVariants() {
  getAll('product-variants').then(res => {
    productVariants.value = res.data;
    console.log(productVariants.value);
  });
}
function getWarehouse() {
  getAll('warehouses').then(async res => {
    warehouses.value = res.data;
    newProduct.value.warehouse_id = warehouses.value[0].id;
  });
}

function getBrands() {
  getAll('brands').then(res => {
    brands.value = res.data;
  });
}
function getCategories() {
  getAll('categories').then(res => {
    categories.value = res.data;
  });
}

// تحديث localStorage عند تغيير المنتجات
watch(
  products,
  newProducts => {
    localStorage.setItem('products', JSON.stringify(newProducts));
    console.log(newProducts);
  },
  { deep: true }
);

// قالب المتغير مع كافة الحقول المطلوبة
const variantTemplate = () => ({
  status: 'active',
  expiry_date: '', // مثال: "2024-12-31"
  image_url: '',
  dimensions: '',
  tax_rate: null,
  discount: null,
  attributes: [
    {
      attribute_id: null,
      attribute_value_id: null,
    },
  ], // سيتم تخزين الكائنات { attribute_id, attribute_value_id }
});

const addVariant = () => {
  // newProduct.value.variants.push(variantTemplate());
  const newVariant = JSON.parse(JSON.stringify(newProduct.value.variants[0]));
  newProduct.value.variants.push(newVariant);
};

const removeVariant = index => {
  newProduct.value.variants.splice(index, 1);
};

const resetForm = () => {
  Object.assign(newProduct.value, {
    name: '',
    slug: '',
    is_active: true,
    featured: false,
    is_returnable: true,
    published_at: '',
    description: '',
    description_long: '',
    company_id: 1,
    created_by: 1,
    category_id: null,
    brand_id: null,
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
  });
};

// فتح الديالوج للإضافة: تأكد من إعادة تعيين النموذج ووضع editIndex على null
const openAddDialog = () => {
  resetForm();
  editIndex.value = null;
  dialog.value = true;
};
const ProductEditDialog = ref(false);
const ProductVariantEdit = ref(null);
// فتح الديالوج للتعديل: نسخ بيانات المنتج إلى النموذج ووضع index المنتج في editIndex
const openEditDialog = Product => {
  ProductVariantEdit.value = Product;
  newProduct.value = ProductVariantEdit.value.product;
  newProduct.value.variants = ProductVariantEdit.value;
  newProduct.value.variants.attributes = ProductVariantEdit.value.attributes;

  // Object.assign(newProduct.value, JSON.parse(JSON.stringify(products.value[index])));
  // ProductEditDialog.value = true;
  dialog.value = true;
};

const prepareProduct = product => {
  // Create a deep copy to avoid mutating the original object
  const prepared = JSON.parse(JSON.stringify(product));
  // Loop through each variant if exists
  if (prepared.variants && Array.isArray(prepared.variants)) {
    prepared.variants = prepared.variants.map(variant => {
      // Remove the 'values' property from each attribute
      if (variant.attributes && Array.isArray(variant.attributes)) {
        variant.attributes = variant.attributes.map(attr => {
          const { values, ...rest } = attr;
          return rest;
        });
      }
      return variant;
    });
  }
  return prepared;
};

// قواعد الفاليديشن باستخدام vuetify
const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  slug: [v => v === null || v === undefined || (!!v && typeof v === 'string') || 'السلوج يجب أن يكون نصًا'],
  warehouse_id: [v => !!v || 'المخزن مطلوب'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
};
// حفظ المنتج سواء للإضافة أو التعديل
const saveProduct = () => {
  // لا داعي للتحقق اليدوي أو إشعارات التوست، نعتمد فقط على vuetify rules
  const productToSend = prepareProduct(newProduct.value);
  if (editIndex.value !== null) {
    // تعديل المنتج
    saveItem('product', productToSend, false, true, true)
      .then(() => {
        products.value[editIndex.value] = JSON.parse(JSON.stringify(newProduct.value));
        toast.success('تم تعديل المنتج بنجاح');
        resetForm();
        dialog.value = false;
        editIndex.value = null;
      })
      .catch(() => toast.error('حدث خطأ أثناء تعديل المنتج'));
  } else {
    // إضافة منتج جديد
    saveItem('product', productToSend, false, true, true)
      .then(() => {
        products.value.push(JSON.parse(JSON.stringify(newProduct.value)));
        toast.success('تم إضافة المنتج بنجاح');
        resetForm();
        dialog.value = false;
        editIndex.value = null;
      })
      .catch(() => toast.error('حدث خطأ أثناء إضافة المنتج'));
  }
};

const removeProduct = id => {
  deleteOne('product-variant', id)
    .then(() => {
      toast.success('تم حذف المنتج بنجاح');
      // products.value.splice(index, 1);
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف المنتج'));
};

// دالة تحويل الاسم إلى سلوج
function generateSlug(name) {
  return name
    .normalize('NFKD') // تحويل الحروف المميزة إلى أشكالها الأساسية
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '') // إزالة التشكيل من الحروف
    .replace(/[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, '-') // استبدال الرموز والمسافات بشرطات
    .replace(/^-+|-+$/g, '');
}

// مراقبة التغيير في الاسم وتحديث السلوج تلقائيًا
watch(
  () => newProduct.value.name,
  newName => {
    newProduct.value.slug = generateSlug(newName);
  },
  { immediate: true }
);

const submitProducts = () => {};
function fetchBrands(query) {
  if (!query) return;
  getAll('brands', { search: query }).then(res => {
    brands.value = res.data;
  });
}
function fetchCategories(query) {
  if (!query) return;
  getAll('categories', { search: query }).then(res => {
    categories.value = res.data;
    console.log(categories.value);
  });
}
const formattedCategories = computed(() => {
  const flatCategories = [];
  const formatCategory = (category, depth = 0) => {
    flatCategories.push({
      id: category.id,
      name: `${''.repeat(depth)}${category.name}`,
    });

    if (category.children && category.children.length) {
      category.children.forEach(child => formatCategory(child, depth + 1));
    }
  };

  categories.value.forEach(cat => formatCategory(cat));
  return flatCategories;
});

// تطبيق البحث في `name` و `description`
const filteredCategories = computed(() => {
  if (!searchCategory.value) return formattedCategories.value;
  return formattedCategories.value.filter(cat => cat.name.includes(searchCategory.value));
});
const setAttributeValues = item => {
  console.log(item.raw.values);
  // newProduct.value.attributeValues.value = item.values;
  attributeValues.value = item.raw.values;
};
function closeDialog() {
  dialog.value = false;
}
</script>

<template>
  <v-container>
    <!-- دايلوج موحد للإضافة والتعديل -->
    <v-dialog :fullscreen="xs" v-model="dialog">
      <v-card>
        <v-btn color="error" style="position: fixed; z-index: 10" class="ma-2" icon="ri-close-line" @click="dialog = false"></v-btn>
        <v-card-title class="ma-5 text-center">
          <h2>{{ isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
        </v-card-title>
        <v-card-text :class="xs ? 'px-2' : 'px-5'">
          <!-- بيانات المنتج الأساسية -->
          <v-row class="elevation-10 my-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="newProduct.name" label="اسم المنتج" :rules="productRules.name" required />
            </v-col>
            <!--is_active && featured && is_returnable -->
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-switch v-model="newProduct.is_active" label="نشط" />
                </v-col>
                <v-col>
                  <v-switch v-model="newProduct.featured" label="مميز" />
                </v-col>
                <v-col>
                  <v-switch v-model="newProduct.is_returnable" label="قابل للإرجاع" />
                </v-col>
              </v-row>
            </v-col>
            <!-- Categories && brands && warehouses  -->
            <v-col cols="12">
              <v-row>
                <v-col>
                  <v-combobox
                    v-model="newProduct.category_id"
                    item-value="id"
                    item-title="name"
                    :items="filteredCategories || []"
                    label="الفئة"
                    @update:modelValue="newProduct.category_id = $event ? $event.id : null"
                    v-model:search="searchCategory"
                    hide-no-data
                    hide-selected
                  />
                </v-col>
                <v-col class="px-0">
                  <v-combobox
                    v-model="newProduct.brand_id"
                    item-value="id"
                    item-title="name"
                    :items="brands || []"
                    label="العلامة التجارية"
                    @update:modelValue="newProduct.brand_id = $event ? $event.id : null"
                    v-model:search="searchBrand"
                    hide-no-data
                    hide-selected
                    :rules="productRules.brand_id"
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-if="warehouses.length"
                    v-model="newProduct.warehouse_id"
                    item-value="id"
                    item-title="name"
                    :items="warehouses || []"
                    label="المخزن"
                    :rules="productRules.warehouse_id"
                    required
                  />
                  <v-select
                    v-else
                    :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
                    label="المخزن"
                    item-title="name"
                    :value="null"
                    required
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-textarea rows="1" auto-grow v-model="newProduct.description" label="الوصف القصير" :rules="productRules.description" />
            </v-col>
            <v-col cols="12">
              <v-textarea rows="2" auto-grow v-model="newProduct.description_long" label="الوصف المفصل" :rules="productRules.description_long" />
            </v-col>
          </v-row>
          <!-- بيانات المتغيرات -->
          <v-card-title> تفاصيل المنتج الإضافية </v-card-title>
          <v-card-subtitle class="pb-2"> مثل السعر والصور والخصومات </v-card-subtitle>
          <v-row class="elevation-10 my-5" v-for="(variant, vIndex) in newProduct.variants" :key="vIndex">
            <v-col cols="12">
              <!--purchase_price && retail_price && wholesale_price -->
              <v-row>
                <v-col cols="4">
                  <v-text-field v-model="variant.purchase_price" label="سعر الشراء" type="number" />
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="variant.retail_price" label="سعر التجزئة" type="number" />
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="variant.wholesale_price" label="سعر الجملة" type="number" />
                </v-col>
              </v-row>
            </v-col>
            <!-- tax rate && discount -->
            <v-col cols="12">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="variant.tax_rate" label="نسبة الضريبة" type="number" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="variant.discount" label="الخصم" type="number" />
                </v-col>
              </v-row>
            </v-col>
            <v-col class="py-0" cols="12">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="variant.expiry_date" label="تاريخ الانتهاء" type="date" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="variant.image_url" label="رابط الصورة" />
                </v-col>
              </v-row>
            </v-col>
            <!-- قسم اختيار الخصائص المتعددة -->
            <v-col cols="12">
              <!-- زر إضافة خاصية -->
              <v-btn variant="text" color="primary" @click="variant.attributes.push({ attribute_id: null, attribute_value_id: null, values: [] })">
                + إضافة خصائص
              </v-btn>
              <v-card-subtitle>اختيار خصائص مثل اللون والحجم</v-card-subtitle>

              <div v-for="(attr, aIndex) in variant.attributes" :key="aIndex" class="d-flex align-center mb-2">
                <v-col cols="5">
                  <v-combobox
                    v-model="attr.attribute_id"
                    :items="attributes || []"
                    item-title="name"
                    item-value="id"
                    label="الخاصية"
                    class="mr-2"
                    @update:modelValue="attr.attribute_id = $event ? $event.id : null"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        @click="
                          () => {
                            attr.attribute_value_id = null;
                            attr.values = item.raw.values;
                          }
                        "
                      >
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="5">
                  <v-combobox
                    v-model="attr.attribute_value_id"
                    :items="attr.values || []"
                    item-title="name"
                    item-value="id"
                    label="اختر قيمة"
                    class="mr-2"
                    :return-object="false"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item append-icon="ri-pantone-fill" :style="{ color: item.raw.value || '' }" v-bind="props"> </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col cols="2">
                  <v-btn variant="text" class="ms-2" color="red" icon @click="variant.attributes.splice(aIndex, 1)">
                    <v-icon>ri-delete-bin-line</v-icon>
                  </v-btn>
                </v-col>
              </div>
            </v-col>
            <v-col cols="12" md="12">
              <v-btn prepend-icon="ri-delete-bin-line" color="error" @click="removeVariant(vIndex)">حذف التفاصيل</v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" @click="addVariant" class="mb-3">+ إضافة تفاصيل جديدة</v-btn>
          <v-divider class="my-4"></v-divider>
          <div style="display: flex; position: sticky; bottom: 4px; left: 0; right: 0; width: 100%">
            <v-row>
              <v-col cols="4">
                <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
              </v-col>
              <v-col cols="4" class="text-center">
                <v-btn prepend-icon="ri-save-line" color="success" @click="saveProduct">
                  {{ isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج' }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="ProductEditDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">تعديل المنتج</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="ProductVariantEdit.name" label="اسم المنتج" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-textarea v-model="ProductVariantEdit.description" label="الوصف" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="ProductVariantEdit.category" :items="categories" label="الفئة" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="ProductVariantEdit.purchase_price" label="سعر الشراء" type="number" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="ProductVariantEdit.retail_price" label="السعر التجزئة" type="number" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="ProductVariantEdit.discount" label="الخصم" type="number" required />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="ProductVariantEdit.sku" label="SKU" required />
              </v-col>
            </v-row>

            <!-- عرض الـ Attributes -->
            <v-divider></v-divider>
            <v-chip>الخصائص</v-chip>
            <v-row v-for="(attribute, index) in ProductVariantEdit.attributes" :key="index">
              <v-col cols="12" sm="6">
                <v-text-field v-model="attribute.value" :label="attribute.name" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="dialog = false">إلغاء</v-btn>
          <v-btn color="primary">حفظ التغييرات</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="pa-4">
      <!-- زر فتح الديالوج للإضافة -->
      <v-btn color="primary" @click="openAddDialog">+ إضافة منتج</v-btn>

      <!-- جدول عرض المنتجات -->

      <v-table class="mt-4">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الخصائص</th>
            <th>الكمية</th>
            <th>الفئة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody v-if="products.length">
          <tr v-for="(product, index) in productVariants" :key="index">
            <td>{{ product.name }}</td>
            <td>
              <v-chip
                v-for="(attribute, idx) in product.attributes"
                :key="idx"
                :style="{ color: attribute.value.value }"
                class="ma-1"
                text-color="white"
              >
                {{ attribute.value.name || 'غير محدد' }}
              </v-chip>
            </td>
            <td>{{ product.stock_quantity }}</td>
            <td>{{ product.category }}</td>
            <td>
              <v-btn variant="text" color="blue" icon="ri-edit-line" @click="openEditDialog(product)"></v-btn>
              <v-btn variant="text" icon="ri-delete-bin-line" color="red" @click="removeProduct(product.id)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <!-- زر إرسال المنتجات -->
  </v-container>
</template>
