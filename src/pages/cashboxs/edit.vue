<script setup>
import { getOne, saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const userStore = useUserStore();
const image = ref(null);
const imagePreview = ref(null);
const generateImagePreview = () => {
  console.log(image.value);

  if (image.value && image.value.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(image.value);
  } else {
    imagePreview.value = null;
  }
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
  if (image.value) {
    company.value.logo = image.value;
  }
  saveItem('company', company.value, route.params.id).then(res => {
    userStore.fetchUser();
    router.go(-1);
  });
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
                    <div v-if="imagePreview">
                      <v-img :src="imagePreview" class="mb-2" aspect-ratio="1" cover></v-img>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <!-- إدخال الملف -->
                    <v-file-input
                      v-model="image"
                      label="اختر شعار"
                      prepend-icon="ri-image-add-fill"
                      accept="image/*"
                      chips
                      placeholder="اختر شعار للشركة"
                      @change="generateImagePreview"
                    ></v-file-input>
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
