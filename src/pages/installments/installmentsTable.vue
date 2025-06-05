<script setup>
import { useappState } from '@/stores/appState';
import axios from 'axios';
import { ref } from 'vue';
const appState = useappState();
const expanded = ref([]);
const users = ref([]);
const total = ref(0);
const loading = ref(false);
const itemsPerPage = ref(10);

const selectedUsers = ref([]);
const contextMenu = ref(null);
const userAction = ref(null);
// الدوال الخاصة بالإجراءات
const editUser = ref(() => {
  colsContextMenu();
});

const deletedUsers = ref(null);

const deleteUser = ref(() => {
  deletedUsers.value = users.value.filter(user => selectedUsers.value.includes(user.id));
  appState.appState = true;
  colsContextMenu();
});

const viewUser = ref(() => {
  colsContextMenu();
});

const userActions = ref([
  { title: 'تعديل', color: '#28a745', icon: 'ri-pencil-line', callback: editUser.value },
  { title: 'حذف', color: '#dc3545', icon: 'ri-delete-bin-line', callback: deleteUser.value },
  { title: 'عرض', color: '#007bff', icon: 'ri-eye-line', callback: viewUser.value },
]);

const showContextMenu = (event, { item }) => {
  event.preventDefault();
  if (selectedUsers.value.length) {
    userActions.value = [{ title: 'حذف', color: '#dc3545', icon: 'ri-delete-bin-line', callback: deleteUser.value }];
    // deleteUser.value
    contextMenu.value.showContextMenu(event);
    return;
  }
  userAction.value = item;
  if (contextMenu.value) {
    contextMenu.value.showContextMenu(event);
  } else {
    console.error('Context menu is not initialized.');
  }
};

const colsContextMenu = () => {
  if (contextMenu.value) {
    contextMenu.value.colsContextMenu();
  } else {
    console.error('Context menu is not initialized.');
  }
};

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json',
  },
});

const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'الهاتف', key: 'phone', align: 'start' },
  { title: 'الرصيد', key: 'balance', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'start' },
  { title: 'الإجراءات', key: 'action', sortable: false, align: 'center' },
]);

const options = ref({
  page: 1,
  sortBy: [],
  itemsPerPage: 10,
});
function getRowProps({ item, index }) {
  // إضافة class بناءً على حالة الصف
  return {
    class: item.status === 'active' ? 'active-row' : 'inactive-row',
    'data-index': index,
  };
}

const filters = ref({
  name: '',
  email: '',
  status: 'active',
  created_at_from: '',
  created_at_to: '',
});

async function fetchUsers() {
  loading.value = true;
  const { page, itemsPerPage, sortBy } = options.value;
  const sortField = sortBy.length ? sortBy[0].key : 'id';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';

  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;

  try {
    const response = await apiClient.get('users', {
      params: {
        page,
        per_page: perPage,
        sort_by: sortField,
        sort_order: sortOrder,
        ...filters.value, // إضافة الفلاتر إلى الطلب
      },
    });
    users.value = response.data.data;
    total.value = response.data.total;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
}

// Fetch users on component mount
fetchUsers();

const updateSelectedUsers = selected => {
  selectedUsers.value = selected;
};
</script>
<template>
  <v-container>
    <DeletedItem :dataDelete="{ items: deletedUsers, key: 'name' }" />
    <!-- Advanced Search -->
    <AdvancedSearch
      :fields="[
        { name: 'nickname', type: 'input', label: ' اسم الشهرة ' },
        { name: 'status', type: 'select', label: 'الحالة', items: ['نشط', 'غير نشط'] },
        { name: 'role', type: 'select', label: 'الدور', items: ['مشرف', 'مستخدم', 'زائر'] },
      ]"
    />

    <!-- Delete User -->
    <v-btn
      v-if="selectedUsers.length"
      class="text-center my-2 mx-10"
      density="compact"
      variant="flat"
      style="background-color: #dc3545 !important; color: white"
      prepend-icon="ri-delete-bin-line"
      @click="deleteUser"
    >
      حذف عدد {{ selectedUsers.length }} من العناصر
    </v-btn>
    <!-- Data Table Server -->
    <div id="dataTable" style="position: relative !important">
      <v-data-table-server
        item-value="id"
        v-model:items-per-page="itemsPerPage"
        v-model:options="options"
        v-model:expanded="expanded"
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
        @update="updateSelectedUsers({ item })"
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
          <v-btn
            density="compact"
            variant="text"
            color="#0086CD"
            prepend-icon="ri-more-2-fill"
            @click.stop="event => showContextMenu(event, { item })"
          >
          </v-btn>
        </template>

        <!-- الصف الموسع -->
        <template #expanded-row="{ item, columns }">
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
        </template>
      </v-data-table-server>
      <ContextMenu ref="contextMenu" :actions="userActions" />
    </div>
  </v-container>
</template>

<style>
.active-row {
  background-color: transparent; /* لون خلفية للصف النشط */
}
.inactive-row {
  background-color: #f65a69; /* لون خلفية للصف غير النشط */
}
</style>
