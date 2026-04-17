<template>
    <div class="relative">
        <div ref="container" class="w-full h-screen"></div>
        <div class="absolute bottom-4 right-4 z-20 w-[420px] h-[260px] bg-black/40 p-2 rounded">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <select v-model="selectedController" class="absolute top-4 left-4 p-2 bg-black text-white z-50" >
            <option value="GA">Genetic Algorithm</option>
            <option value="PSO">Particle Swarm Optimization</option>
            <option value="GNN">Graph Neural Network</option>
        </select>
    </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
)
const container = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let clock = new THREE.Clock()

let drone: THREE.Object3D | null = null
let propellers: THREE.Object3D[] = []
const vibrationEnergyBuffer: number[] = []   // ❗ NON reactive
const vibrationEnergy: any = ref<number[]>([])    // hanya untuk chart
const angVel = {
    roll: 0,
    pitch: 0,
    yaw: 0
}
let gaTimer = 0

let lastChartUpdate = 0
const CHART_UPDATE_INTERVAL = 0.1
const A = 0.25                 // amplitudo
const zeta = 0.08              // underdamped (<1)
const omega = 18               // HIGH frequency
const omegaD = omega * Math.sqrt(1 - zeta ** 2)
const vibAmpRoll = 0.08
const vibAmpPitch = 0.1
const vibAmpYaw = 0.06
const reference = {
    roll: 0,
    pitch: 0,
    yaw: 0
}
const delayedError = {
    roll: 0,
    pitch: 0,
    yaw: 0
}
const ERROR_DELAY = 6   // frame delay
const errorQueue: any[] = []
const rollBuffer: number[] = []
const pitchBuffer: number[] = []
const yawBuffer: number[] = []
const gnnState = {
    roll: 0,
    pitch: 0,
    yaw: 0
}

const gnnVel = {
    roll: 0,
    pitch: 0,
    yaw: 0
}

const prevError = {
    roll: 0,
    pitch: 0,
    yaw: 0
}

const VIB_AMP = {
    roll: 0.015,
    pitch: 0.02,
    yaw: 0.01,
}

const VIB_FREQ = {
    roll: 28,
    pitch: 32,
    yaw: 24,
}

const VIB_PHASE = {
    roll: 0,
    pitch: Math.PI / 2,
    yaw: Math.PI / 3,
}
let basePosition = new THREE.Vector3()
let baseRotation = new THREE.Euler()

const vibFreqRoll = 22
const vibFreqPitch = 26
const vibFreqYaw = 20
const PROP_RPM = 1200

const chartData = computed(() => ({
    labels: vibrationEnergy.value.map((_, i) => i),
    datasets: [
        {
            label: 'Roll',
            data: vibrationEnergy.value.map(v => v.roll),
            borderColor: '#ff4d4d',
            borderWidth: 2,
            pointRadius: 0
        },
        {
            label: 'Pitch',
            data: vibrationEnergy.value.map(v => v.pitch),
            borderColor: '#4dff4d',
            borderWidth: 2,
            pointRadius: 0
        },
        {
            label: 'Yaw',
            data: vibrationEnergy.value.map(v => v.yaw),
            borderColor: '#4dd2ff',
            borderWidth: 2,
            pointRadius: 0
        }
    ]
}))



const chartOptions = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#fff' }
        }
    },
    scales: {
        x: { ticks: { color: '#ccc' } },
        y: { ticks: { color: '#ccc' } }
    }
}


type ControllerType = 'GA' | 'PSO' | 'GNN'
const selectedController = ref<ControllerType>('GA')

const controllerGain = ref({
    roll: 0.3,
    pitch: 0.3,
    yaw: 0.3
})


function optimizeGA(error: number[], dt: number) {
    gaTimer += dt
    if (gaTimer > 0.5) { // update lambat
        controllerGain.value = {
            roll: 0.1 + Math.random() * 0.6,
            pitch: 0.1 + Math.random() * 0.6,
            yaw: 0.1 + Math.random() * 0.6
        }
        gaTimer = 0
    }
}

