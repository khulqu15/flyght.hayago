<template>
  <div
    class="analog relative rounded-full bg-[#1e293b] w-48 h-48 touch-none select-none flex items-center justify-center"
    ref="joystick"
    @touchstart.prevent="start"
    @touchmove.prevent="move"
    @touchend="end"
    @mousedown.prevent="startMouse"
  >
    <div
      class="thumb absolute w-12 h-12 rounded-full bg-blue-500"
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { database } from '@/firebase';
import { onValue, ref as dbRef } from 'firebase/database';
import { ref, defineEmits, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'update', value: { x: number; y: number }): void
}>()
const props = defineProps<{ 
  autoReset?: boolean
  initial?: { x: number; y: number }
}>()

const position = ref({ x: 0, y: 0 })
const origin = ref({ x: 0, y: 0 })
const maxRadius = 72
const dragging = ref(false)
const joystick = ref<HTMLElement | null>(null)

onMounted(() => {
  if (props.initial) {
    position.value.x = props.initial.x * maxRadius
    position.value.y = props.initial.y * maxRadius
    emit('update', props.initial)
  }

  const throttleRef = dbRef(database, '/throttle')

  onValue(throttleRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) return

    // Cek apakah ini joystick kiri (X/Y) atau kanan (Z/Yaw)
    if (props.autoReset !== false) {
      // kiri: x dan y
      if ('x' in data && 'y' in data) {
        position.value.x = Math.max(-1, Math.min(1, (data.x - 1500) / 700)) * maxRadius
        position.value.y = Math.max(-1, Math.min(1, (data.y - 1500) / 700)) * maxRadius
      }
    } else {
      // kanan: z dan yaw
      if ('z' in data && 'yaw' in data) {
        position.value.x = Math.max(-1, Math.min(1, (data.yaw - 1500) / 700)) * maxRadius
        position.value.y = Math.max(-1, Math.min(1, (data.z - 1500) / 700)) * maxRadius
      }
    }
  })
})

const start = (e: TouchEvent) => {
  dragging.value = true
}

const move = (e: TouchEvent) => {
  if (!dragging.value) return
  const touch = e.touches[0]
  updatePosition(touch.clientX, touch.clientY)
}

const end = () => {
  dragging.value = false
  console.log(props.autoReset)
  if (props.autoReset !== false) {
    position.value = { x: 0, y: 0 }
    emit('update', { x: 0, y: 0 })
  } else {
    emit('update', {
      x: +(position.value.x / maxRadius).toFixed(2),
      y: +(position.value.y / maxRadius).toFixed(2),
    })
  }
}

const startMouse = (e: MouseEvent) => {
  dragging.value = true
  const moveMouse = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY)
  const upMouse = () => {
    dragging.value = false
    if (props.autoReset !== false) {
        position.value = { x: 0, y: 0 }
        emit('update', { x: 0, y: 0 })
    } else {
        emit('update', {
        x: +(position.value.x / maxRadius).toFixed(2),
        y: +(position.value.y / maxRadius).toFixed(2),
        })
    }
    window.removeEventListener('mousemove', moveMouse)
    window.removeEventListener('mouseup', upMouse)
    }
  window.addEventListener('mousemove', moveMouse)
  window.addEventListener('mouseup', upMouse)
}

const updatePosition = (clientX: number, clientY: number) => {
  const rect = joystick.value!.getBoundingClientRect()
  const dx = clientX - rect.left - rect.width / 2
  const dy = clientY - rect.top - rect.height / 2
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  if (distance > maxRadius) {
    position.value.x = maxRadius * Math.cos(angle)
    position.value.y = maxRadius * Math.sin(angle)
  } else {
    position.value.x = dx
    position.value.y = dy
  }

  emit('update', {
    x: +(position.value.x / maxRadius).toFixed(2),
    y: +(position.value.y / maxRadius).toFixed(2),
  })
}


</script>
