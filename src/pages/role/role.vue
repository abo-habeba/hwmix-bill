<template>
  <div class="mx-auto mt-10 pa-10" style="max-width: 700px; background-color: white">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <div>
          <h1 class="text-h4 font-weight-bold">إدارة الأدوار</h1>
          <p class="text-subtitle-1 text-medium-emphasis mt-1">قم بإدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
        </div>
        <v-spacer />
        <v-btn color="primary" prepend-icon="ri-add-line" @click="openDialog()" elevation="2" size="large"> دور جديد </v-btn>
      </v-col>
    </v-row>
    <!-- <v-card>
      <v-card-title>
        {{ userStore.user.nickname }}
      </v-card-title>
      <v-card-text v-for="(permission, i) in userStore.user.permissions" :key="i"> {{ permission }} </v-card-text>
    </v-card> -->

    <!-- Roles Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="roles"
        :loading="loading"
        :search="search"
        hover
        loading-text=" جاري تحمل البيانات "
        no-data-text=" لا توجد بيانات "
        items-per-page-text="عدد الصفوف في الصفحة"
      >
        <template v-slot:top>
          <v-toolbar color="transparent">
            <v-text-field class="ma-10" v-model="search" prepend-icon="ri-search-line" label="بحث..." hide-details density="compact"></v-text-field>
          </v-toolbar>
        </template>

        <!-- <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small" class="text-uppercase">
              {{ item.status === 'active' ? 'نشط' : 'غير نشط' }}
            </v-chip>
          </template> -->

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn icon="ri-pencil-line" color="primary" size="small" variant="text" @click="editRole(item)"> </v-btn>
            <v-btn icon="ri-delete-bin-line" color="error" size="small" variant="text" @click="confirmDelete(item)"> </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Role Dialog -->
    <v-dialog :fullscreen="xs" v-model="dialog" max-width="900" persistent>
      <v-card style="position: relative">
        <div @click="closeDialog" style="position: fixed; top: 5px; left: 5px">
          <v-btn icon="ri-close-line"> </v-btn>
        </div>
        <v-card-title class="text-h5">
          {{ editedItem.id ? 'تعديل دور' : 'إضافة دور جديد' }}
          <v-spacer></v-spacer>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.name"
              label="اسم الدور"
              :rules="nameRules"
              required
              variant="outlined"
              density="comfortable"
            ></v-text-field>
            <v-divider class="my-4"></v-divider>
            <div class="text-subtitle-1 mb-3">الصلاحيات</div>
            <v-row class="mb-10" v-if="permissionGroups">
              <v-col class="pa-0" v-for="group in permissionGroups" :key="group.name" cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 py-1 px-4 bg-grey-lighten-4">
                    {{ group.name }}
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col class="pa-0" cols="12" xs="6" sm="6" md="4" lg="3" v-for="(permission, i) in group.permissions" :key="i">
                        <v-checkbox
                          v-model="editedItem.permissions"
                          :label="permission.name"
                          :value="permission.value"
                          density="comfortable"
                          color="primary"
                          class="permission-checkbox"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions style="position: fixed; bottom: 35px; left: 50%; transform: translate(-50%, 50%); min-width: 200px" class="pa-4 ma-auto">
          <v-btn append-icon="ri-close-line" style="background-color: #dc3545; color: white !important" variant="text" @click="closeDialog">
            إلغاء
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn append-icon="ri-save-line" style="background-color: #007bff; color: white !important" :loading="saving" @click="saveRole">
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
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
import { getLocalPermissions } from '@/@core/utils/permissions';
import { deleteOne, getAll, getOne, saveItem } from '@/services/api';
import { ref, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
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
// const user = ref();
const userPermission = ref({});
const permissionGroups = ref({});
const userStore = useUserStore();
watch(
  () => userStore.user,
  () => {
    console.log('rin watch');
    userPermission.value = userStore.user.permissions || [];
    permissionGroups.value = getLocalPermissions(userPermission.value);
  },
  { immediate: true }
);

onMounted(async () => {
  loading.value = true;
  getAll('roles')
    .then(data => {
      roles.value = data.data;
      loading.value = false;
    })
    .catch(e => {
      loading.value = false;
      if (e.data.error === 'Unauthorized') {
        // router.push({ name: 'unauthorized' });
      }
    });
});

const headers = ref([
  { title: 'اسم الدور', key: 'name', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'center' },
  { title: 'الإجراءات', key: 'actions', align: 'center', sortable: false },
]);

const roles = ref([]);

const editedItem = ref({
  name: '',
  permissions: [],
});

const nameRules = [v => !!v || 'اسم الدور مطلوب', v => v.length >= 3 || 'يجب أن يكون الاسم 3 أحرف على الأقل'];

// Methods
const openDialog = () => {
  editedItem.value = {
    name: '',
    permissions: [],
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedItem.value = {
    name: '',
    permissions: [],
  };
};

const editRole = item => {
  editedItem.value = { ...item };
  dialog.value = true;
};

const confirmDelete = item => {
  editedItem.value = { ...item };
  deleteDialog.value = true;
};

const saveRole = () => {
  saving.value = true;
  if (!form.value.validate()) return;
  try {
    saveItem('role', editedItem.value, editedItem.value.id).then(data => {
      if (editedItem.value.id) {
        let role = roles.value.find(role => role.id === data.id);
        Object.assign(role, editedItem.value);
      } else {
        roles.value.push(data);
      }
    });
  } finally {
    saving.value = false;
    dialog.value = false;
  }
};

const deleteRole = async () => {
  deleting.value = true;
  try {
    deleteOne('role', editedItem.value.id).then(() => {
      roles.value = roles.value.filter(role => role.id !== editedItem.value.id);
    });
  } finally {
    deleteDialog.value = false;
    deleting.value = false;
  }
};

// Lifecycle
</script>
