<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        ref="vBtnd"
        v-bind="props"
        density="compact"
        variant="text"
        color="#0086CD"
        :icon="`ri-more-2-fill`"
      ></v-btn>
      <pre>{{ props }}</pre>
    </template>
    <v-list>
      <v-list-item @click="editUser">
        <v-list-item-title>تعديل المستخدم</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteUser">
        <v-list-item-title>مسح المستخدم</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { defineExpose, defineProps, ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
  },
})

// الوصول إلى القائمة باستخدام ref
// const menu = ref(null)
const vBtnd = ref(null)

// تعريف دالة openMenu للتصدير
function openMenu() {
  if (vBtnd) {
    console.log(' vBtn.value', vBtnd.value)
  }
}
defineExpose({ openMenu })

// منطق تعديل ومسح المستخدم
const editUser = () => {
  console.log('تعديل المستخدم:', props.user)
}

const deleteUser = () => {
  console.log('مسح المستخدم:', props.user)
}
</script>
