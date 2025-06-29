<template>
    <AppLayout>
        <div class="w-full grid lg:grid-cols-1 grid-cols-1 p-8 gap-3">
            <ModelOrientationVue/>
        </div>
        <div class="grid grid-cols-3 gap-4 justify-center items-center p-6 justify-items-center">
            <ControlThrottleView @update="updateLeft" :auto-reset="true" />
            <div>
                <div class="form-control">
                  <label class="label cursor-pointer">
                    <span class="label-text">Arming</span>
                    <input type="checkbox" v-model="isArming" @input="setArming()" class="checkbox checkbox-primary" />
                  </label>
                </div>
                <div class="grid grid-cols-2 gap-4 text-center mt-4 px-6">
                    <div>
                        <p class="text-sm text-gray-400">Throttle X</p>
                        <h2 class="text-2xl font-bold">{{ throttleX }}</h2>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Throttle Y</p>
                        <h2 class="text-2xl font-bold">{{ throttleY }}</h2>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Throttle Z</p>
                        <h2 class="text-2xl font-bold">{{ throttleZ }}</h2>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Throttle Yaw</p>
                        <h2 class="text-2xl font-bold">{{ throttleYaw }}</h2>
                    </div>
                </div>
            </div>
            <ControlThrottleView @update="updateRight" :auto-reset="false" :initial="{ x: 0, y: 1 }"/>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import ModelOrientationVue from '@/components/ModelOrientation.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { ref as dbRef, onValue } from 'firebase/database'
import ControlThrottleView from '@/components/ControlThrottleView.vue'
import { onMounted, ref, watch } from 'vue'
import { set } from 'firebase/database'
import { database } from '@/firebase'

const throttleX = ref(1500)
const throttleY = ref(1500)
const throttleZ = ref(1000)
const throttleYaw = ref(1500)
const isArming = ref(false)

const scaleThrottle = (val: number) => {
  const scaled = 1500 + val * (val >= 0 ? 700 : 500)
  return Math.round(scaled)
}

const updateLeft = (value: { x: number; y: number }) => {
  throttleX.value = scaleThrottle(-value.x)
  throttleY.value = scaleThrottle(-value.y)
}

const updateRight = (value: { x: number; y: number }) => {
  throttleZ.value = scaleThrottle(-value.y)
  throttleYaw.value = scaleThrottle(-value.x)
}

watch(throttleX, (newVal) => {
  sendThrottle('x', newVal)
})

watch(throttleY, (newVal) => {
  sendThrottle('y', newVal)
})

watch(throttleZ, (newVal) => {
  sendThrottle('z', newVal)
})

watch(throttleYaw, (newVal) => {
  sendThrottle('yaw', newVal)
})

const sendThrottle = (axis: string, value: number) => {
    const pathRef = dbRef(database, `/throttle/${axis}`)
    set(pathRef, value)
        .then(() => console.log(`✅ Sent ${axis}: ${value}`))
        .catch(err => console.error(`❌ Failed to send ${axis}:`, err))
}

const setArming = () => {
  const pathRef = dbRef(database, '/throttle/is_arming')
  isArming.value = !isArming.value
  set(pathRef, isArming.value)
}

onMounted(() => {
  const pathRef = dbRef(database, `/throttle`)
  setArming()
  onValue(pathRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      throttleX.value = data.x || 1500
      throttleY.value = data.y || 1500
      throttleZ.value = data.z || 1000
      throttleYaw.value = data.yaw || 1500
    }
  })
})
</script>
