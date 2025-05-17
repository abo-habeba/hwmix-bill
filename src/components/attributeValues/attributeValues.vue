<template>
  <h1>attributeValues component</h1>
</template>

<script>
import { toast } from 'vue3-toastify';

export default {
  name: 'attributeValues',
  setup() {
    const attributeValue = ref({ name: '' });

    function saveAttributeValue() {
      if (!attributeValue.value.name) {
        toast.error('اسم قيمة الخاصية مطلوب');
        return;
      }
      saveItem('attribute-value', attributeValue.value, false, true, true)
        .then(() => {
          toast.success('تم حفظ قيمة الخاصية بنجاح');
        })
        .catch(() => toast.error('حدث خطأ أثناء حفظ قيمة الخاصية'));
    }

    function deleteAttributeValue(id) {
      deleteOne('attribute-value', id)
        .then(() => {
          toast.success('تم حذف قيمة الخاصية بنجاح');
        })
        .catch(() => toast.error('حدث خطأ أثناء حذف قيمة الخاصية'));
    }

    return {
      attributeValue,
      saveAttributeValue,
      deleteAttributeValue,
    };
  },
};
</script>
