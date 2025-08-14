<template>
    <div class="grid md:grid-cols-3 grid-cols-1 p-3">
        <div class="p-4" v-for="(item, index) in quickData" :key="index">
            <p class="text-xs mb-2">{{ item.name }}</p>
            <h1 class="text-2xl font-bold">{{ item.value > 100 ? item.value.toFixed(2) : item.value}} <sub class="font-normal" v-if="item.unit">{{ item.unit }}</sub></h1>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        const quickData = ref([
            { name: 'Altitude', value: 0.00, unit: 'm' },
            { name: 'Dist to WP', value: 0.00, unit: 'm' },
            { name: 'Vertical Speed', value: 0.00, unit: 'mph' },
            { name: 'Dist to MAV', value: 0.00, unit: 'm' },
            { name: 'Yaw', value: 0.00, unit: '°' },
            { name: 'SK Radio', value: 110.00, unit: 'ssi' },
        ])
        return { quickData }
    },
})
</script>
