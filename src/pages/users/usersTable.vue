<script setup>
import ContextMenu from '@/components/ContextMenu.vue'
import axios from 'axios'
import { ref } from 'vue'
const selectedUsers = ref([])
const contextMenu = ref(null)
const openeMenu = ref(null)
const userAction = ref(null)

// الدوال الخاصة بالإجراءات
const editUser = ref(() => {
  console.log(userAction.value)

  console.log('تم تعديل المستخدم')
})

const deleteUser = ref(() => {
  console.log('تم حذف المستخدم')
})

const viewUser = ref(() => {
  console.log('تم عرض المستخدم')
})

const userActions = [
  { title: 'تعديل', color: '#28a745', icon: 'ri-pencil-line', callback: editUser.value },
  { title: 'حذف', color: '#dc3545', icon: 'ri-delete-bin-line', callback: deleteUser.value },
  { title: 'عرض', color: '#007bff', icon: 'ri-eye-line', callback: viewUser.value },
]

const showContextMenu = (event, { item }) => {
  event.preventDefault()
  if (selectedUsers.value.length) {
    console.log(selectedUsers.value.length)
    return
  }

  userAction.value = item
  if (contextMenu.value) {
    contextMenu.value.showContextMenu(event)
  } else {
    console.error('Context menu is not initialized.')
  }
}

const openMenu = () => {
  if (openeMenu.value) {
    openeMenu.value.colsContextMenu()
  } else {
    console.error('Context menu is not initialized.')
  }
}
const colsContextMenu = () => {
  if (contextMenu.value) {
    contextMenu.value.colsContextMenu()
  } else {
    console.error('Context menu is not initialized.')
  }
}

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json',
  },
})

const headers = ref([
  { title: '#', key: 'index', sortable: false },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'الهاتف', key: 'phone', align: 'start' },
  { title: 'الرصيد', key: 'balance', align: 'start' },
  { title: 'تاريخ الإنشاء', key: 'created_at', align: 'start' },
  { title: 'الإجراءات', key: 'action', sortable: false, align: 'center' },
])

const expanded = ref([])
const users = ref([])
const total = ref(0)
const loading = ref(false)
const itemsPerPage = ref(10)
const options = ref({
  page: 1,
  sortBy: [],
  itemsPerPage: 10,
})
function getRowProps({ item, index }) {
  // إضافة class بناءً على حالة الصف
  return {
    class: item.status === 'active' ? 'active-row' : 'inactive-row',
    'data-index': index,
  }
}
const filters = ref({
  name: '',
  email: '',
  status: 'active',
  created_at_from: '',
  created_at_to: '',
})

async function fetchUsers() {
  loading.value = true
  const { page, itemsPerPage, sortBy } = options.value
  const sortField = sortBy.length ? sortBy[0].key : 'id'
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'asc'

  const perPage = itemsPerPage === -1 ? total.value : itemsPerPage

  try {
    const response = await apiClient.get('users', {
      params: {
        page,
        per_page: perPage,
        sort_by: sortField,
        sort_order: sortOrder,
        ...filters.value, // إضافة الفلاتر إلى الطلب
      },
    })
    users.value = response.data.data
    total.value = response.data.total
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

// Fetch users on component mount
fetchUsers()

const updateSelectedUsers = selected => {
  selectedUsers.value = selected
  console.log('المستخدمون المحددون:', selected)
}
</script>
<template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>بحث متقدم</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <!-- Search by Name -->
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-text-field
                label=" بحث بالاسم "
                v-model="filters.name"
                @input=";(filters.name.length > 3 || filters.name.length === 0) && fetchUsers()"
              ></v-text-field>
            </v-col>

            <!-- Search by Email -->
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-text-field
                v-model="filters.email"
                label="بحث بالايميل"
                @input=";(filters.email.length > 3 || filters.email.length === 0) && fetchUsers()"
              ></v-text-field>
            </v-col>
            <!-- Search by phone -->
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-text-field
                v-model="filters.phone"
                label="بحث بالهاتف"
                @input=";(filters.phone.length > 3 || filters.phone.length === 0) && fetchUsers()"
              ></v-text-field>
            </v-col>

            <!-- Status Select -->
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-select
                v-model="filters.status"
                :items="[
                  { text: 'فعال', value: 'active' },
                  { text: 'غير فعال', value: 'inactive' },
                ]"
                item-title="text"
                item-value="value"
                label="الحالة"
                @input="fetchUsers"
              />
            </v-col>

            <!-- Created At Range -->
            <v-col cols="12">
              <v-row>
                <!-- Created At From -->
                <v-col
                  label="hhhhh"
                  cols="12"
                  sm="6"
                >
                  <label
                    style="display: inline-block; margin: 20px"
                    for="created_at_from"
                  >
                    من تاريخ
                  </label>
                  <input
                    style="border: 1px blue solid; border-radius: 6px; padding: 5px"
                    type="date"
                    v-model="filters.created_at_from"
                    id="created_at_from"
                  />
                </v-col>

                <!-- Created At To -->
                <v-col
                  cols="12"
                  sm="6"
                >
                  <label
                    style="display: inline-block; margin: 20px"
                    for="created_at_to"
                    >الي تاريخ</label
                  >
                  <input
                    style="border: 1px blue solid; border-radius: 6px; padding: 5px"
                    type="date"
                    v-model="filters.created_at_to"
                    id="created_at_to"
                  />
                </v-col>
              </v-row>
            </v-col>

            <!-- Fetch Button -->
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-btn
                density="compact"
                variant="text"
                color="#0086CD"
                @click="fetchUsers"
              >
                جلب الفتره
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
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
    <div>{{ selectedUsers }}</div>
    <v-data-table-server
      style="position: relative"
      id="dataTable"
      item-value="id"
      v-model:selected="selectedUsers"
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
      show-select
      item-selectable
      loading-text=" جاري تحمل البيانات "
      no-data-text=" لا توجد بيانات "
      items-per-page-text="عدد الصفوف في الصفحة"
      @update:selected="updateSelectedUsers"
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
    <ContextMenu
      ref="contextMenu"
      :actions="userActions"
    />
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
