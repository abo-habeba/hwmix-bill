<template>
  <DeletedItem @update-items="removeDeletedItems" api="users/delete" :dataDelete="{ items: deletedUsers, key: 'nickname' }" />
  <div id="dataTable" style="position: relative !important">
    <v-btn
      v-if="selectedUsers.length"
      class="text-center my-2 mx-10"
      density="compact"
      variant="flat"
      style="background-color: #dc3545 !important; color: white; position: absolute; top: -30px; z-index: 10"
      prepend-icon="ri-delete-bin-line"
      @click="deleteUser"
    >
      حذف عدد {{ selectedUsers.length }} من العناصر
    </v-btn>

    <v-data-table-server
      item-value="id"
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      :headers="headers"
      :items="users"
      :items-length="total"
      :loading="loading"
      hover
      show-current-page
      :row-props="getRowProps"
      v-model="selectedUsers"
      show-select
      item-selectable
      loading-text=" جاري تحمل البيانات "
      no-data-text=" لا توجد بيانات "
      items-per-page-text="عدد الصفوف في الصفحة"
      @update:options="fetchUsers"
      @contextmenu:row="showContextMenu"
      @click="colsContextMenu"
    >
      <template v-slot:top>
        <v-toolbar color="transparent">
          <v-text-field
            clearable
            class="ma-10"
            max-width="200"
            v-model="searchQuery"
            prepend-inner-icon="ri-search-line"
            label="بحث..."
            hide-details
            rounded
          ></v-text-field>
        </v-toolbar>
      </template>
      <template #item.index="{ index }">
        {{ index + 1 }}
      </template>

      <template #item.action="{ item }">
        <v-btn density="compact" variant="text" color="#0086CD" prepend-icon="ri-more-2-fill" @click.stop="event => showContextMenu(event, { item })">
        </v-btn>
      </template>
    </v-data-table-server>
    <ContextMenu ref="contextMenu" :actions="actions" />
  </div>
</template>

<script setup>
import { getAll, saveItem } from '@/services/api';
import { useappState } from '@/stores/appState';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import DeletedItem from '../DeletedItem.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const appState = useappState();
const selectedUsers = ref([]);
const total = ref(0);
const users = ref([]);
const user = ref(null);
const loading = ref(false);
const itemsPerPage = ref(10);
const searchQuery = ref(''); // ref جديد لحقل البحث

const filters = ref({
  nickname: '',
  phone: '',
  status: '',
  created_at_from: '',
  created_at_to: '',
});

const options = ref({
  page: 1,
  sortBy: [],
  itemsPerPage: 10,
});
const canViewCompany = await userStore.can(['admin.super', 'admin.company']);

const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'اسم الشهره', key: 'nickname', align: 'start' },
  ...(canViewCompany ? [{ title: 'اسم الشركة', key: 'company_name', align: 'start' }] : []),
  { title: 'الهاتف', key: 'phone', align: 'start' },
  { title: 'الرصيد', key: 'balance', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'start' },
  { title: 'الإجراءات', key: 'action', sortable: false, align: 'center' },
]);

const deletedUsers = ref(null);

const editUser = ref(() => {
  router.push({ name: 'edit-user', params: { id: user.value.id } });
  colsContextMenu();
});

const deleteUser = ref(() => {
  if (selectedUsers.value.length) {
    deletedUsers.value = users.value.filter(user => selectedUsers.value.includes(user.id));
  } else {
    deletedUsers.value = [user.value];
  }
  appState.dialogDelete = true;
  colsContextMenu();
});

const viewUser = ref(() => {
  colsContextMenu();
});

const activeUser = ref(() => {
  const newStatus = user.value.status === '0' ? '1' : '0';
  saveItem('user', { status: newStatus }, user.value.id).then(() => {
    users.value.forEach(u => {
      if (u.id === user.value.id) {
        u.status = newStatus;
      }
    });
    colsContextMenu();
  });
});

const actions = ref([]);
const availableActions = ref([]);

watch(
  () => user.value,
  async newUser => {
    if (!newUser) return;

    const canUpdate = await userStore.can([
      'users.update_all',
      'users.update_children',
      'users.update_self',
      'users.create',
      'admin.super',
      'admin.company',
    ]);
    const canDelete = await userStore.can(['users.delete_all', 'users.delete_children', 'users.delete_self', 'admin.super', 'admin.company']);
    const canView = await userStore.can(['users.view_any', 'users.view_children', 'users.view_self', 'admin.super', 'admin.company']);
    availableActions.value = [
      !selectedUsers.value.length && canUpdate
        ? {
            title: Number(newUser?.status) === 1 ? 'تعطيل' : 'تفعيل',
            color: Number(newUser?.status) === 1 ? '#ffc107' : '#28a745',
            icon: Number(newUser?.status) === 1 ? 'ri-toggle-line' : 'ri-toggle-fill',
            callback: activeUser.value,
          }
        : null,
      !selectedUsers.value.length && canUpdate
        ? {
            title: 'تعديل',
            color: '#007bff',
            icon: 'ri-pencil-line',
            callback: editUser.value,
          }
        : null,
      canDelete
        ? {
            title: 'حذف',
            color: '#dc3545',
            icon: 'ri-delete-bin-line',
            callback: deleteUser.value,
          }
        : null,
      !selectedUsers.value.length && canView
        ? {
            title: 'عرض',
            color: '#17a2b8',
            icon: 'ri-eye-line',
            callback: viewUser.value,
          }
        : null,
    ].filter(Boolean);
  },
  { immediate: true }
);

watchEffect(() => {
  if (availableActions.value.length === 0) {
    actions.value = [
      {
        title: 'لا تملك إجراءات',
        color: '#6c757d',
        icon: 'ri-spam-3-line',
        callback: () => {},
      },
    ];
  } else {
    actions.value = availableActions.value;
  }
});

const removeDeletedItems = deletedIds => {
  users.value = users.value.filter(user => !deletedIds.includes(user.id));
  selectedUsers.value = [];
};

const contextMenu = ref(null);
const showContextMenu = (event, { item }) => {
  user.value = item;
  event.preventDefault();
  if (contextMenu.value) {
    contextMenu.value.showContextMenu(event);
  }
};

const colsContextMenu = () => {
  if (contextMenu.value) {
    contextMenu.value.colsContextMenu();
  } else {
    console.error('Context menu is not initialized.');
  }
};

// مراقبة حقل البحث لتأخير الطلب حتى كتابة 3 أحرف
watch(searchQuery, newVal => {
  if (newVal && newVal.length >= 3) {
    fetchUsers();
  } else if (newVal.length === 0) {
    fetchUsers();
  }
});

async function fetchUsers() {
  loading.value = true;
  const { page, itemsPerPage, sortBy } = options.value;
  const sortField = sortBy.length ? sortBy[0].key : 'id';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';
  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;
  try {
    const response = await getAll(
      'users/search',
      {
        page,
        per_page: perPage,
        sort_by: sortField,
        sort_order: sortOrder,
        ...filters.value,
        search: searchQuery.value.length >= 3 ? searchQuery.value : '',
      },
      false,
      false,
      false
    );
    users.value = response.data;
    total.value = response.total;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
}

function getRowProps({ item, index }) {
  return {
    class: item.status === 'active' ? 'active-row' : 'inactive-row',
    'data-index': index,
  };
}

onMounted(() => {
  // fetchUsers(); // لا تستدعي fetchUsers هنا مباشرة، بل ستتم المزامنة عبر watchEffect للخيارات
});
</script>
<style>
.active-row {
  background-color: transparent;
}

.inactive-row {
  background-color: #ff00003c;
}
</style>
