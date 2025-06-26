<template>
  <!-- Data Table Server -->
  <v-container id="dataTable" style="position: relative !important">
    <v-data-table-server style="white-space: nowrap" item-value="id" v-model:items-per-page="itemsPerPage"
      v-model:options="options" :headers="headers" :items="users" :items-length="total" :loading="loading" hover
      show-current-page :row-props="getRowProps" v-model="selectedUsers" loading-text=" جاري تحمل البيانات "
      no-data-text=" لا توجد بيانات " items-per-page-text="عدد الصفوف في الصفحة" @update:options="fetchUsers"
      @contextmenu:row="showContextMenu" @click:row="operationDialog">
      <!-- عمود التسلسل -->
      <template #item.index="{ index }">
        {{ index + 1 }}
      </template>

      <!-- عمود الإجراءات -->
      <template #item.action="{ item }">
        <v-btn density="compact" variant="text" color="#0086CD" prepend-icon="ri-more-2-fill"
          @click.stop="event => showContextMenu(event, { item })">
        </v-btn>
      </template>
    </v-data-table-server>
    <TransactionDialog ref="transactionDialog" :transaction="transaction" />
    <ContextMenu ref="contextMenu" :actions="actions" />
  </v-container>
</template>

<script setup>
import { getAll, saveItem } from '@/services/api';
import { useappState } from '@/stores/appState';
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import TransactionDialog from './TransactionDialog.vue';

const userStore = useUserStore();
const router = useRouter();
const appState = useappState();
const selectedUsers = ref([]);
const total = ref(0);
const users = ref([]);
const user = ref(null);
const transaction = ref(null);
const loading = ref(false);
const itemsPerPage = ref(10);
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

const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'نوع العملية', key: 'type', align: 'start' },
  { title: 'المبلغ', key: 'amount', align: 'start' },
  { title: 'التاريخ', key: 'created_at', align: 'center' },
  { title: ' الوصف', key: 'description', sortable: false, align: 'center' },
]);
onMounted(() => {
  fetchUsers();
});
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
// import { ref, computed, watchEffect } from 'vue';

const actions = ref([]);
const availableActions = ref([]);

watch(
  () => user.value,
  async newUser => {
    if (!newUser) return;

    const canUpdate = await userStore.can([
      'users.update_any',
      'users.update_children',
      'users.update_self',
      'users.create',
      'admin.super',
      'admin.company',
    ]);
    const canDelete = await userStore.can(['users.delete_any', 'users.delete_children', 'users.delete_self', 'admin.super', 'admin.company']);
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
        callback: () => { },
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
const transactionDialog = ref(null);
const operationDialog = (event, { item }) => {
  const Item = item;
  // const clickedItem = event.item || event;
  // console.log(clickedItem);
  console.log(Item);
  transaction.value = item;
  event.preventDefault();
  if (transactionDialog.value) {
    transactionDialog.value.operationDialog();
  }
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
async function fetchUsers() {
  const { page, itemsPerPage, sortBy } = options.value;
  const sortField = sortBy.length ? sortBy[0].key : 'id';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';
  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;
  try {
    const response = await getAll('/transactions/user', {
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_order: sortOrder,
      ...filters.value,
    });
    users.value = response.data;
    console.log(response.data);

    total.value = response.total;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
}
function getRowProps({ item, index }) {
  return {
    class: item.status === '1' ? 'active-row' : 'inactive-row',
    'data-index': index,
  };
}
defineExpose({ fetchUsers });
</script>
<style>
.active-row {
  background-color: transparent;
}

/* .inactive-row {
  background-color: #ff00003c;
} */
</style>
