<template>
    <AppLayout>
        <div class="w-full grid lg:grid-cols-1 grid-cols-1 p-8 gap-3">
            <ModelOrientationVue/>
        </div>
        <div class="px-6">
          <div class="tabs tabs-boxed w-full">
            <a class="tab w-full" :class="{ 'bg-blue-700 text-white': selectTab === 'Control' }" @click="selectTab = 'Control'">Control</a>
            <a class="tab w-full" :class="{ 'bg-blue-700 text-white': selectTab === 'Tuning' }" @click="selectTab = 'Tuning'">Tuning</a>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 justify-center items-center p-6 justify-items-center" v-if="selectTab == 'Control'">
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
        <div v-if="selectTab == 'Tuning'" class="p-6">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h1 class="mb-4 font-bold">State Feedback Control LQR Based on PID</h1>
          <div class="flex items-center gap-2">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Duration Takeoff (detik)</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="durationTakeoff"
                @keyup="setDurationTakeoff()"
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Duration Hovering (detik)</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="durationHovering"
                @keyup="setDurationHovering()"
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Duration Landing (detik)</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="durationLanding"
                @keyup="setDurationLanding()"
              />
            </label>
          </div>
        </div>

        <div class="mb-7 flex">
          <button v-if="!isArming" @click="setDisarmDrone()" class="btn btn-error">Force Disarm</button>
          <button v-if="isArming" @click="setArmingDrone()" class="btn btn-primary ml-2">Enable Arm</button>
          <span>Status: {{ isArming ? 'Disarm' : 'Arm' }}</span>
        </div>

        <div v-for="axis in ['Roll', 'Pitch', 'Yaw']" :key="axis">
          <h4 class="text-sm font-semibold">{{ axis }} Feedback</h4>
          <div class="grid lg:grid-cols-3 grid-cols-1 gap-4 justify-center items-center p-3">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">KP</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="gain[axis.toLowerCase()].kp"
                @keyup="updateGain(axis.toLowerCase())"
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">KI</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="gain[axis.toLowerCase()].ki"
                @keyup="updateGain(axis.toLowerCase())"
              />
            </label>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">KD</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model.number="gain[axis.toLowerCase()].kd"
                @keyup="updateGain(axis.toLowerCase())"
              />
            </label>
          </div>
        </div>
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
const selectTab = ref('Control')
const durationTakeoff = ref(10)
const durationLanding = ref(10)
const durationHovering = ref(10)

const scaleThrottle = (val: number) => {
  const scaled = 1500 + val * (val >= 0 ? 700 : 500)
  return Math.round(scaled)
}

const gain: any = ref({
  roll: { kp: 0, ki: 0, kd: 0 },
  pitch: { kp: 0, ki: 0, kd: 0 },
  yaw: { kp: 0, ki: 0, kd: 0 }
})

const setDurationTakeoff = () => {
  const pathRef = dbRef(database, '/duration/takeoff')
  set(pathRef, durationTakeoff.value * 1000)
    .then(() => console.log(`✅ Duration set to: ${durationTakeoff.value}`))
    .catch(err => console.error('❌ Failed to set duration:', err))
}

const setDurationHovering = () => {
  const pathRef = dbRef(database, '/duration/hovering')
  set(pathRef, durationHovering.value * 1000)
    .then(() => console.log(`✅ Duration set to: ${durationHovering.value}`))
    .catch(err => console.error('❌ Failed to set duration:', err))
}


const setDurationLanding = () => {
  const pathRef = dbRef(database, '/duration/landing')
  set(pathRef, durationLanding.value * 1000)
    .then(() => console.log(`✅ Duration set to: ${durationLanding.value}`))
    .catch(err => console.error('❌ Failed to set duration:', err))
}

const setDisarmDrone = () => {
  isArming.value = true
  const pathRef = dbRef(database, '/drone/force_landing')
  set(pathRef, isArming.value)
    .then(() => console.log('✅ Disarm command sent'))
    .catch(err => console.error('❌ Failed to send disarm command:', err))
}

const setArmingDrone = () => {
  isArming.value = false
  const pathRef = dbRef(database, '/drone/force_landing')
  set(pathRef, isArming.value)
    .then(() => console.log('✅ Arm command sent'))
    .catch(err => console.error('❌ Failed to send arm command:', err))
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

const updateGain = (axis: string) => {
  const pathRef = dbRef(database, `/gain/${axis}`)
  set(pathRef, gain.value[axis])
    .then(() => console.log(`✅ Updated ${axis} gain:`, gain.value[axis]))
    .catch(err => console.error(`❌ Failed to update ${axis} gain:`, err))
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

  onValue(dbRef(database, '/drone/force_landing'), (snapshot) => {
    const data = snapshot.val()
    isArming.value = data
  })

  const gainRef = dbRef(database, `/gain`)
  onValue(gainRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      gain.value.roll.kp  = data.roll?.kp ?? 0
      gain.value.roll.ki  = data.roll?.ki ?? 0
      gain.value.roll.kd  = data.roll?.kd ?? 0

      gain.value.pitch.kp = data.pitch?.kp ?? 0
      gain.value.pitch.ki = data.pitch?.ki ?? 0
      gain.value.pitch.kd = data.pitch?.kd ?? 0

      gain.value.yaw.kp   = data.yaw?.kp ?? 0
      gain.value.yaw.ki   = data.yaw?.ki ?? 0
      gain.value.yaw.kd   = data.yaw?.kd ?? 0

      console.log("✅ Gain loaded:", gain.value)
    }
  })

  onValue(dbRef(database, '/duration/takeoff'), (snapshot) => {
    durationTakeoff.value = Math.round((snapshot.val() || 10) / 1000)
    console.log("✅ Duration Takeoff loaded:", durationTakeoff.value)
  })
  onValue(dbRef(database, '/duration/landing'), (snapshot) => {
    durationLanding.value = Math.round((snapshot.val() || 10) / 1000)
    console.log("✅ Duration Landing loaded:", durationLanding.value)
  })

  onValue(dbRef(database, '/duration/hovering'), (snapshot) => {
    durationHovering.value = Math.round((snapshot.val() || 10) / 1000)
    console.log("✅ Duration Hovering loaded:", durationHovering.value)
  })
})

</script>
