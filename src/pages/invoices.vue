<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card class="mx-auto" max-width="800">
          <v-card-title class="text-h5 primary white--text d-flex justify-space-between align-center">
            إدارة صلاحيات المستخدم
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="ابحث عن صلاحية"
              single-line
              hide-details
              dark
              dense
              class="ml-4"
              style="max-width: 250px"
            ></v-text-field>
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="loading" class="text-center py-5">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-3">جاري تحميل الصلاحيات...</p>
            </div>

            <v-alert v-if="error" type="error" dense prominent border="left"> حدث خطأ أثناء تحميل الصلاحيات: {{ error }} </v-alert>

            <div v-if="!loading && !error">
              <div class="text-subtitle-1 mb-3">الصلاحيات</div>
              <v-row class="mb-10" v-if="filteredPermissionGroups.length > 0">
                <v-col class="pa-0" v-for="group in filteredPermissionGroups" :key="group.name" cols="12">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="py-2 px-2 bg-grey-lighten-4 d-flex align-center">
                      <v-checkbox
                        :model-value="isGroupSelected(group)"
                        @update:model-value="val => toggleGroupSelection(group, val)"
                        hide-details
                        color="primary"
                        class="ma-0 pa-0"
                      ></v-checkbox>
                      <span class="text-subtitle-1 mr-2">{{ group.name }}</span>
                      <v-spacer></v-spacer>
                      <span class="text-caption grey--text text--darken-1">{{ group.permissions.length }} صلاحية</span>
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col class="py-0 px-3" cols="12" xs="6" sm="6" md="4" lg="3" v-for="(permission, i) in group.permissions" :key="i">
                          <v-checkbox
                            v-model="selectedPermissionsKeys"
                            :label="permission.label"
                            :value="permission.value"
                            density="comfortable"
                            color="primary"
                            class="permission-checkbox py-0 px-3"
                            hide-details
                            @update:model-value="() => updateGroupSelection(group)"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-col v-else-if="search" cols="12">
                <v-alert type="info" text> لا توجد صلاحيات مطابقة لـ "{{ search }}" في أي مجموعة. </v-alert>
              </v-col>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="d-flex justify-end pa-4">
            <v-btn color="primary" :loading="saving" :disabled="loading || error" @click="savePermissions">
              <v-icon left>mdi-content-save</v-icon>
              حفظ التغييرات
            </v-btn>
          </v-card-actions>

          <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" :color="snackbar.color">
            {{ snackbar.message }}
            <template v-slot:action="{ attrs }">
              <v-btn text v-bind="attrs" @click="snackbar.show = false"> إغلاق </v-btn>
            </template>
          </v-snackbar>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// import axios from 'axios';

const route = useRoute();
const userId = ref(route.params.userId);

const allPermissionsConfig = ref(null);
const userCurrentPermissionsKeys = ref([]); // ستظل فارغة مؤقتاً في هذا السيناريو
const selectedPermissionsKeys = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const search = ref('');
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000,
});

// بيانات وهمية للصلاحيات الحالية للمستخدم (مصفوفة واحدة كما طلبت)
const DUMMY_USER_CURRENT_PERMISSIONS_ARRAY = ['companies.view_any', 'users.create', 'products.view_any', 'users.view_all', 'invoices.view_any'];

// بيانات وهمية لكل الصلاحيات المتاحة
const DUMMY_ALL_PERMISSIONS = {
  companies: {
    page: { key: 'companies.page', label: 'صفحة الشركات' },
    view_any: { key: 'companies.view_any', label: 'عرض كل الشركات' },
    view: { key: 'companies.view', label: 'عرض تفاصيل الشركة' },
    create: { key: 'companies.create', label: 'إنشاء شركة جديدة' },
    update_any: { key: 'companies.update_any', label: 'تعديل أى شركة' },
    delete_any: { key: 'companies.delete_any', label: 'حذف أى شركة' },
  },
  users: {
    page: { key: 'users.page', label: 'صفحة المستخدمين' },
    view_all: { key: 'users.view_all', label: 'عرض كل المستخدمين' },
    view_children: { key: 'users.view_children', label: 'عرض المستخدمين التابعين' },
    create: { key: 'users.create', label: 'إنشاء مستخدم' },
    update_any: { key: 'users.update_any', label: 'تعديل أى مستخدم' },
    delete_any: { key: 'users.delete_any', label: 'حذف أى مستخدم' },
  },
  products: {
    page: { key: 'products.page', label: 'صفحة المنتجات' },
    view_any: { key: 'products.view_any', label: 'عرض كل المنتجات' },
    create: { key: 'products.create', label: 'إنشاء منتج' },
    delete_any: { key: 'products.delete_any', label: 'حذف أى منتج' },
  },
  invoices: {
    page: { key: 'invoices.page', label: 'صفحة الفواتير' },
    view_any: { key: 'invoices.view_any', label: 'عرض كل الفواتير' },
    create: { key: 'invoices.create', label: 'إنشاء فاتورة' },
    update_any: { key: 'invoices.update_any', label: 'تعديل أى فاتورة' },
  },
};

const permissionGroups = computed(() => {
  if (!allPermissionsConfig.value) return [];

  const groups = [];
  for (const entityKey in allPermissionsConfig.value) {
    if (allPermissionsConfig.value.hasOwnProperty(entityKey)) {
      const entityData = allPermissionsConfig.value[entityKey];
      const groupName =
        entityData.page && entityData.page.label
          ? entityData.page.label
          : entityKey
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

      const permissionsInGroup = [];
      for (const actionKey in entityData) {
        if (entityData.hasOwnProperty(actionKey) && actionKey !== 'page') {
          permissionsInGroup.push({
            label: entityData[actionKey].label, // التسمية المعربة للصلاحية
            value: entityData[actionKey].key, // المفتاح الفعلي للصلاحية (الـ key)
          });
        }
      }
      groups.push({
        name: groupName,
        permissions: permissionsInGroup,
      });
    }
  }
  return groups;
});

