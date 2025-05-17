<template>
  <v-data-table :headers="headers" :items="users" item-key="id" class="elevation-1" hide-default-footer density="compact">
    <template #no-data>
      <v-row class="pa-4">
        <v-col class="text-center text-grey"> لا توجد بيانات مستخدمين </v-col>
      </v-row>
    </template>

    <template #item.name="{ item }">
      {{ item.name }}
    </template>

    <template #item.email="{ item }">
      {{ item.email }}
    </template>

    <template #item.role="{ item }">
      {{ item.role }}
    </template>

    <template #item.status="{ item }">
      <v-chip :color="item.status === 'نشط' ? 'success' : 'error'" text-color="white" small>
        {{ item.status }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon color="primary" @click="editUser(item.id)">
        <v-icon>ri-pencil-line</v-icon>
      </v-btn>
      <v-btn icon color="error" @click="confirmDelete(item.id)">
        <v-icon>ri-delete-bin-line</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'UserDataTable',
  props: {
    users: {
      type: Array,
      required: true,
    },
    headers: {
      type: Array,
      required: true,
    },
  },
  methods: {
    editUser(id) {
      this.$emit('edit', id);
    },
    confirmDelete(id) {
      this.$emit('delete', id);
    },
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
