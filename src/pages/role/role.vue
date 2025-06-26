<template>
  <div class="mx-auto mt-10 pa-10" style="max-width: 700px; background-color: white">
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <div>
          <h1 class="text-h4 font-weight-bold">إدارة الأدوار</h1>
          <p class="text-subtitle-1 text-medium-emphasis mt-1">قم بإدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
        </div>
        <v-spacer />
        <v-btn v-if="userStore.can(['roles.create', 'admin.super', 'admin.company'])" color="primary"
          prepend-icon="ri-add-line" @click="openDialog()" elevation="2" size="large">
          دور جديد
        </v-btn>
      </v-col>
    </v-row>
    <v-card elevation="2">
      <v-data-table :headers="headers" :items="roles" :loading="loading" :search="search" hover
        loading-text=" جاري تحمل البيانات " no-data-text=" لا توجد بيانات " items-per-page-text="عدد الصفوف في الصفحة">
        <template v-slot:top>
          <v-toolbar color="transparent">
            <v-text-field class="ma-10" v-model="search" prepend-icon="ri-search-line" label="بحث..."
              hide-details></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn icon="ri-pencil-line" color="primary" size="small" variant="text" @click="editRole(item)"> </v-btn>
            <v-btn icon="ri-delete-bin-line" color="error" size="small" variant="text" @click="confirmDelete(item)">
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog :fullscreen="xs" v-model="dialog" max-width="700" persistent>
      <v-card style="position: relative">
        <div @click="closeDialog" style="position: fixed; top: 5px; left: 5px; z-index: 100">
          <v-btn icon="ri-close-line" variant="text" color="grey-darken-1"> </v-btn>
        </div>
        <v-card-title class="text-h5">
          {{ editedItem.id ? 'تعديل دور' : 'إضافة دور جديد' }}
          <v-spacer></v-spacer>
        </v-card-title>

        <v-divider class="my-4" />


        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row dense>
              <v-col cols="12" xs="6">
                <v-text-field v-model="editedItem.name" label="اسم الدور" :rules="nameRules" required variant="outlined"
                  hide-details>
                </v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4" />
            <v-row class="mb-10" v-if="permissionGroups">
              <v-col cols="4">
                <div class="text-subtitle-1 mb-3">الصلاحيات</div>
              </v-col>
              <v-col cols="8">
                <v-text-field v-model="search" prepend-icon="ri-search-line" label="بحث..." hide-details>
                </v-text-field>
              </v-col>
              <v-expansion-panels v-model="openPanels" class="my-4" variant="popout" multiple>
                <v-expansion-panel class="pa-0" v-for="group in filteredPermissionGroups" :key="group.name">
                  <v-expansion-panel-title style="background-color: #f0f4f8;" class="text-subtitle">
                    {{ group.name }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-card class="mt-3" variant="outlined">
                      <v-card-title class="py-2 px-2 bg-grey-lighten-4 d-flex align-center">
                        <v-checkbox :model-value="isGroupSelected(group)"
                          :label="isGroupSelected(group) ? 'إلغاء تحديد الكل' : 'تحديد الكل'"
                          @update:model-value="val => toggleGroupSelection(group, val)" hide-details color="primary"
                          class="ma-0 pa-0"></v-checkbox>
                        <v-spacer></v-spacer>
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col class="py-0 px-3" cols="12" xs="6" sm="6" md="4" lg="3"
                            v-for="(permission, i) in group.permissions" :key="i">
                            <v-checkbox v-model="editedItem.permissions" :label="permission.label"
                              :value="permission.value" density="comfortable" color="primary"
                              class="permission-checkbox py-0 px-3" hide-details
                              @update:model-value="() => updateGroupSelection(group)"></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions style="position: sticky; bottom: 0; background-color: white; z-index: 5"
          class="pa-4 d-flex justify-center">
          <v-btn append-icon="ri-close-line" color="error" variant="text" @click="closeDialog" class="mx-2"> إلغاء
          </v-btn>
          <v-btn append-icon="ri-save-line" color="primary" :loading="saving" @click="saveRole" class="mx-2"> حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-4"> تأكيد الحذف </v-card-title>
        <v-card-text class="pa-4"> هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء. </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false"> إلغاء </v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteRole"> حذف </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { getLocalPermissions } from '@/services/api';
import { deleteOne, getAll, getOne, saveItem } from '@/services/api';
import { ref, onMounted, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { toast } from 'vue3-toastify';

const router = useRouter();
const { xs } = useDisplay();
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const search = ref('');
const valid = ref(false);
const form = ref(null);
const permissionGroups = ref([]);
const openPanels = ref([]);
const userStore = useUserStore();
const roles = ref([]);

const editedItem = ref({
  id: null,
  name: '',
  permissions: [],
});

const nameRules = [
  v => !!v || 'اسم الدور مطلوب',
  v => v.length >= 3 || 'يجب أن يكون الاسم 3 أحرف على الأقل'
];

const headers = ref([
  { title: 'اسم الدور', key: 'name', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'center' },
  { title: 'الإجراءات', key: 'actions', align: 'center', sortable: false },
]);

const isGroupSelected = group => {
  return group.permissions.every(permission => editedItem.value.permissions.includes(permission.value));
};

const toggleGroupSelection = (group, isChecked) => {
  const currentPermissions = new Set(editedItem.value.permissions);
  if (isChecked) {
    group.permissions.forEach(permission => currentPermissions.add(permission.value));
  } else {
    group.permissions.forEach(permission => currentPermissions.delete(permission.value));
  }
  editedItem.value.permissions = Array.from(currentPermissions);
};

const updateGroupSelection = () => { };

const filteredPermissionGroups = computed(() => {
  if (!search.value) return permissionGroups.value;
  const lowerCaseSearch = search.value.toLowerCase();
  return permissionGroups.value.filter(group => {
    const groupNameMatches = group.name.toLowerCase().includes(lowerCaseSearch);
    const permissionMatches = group.permissions.some(
      permission =>
        permission.label.toLowerCase().includes(lowerCaseSearch) ||
        permission.value.toLowerCase().includes(lowerCaseSearch)
    );
    return groupNameMatches || permissionMatches;
  });
});

watch(
  [() => editedItem.value.permissions, () => filteredPermissionGroups.value],
  () => {
    openPanels.value = filteredPermissionGroups.value
      .map((group, index) => {
        return group.permissions.some(p => editedItem.value.permissions.includes(p.value)) ? index : null;
      })
      .filter(index => index !== null);
  },
  { immediate: true, deep: true }
);

watch(
  () => userStore.user,
  async newUser => {
    if (newUser && newUser.permissions) {
      permissionGroups.value = await getLocalPermissions(newUser.permissions);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await getAll('roles');
    roles.value = data.data;
  } catch (e) {
    if (e.data?.error === 'Unauthorized') {
      // router.push({ name: 'unauthorized' });
    } else {
      toast.error('حدث خطأ أثناء جلب الأدوار');
    }
  } finally {
    loading.value = false;
  }
});

const openDialog = () => {
  editedItem.value = {
    id: null,
    name: '',
    permissions: [],
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedItem.value = {
    id: null,
    name: '',
    permissions: [],
  };
  form.value?.resetValidation();
};

const editRole = item => {
  editedItem.value = { ...item, permissions: [...item.permissions] };
  dialog.value = true;
};

const confirmDelete = item => {
  editedItem.value = { ...item };
  deleteDialog.value = true;
};

const saveRole = async () => {
  saving.value = true;
  const { valid: formValid } = await form.value.validate();

  if (!formValid) {
    toast.error('يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح');
    saving.value = false;
    return;
  }

  try {
    const data = await saveItem('role', editedItem.value, editedItem.value.id);
    // if (editedItem.value.id) {
    //   const index = roles.value.findIndex(role => role.id === data.id);
    //   if (index !== -1) Object.assign(roles.value[index], data);
    // } else {
    //   roles.value.push(data);
    // }
    const dataRes = await getAll('roles');
    roles.value = dataRes.data;
    closeDialog();
  } catch (error) {
    console.error('Error saving role:', error);
    toast.error('حدث خطأ أثناء حفظ الدور');
  } finally {
    saving.value = false;
  }
};

const deleteRole = async () => {
  deleting.value = true;
  try {
    await deleteOne('role', editedItem.value.id);
    roles.value = roles.value.filter(role => role.id !== editedItem.value.id);
  } catch (error) {
    console.error('Error deleting role:', error);
  } finally {
    deleteDialog.value = false;
    deleting.value = false;
  }
};
</script>
<style scoped>
.d-flex.gap-2>.v-btn {
  margin-right: 8px;
  /* For `gap-2` equivalent in Vuetify */
}

.v-card-actions {
  background-color: rgb(255, 255, 255);
  /* Ensure background is white */
  z-index: 5;
  /* Ensure it stays above content */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  /* Optional: subtle shadow for fixed footer */
}
</style>