function optimizePSO(error: number[]) {
    const inertia = 0.92
    controllerGain.value.roll  = inertia * controllerGain.value.roll  + 0.05 * Math.abs(error[0])
    controllerGain.value.pitch = inertia * controllerGain.value.pitch + 0.05 * Math.abs(error[1])
    controllerGain.value.yaw   = inertia * controllerGain.value.yaw   + 0.05 * Math.abs(error[2])
    controllerGain.value.roll  = Math.min(controllerGain.value.roll, 0.8)
    controllerGain.value.pitch = Math.min(controllerGain.value.pitch, 0.8)
    controllerGain.value.yaw   = Math.min(controllerGain.value.yaw, 0.8)
}

function optimizeGNN(error: number[]) {
    const [rollErr, pitchErr, yawErr] = error

    const alpha = 0.25   // state smoothing
    const beta  = 0.6    // damping
    const gamma = 0.15   // graph coupling

    const rollMsg  = rollErr  + gamma * (pitchErr + yawErr)
    const pitchMsg = pitchErr + gamma * (rollErr + yawErr)
    const yawMsg   = yawErr   + gamma * (rollErr + pitchErr)

    gnnState.roll  += alpha * (rollMsg  - gnnState.roll)
    gnnState.pitch += alpha * (pitchMsg - gnnState.pitch)
    gnnState.yaw   += alpha * (yawMsg   - gnnState.yaw)

    gnnVel.roll  = rollErr  - prevError.roll
    gnnVel.pitch = pitchErr - prevError.pitch
    gnnVel.yaw   = yawErr   - prevError.yaw

    controllerGain.value.roll  = THREE.MathUtils.clamp(
        0.35 + Math.abs(gnnState.roll)  - beta * Math.abs(gnnVel.roll),
        0.05, 0.7
    )

    controllerGain.value.pitch = THREE.MathUtils.clamp(
        0.35 + Math.abs(gnnState.pitch) - beta * Math.abs(gnnVel.pitch),
        0.05, 0.7
    )

    controllerGain.value.yaw   = THREE.MathUtils.clamp(
        0.35 + Math.abs(gnnState.yaw)   - beta * Math.abs(gnnVel.yaw),
        0.05, 0.7
    )

    prevError.roll  = rollErr
    prevError.pitch = pitchErr
    prevError.yaw   = yawErr
}


const loadDroneModel = async (boxPosition?: THREE.Vector3): Promise<{ model: THREE.Object3D; propellers: THREE.Object3D[] }> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        loader.setDRACOLoader(dracoLoader)
        loader.load('/3d/drone_without_prop.glb', (gltf) => {
            const drone = gltf.scene
            drone.scale.set(3, 3, 3)
            if (boxPosition) {
                drone.position.set(
                    boxPosition.x,
                    boxPosition.y + 1,
                    boxPosition.z
                )
            }
            scene.add(drone)
            basePosition.copy(drone.position)
            baseRotation.copy(drone.rotation)
            loader.load('/3d/prop.glb', (propGltf) => {
                const prop = propGltf.scene
                drone.add(prop)
                let propellerParts: THREE.Object3D[] = []
                prop.traverse((child) => {
                    if (child instanceof THREE.Mesh) propellerParts.push(child)
                })
                const propPositions = [
                    [0.28, 0.05, 0],
                    [0, 0.05, -0.28],
                    [0, 0.05, 0.28],
                    [-0.28, 0.05, 0],
                ]
                propellerParts.forEach((part, index) => {
                    const [x, y, z] = propPositions[index]
                    part.position.set(x, y, z)
                })
                resolve({ model: drone, propellers: propellerParts })
            })
        })
    })
}

