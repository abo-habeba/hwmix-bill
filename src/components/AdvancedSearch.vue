<template>
  <v-expansion-panels class="pb-3">
    <v-expansion-panel>
      <v-expansion-panel-title>بحث متقدم</v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-form @submit.prevent="applyFilters">
          <v-row>
            <v-col v-for="(field, index) in fields" :key="index" cols="6" sm="3" md="1.5">
              <template v-if="field.type === 'input'">
                <v-text-field v-model="modelValue[field.name]" :label="field.label" />
              </template>
              <template v-else-if="field.type === 'select'">
                <v-select v-model="modelValue[field.name]" :items="field.items" :label="field.label" />
              </template>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col cols="6">
                  <v-btn type="submit" color="primary">تطبيق</v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn @click="clearFilters" color="secondary">إعادة تعيين</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
defineModel('modelValue', { type: Object, default: () => ({}) });
defineProps(['fields']);
</script>
