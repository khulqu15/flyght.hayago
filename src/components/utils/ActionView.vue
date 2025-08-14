<template>
    <div>
        <div class="flex items-center justify-start gap-3 p-2 flex-nowrap">
            <div>
                <select class="select select-bordered select-sm">
                    <option value="loiter" selected>Loiter</option>
                    <option value="auto">Auto</option>
                    <option value="acro">Acro</option>
                    <option value="guided">Guided</option>
                    <option value="rtl">RTL</option>
                    <option value="rth">RTH</option>
                </select>
            </div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Action</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Auto</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Home</button></div>
            <div>
                <input type="number" class="input input-bordered input-sm w-20" value="100">
            </div>
            <div><button class="btn bg-blue-500 btn-sm text-white">Send</button></div>
        </div>

        <div class="flex items-center justify-start gap-3 p-2 flex-nowrap">
            <div>
                <select class="select select-bordered select-sm">
                    <option value="loiter" selected>Home</option>
                    <option value="auto">Waypoint</option>
                    <option value="acro">Target</option>
                </select>
            </div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">SetWP</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Guided</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Restart</button></div>
            <div>
                <input type="number" class="input input-bordered input-sm w-20" value="100">
            </div>
            <div><button class="btn bg-blue-500 btn-sm text-white">Send</button></div>
        </div>

        <div class="flex items-center justify-start gap-3 p-2 flex-nowrap">
            <div>
                <select class="select select-bordered select-sm">
                    <option value="loiter" selected>Auto</option>
                    <option value="auto">Manual</option>
                </select>
            </div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">SetMode</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">RTL</button></div>
            <div><button class="btn bg-blue-500/10 btn-sm text-blue-600">Raw Sensor</button></div>
            <div>
                <input type="number" class="input input-bordered input-sm w-20" value="100">
            </div>
            <div><button class="btn bg-blue-500 btn-sm text-white">Send</button></div>
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
