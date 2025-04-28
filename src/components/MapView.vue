<template>
    <div class="col-span-2">
        <div id="map" class="w-full min-h-[45.5vh] h-full rounded-2xl"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import L from 'leaflet'

export default defineComponent({
  setup() {
    onMounted(() => {
        setTimeout(() => {
            const map = L.map('map').setView([-7.276331, 112.793840], 17)
        
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            }).addTo(map)

            L.marker([-7.276331, 112.793840])
                .addTo(map)
                .bindPopup('Kantor Hayago')
                .openPopup()

            const customIcon = L.icon({
                iconUrl: 'https://hayago.id/logo.png',
                iconSize: [20, 20],
            })

            L.marker([-7.276717, 112.794976], {icon: customIcon})
                .addTo(map)
                .bindPopup('Drone Hayago')

            console.log(map)
            setTimeout(() => {
                map?.invalidateSize()
            }, 300)
        }, 200);
    })

    return { }
  }
})
</script>
