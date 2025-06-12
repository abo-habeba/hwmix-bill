<script setup>
import { ref, watch, toRefs } from 'vue';
import { VTextField, VIcon, VTooltip } from 'vuetify/components';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const props = defineProps({
  label: { type: String, default: 'رقم الهاتف' },
  placeholder: { type: String, default: 'أدخل رقم الهاتف' },
  rules: { type: Array, default: () => [] },
  counter: { type: Number, default: 15 },
  initialPhoneNumber: { type: String, default: '' },
});
const emit = defineEmits(['update:phoneNumber']);

const { initialPhoneNumber } = toRefs(props);
const phoneNumber = ref(initialPhoneNumber.value);

// Emit on change
watch(phoneNumber, val => {
  emit('update:phoneNumber', val);
});
// Watch for parent update
watch(initialPhoneNumber, val => {
  if (val !== phoneNumber.value) phoneNumber.value = val;
});

// Contact Picker
import { ref as vueRef } from 'vue';
const showNumbersDialog = vueRef(false);
const contactNumbers = vueRef([]);
const contactName = vueRef('');

async function pickContact() {
  if (!('contacts' in navigator) || !('select' in navigator.contacts)) {
    toast.error('جهازك لا يدعم اختيار جهات الاتصال');
    return;
  }
  try {
    const props = ['tel', 'name'];
    const opts = { multiple: false };
    const contacts = await navigator.contacts.select(props, opts);
    if (contacts && contacts.length && contacts[0].tel && contacts[0].tel.length) {
      if (contacts[0].tel.length === 1) {
        phoneNumber.value = contacts[0].tel[0];
        // لا تعرض إشعار نجاح هنا
      } else {
        contactNumbers.value = contacts[0].tel;
        contactName.value = contacts[0].name ? contacts[0].name[0] : '';
        showNumbersDialog.value = true;
      }
    } else {
      toast.error('لم يتم العثور على رقم هاتف في جهة الاتصال');
    }
  } catch (e) {
    toast.error('تم إلغاء اختيار جهة الاتصال أو حدث خطأ');
  }
}

function selectNumberFromDialog(number) {
  phoneNumber.value = number;
  showNumbersDialog.value = false;
}

const isContactSupported =
  typeof window !== 'undefined' &&
  'contacts' in navigator &&
  typeof navigator.contacts.select === 'function';
</script>

<template>
  <div class="phone-input-wrapper">
    <VTextField
      v-model="phoneNumber"
      :label="label"
      :placeholder="placeholder"
      :rules="rules"
      :counter="counter"
      type="number"
      class="phone-input"
      clearable
      @click:prepend-inner="pickContact"
      :prepend-inner-icon-cb="() => {}"
    >
      <template #prepend-inner>
        <VTooltip location="top">
          <template #activator="{ props: tooltipProps }">
            <VIcon
              v-bind="tooltipProps"
              class="contact-picker-icon"
              :color="isContactSupported ? 'primary' : 'grey'"
              size="24"
              :style="isContactSupported ? 'cursor:pointer;' : 'cursor:not-allowed; opacity:0.5;'"
              @click.stop="isContactSupported && pickContact()"
              tabindex="0"
              @keydown.enter.prevent="isContactSupported && pickContact()"
              :aria-disabled="!isContactSupported"
            >
              ri-contacts-book-2-line
            </VIcon>
          </template>
          <span v-if="isContactSupported">اختيار من جهات الاتصال</span>
          <span v-else>جهازك لا يدعم اختيار جهات الاتصال</span>
        </VTooltip>
      </template>
    </VTextField>
    <!-- Dialog لاختيار رقم من عدة أرقام -->
    <v-dialog v-model="showNumbersDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">اختر رقم الهاتف <span v-if="contactName">({{ contactName }})</span></v-card-title>
        <v-divider></v-divider>
        <v-list>
          <v-list-item v-for="(num, idx) in contactNumbers" :key="idx" @click="selectNumberFromDialog(num)" style="cursor:pointer">
            <v-list-item-title>{{ num }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showNumbersDialog = false">إلغاء</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.phone-input-wrapper {
  display: flex;
  align-items: center;
}
.phone-input {
  flex: 1;
}
.contact-picker-icon {
  transition: color 0.2s;
}
.contact-picker-icon:hover,
.contact-picker-icon:focus {
  color: #ff9800;
}
</style>
