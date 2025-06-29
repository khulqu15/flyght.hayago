<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="drawer">
            <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content flex flex-col min-h-screen bg-base-300 text-base-content">
                <div class="navbar bg-base-200 w-full">
                    <div class="flex-none lg:hidden">
                        <label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                    </div>
                    <div class="flex items-center w-full">
                        <img src="/logo.png" alt="FLYGHT" class="w-12 rounded-xl">
                        <div class="mx-2 flex items-center px-2 gap-2 w-full">
                            <h1 class="font-bold italic text-2xl">Engineering Physics</h1>
                            <p class="text-xs badge bg-blue-600 text-white">ITS</p>
                        </div>
                        <img src="/logo.svg" alt="FLYGHT" class="w-12">
                        <div class="mx-2 flex items-center px-2 gap-2 w-full">
                            <h1 class="font-bold italic text-2xl">FLYGHT</h1>
                            <p class="text-xs badge bg-blue-600 text-white">Hayago</p>
                        </div>
                    </div>
                    <div class="hidden flex-none lg:block">
                        <ul class="menu font-light menu-horizontal space-x-2">
                            <li><a class="btn btn-sm" @click="$router.replace('Home')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Home'}">Condition</a></li>
                            <li><a class="btn btn-sm" @click="$router.replace('Simulation')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Simulation'}">Simulation</a></li>
                            <li><a class="btn btn-sm" @click="$router.replace('Home')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Params'}">Params</a></li>
                            <li><a class="btn btn-sm" @click="$router.replace('Control')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Control'}">Control</a></li>
                        </ul>
                    </div>
                </div>
                <slot></slot>
            </div>
            <div class="drawer-side">
                <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul class="menu bg-base-200 min-h-full w-80 p-4">
                    <li><a @click="$router.replace('Home')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Home'}">Condition</a></li>
                    <li><a @click="$router.replace('Simulation')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Simulation'}">Simulation</a></li>
                    <li><a @click="$router.replace('Home')" :class="{'bg-blue-600 text-white hover:bg-blue-600': $route.name == 'Params'}">Params</a></li>
                </ul>
            </div>
            </div>
        </ion-content>
    </ion-page>
</template>
  
<script lang="ts">
import { IonContent, IonPage } from '@ionic/vue';

export default {
    components: { IonContent, IonPage },
    setup() {
        return {

        }
    }
}
</script>
  