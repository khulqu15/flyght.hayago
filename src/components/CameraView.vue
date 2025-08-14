<template>
    <div class="bg-black/30 rounded-xl min-h-[35vh] flex items-center justify-center p-4">
        <div class="text-center">
            <Icon icon="fluent:camera-off-16-regular" class="inline-block mb-3 opacity-40" width="32" height="32" />
            <h1>Camera Not Found</h1>
            <p class="opacity-40 text-xs">Plug camera and activate</p>
            <button class="btn btn-sm mt-3">Reload</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Icon } from '@iconify/vue'

export default defineComponent({
    components: {
        Icon
    },
    setup() {
        
    }
})
</script>