<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <!-- تفاصيل الدور -->
      <v-card-title>
        <span> صلاحيات الدور {{ userRole.name }}</span>
      </v-card-title>
      <div v-if="userGroupPermissions">
        <div v-for="(group, index) in userGroupPermissions" :key="index">
          <hr style="width: 70%; margin: 10px" />
          <v-card-title>
            <span>{{ group.name }}</span>
          </v-card-title>

          <v-chip class="ma-1" v-for="(perm, index) in group.permissions" :key="index" color="blue" text-color="white">
            {{ perm.name }}
          </v-chip>
        </div>
      </div>
      <v-card-actions>
        <v-btn text @click="dialog = false">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { getLocalPermissions } from '@/@core/utils/permissions';
import { defineProps, ref, defineExpose, onMounted } from 'vue';

const props = defineProps({
  userRole: {
    type: Object,
    required: true,
  },
});
const userGroupPermissions = ref(null);
const rolePermissions = ref([]);
onMounted(() => {});
const dialog = ref(false);
function openDialog() {
  dialog.value = true;
}

watch(
  () => props.userRole,
  newRole => {
    if (newRole && newRole.permissions) {
      rolePermissions.value = newRole.permissions;
      userGroupPermissions.value = getLocalPermissions(rolePermissions.value);
    }
  },
  { immediate: true } // حتى يعمل عند التهيئة
);
defineExpose({ openDialog });
</script>
