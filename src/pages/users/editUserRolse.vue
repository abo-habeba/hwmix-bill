<script setup>
import { saveItem } from '@/services/api';
import { ref, watch, defineProps } from 'vue';
import { useDisplay } from 'vuetify';
const { xs } = useDisplay();
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  roles: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['update:user']);
const roles = ref(props.roles);
const dialogRolesEdit = ref(false);
const selectedRoles = ref([]);
watch(
  () => props.user.roles,
  newRoles => {
    selectedRoles.value = newRoles ? newRoles.map(role => role.name) : [];
  },
  { immediate: true }
);

function assignRole() {
  const rolesAndId = {
    user_id: props.user.id,
    roles: selectedRoles.value,
  };
  console.log(rolesAndId);
  // return;
  saveItem('assignRole', rolesAndId)
    .then(data => {
      console.log(data);
      emit('update:user', data);
      dialogRolesEdit.value = false;
    })
    .catch(e => {
      console.log(e);
    });
}
</script>
<template>
  <v-btn
    class="ma-4 text-center btn-add"
    density="compact"
    variant="flat"
    style="background-color: #28a745 !important; color: white; z-index: 10"
    prepend-icon="ri-pencil-line"
    @click="dialogRolesEdit = true"
  >
    تعديل الادوار
  </v-btn>
  <v-dialog :fullscreen="xs" v-model="dialogRolesEdit" max-width="900">
    <v-card class="pa-4">
      <v-card-title class="text-subtitle-1 py-1 px-4 bg-grey-lighten-4">تعديل ادوار المستخدم </v-card-title>
      <v-row class="mb-10" v-if="roles">
        <v-col cols="12">
          <v-card-text class="elevation-5 pa-10">
            <v-row v-if="user.roles">
              <v-col class="pa-0" cols="12" xs="6" sm="6" md="4" lg="3" v-for="(role, i) in roles" :key="i">
                <v-checkbox
                  v-model="selectedRoles"
                  :label="role.name"
                  :value="role.name"
                  density="comfortable"
                  color="primary"
                  class="permission-checkbox"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
      <v-card-actions style="position: fixed; bottom: 35px; left: 50%; transform: translate(-50%, 50%); min-width: 200px" class="pa-4 ma-auto">
        <v-btn append-icon="ri-close-line" style="background-color: #dc3545; color: white !important" variant="text" @click="dialogRolesEdit = false">
          إلغاء
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn append-icon="ri-save-line" style="background-color: #007bff; color: white !important" @click="assignRole"> حفظ </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
