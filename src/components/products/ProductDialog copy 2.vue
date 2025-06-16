<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'; // إضافة nextTick
import { useDisplay } from 'vuetify';
import { getAll, saveItem } from '@/services/api'; // تأكد من أن المسار صحيح لخدمة الـ API

const props = defineProps({
  dialog: Boolean,
  product: Object,
  isEditMode: Boolean,
});

const emit = defineEmits(['update:dialog', 'saved', 'close']);
const { xs } = useDisplay();

const dialog = ref(props.dialog);
const productForm = ref(null);
const productFormValid = ref(false); // يتم تحديثها بواسطة VForm
const brands = ref([]);
const warehouses = ref([]);
const categories = ref([]);
const attributes = ref([]);

// دوال مساعدة للتحقق من الأرقام
const isNumber = v => (typeof v === 'number' && !isNaN(v)) || 'يجب أن يكون رقمًا';
const isPositiveOrZero = v => parseFloat(v) >= 0 || 'يجب أن يكون رقمًا موجبًا أو صفرًا';
const isRequiredNumber = v => (typeof v === 'number' && !isNaN(v) && v !== null) || 'مطلوب ويجب أن يكون رقمًا';

// القيم الافتراضية للمنتج الجديد
const defaultProduct = {
  id: null,
  name: '',
  active: true,
  featured: false,
  returnable: true,
  desc: '',
  desc_long: '',
  category_id: null,
  brand_id: null,
  variants: [
    {
      barcode: '',
      sku: '',
      retail_price: 0,
      wholesale_price: 0,
      image: null, // سيتطلب v-file-input لرفع الملفات
      weight: 0,
      dimensions: '',
      tax: 0,
      discount: 0,
      status: 'active', // حالة الـ variant
      attributes: [],
      stocks: [
        {
          qty: 0,
          reserved: 0,
          min_qty: 0,
          cost: 0, // تعيين قيمة افتراضية لـ cost
          batch: '',
          expiry: null,
          loc: '',
          status: true,
          warehouse_id: null, // سيتم تعيينه بعد جلب المخازن
        },
      ],
    },
  ],
};

const localProduct = ref(JSON.parse(JSON.stringify(defaultProduct)));

function mapProductDataForEdit(apiProduct) {
  // استخدام التعيين الآمن (??) لضمان قيم افتراضية حتى لو كانت البيانات مفقودة
  return {
    id: apiProduct.id,
    name: apiProduct.name || '',
    active: apiProduct.active ?? true,
    featured: apiProduct.featured ?? false,
    returnable: apiProduct.returnable ?? true,
    desc: apiProduct.desc || '',
    desc_long: apiProduct.desc_long || '',
    category_id: apiProduct.category_id || null,
    brand_id: apiProduct.brand_id || null,
    variants: (apiProduct.variants || []).map(variant => ({
      id: variant.id,
      barcode: variant.barcode || '',
      sku: variant.sku || '',
      retail_price: parseFloat(variant.retail_price) || 0,
      wholesale_price: parseFloat(variant.wholesale_price) || 0,
      image: variant.image || null,
      weight: parseFloat(variant.weight) || 0,
      dimensions: variant.dimensions || '',
      tax: parseFloat(variant.tax) || 0,
      discount: parseFloat(variant.discount) || 0,
      status: variant.status || 'active',
      attributes: (variant.attributes || []).map(attr => ({
        attribute_id: attr.attribute_id || null,
        attribute_value_id: attr.attribute_value_id || null,
      })),
      stocks: (variant.stocks || []).map(stock => ({
        id: stock.id,
        qty: stock.qty || 0,
        reserved: stock.reserved || 0,
        min_qty: stock.min_qty || 0,
        cost: parseFloat(stock.cost) || 0, // التأكد من التحويل لعدد
        batch: stock.batch || '',
        expiry: stock.expiry ? new Date(stock.expiry).toISOString().substr(0, 10) : null,
        loc: stock.loc || '',
        status: stock.status ?? true,
        warehouse_id: stock.warehouse ? stock.warehouse.id : null,
      })),
    })),
  };
}

