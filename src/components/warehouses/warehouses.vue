<template>
  <h1>warehouses component</h1>
</template>

<script>
import { toast } from 'vue3-toastify';

export default {
  name: 'warehouses',
  setup() {
    const warehouse = ref({});

    function saveWarehouseComponent() {
      if (!warehouse.value.name) {
        toast.error('اسم المخزن مطلوب');
        return;
      }
      saveItem('warehouse', warehouse.value, false, true, true)
        .then(() => {
          toast.success('تم حفظ المخزن بنجاح');
        })
        .catch(() => toast.error('حدث خطأ أثناء حفظ المخزن'));
    }

    function deleteWarehouseComponent(id) {
      deleteOne('warehouse', id)
        .then(() => {
          toast.success('تم حذف المخزن بنجاح');
        })
        .catch(() => toast.error('حدث خطأ أثناء حذف المخزن'));
    }

    return {
      warehouse,
      saveWarehouseComponent,
      deleteWarehouseComponent,
    };
  },
};
</script>
