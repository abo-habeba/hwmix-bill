<template>
    <div class="d-flex align-center gap-4 pa-3 rounded-lg bg-grey-lighten-4">
        <v-icon :color="iconColor" size="24">
            {{ icon }}
        </v-icon>

        <div class="text-body-1 text-grey-darken-2 font-weight-medium">
            {{ label }}:
        </div>
        <div class="text-body-1 font-weight-bold text-truncate">
            {{ text || '-' }}
        </div>
    </div>
</template>

<script setup>
defineProps({
    icon: String,
    label: String,
    text: String,
    iconColor: {
        type: String,
        default: 'primary'
    }
})
</script>
