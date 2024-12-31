<template>
  <v-container>
    <v-card>
      {{ date }}
    </v-card>

    <v-row justify="space-around">
      <v-date-picker
        v-model="date"
        landscape
        :title="titleDate || 'اختر التاريخ'"
      >
      </v-date-picker>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref } from 'vue'
// import { useDate } from 'vuetify'

const date = ref()
const titleDate = ref(null)
// const adapter = useDate()
</script>
