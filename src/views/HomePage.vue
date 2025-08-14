<template>
  <AppLayout>
    <div class="w-full grid lg:grid-cols-3 grid-cols-1 p-8 gap-3">
      <ModelOrientationVue/>
      <MapViewVue/>
    </div>
    <div class="w-full grid lg:grid-cols-2 grid-cols-1 px-8 gap-3 pb-12">
      <StatusViewVue/>
      <CameraViewVue/>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import CameraViewVue from '@/components/CameraView.vue'
import MapViewVue from '@/components/MapView.vue'
import ModelOrientationVue from '@/components/ModelOrientation.vue'
import StatusViewVue from '@/components/StatusView.vue'
import AppLayout from '@/layouts/AppLayout.vue'
</script>
