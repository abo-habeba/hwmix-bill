<template>
  <VCol cols="12" class="d-flex flex-wrap gap-4">
    <VBtn @click="dialog = true">{{ buttonText }}</VBtn>
  </VCol>
  <v-dialog v-model="dialog" max-width="900" scrollable persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center py-4 px-6 bg-blue-grey-lighten-5">
        <span class="text-h6 font-weight-bold text-blue-grey-darken-3">مكتبة الصور</span>
        <v-btn
          color="blue-grey-darken-2"
          variant="flat"
          rounded="pill"
          size="small"
          class="text-caption font-weight-bold"
          @click="triggerFileInput"
          :loading="uploading"
          :disabled="uploading"
        >
          <i class="ri-add-line mr-1"></i>
          إضافة صور من الجهاز
        </v-btn>
        <v-file-input
          ref="fileInputRef"
          v-model="newImages"
          multiple
          accept="image/*"
          class="d-none"
          @change="handleNewImagesSelected"
        ></v-file-input>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4 image-grid-container">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="d-flex justify-center align-center w-100"
          size="64"
          width="6"
        ></v-progress-circular>

        <v-row dense v-else-if="images.length > 0">
          <v-col v-for="image in images" :key="image.id" cols="6" sm="4" md="3" lg="2" class="pa-">
            <v-card
              outlined
              class="image-card d-flex flex-column"
              :class="{ 'selected-card': isSelected(image.id) }"
              @click="toggleSelection(image.id)"
              rounded="md"
              elevation="2"
            >
              <v-img :src="image.url" height="100" cover class="rounded-t-md"></v-img>
              <div class="d-flex justify-end pa-1">
                <v-checkbox :model-value="isSelected(image.id)" hide-details density="compact" class="ma-0 pa-0" color="primary" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div v-else class="d-flex flex-column justify-center align-center text-center text-grey-darken-1 flex-grow-1">
          <i class="ri-image-line text-h1 mb-4"></i>
          <p class="text-h6 font-weight-medium">لا توجد صور لعرضها بعد.</p>
          <p class="text-body-2">يمكنك البدء بإضافة صور جديدة إلى مكتبتك.</p>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="d-flex justify-end py-3 px-6 sticky-actions">
        <v-btn color="red-darken-1" variant="flat" rounded="pill" @click="deleteSelected" :disabled="!selected.length" class="mr-2">
          <i class="ri-delete-bin-line mr-1"></i>
          حذف
        </v-btn>
        <v-btn color="primary" variant="flat" rounded="pill" @click="confirmSelection" :disabled="!selected.length" class="mr-2">
          <i class="ri-check-line mr-1"></i>
          تعيين
        </v-btn>
        <v-btn color="grey-darken-1" variant="outlined" rounded="pill" @click="closeDialog">
          <i class="ri-close-line mr-1"></i>
          إلغاء
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAll, saveItem, deleteAll } from '@/services/api';

const props = defineProps({
  modelValue: Boolean,
  // بروبس للنص الظاهر على الزر
  buttonText: {
    type: String,
    default: 'اختيار صورة',
  },
  // بروبس لتحديد إذا كان الاختيار فردي أم متعدد
  multiple: {
    type: Boolean,
    default: false, // افتراضي: اختيار فردي
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

const dialog = ref(false);
const images = ref([]);
const selected = ref([]);
const newImages = ref([]);
const loading = ref(false);
const uploading = ref(false);
const fileInputRef = ref(null);
////////////////////////////
// الاستخدام
// <ImagePickerDialog v-model="showImageDialog" @close="onImagesSelected" />
// import ImagePickerDialog from '@/components/images/ImagePickerDialog.vue';
// const showImageDialog = ref(false);
// const selectedImageIds = ref([]);
// const onImagesSelected = ids => {
//   selectedImageIds.value = ids;
//   user.value.images_ids = ids;
// };
///////////////////////
onMounted(() => {
  loadImages();
});
// مزامنة فتح/غلق الدايلوج
watch(
  () => props.modelValue,
  val => {
    dialog.value = val;
    if (val) {
      loadImages();
      selected.value = []; // مسح التحديد عند فتح الدايلوج
    }
  }
);

// إغلاق الدايلوج الرئيسي
const closeDialog = () => {
  emit('update:modelValue', false);
  dialog.value = false;
  newImages.value = [];
};

// تأكيد التحديد وإغلاق الدايلوج
const confirmSelection = () => {
  // بناءً على وضع الاختيار (فردي/متعدد)
  const selectedResult = props.multiple ? selected.value : selected.value[0];
  emit('close', [selectedResult]);
  closeDialog();
};

// تحميل الصور من API
const loadImages = async () => {
  loading.value = true;
  try {
    const res = await getAll('images', { is_temp: 1 });
    images.value = res;
  } catch (error) {
    console.error('خطأ في تحميل الصور:', error);
  } finally {
    loading.value = false;
  }
};

// حذف الصور المحددة
const deleteSelected = async () => {
  if (!selected.value.length) return;
  try {
    await deleteAll('images/delete', { ids: selected.value });
    images.value = images.value.filter(image => !selected.value.includes(image.id));
    selected.value = [];
  } catch (error) {
    console.error('خطأ في حذف الصور:', error);
  }
};

// تشغيل النقر على مدخل الملفات المخفي
const triggerFileInput = () => {
  fileInputRef.value.$el.querySelector('input[type="file"]').click();
};

// معالجة اختيار الصور الجديدة وبدء الرفع
const handleNewImagesSelected = () => {
  if (newImages.value && newImages.value.length > 0) {
    uploadImages();
  }
};

// رفع الصور الجديدة
const uploadImages = async () => {
  if (!newImages.value.length) return;
  uploading.value = true;
  try {
    const response = await saveItem('image', { images: newImages.value });
    if (response && Array.isArray(response)) {
      images.value.unshift(...response);
    } else if (response) {
      images.value.unshift(response);
    }
    newImages.value = [];
  } catch (error) {
    console.error('خطأ في رفع الصور:', error);
  } finally {
    uploading.value = false;
  }
};

// التحقق مما إذا كانت الصورة محددة
const isSelected = imageId => {
  return selected.value.includes(imageId);
};

// تبديل تحديد الصورة بناءً على وضع الاختيار (فردي/متعدد)
const toggleSelection = imageId => {
  if (props.multiple) {
    const index = selected.value.indexOf(imageId);
    if (index > -1) {
      selected.value.splice(index, 1); // إلغاء التحديد
    } else {
      selected.value.push(imageId); // تحديد
    }
  } else {
    // وضع الاختيار الفردي
    selected.value = selected.value[0] === imageId ? [] : [imageId];
  }
};

onMounted(() => {});
</script>

<style scoped>
.image-grid-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.image-grid-container > .v-row {
  flex-grow: 1;
}

.sticky-actions {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
  border-top: 1px solid #eee;
}

.image-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-card.selected-card {
  border: 2px solid #1976d2;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.3);
}
</style>