const productRules = {
  name: [v => !!v || 'اسم المنتج مطلوب', v => (typeof v === 'string' && v.length <= 255) || 'اسم المنتج يجب ألا يزيد عن 255 حرفًا'],
  description: [v => !v || typeof v === 'string' || 'الوصف يجب أن يكون نصًا'],
  description_long: [v => !v || typeof v === 'string' || 'الوصف المفصل يجب أن يكون نصًا'],
  // قواعد لخصائص الـ variant
  retail_price: [isRequiredNumber, isPositiveOrZero],
  wholesale_price: [isRequiredNumber, isPositiveOrZero],
  tax: [isNumber, isPositiveOrZero],
  discount: [isNumber, isPositiveOrZero],
  weight: [isNumber, isPositiveOrZero],
  // قواعد لخصائص الـ stock
  qty: [isRequiredNumber, isPositiveOrZero],
  cost: [isNumber, isPositiveOrZero],
};

// دالة مساعدة لتعيين المخزن الافتراضي للمخزون الأول
function setInitialWarehouseForFirstStock() {
  if (localProduct.value.variants.length > 0 && localProduct.value.variants[0].stocks.length > 0 && warehouses.value.length > 0) {
    if (localProduct.value.variants[0].stocks[0].warehouse_id === null) {
      localProduct.value.variants[0].stocks[0].warehouse_id = warehouses.value[0].id;
    }
  }
}

watch(
  () => props.dialog,
  async val => {
    // جعلها async لدعم await productForm.value.reset()
    dialog.value = val;
    if (val) {
      if (props.isEditMode && props.product) {
        localProduct.value = mapProductDataForEdit(props.product);
      } else {
        localProduct.value = JSON.parse(JSON.stringify(defaultProduct));
        // تأكد من تهيئة المخزن الافتراضي عند إضافة منتج جديد
        setInitialWarehouseForFirstStock();
      }
      // إعادة ضبط التحقق من الصحة عند فتح الحوار
      await nextTick(); // انتظر حتى يتم تحديث DOM
      if (productForm.value) {
        productForm.value.resetValidation();
      }
    }
  },
  { immediate: true }
);

watch(dialog, val => {
  emit('update:dialog', val);
});

watch(
  () => props.product,
  newVal => {
    if (props.isEditMode && newVal) {
      localProduct.value = mapProductDataForEdit(newVal);
    }
  }
);

onMounted(async () => {
  await Promise.all([getBrands(), getAttributes(), getWarehouses(), getCategories()]);

  // بعد جلب المخازن، تأكد من تعيين المخزن الافتراضي لـ localProduct إذا لم يكن معيناً
  // وهذا يضمن أن يكون هناك مخزن افتراضي للـ variant الأول في وضع الإضافة.
  if (!props.isEditMode) {
    setInitialWarehouseForFirstStock();
  }
});

