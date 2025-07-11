<script setup>
import { getOne, saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { toast } from 'vue3-toastify';
const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const userStore = useUserStore();
const image = ref(null);
const imagePreview = ref(null);
const generateImagePreview = () => {
  if (image.value && image.value.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.value = e.target.result; // تعيين رابط المعاينة
    };
    reader.readAsDataURL(image.value); // قراءة الملف وتحويله إلى Base64
  } else {
    imagePreview.value = null; // إعادة التعيين إذا لم يكن الملف صورة
  }
};

import ImagePickerDialog from '@/components/images/ImagePickerDialog.vue';
const showImageDialog = ref(false);
const selectedImageIds = ref([]);
const onImagesSelected = ids => {
  selectedImageIds.value = ids;
  console.log(selectedImageIds.value);
  company.value.logo = ids;
};

//companies
const company = ref({});

onMounted(() => {
  if (route.params.id) {
    loading.value = true;
    getOne('company', userId.value, true)
      .then(res => {
        company.value = res;
        console.log(' company.value.logo', res.logo);
        imagePreview.value = res.logo;
        console.log('imagePreview', imagePreview);
      })
      .finally(e => {
        loading.value = false;
      });
  }
});
function sendData() {
  const payload = { ...company.value };
  payload.images_ids = selectedImageIds.value; // إرسال الصورة فقط إذا تم اختيار صورة جديدة
  delete payload.logo; // حذف المفتاح إذا لم يتم اختيار صورة جديدة

  saveItem('company', payload, route.params.id)
    .then(res => {
      userStore.fetchUser();

      router.go(-1);
    })
    .catch(error => {
      console.error('Error saving company:', error);
      toast.error('حدث خطأ أثناء حفظ الشركة');
    });
}
function saveCompany() {
  if (!company.value.name) {
    toast.error('اسم الشركة مطلوب');
    return;
  }
  saveItem('company', company.value, route.params.id)
    .then(() => {
      toast.success('تم حفظ الشركة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حفظ الشركة'));
}
function deleteCompany(id) {
  deleteOne('company', id)
    .then(() => {
      toast.success('تم حذف الشركة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف الشركة'));
}
function validateImage() {
  if (image.value) {
    const fileSizeInMB = image.value.size / (1024 * 1024);
    if (fileSizeInMB > 1) {
      toast.error('حجم الصورة يجب ألا يتعدى 1 ميجا بايت');
      image.value = null;
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(image.value);
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        toast.error('يفضل أن تكون أبعاد الصورة أكبر من 100x100 لتناسب أي شعار');
        image.value = null;
      }
    };
  }
}
</script>

<template>
  <v-card>
    <VRow>
      <VCol cols="12">
        <VCard elevation="0" :loading="loading" :title="route.params.id ? 'تعديل الشركة' : 'اضافة شركة'" class="ma-4">
          <VDivider />
          <VCardText>
            <!-- 👉 Form -->
            <VForm class="mt-6">
              <VRow>
                <!-- 👉  Name -->
                <VCol sm="6" md="4" cols="12">
                  <VTextField v-model="company.name" label=" اسم الشركة " />
                </VCol>

                <!-- 👉 field -->
                <VCol sm="6" md="4" cols="12">
                  <VTextField v-model="company.field" label=" التخصص  " />
                </VCol>

                <!-- 👉 Email -->
                <VCol cols="12" sm="6" md="4">
                  <VTextField required v-model="company.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                </VCol>
                <!-- 👉 Phone -->
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.phone" label=" رقم الهاتف " placeholder="0123456789" />
                </VCol>
                <!-- 👉 description -->
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.description" label=" وصف  " placeholder="نبذه عن الشركة ومجالها" />
                </VCol>
                <!-- 👉 address -->
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.address" label=" العنوان  " placeholder="عنوان الشركة" />
                </VCol>
                <!-- 👉 Image -->
                <VCol cols="12" sm="6" md="4">
                  <v-col cols="12" md="6">
                    <div v-if="company?.logo">
                      <v-img :src="company?.logo" class="mb-2" aspect-ratio="1" cover></v-img>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <!-- إدخال الملف -->
                    <ImagePickerDialog v-model="showImageDialog" @close="onImagesSelected" />
                  </v-col>
                </VCol>
                <!-- 👉 Form Actions -->
                <VCol cols="12" class="d-flex flex-wrap gap-4">
                  <VBtn @click="sendData"> حفظ </VBtn>
                  <!-- reset Form -->
                  <!-- <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="resetForm"> Reset </VBtn> -->
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </v-card>
</template>
<style scoped>
.image-preview {
  max-width: 100%;
  max-height: 300px;
  margin-top: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