const filteredPermissionGroups = computed(() => {
  if (!search.value) return permissionGroups.value;

  const lowerCaseSearch = search.value.toLowerCase();
  return permissionGroups.value.filter(group => {
    // فلترة المجموعات التي اسمها يطابق البحث أو تحتوي على صلاحية تطابق البحث
    const groupNameMatches = group.name.toLowerCase().includes(lowerCaseSearch);
    const permissionMatches = group.permissions.some(
      permission =>
        permission.label.toLowerCase().includes(lowerCaseSearch) || // البحث في الـ label
        permission.value.toLowerCase().includes(lowerCaseSearch) // البحث في الـ value (المفتاح)
    );
    return groupNameMatches || permissionMatches;
  });
});

const isGroupSelected = group => {
  // تتحقق لو كل الصلاحيات اللي في المجموعة دي موجودة في selectedPermissionsKeys
  // استخدم set لتحسين الأداء في البحث عن وجود العنصر
  const selectedSet = new Set(selectedPermissionsKeys.value);
  return (
    group.permissions.length > 0 && // تأكد أن المجموعة ليست فارغة لتجنب تحديدها دائماً
    group.permissions.every(permission => selectedSet.has(permission.value))
  );
};

const toggleGroupSelection = (group, isSelected) => {
  if (isSelected) {
    // لو حدد المجموعة، نضيف كل صلاحياتها لـ selectedPermissionsKeys
    group.permissions.forEach(permission => {
      if (!selectedPermissionsKeys.value.includes(permission.value)) {
        selectedPermissionsKeys.value.push(permission.value);
      }
    });
  } else {
    // لو لغى تحديد المجموعة، نشيل كل صلاحياتها من selectedPermissionsKeys
    selectedPermissionsKeys.value = selectedPermissionsKeys.value.filter(key => !group.permissions.some(permission => permission.value === key));
  }
};

const updateGroupSelection = group => {
  // هذه الدالة لا تحتاج إلى فعل أي شيء مباشر هنا.
  // v-model على v-checkbox الفردي هو الذي يقوم بتحديث selectedPermissionsKeys.
  // المنطق في isGroupSelected هو الذي يقوم بتحديد حالة checkbox الخاص بالمجموعة تلقائياً.
  // أضفتها لتكون نقطة استدعاء إذا أردت أي منطق إضافي في المستقبل.
};

// دالة جلب البيانات الوهمية
const fetchPermissions = async () => {
  loading.value = true;
  error.value = null;
  try {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));

    allPermissionsConfig.value = DUMMY_ALL_PERMISSIONS;

    // تهيئة selectedPermissionsKeys بالصلاحيات الحالية للمستخدم مباشرة
    // هنا بيتم استخدام مصفوفة الصلاحيات الوهمية اللي طلبتها
    selectedPermissionsKeys.value = [...DUMMY_USER_CURRENT_PERMISSIONS_ARRAY];
  } catch (err) {
    console.error('Error fetching dummy permissions:', err);
    error.value = 'تعذر تحميل الصلاحيات الوهمية.';
    snackbar.value = {
      show: true,
      message: 'فشل تحميل الصلاحيات!',
      color: 'error',
      timeout: 4000,
    };
  } finally {
    loading.value = false;
  }
};

// دالة حفظ البيانات الوهمية
const savePermissions = async () => {
  saving.value = true;
  error.value = null;
  try {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`صلاحيات المستخدم ${userId.value} الجديدة:`, selectedPermissionsKeys.value);

    snackbar.value = {
      show: true,
      message: 'تم حفظ الصلاحيات بنجاح (وهمي)!',
      color: 'success',
      timeout: 3000,
    };
  } catch (err) {
    console.error('Error saving dummy permissions:', err);
    error.value = 'تعذر حفظ الصلاحيات الوهمية.';
    snackbar.value = {
      show: true,
      message: 'فشل حفظ الصلاحيات!',
      color: 'error',
      timeout: 4000,
    };
  } finally {
    saving.value = false;
  }
};

// Lifecycle Hook
onMounted(() => {
  fetchPermissions();
});
</script>

<style scoped>
.permission-checkbox {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* تعديل الهوامش السلبية للصفوف لتعويض بادينج الـ col */
.v-card-text .v-row {
  margin-right: -12px !important;
  margin-left: -12px !important;
}

/* لضبط المسافة بين الـ checkbox والـ label في v-checkbox */
.v-checkbox .v-label {
  padding-right: 8px; /* مسافة لليمين من الـ checkbox */
}

/* لضبط لون checkbox */
/* هذا النمط يستخدم '>>>' (Deep Selector) للوصول داخل Shadow DOM للمكونات الفرعية لـ Vuetify. */
/* إذا لم يعمل، قد تحتاج إلى إضافة !important أو البحث عن طريقة Vuetify الموصى بها لتغيير اللون. */
.v-checkbox >>> .v-icon {
  color: var(--v-primary-base) !important;
}

/* تحسين مظهر v-checkbox في Vuetify 3 ليكون أكثر قربًا للصورة */
.v-checkbox.permission-checkbox {
  .v-selection-control__wrapper {
    min-width: 24px; /* لتقليل المساحة التي يأخذها الـ checkbox نفسه */
  }
  .v-selection-control__input {
    margin-right: 0; /* إزالة أي هامش داخلي قد يدفعه بعيدًا عن الـ label */
  }
}
</style>