const animate = () => {
    requestAnimationFrame(animate)

    const dt = clock.getDelta()
    const t = clock.getElapsedTime()

    if (drone) {
        const disturbance = {
            roll: 0.3 * Math.sin(38 * t),
            pitch: 0.2 * Math.sin(42 * t + 1.2),
            yaw: 0.12 * Math.sin(34 * t + 0.7),
        }
        const state = {
            roll: drone.rotation.z,
            pitch: drone.rotation.x,
            yaw: drone.rotation.y
        }

        const error = {
            roll: reference.roll - state.roll,
            pitch: reference.pitch - state.pitch,
            yaw: reference.yaw - state.yaw
        }
        errorQueue.push({ ...error })
        if (errorQueue.length > ERROR_DELAY) {
            const e = errorQueue.shift()
            delayedError.roll = e.roll
            delayedError.pitch = e.pitch
            delayedError.yaw = e.yaw
        }

        const usedError =
            selectedController.value === 'GNN'
                ? error
                : delayedError

        if (selectedController.value === 'GA')
            optimizeGA([usedError.roll, usedError.pitch, usedError.yaw], t)

        if (selectedController.value === 'PSO')
            optimizePSO([usedError.roll, usedError.pitch, usedError.yaw])

        if (selectedController.value === 'GNN')
            optimizeGNN([error.roll, error.pitch, error.yaw])

        const saturate = (u: number) => {
            if (Math.abs(u) < 0.025) return 0
            return THREE.MathUtils.clamp(u, -0.45, 0.45)
        }

        let control = {
            roll: saturate(controllerGain.value.roll * usedError.roll),
            pitch: saturate(controllerGain.value.pitch * usedError.pitch),
            yaw: saturate(controllerGain.value.yaw * usedError.yaw)
        }

        if (selectedController.value === 'GNN') {
            control.roll  -= 0.9 * angVel.roll
            control.pitch -= 0.9 * angVel.pitch
            control.yaw   -= 0.9 * angVel.yaw
        }

        const inertia = { roll: 1.3, pitch: 1.5, yaw: 1.1 }
        const damping = 0.08   // intentionally low

        angVel.roll  += (control.roll  + disturbance.roll  - damping * angVel.roll)  / inertia.roll  * dt
        angVel.pitch += (control.pitch + disturbance.pitch - damping * angVel.pitch) / inertia.pitch * dt
        angVel.yaw   += (control.yaw   + disturbance.yaw   - damping * angVel.yaw)   / inertia.yaw   * dt

        drone.rotation.z += angVel.roll  * dt
        drone.rotation.x += angVel.pitch * dt
        drone.rotation.y += angVel.yaw   * dt

        if (t - lastChartUpdate > CHART_UPDATE_INTERVAL) {
            rollBuffer.push(error.roll)
            pitchBuffer.push(error.pitch)
            yawBuffer.push(error.yaw)

            if (rollBuffer.length > 120) {
                rollBuffer.shift()
                pitchBuffer.shift()
                yawBuffer.shift()
            }

            vibrationEnergy.value = rollBuffer.map((_, i) => ({
                roll: rollBuffer[i],
                pitch: pitchBuffer[i],
                yaw: yawBuffer[i]
            }))

            lastChartUpdate = t
        }
    }

    /* =======================
     * 10. PROPELLER ROTATION
     * ======================= */
    propellers.forEach((prop) => {
        prop.rotation.y += (PROP_RPM / 60) * Math.PI * 2 * dt
    })

    renderer.render(scene, camera)
}



onMounted(async () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b0f1a)
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    )
    camera.position.set(2, 2, 4)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.value?.appendChild(renderer.domElement)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)
    const result = await loadDroneModel(new THREE.Vector3(0, 0, 0))
    drone = result.model
    propellers = result.propellers
    camera.lookAt(drone.position)
    animate()
})

onUnmounted(() => {
    renderer.dispose()
})
</script>

<style scoped>
div {
  overflow: hidden;
}
</style>
