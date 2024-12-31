<template>
  <!-- Advanced Search -->
  <AdvancedSearch ref="advancedSearch" v-model="filters" :fields="fields" />
  <!-- Deleted Item -->

  <DeletedItem @update-users="removeDeletedUsers" api="users/delete" :dataDelete="{ items: deletedUsers, key: 'nickname' }" />
  <!-- Data Table Server -->
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
      <!-- عمود التسلسل -->
      <template #item.index="{ index }">
        {{ index + 1 }}
      </template>

      <!-- عمود الإجراءات -->
      <template #item.action="{ item }">
        <v-btn density="compact" variant="text" color="#0086CD" prepend-icon="ri-more-2-fill" @click.stop="event => showContextMenu(event, { item })">
        </v-btn>
      </template>

      <!-- الصف الموسع -->
      <!-- v-model:expanded="expanded" -->
      <!-- <template #expanded-row="{ item, columns }">
        <tr>
          <td :colspan="columns.length">
            <v-card>
              <v-card-title>تفاصيل المستخدم</v-card-title>
              <v-card-text>
                <div>اسم المستخدم: {{ item.username }}</div>
                <div>البريد الإلكتروني: {{ item.email }}</div>
                <div>الحالة: {{ item.status }}</div>
              </v-card-text>
            </v-card>
          </td>
        </tr>
      </template> -->
    </v-data-table-server>
    <ContextMenu ref="contextMenu" :actions="actions" />
  </div>
</template>

<script setup>
import { getAll, saveItem } from '@/services/api';
import { useappState } from '@/stores/appState';
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import AdvancedSearch from '../AdvancedSearch.vue';
import DeletedItem from '../DeletedItem.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
const router = useRouter();
const appState = useappState();
const selectedUsers = ref([]);
const total = ref(0);
const users = ref([]);
const user = ref(null);
const itemAction = ref(null);
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
const fields = ref([
  { name: 'nickname', type: 'input', label: ' اسم الشهرة ' },
  { name: 'phone', type: 'input', label: '  الهاتف ' },
]);
const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'اسم الشهره', key: 'nickname', align: 'start' },
  { title: 'الهاتف', key: 'phone', align: 'start' },
  { title: 'الرصيد', key: 'balance', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'start' },
  { title: 'الإجراءات', key: 'action', sortable: false, align: 'center' },
]);
onMounted(() => {
  fetchUsers();
});
const deletedUsers = ref(null);
const advancedSearch = ref(null);

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
  appState.appState = true;
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

    const canUpdate = await userStore.can(['users.update.self', 'users.update.own', 'users.update', 'super.admin', 'company.owner']);
    const canDelete = await userStore.can(['users.delete.self', 'users.delete.own', 'users.delete', 'super.admin', 'company.owner']);
    const canView = await userStore.can(['users.show.self', 'users.show.own', 'users.show', 'super.admin', 'company.owner']);
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

const removeDeletedUsers = deletedIds => {
  users.value = users.value.filter(user => !deletedIds.includes(user.id));
  selectedUsers.value = [];
};
const contextMenu = ref(null);
const showContextMenu = (event, { item }) => {
  user.value = item;
  console.log('user.value', user.value);
  console.log('availableActions.value', availableActions.value);

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
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'asc';
  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;
  try {
    const response = await getAll('users', {
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_order: sortOrder,
      ...filters.value,
    });
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
    class: item.status === '1' ? 'active-row' : 'inactive-row',
    'data-index': index,
  };
}
</script>
<style>
.active-row {
  background-color: transparent;
}
.inactive-row {
  background-color: #ff00003c;
}
</style>
