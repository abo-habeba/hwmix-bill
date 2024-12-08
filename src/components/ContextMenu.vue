<template>
  <v-list
    id="menuAction"
    class="pa-0"
    style="position: absolute; background-color: #ededf3"
    v-show="contextMenuVisible"
    :position-x="menuPosition.x"
    :position-y="menuPosition.y"
  >
    <v-list-item
      v-for="action in actions"
      :style="{ color: action.color }"
      :key="action.title"
      :prepend-icon="action.icon"
      :title="action.title"
      @click="handleAction(action)"
    >
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineExpose, defineProps, ref } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    required: true,
  },
})

// تنفيذ الإجراء عند اختيار عنصر
const handleAction = action => {
  if (typeof action.callback === 'function') {
    action.callback() // تنفيذ الدالة المرتبطة
  }
}
const contextMenuVisible = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const openContextMenu = () => {
  contextMenuVisible.value = true
}
const colsContextMenu = () => {
  contextMenuVisible.value = false
}

function showContextMenu(event) {
  event.preventDefault() // منع القائمة السياقية الافتراضية
  console.log('run showContextMenu in ContextMenu')

  const mousePageX = event.pageX - 60
  const mousePageY = event.pageY - 80

  const menuAction = document.getElementById('menuAction')
  const dataTable = document.getElementById('dataTable')

  const menuWidth = 150 // عرض القائمة
  const menuHeight = 95 // ارتفاع القائمة

  // عرض الجدول وحدوده
  const tableRect = dataTable.getBoundingClientRect()

  // تحديد المواضع الأولية للقائمة بناءً على موضع الماوس
  let menuActionLeft = mousePageX
  let menuActionTop = mousePageY

  // التحقق إذا كانت القائمة ستخرج عن حدود الجدول أفقيًا
  if (mousePageX + menuWidth > tableRect.right) {
    menuActionLeft = tableRect.right - menuWidth - 10 // ضبط القائمة لتبقى داخل الجدول
  } else if (mousePageX < tableRect.left) {
    menuActionLeft = tableRect.left + 10 // تأكد من عدم الخروج عن الحافة اليسرى
  }

  // التحقق إذا كانت القائمة ستخرج عن حدود الجدول عموديًا
  if (mousePageY + menuHeight > tableRect.bottom) {
    menuActionTop = tableRect.bottom - menuHeight - 10 // ضبط القائمة لتبقى داخل الجدول
  } else if (mousePageY < tableRect.top) {
    menuActionTop = tableRect.top + 10 // تأكد من عدم الخروج عن الحافة العليا
  }

  // تطبيق المواضع على القائمة
  menuAction.style.left = `${menuActionLeft}px`
  menuAction.style.top = `${menuActionTop}px`

  // إظهار القائمة
  contextMenuVisible.value = true
}
defineExpose({ showContextMenu, colsContextMenu, openContextMenu })
</script>
<style scoped lang="scss">
.v-list {
  border: 1px #c6b5d3 solid;
  border-radius: 4px;
  user-select: none;
  .v-list-item {
    border-bottom: 1px #c6b5d3 solid;
    &:hover {
      background-color: #d6c1e0;
    }
  }
}
</style>
