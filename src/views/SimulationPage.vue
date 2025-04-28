<template>
    <AppLayout>
        <div class="absolute p-2 top-20 left-4 bg-base-200 rounded-xl z-10">
            <details class="dropdown">
                <summary class="btn m-1 btn-sm bg-base-300">
                    <span v-if="selectedSimulation == '3d'" class="flex items-center gap-2"><Icon icon="iconamoon:3d" width="24" height="24" /> 3D Simulation</span>
                    <span v-if="selectedSimulation == 'waypoint'" class="flex items-center gap-2"><Icon icon="lucide:waypoints" width="24" height="24" /> Waypoint</span>
                </summary>
                <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    <li><a @click="selectedSimulation = '3d'"><Icon icon="iconamoon:3d" width="24" height="24"/> 3D Simulation</a></li>
                    <li><a @click="selectedSimulation = 'waypoint'"><Icon icon="lucide:waypoints" width="24" height="24"/> Waypoint</a></li>
                </ul>
            </details>
        </div>
        <div v-if="selectedSimulation == '3d'" class="h-full w-full relative">
            <ModelSimulationVue/>
        </div>
    </AppLayout>
</template>
  
<script setup lang="ts">
import ModelSimulationVue from '@/components/ModelSimulation.vue';
import AppLayout from '@/layouts/AppLayout.vue'
import { Icon } from '@iconify/vue'
import { ref } from 'vue';

const selectedSimulation = ref('3d')

</script>
