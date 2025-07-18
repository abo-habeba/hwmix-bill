<template>
  <v-autocomplete
    v-model="selectedUser"
    v-model:search="userSearchText"
    :items="users"
    :item-title="userTitle"
    item-value="id"
    :filter="() => true"
    label="ابحث عن عميل"
    prepend-inner-icon="ri-user-line"
    :rules="[v => !!v || 'حقل العميل مطلوب']"
    @update:search="onUserSearch"
    @update:model-value="onUserSelect"
    :loading="isLoadingUsers"
    :no-data-text="userNoDataText"
    clearable
    required
    return-object
    no-filter
    hide-details="auto"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getAll } from '@/services/api';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: Object,
});
const userSearchText = ref('');
const users = ref([]);
const isLoadingUsers = ref(false);
const selectedUser = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

function userTitle(item) {
  if (!item) return '';
  const _name = item.full_name || 'بدون اسم';
  const _nickname = item.nickname ? `(${item.nickname})` : '';
  const _phone = item.phone ? `📞 ${item.phone}` : 'بدون هاتف';
  const _id = item.id ? `كود ${item.id}` : '';
  return `${_name} ${_nickname} ${_phone} ${_id}`.replace(/\s+/g, ' ').trim();
}

const userNoDataText = computed(() => {
  if (!userSearchText.value || userSearchText.value.length < 3) {
    return 'أدخل 3 أحرف على الأقل';
  }
  return isLoadingUsers.value ? 'جاري البحث...' : 'لم يتم العثور على عميل';
});

let userSearchTimeout = null;
function onUserSearch(val) {
  // 💡 إضافة الشرط لمنع البحث عند تحديد قيمة تتطابق مع العنصر المحدد
  if (selectedUser.value && val === userTitle(selectedUser.value)) {
    return;
  }

  if (!val || val.length < 3) {
    // يمكن هنا مسح قائمة المستخدمين إذا كان نص البحث أقل من 3 أحرف
    // users.value = [];
    return;
  }

  if (userSearchTimeout) clearTimeout(userSearchTimeout);
  userSearchTimeout = setTimeout(() => {
    fetchUsers(val);
  }, 400);
}

async function fetchUsers(search = '') {
  isLoadingUsers.value = true;
  try {
    const res = await getAll('users/search', { search, limit: 10 }, false, false, false);
    users.value = res.data || [];
  } catch (error) {
    users.value = [];
  } finally {
    isLoadingUsers.value = false;
  }
}

// 💡 دالة جديدة لمعالجة حدث التحديد (update:model-value)
function onUserSelect(val) {
  // قم بتحديث userSearchText ليتطابق مع عنوان المستخدم المحدد
  // هذا يمنع onUserSearch من تشغيل بحث جديد لاحقاً إذا كان النص يتطابق
  if (val && typeof val === 'object' && val.id) {
    userSearchText.value = userTitle(val);
  }
  emit('update:modelValue', val);
}

// يمكن إزالة هذا الـ watch لأنه لا يضيف قيمة حقيقية مع الـ computed property
/*
watch(
  () => props.modelValue,
  val => {
    selectedUser.value = val;
  }
);
*/
</script>
