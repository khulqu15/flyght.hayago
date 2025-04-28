<template>
    <div class="grid md:grid-cols-4 grid-cols-1 p-3">
        <div class="p-4" v-for="(item, index) in gaugesData" :key="index">
            <p class="text-xs mb-2">{{ item.name }}</p>
            <h1 class="text-2xl font-bold">{{ item.value.toFixed(2) }} <sub class="font-normal" v-if="item.unit">{{ item.unit }}</sub></h1>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        const gaugesData = ref([
            { name: 'Speed', value: 0.00, unit: 'm/s' },
            { name: 'VSI', value: 0.00, unit: 'm/s' },
            { name: 'Alt', value: 0.00, unit: 'm' },
            { name: 'Heading', value: 0.00, unit: '°' },
            { name: 'Flight', value: 0.00, unit: 's' },
            { name: 'GNSS', value: 0.00, unit: null },
            { name: 'Wind Speed', value: 0.00, unit: 'm/s' },
            { name: 'Baro', value: 0.00, unit: 'hPa' },
        ])
        return { gaugesData }
    },
})
</script>
