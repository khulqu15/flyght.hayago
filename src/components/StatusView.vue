<template>
    <div class="bg-base-200 rounded-xl p-4">
        <div class="">
            <div role="tablist" class="tabs bg-base-300 tabs-boxed w-full overflow-x-auto">
                <a class="capitalize tab" @click="selectedMenu = item" :class="{' bg-blue-700 text-white': item == selectedMenu}" role="tab" v-for="(item, index) in menus" :key="index">{{ item }}</a>
            </div>
        </div>
        <div class="w-full" v-if="selectedMenu == 'quick'"><QuickView/></div>
        <div class="w-full" v-if="selectedMenu == 'gauges'"><GaugesView/></div>
        <div class="w-full" v-if="selectedMenu == 'action'"><ActionView/></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import GaugesView from './utils/GaugesView.vue'
import QuickView from './utils/QuickView.vue'
import ActionView from './utils/ActionView.vue'

export default defineComponent({
    components: { GaugesView, QuickView, ActionView },
    setup() {
        const selectedMenu = ref('quick')
        const menus = ref(['quick', 'gauges', 'action', 'status', 'actuator', 'sensor', 'logs', 'scripts', 'messages'])
        return { selectedMenu, menus }
    }
})
</script>