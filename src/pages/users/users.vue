<script setup>
import usersTable from '@/pages/users/usersTable.vue'
import { ref } from 'vue'
const items = ref({})
// onMounted(() => {
//   console.log('user')
//   getAll('users').then(res => {
//     console.log(res.data)
//     items.value = res.data
//   })
// })
</script>
<template>
  <VCol cols="12">
    <VCard title="المستخدمين">
      <usersTable />
    </VCard>
  </VCol>
</template>
