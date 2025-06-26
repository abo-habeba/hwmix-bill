<template>
  <!-- Data Table Server -->
  <DeletedItem @update-items="removeDeletedItems" api="company/delete"
    :dataDelete="{ items: deletedCompanys, key: 'name' }" />
  <div id="dataTable" style="position: relative !important; white-space: nowrap">
    <v-data-table-server item-value="id" v-model:items-per-page="itemsPerPage" v-model:options="options"
      :headers="headers" :items="companys" :items-length="total" :loading="loading" hover show-current-page
      :row-props="getRowProps" loading-text=" جاري تحمل البيانات " no-data-text=" لا توجد بيانات "
      items-per-page-text="عدد الصفوف في الصفحة" @update:options="fetchCompanys" @contextmenu:row="showContextMenu"
      @click="colsContextMenu">
      <template #item.imageLogo="{ item }">
        <!-- <v-avatar> -->
        <img class="mt-2" width="100" height="50" :src="item.logo" alt="Avatar" />
        <!-- </v-avatar> -->
      </template>
    </v-data-table-server>
    <ContextMenu ref="contextMenu" :actions="actions" />
  </div>
</template>

<script setup>
import { getAll } from '@/services/api';
import { useappState } from '@/stores/appState';
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
const router = useRouter();
const appState = useappState();
const total = ref(0);
const companys = ref([]);
const company = ref(null);
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
  { title: '#', key: 'id', align: 'center' },
  { title: 'الشعار', key: 'imageLogo', align: 'center' },
  { title: 'الاسم', key: 'name', align: 'center' },
  { title: 'رقم الهاتف', key: 'phone', align: 'center' },
  { title: 'المجال', key: 'field', align: 'center' },
  { title: 'الوصف', key: 'description', align: 'center' },
]);
onMounted(() => {
  fetchCompanys();
});
const deletedCompanys = ref(null);
const editcompany = ref(() => {
  router.push({ name: 'edit-company', params: { id: company.value.id } });
  colsContextMenu();
});
const deletecompany = ref(() => {
  deletedCompanys.value = [company.value];
  appState.dialogDelete = true;
  colsContextMenu();
});
const viewcompany = ref(() => {
  colsContextMenu();
});

const actions = ref([]);
const availableActions = ref([]);

const removeDeletedItems = deletedIds => {
  companys.value = companys.value.filter(company => !deletedIds.includes(company.id));
  userStore.fetchUser();
};

watch(
  () => company.value,
  async newUser => {
    if (!newUser) return;

    const canUpdate = await userStore.can([
      'companies.update_any',
      'companies.update_children',
      'companies.update_self',
      'companies.create',
      'admin.super',
      'admin.company',
    ]);
    const canDelete = await userStore.can([
      'companies.delete_any',
      'companies.delete_children',
      'companies.delete_self',
      'admin.super',
      'admin.company',
    ]);
    availableActions.value = [
      canUpdate
        ? {
          title: 'تعديل',
          color: '#007bff',
          icon: 'ri-pencil-line',
          callback: editcompany.value,
        }
        : null,
      canDelete
        ? {
          title: 'حذف',
          color: '#dc3545',
          icon: 'ri-delete-bin-line',
          callback: deletecompany.value,
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

const contextMenu = ref(null);
const showContextMenu = (event, { item }) => {
  company.value = item;
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
async function fetchCompanys() {
  const { page, itemsPerPage, sortBy } = options.value;
  const sortField = sortBy.length ? sortBy[0].key : 'id';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'desc';
  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage;
  try {
    const response = await getAll('companys', {
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_order: sortOrder,
      ...filters.value,
    });
    companys.value = response.data;
    total.value = response.total;
  } catch (error) {
    console.error('Error fetching company:', error);
  } finally {
    loading.value = false;
  }
}
function getRowProps({ item, index }) {
  return {
    class: index % 2 !== 0 ? 'active-row' : '',
    'data-index': index,
  };
}
</script>
<style>
.active-row {
  background-color: #f6f7fb;
}
</style>
