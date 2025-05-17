<script setup>
import { saveItem } from '@/services/api';
import { ref, watch, defineProps } from 'vue';
import { useDisplay } from 'vuetify';
const { xs } = useDisplay();
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  roles: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['update:user']);
const userRoles = ref(props.roles);
const dialogRolesEdit = ref(false);
const selectedRoles = ref([]);
watch(
  () => props.user.roles,
  newRoles => {
    selectedRoles.value = newRoles ? newRoles.map(role => role.name) : [];
  },
  { immediate: true }
);

function assignRole() {
  const rolesAndId = {
    user_id: props.user.id,
    roles: selectedRoles.value,
  };
  console.log(rolesAndId);

  saveItem('role/assignRole', rolesAndId).then(data => {
    emit('update:user', data);
    dialogRolesEdit.value = false;
  });
}

// دالة لإضافة أو زيادة كمية المنتج في form.items
const addOrIncrement = product => {
  if (!product) return;
  // تحقق إذا كان المنتج موجود بالفعل في form.items
  const existingItem = form.value.items.find(i => i.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    form.value.items.push({
      id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: product.price,
      discount: 0,
      total: product.price,
    });
  }
  updateTotal();
};

// عند البحث اليدوي: عند اختيار منتج من الـ autocomplete
const onProductSearch = async val => {
  productSearchText.value = val || '';
  if (!val || val.length < 3) {
    products.value = [];
    return;
  }
  try {
    isLoadingProducts.value = true;
    const data = await searchProducts(val, 1);
    products.value = data.items || data;
    productHasMore.value = data.meta ? data.meta.current_page < data.meta.last_page : false;
  } catch (error) {
    products.value = [];
    console.error('Error searching products:', error);
  } finally {
    isLoadingProducts.value = false;
  }
};

// عند اختيار منتج من البحث اليدوي
const onProductSelect = productId => {
  const product = products.value.find(p => p.id === productId);
  addOrIncrement(product);
};

// عند البحث بالسيريال
async function searchProductBySerial(serial) {
  try {
    const { data } = await getAll('products', { serial });
    let product = null;
    if (data && (Array.isArray(data) ? data.length : data.items?.length)) {
      product = Array.isArray(data) ? data[0] : data.items[0];
    }
    if (product) {
      addOrIncrement(product);
      scannerError.value = null;
      return;
    }
    scannerError.value = 'لم يتم العثور على منتج بهذا السيريال';
  } catch (error) {
    scannerError.value = 'حدث خطأ أثناء البحث عن المنتج';
    console.error('searchProductBySerial error:', error);
  }
}
</script>
<template>
  <v-btn
    class="ma-4 text-center btn-add"
    density="compact"
    variant="flat"
    style="background-color: #28a745 !important; color: white; z-index: 10"
    prepend-icon="ri-pencil-line"
    @click="dialogRolesEdit = true"
  >
    تعديل الادوار
  </v-btn>
  <v-dialog :fullscreen="xs" v-model="dialogRolesEdit" max-width="500">
    <v-card class="pa-4">
      <v-card-title class="text-subtitle-1 py-1 px-4 bg-grey-lighten-4">تعديل ادوار المستخدم </v-card-title>
      <v-row class="mb-10" v-if="userRoles">
        <v-col cols="12">
          <v-card-text class="elevation-5 pa-10">
            <v-row v-if="userRoles">
              <v-col class="pa-0" cols="12" xs="6" sm="6" md="4" lg="3" v-for="(role, i) in userRoles" :key="i">
                <v-checkbox
                  v-model="selectedRoles"
                  :label="role.name"
                  :value="role.name"
                  density="comfortable"
                  color="primary"
                  class="permission-checkbox"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
      <v-card-actions style="position: fixed; bottom: 35px; left: 50%; transform: translate(-50%, 50%); min-width: 200px" class="pa-4 ma-auto">
        <v-btn append-icon="ri-close-line" style="background-color: #dc3545; color: white !important" variant="text" @click="dialogRolesEdit = false">
          إلغاء
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn append-icon="ri-save-line" style="background-color: #007bff; color: white !important" @click="assignRole"> حفظ </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