async function getBrands() {
  try {
    const res = await getAll('brands', null, true, false);
    brands.value = res.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    // يمكن عرض رسالة خطأ للمستخدم هنا
  }
}
async function getAttributes() {
  try {
    const res = await getAll('attributes', null, true, false);
    attributes.value = res.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
  }
}
async function getWarehouses() {
  try {
    const res = await getAll('warehouses', null, true, false);
    warehouses.value = res.data;
    // تعيين المخزن الافتراضي عند جلب المخازن لأول مرة أو إذا لم يكن هناك مخزن محدد
    if (!props.isEditMode) {
      setInitialWarehouseForFirstStock();
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
}
async function getCategories() {
  try {
    const res = await getAll('categories', null, true, false);
    categories.value = res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

function getAttributeValues(attributeId) {
  if (!attributeId) return [];
  const attr = attributes.value.find(a => a.id === attributeId);
  return attr ? attr.values : [];
}

function getContrastColor(hexcolor) {
  if (!hexcolor) return '#000';
  const c = hexcolor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186 ? '#000' : '#fff';
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

function addStock(variantIndex) {
  const newStock = {
    qty: 0,
    reserved: 0,
    min_qty: 0,
    cost: 0,
    batch: '',
    expiry: null,
    loc: '',
    status: true,
    // تعيين المخزن الافتراضي للمخزون الجديد مباشرة
    warehouse_id: warehouses.value.length > 0 ? warehouses.value[0].id : null,
  };
  localProduct.value.variants[variantIndex].stocks.push(newStock);
}

function removeStock(variantIndex, stockIndex) {
  localProduct.value.variants[variantIndex].stocks.splice(stockIndex, 1);
}

function closeDialog() {
  emit('close');
  dialog.value = false;
}

function addVariant() {
  localProduct.value.variants.push({
    barcode: '',
    sku: '',
    retail_price: 0,
    wholesale_price: 0,
    image: null,
    weight: 0,
    dimensions: '',
    tax: 0,
    discount: 0,
    status: 'active',
    attributes: [{ attribute_id: null, attribute_value_id: null }],
    stocks: [
      {
        qty: 0,
        reserved: 0,
        min_qty: 0,
        cost: 0,
        batch: '',
        expiry: null,
        loc: '',
        status: true,
        // تعيين المخزن الافتراضي للمخزون الجديد مباشرة
        warehouse_id: warehouses.value.length > 0 ? warehouses.value[0].id : null,
      },
    ],
  });
}

function removeVariant(index) {
  localProduct.value.variants.splice(index, 1);
}

async function saveProduct() {
  if (!productForm.value) return;
  const { valid } = await productForm.value.validate();
  if (!valid) return;

  try {
    const payload = JSON.parse(JSON.stringify(localProduct.value));

    // تحويل أسماء الحقول لتتوافق مع الـ API إذا كانت مختلفة
    // هذا الجزء يبدو أنه تم التعامل معه بشكل جيد بالفعل
    // ويمكن تركه كما هو إذا كانت تسميات الـ API مختلفة
    if (Object.prototype.hasOwnProperty.call(payload, 'active')) {
      // استخدم "active" مباشرة
    } else if (Object.prototype.hasOwnProperty.call(payload, 'is_active')) {
      payload.active = payload.is_active;
      delete payload.is_active;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'returnable')) {
      // استخدم "returnable" مباشرة
    } else if (Object.prototype.hasOwnProperty.call(payload, 'is_returnable')) {
      payload.returnable = payload.is_returnable;
      delete payload.is_returnable;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'desc')) {
      // استخدم "desc" مباشرة
    } else if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
      payload.desc = payload.description;
      delete payload.description;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'desc_long')) {
      // استخدم "desc_long" مباشرة
    } else if (Object.prototype.hasOwnProperty.call(payload, 'description_long')) {
      payload.desc_long = payload.description_long;
      delete payload.description_long;
    }

    // التأكد من أن warehouse_id موجود لكل stock
    payload.variants.forEach(variant => {
      if (variant.stocks && variant.stocks.length > 0) {
        variant.stocks.forEach(stock => {
          if (!stock.warehouse_id && warehouses.value.length > 0) {
            stock.warehouse_id = warehouses.value[0].id;
          }
        });
      }
    });

    let res;
    if (payload.id) {
      // وضع التعديل
      res = await saveItem('product', payload, payload.id);
    } else {
      // وضع الإضافة - حذف الـ ID لتجنب إرسال null
      const { id, ...newProductPayload } = payload; // حذف الـ id
      res = await saveItem('product', newProductPayload);
    }

    emit('saved', res.data);
    closeDialog();
  } catch (e) {
    console.error('Error saving product:', e);
    // يمكن عرض رسالة خطأ للمستخدم هنا
  }
}

const statusOptions = [
  { value: 'active', text: 'نشط' },
  { value: 'inactive', text: 'غير نشط' },
  { value: 'expired', text: 'منتهي' },
];
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
                  <v-switch v-model="localProduct.active" label="نشط" :color="localProduct.active ? 'primary' : 'grey'" hide-details="auto" />
                </v-col>
                <v-col>
                  <v-switch v-model="localProduct.featured" label="مميز" :color="localProduct.featured ? 'primary' : 'grey'" hide-details="auto" />
                </v-col>
                <v-col>
                  <v-switch
                    v-model="localProduct.returnable"
                    label="قابل للإرجاع"
                    :color="localProduct.returnable ? 'primary' : 'grey'"
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
                    :return-object="false"
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
                    :return-object="false"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-textarea rows="1" auto-grow v-model="localProduct.desc" label="الوصف القصير" :rules="productRules.description" hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-textarea
                rows="2"
                auto-grow
                v-model="localProduct.desc_long"
                label="الوصف المفصل"
                :rules="productRules.description_long"
                hide-details="auto"
              />
            </v-col>
          </v-row>
          <v-card class="bg-grey-lighten-4 pa-2">
            <v-card-title> خيارات المنتج </v-card-title>
            <v-row class="bg-grey-lighten-4 pa-2" v-for="(variant, vIndex) in localProduct.variants" :key="vIndex">
              <v-col cols="12">
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model.number="variant.retail_price"
                      label="سعر القطاعي "
                      type="number"
                      :rules="productRules.retail_price"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model.number="variant.wholesale_price"
                      label="سعر الجملة"
                      type="number"
                      :rules="productRules.wholesale_price"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="variant.status"
                      :items="statusOptions"
                      item-value="value"
                      item-title="text"
                      label="حالة المتغير"
                      hide-details="auto"
                      :rules="[v => !!v || 'حالة المتغير مطلوبة']"
                      required
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model.number="variant.tax" label="نسبة الضريبة" type="number" :rules="productRules.tax" hide-details="auto" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model.number="variant.discount" label="الخصم" type="number" :rules="productRules.discount" hide-details="auto" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="variant.image" label="رابط الصورة" hide-details="auto" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="variant.dimensions" label="الأبعاد" hide-details="auto" />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="variant.barcode" label="الباركود" hide-details="auto" />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="variant.sku" label="رمز المنتج (SKU)" hide-details="auto" />
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" class="mt-1">
                <v-card-subtitle class="ma-1">المخزون (Stocks)</v-card-subtitle>
                <v-card class="mb-4 pa-3" outlined v-for="(stock, sIndex) in variant.stocks" :key="sIndex">
                  <v-row dense>
                    <v-col cols="4">
                      <v-text-field v-model.number="stock.cost" label="سعر الشراء" type="number" :rules="productRules.cost" hide-details="auto" />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field v-model.number="stock.qty" label="الكمية" type="number" :rules="productRules.qty" hide-details="auto" />
                    </v-col>
                    <v-col cols="4">
                      <v-select
                        v-if="warehouses.length"
                        v-model="stock.warehouse_id"
                        item-value="id"
                        item-title="name"
                        :items="warehouses || []"
                        label="المخزن"
                        :rules="[v => !!v || 'المخزن مطلوب']"
                        required
                        hide-details="auto"
                        :return-object="false"
                      />
                      <v-select
                        v-else
                        :items="[{ id: null, name: 'لا يوجد مخازن، يرجى إضافة مخزن أولاً', disabled: true }]"
                        label="المخزن"
                        item-title="name"
                        :value="null"
                        :rules="[v => !!v || 'المخزن مطلوب']"
                        required
                        hide-details="auto"
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-select
                        v-model="stock.status"
                        :items="statusOptions"
                        item-value="value"
                        item-title="text"
                        label="حالة المتغير"
                        hide-details="auto"
                        :rules="[v => !!v || 'حالة المتغير مطلوبة']"
                        required
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field v-model="stock.expiry" label="تاريخ الانتهاء" type="date" hide-details="auto" />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field v-model="stock.loc" label="الموقع" hide-details="auto" />
                    </v-col>
                  </v-row>
                  <v-btn
                    v-if="variant.stocks.length > 1"
                    class="mt-2"
                    icon="ri-delete-bin-line"
                    color="error"
                    size="small"
                    @click="removeStock(vIndex, sIndex)"
                  ></v-btn>
                </v-card>
                <!-- <v-btn class="my-2" text color="primary" small @click="addStock(vIndex)">+ إضافة مخزون جديد لهذا الخيار</v-btn> -->
              </v-col>

              <v-col cols="12" class="mt-2">
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
                      @update:modelValue="() => (attr.attribute_value_id = null)"
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
                    <v-btn class="my-a" icon="ri-delete-bin-line" color="error" size="small" @click="removeAttribute(vIndex, aIndex)"> </v-btn>
                  </v-col>
                </v-row>

                <v-btn class="my-2" text color="primary" small @click="addAttribute(vIndex)">+ إضافة خاصية جديدة</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn variant="text" color="error" append-icon="ri-delete-bin-line" @click="removeVariant(vIndex)">حذف هذا الخيار</v-btn>
              </v-col>
              <v-col cols="12" v-if="vIndex < localProduct.variants.length - 1"> <v-divider class="my-4"></v-divider> </v-col>
            </v-row>
          </v-card>
          <v-row>
            <v-col cols="12">
              <v-btn class="my-3" color="primary" @click="addVariant">+ اضافة خيار جديد </v-btn>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="6">
              <v-btn prepend-icon="ri-close-line" color="error" @click="closeDialog"> إلغاء </v-btn>
            </v-col>
            <v-col cols="6" class="text-end">
              <v-btn prepend-icon="ri-save-line" color="success" :disabled="!productFormValid" @click="saveProduct">
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
/* إزالة .forbidden-cursor لأننا نستخدم :disabled الآن */
</style>
