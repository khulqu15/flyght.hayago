<template>
    <AppLayout>
        <div class="min-h-screen relative text-base-content">
            <div v-if="showHandCam">
                <div class="absolute left-0 bottom-0 opacity-40 z-999 w-full h-full">
                    <HandGestureView @gesture="onGestureDetected"></HandGestureView>
                </div>
            </div>
            <div v-if="showChartData">
                <RealtimePlot ref="plotRef"/>
            </div>
            <div ref="canvasContainer" class="viewer-container w-full h-full bg-gradient-to-br from-blue-600 to-blue-900"></div>
            <div class="absolute top-4 left-4 w-72 bg-base-200 bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-xl p-5 font-sans space-y-3 border border-gray-200/20">
                <h2 class="text-xl font-bold mb-3 text-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Drone Info</h2>
                <div class="flex justify-between items-center">
                    <span class="font-medium">Flight State:</span>
                    <span 
                    :class="{
                        'text-green-500': flightState === 'hover',
                        'text-orange-500': flightState === 'takeoff',
                        'text-red-500': flightState === 'landing',
                        'text-blue-500': ['forward','backward','left','right','up','down'].includes(flightState)
                    }"
                    class="font-bold uppercase"
                    >{{ flightState }}</span>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between"><span>Thrust:</span> <span>{{ control.thrust.toFixed(2) }}</span></div>
                    <div class="flex justify-between"><span>Pitch:</span> <span>{{ control.pitch.toFixed(2) }}°</span></div>
                    <div class="flex justify-between"><span>Roll:</span> <span>{{ control.roll.toFixed(2) }}°</span></div>
                    <div class="flex justify-between"><span>Yaw:</span> <span>{{ control.yaw.toFixed(2) }}°</span></div>
                </div>
                <div class="space-y-1 mt-2">
                    <div class="font-medium">Position:</div>
                    <div class="text-sm">X: {{ physics.drone.position.x.toFixed(2) }}, Y: {{ physics.drone.position.y.toFixed(2) }}, Z: {{ physics.drone.position.z.toFixed(2) }}</div>
                </div>
                <div class="space-y-1">
                    <div class="font-medium">Velocity:</div>
                    <div class="text-sm">X: {{ physics.drone.velocity.x.toFixed(2) }}, Y: {{ physics.drone.velocity.y.toFixed(2) }}, Z: {{ physics.drone.velocity.z.toFixed(2) }}</div>
                </div>
            </div>

            <div class="absolute top-4 right-4 w-72 bg-base-200 bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-xl p-5 font-sans space-y-3 border border-gray-200/20">
                <h2 class="text-xl font-bold mb-3 text-gradient-to-r from-green-400 via-blue-500 to-indigo-600">Rotor & Payload</h2>
                <div class="space-y-2">
                    <div v-for="(r, i) in rotorData" :key="i">
                    <div class="flex justify-between text-sm font-medium">
                        <span>Rotor {{ i+1 }} RPM:</span>
                        <span>{{ r.rpm.toFixed(0) }}</span>
                    </div>
                    <div class="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-400 to-purple-500" :style="{ width: Math.min(r.rpm/5000*100,100)+'%' }"></div>
                    </div>
                    </div>
                </div>
                <div class="mt-3 space-y-1">
                    <h3 class="font-medium text-sm">Payload</h3>
                    <div class="text-sm">Pos: X: {{ physics.payload.position.x.toFixed(2) }}, Y: {{ physics.payload.position.y.toFixed(2) }}, Z: {{ physics.payload.position.z.toFixed(2) }}</div>
                    <div class="text-sm">Vel: X: {{ physics.payload.velocity.x.toFixed(2) }}, Y: {{ physics.payload.velocity.y.toFixed(2) }}, Z: {{ physics.payload.velocity.z.toFixed(2) }}</div>
                </div>
            </div>

        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { nextTick, onMounted, ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import HandGestureView from '@/components/HandGestureView.vue';
import { DroneController } from '@/controllers'
import RealtimePlot from '@/components/RealtimePlot.vue'
import * as THREE from 'three'
import gsap from 'gsap'

const showHandCam = ref(false)
const showChartData = ref(true)
const droneController = new DroneController('gnn')
const canvasContainer = ref<HTMLElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
enum CameraMode {
    FREE = 'free',
    FOLLOW = 'follow'
}
const plotRef = ref<InstanceType<typeof RealtimePlot> | null>(null)

const cameraAngles = [
    new THREE.Vector3(0, 2, 6),
    new THREE.Vector3(6, 3, 0),
    new THREE.Vector3(-6, 3, 0),
    new THREE.Vector3(0, 8, 0),
    new THREE.Vector3(0, 2, -6),
]
const targetPos = ref(new THREE.Vector3()) 
const currentCameraAngle = ref(0)
const MAX_HEIGHT = 20
const cameraMode = ref<CameraMode>(CameraMode.FREE)
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let drones: { model: THREE.Object3D, propellers: THREE.Object3D[] }[] = []
const ground = {
    height: ref(0.75),
    restitution: ref(0.0),
    friction: ref(0.8),
}
const collider = {
    drone: { halfSize: new THREE.Vector3(0.4, 0.6, 0.4) },
    payload: { halfSize: new THREE.Vector3(0.3, 0.3, 0.3) }
}

let payloadInitialPosition = new THREE.Vector3()

const onGestureDetected = (name: string) => {
    if(name == "TAKEOFF") flightState.value = FlightState.TAKEOFF
    if(name == "UP") flightState.value = FlightState.UP
    if(name == "LEFT") flightState.value = FlightState.LEFT
    if(name == "RIGHT") flightState.value = FlightState.RIGHT
    if(name == "DOWN") flightState.value = FlightState.DOWN
    if(name == "LANDING") flightState.value = FlightState.LANDING
    if(name == "HOVER") flightState.value = FlightState.HOVER
    if(name == "IDLE") flightState.value = FlightState.IDLE
    if(name == "CAMERA FOLLOW") cameraMode.value = CameraMode.FOLLOW
    if(name == "CAMERA UNFOLLOW") cameraMode.value = CameraMode.FREE
    if(name == "CAMERA ANGLE 1") currentCameraAngle.value = 0
    if(name == "CAMERA ANGLE 2") currentCameraAngle.value = 1
    if(name == "CAMERA ANGLE 3") currentCameraAngle.value = 2
    if(name == "CAMERA ANGLE 4") currentCameraAngle.value = 3
    if(name == "CAMERA ANGLE 5") currentCameraAngle.value = 4
}

const SMC = {
    lambda: 0.2,
    eta: 0.5,
}

enum FlightState {
    IDLE = 'idle',
    TAKEOFF = 'takeoff',
    LANDING = 'landing',
    HOVER = 'hover',
    FORWARD = 'forward',
    BACKWARD = 'backward',
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
}

const TAKEOFF_HEIGHT = 8
const flightState = ref<FlightState>(FlightState.IDLE)
const control = {
    thrust: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
}

const physics = {
    drone: {
        mass: ref(1),
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        acceleration: new THREE.Vector3(),
    },
    payload: {
        mass: ref(0.8),
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        acceleration: new THREE.Vector3(),
    }
}

const env = {
    gravity: ref(9.81),
    airDensity: ref(1.225),
    windSpeed: ref(2),
    windDirection: ref(45),
    dragCoeff: ref(1.05),
}

const smcControl = (targetPos: THREE.Vector3, currentPos: THREE.Vector3, currentVel: THREE.Vector3, mass: number) => {
    const posError = targetPos.clone().sub(currentPos)
    const velError = currentVel.clone().negate() // target vel = 0
    const s = velError.clone().add(posError.multiplyScalar(SMC.lambda))
    const u = s.multiplyScalar(SMC.lambda).add(s.clone().normalize().multiplyScalar(SMC.eta))
    return u.divideScalar(mass) // acceleration
}

const clock = new THREE.Clock()
const numDrones = ref(1)
const BOX_HEIGHT = ref(1.6)
const ROPE_LENGTH = 1.2
const ROPE_MIN = ref(0.2)
const rotorData = ref<{ rpm: number, thrust: number }[]>([]);
const initRotorData = (numDrones: number) => {
    rotorData.value = Array.from({ length: 4 }, () => ({
        rpm: 0,
        thrust: 0
    }))
}

type RopeObject = {
    rope: THREE.Mesh
    curve: THREE.CatmullRomCurve3
    points: THREE.Vector3[]
}
let payload: {
    model: THREE.Object3D
    rope: RopeObject
} | null = null

const getWindVector = () => {
    const rad = THREE.MathUtils.degToRad(env.windDirection.value)
    return new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad)).multiplyScalar(env.windSpeed.value)
}


const computeDrag = (vel: THREE.Vector3) => {
    const relVel = vel.clone().sub(getWindVector())
    const speed = relVel.length()
    if (speed === 0) return new THREE.Vector3()
    const dragMag = 0.5 * env.airDensity.value * speed * speed * env.dragCoeff.value
    return relVel.normalize().multiplyScalar(-dragMag)
}

const applyRopeConstraint = () => {
    const dir = physics.payload.position.clone().sub(physics.drone.position)
    const dist = dir.length()
    if (dist <= ROPE_LENGTH) return
    const correction = dir.normalize().multiplyScalar(dist - ROPE_LENGTH)
    physics.payload.position.sub(correction.multiplyScalar(0.7))
    physics.drone.position.add(correction.multiplyScalar(0.3))
}

const integrate = (obj: any, dt: any) => {
    obj.velocity.add(obj.acceleration.clone().multiplyScalar(dt))
    obj.position.add(obj.velocity.clone().multiplyScalar(dt))
    obj.acceleration.set(0, 0, 0)
}

const initThreeJs = async () => {
    await nextTick()
    if (!canvasContainer.value) return
    const containerWidth = canvasContainer.value.clientWidth || 600
    const containerHeight = canvasContainer.value.clientHeight || 500
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 1, 1000)
    camera.position.set(5, 5, 10)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerWidth, containerHeight)
    canvasContainer.value.appendChild(renderer.domElement)
    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 0)
    scene.add(directionalLight)
    controls = new OrbitControls(camera, renderer.domElement)
}

const loadDroneModel = async (boxPosition?: THREE.Vector3): Promise<{ model: THREE.Object3D, propellers: THREE.Object3D[] }> => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath("/draco/")
        loader.setDRACOLoader(dracoLoader)
        loader.load("/3d/drone_without_prop.glb", (gltf) => {
            const drone = gltf.scene
            drone.scale.set(3, 3, 3)
            if (boxPosition) {
                drone.position.set(
                    boxPosition.x,
                    boxPosition.y + ROPE_LENGTH,
                    boxPosition.z
                )
            }
            scene.add(drone)
            loader.load("/3d/prop.glb", (propGltf) => {
                const prop = propGltf.scene
                prop.scale.set(1, 1, 1)
                drone.add(prop)
                let propellerParts: THREE.Object3D[] = []
                prop.traverse((child) => {
                    if (child instanceof THREE.Mesh) propellerParts.push(child)
                })
                const propPositions = 
                [[0.28, 0.05, 0],
                [0, 0.05, -0.28],
                [0, 0.05, 0.28],
                [-0.28, 0.05, 0]]
                propellerParts.forEach((part, index) => {
                    if (index < propPositions.length) {
                        const [x, y, z] = propPositions[index]
                        part.position.set(x, y, z)
                    }
                })
                resolve({ model: drone, propellers: propellerParts })
            }, undefined, reject)
        }, undefined, reject)
    })
}

const loadPayloadBox = async () => {
    return new Promise<THREE.Object3D>((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load("/3d/box.glb", (gltf) => {
            const box = gltf.scene
            box.scale.set(0.4, 0.4, 0.4)
            box.position.set(0, 0.75, 0)
            const anchor = new THREE.Object3D()
            anchor.position.set(0, 0.3, 0)
            box.add(anchor)
            box.userData.anchor = anchor
            scene.add(box)
            resolve(box)
        }, undefined, reject)
    })
}

const propSpinDirection = [1, -1, -1, 1]

const updatePropellers = (dt: number) => {
    const baseSpeed = 0
    drones.forEach(drone => {
        drone.propellers.forEach((prop, i) => {
            const rpm = rotorData.value[i]?.rpm ?? 0
            const direction = propSpinDirection[i] ?? 1
            const angularSpeed = rpm * 0.002 + baseSpeed
            prop.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.rotation.y += direction * angularSpeed * dt
                }
            })
        })
    })
}

const attitude = {　pitch: 0,　roll: 0,　yaw: 0　}

const updateAttitude = (dt: number) => {
    const targetPitch = THREE.MathUtils.degToRad(control.pitch)
    const targetRoll  = THREE.MathUtils.degToRad(-control.roll)
    const targetYaw   = THREE.MathUtils.degToRad(control.yaw)
    const lerpFactor = Math.min(dt * 5, 1)
    attitude.pitch += (targetPitch - attitude.pitch) * lerpFactor
    attitude.roll  += (targetRoll  - attitude.roll)  * lerpFactor
    attitude.yaw   += (targetYaw   - attitude.yaw)   * lerpFactor
}

const updateRotorRPM = () => {
    const baseRPMMap: Record<FlightState, number[]> = {
        [FlightState.IDLE]:     [0, 0, 0, 0],
        [FlightState.TAKEOFF]:  [5200, 5200, 5200, 5200],
        [FlightState.HOVER]:    [4500, 4500, 4500, 4500],
        [FlightState.LANDING]:  [3000, 3000, 3000, 3000],
        [FlightState.FORWARD]:  [4700, 4300, 4700, 4300],
        [FlightState.BACKWARD]: [4300, 4700, 4300, 4700],
        [FlightState.LEFT]:     [4300, 4700, 4700, 4300],
        [FlightState.RIGHT]:    [4700, 4300, 4300, 4700],
        [FlightState.UP]:       [5000, 5000, 5000, 5000],
        [FlightState.DOWN]:     [3500, 3500, 3500, 3500],
    }
    const targetRPMs = baseRPMMap[flightState.value] || [4500, 4500, 4500, 4500]
    rotorData.value.forEach((r, i) => {
        r.rpm += (targetRPMs[i] - r.rpm) * 0.1
    })
}

const createRope = (parent: THREE.Object3D) => {
    const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.75, 0),
        new THREE.Vector3(0, -1.5, 0),
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false)
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 })
    const rope = new THREE.Mesh(geometry, material)
    scene.add(rope)
    return { rope, curve, points }
}

const applyGroundConstraint = (obj: any) => {
    if (obj.position.y < ground.height.value) {
        obj.position.y = ground.height.value
        if (obj.velocity.y < 0) obj.velocity.y *= -ground.restitution.value
        obj.velocity.x *= ground.friction.value
        obj.velocity.z *= ground.friction.value
    }
}

const addDrone = async (box?: THREE.Object3D) => {
    const boxPos = box ? box.position.clone() : undefined
    const newDrone = await loadDroneModel(boxPos)
    const attachPoint = new THREE.Object3D()
    attachPoint.position.set(0, -0.25, 0)
    newDrone.model.add(attachPoint)
    newDrone.model.userData.attachPoint = attachPoint
    newDrone.model.position.set(0, BOX_HEIGHT.value + ROPE_MIN.value, 0)
    drones.length = 0
    drones.push(newDrone)
    physics.drone.position.set(0, BOX_HEIGHT.value + ROPE_MIN.value, 0)
    physics.drone.velocity.set(0, 0, 0)
    physics.drone.acceleration.set(0, 0, 0)
}

const stabilize = () => {
  physics.drone.velocity.clampLength(0, 15)
  physics.payload.velocity.clampLength(0, 10)
}

const applyDroneBoxConstraint = () => {
    const drone = physics.drone
    const payload = physics.payload
    const boxTop =　payload.position.y + collider.payload.halfSize.y
    const droneBottom =　drone.position.y - collider.drone.halfSize.y
    const horizontalOverlap =　Math.abs(drone.position.x - payload.position.x) <　(collider.drone.halfSize.x + collider.payload.halfSize.x) &&　Math.abs(drone.position.z - payload.position.z) <　(collider.drone.halfSize.z + collider.payload.halfSize.z)
    if (horizontalOverlap && droneBottom <= boxTop + 0.001) {
        drone.position.y = boxTop + collider.drone.halfSize.y
        drone.velocity.set(0, Math.max(drone.velocity.y, 0), 0)
        drone.acceleration.y = Math.max(drone.acceleration.y, 0)
    }
}

const syncPayloadBelowDrone = () => {
    const dronePos = physics.drone.position
    physics.payload.position.set( dronePos.x, dronePos.y - ROPE_LENGTH, dronePos.z )
    physics.payload.velocity.copy(physics.drone.velocity)
}


const updateControlByState = () => {
    control.thrust = 0
    control.pitch = 0
    control.roll = 0
    control.yaw = 0
    const baseLift = physics.drone.mass.value * env.gravity.value
    const moveSpeed = 5 // m/s
    switch (flightState.value) {
        case FlightState.TAKEOFF:
            control.thrust = baseLift * 1.6; break
        case FlightState.LANDING:
            control.thrust = baseLift * 0.6; break
        case FlightState.HOVER:
            control.thrust = baseLift; break
        case FlightState.UP:
            control.thrust = baseLift * 2; break
        case FlightState.DOWN:
            control.thrust = baseLift * 3; break
        case FlightState.FORWARD:
            control.thrust = baseLift
            physics.drone.acceleration.z = -moveSpeed; break
        case FlightState.BACKWARD:
            control.thrust = baseLift
            physics.drone.acceleration.z = moveSpeed; break
        case FlightState.LEFT:
            control.thrust = baseLift
            physics.drone.acceleration.x = -moveSpeed; break
        case FlightState.RIGHT:
            control.thrust = baseLift
            physics.drone.acceleration.x = moveSpeed; break
    }
}


const startRendering = async () => {
    await initThreeJs()
    addGround()
    const box = await loadPayloadBox()
    payloadInitialPosition.copy(box.position)
    physics.payload.position.copy(box.position)
    physics.payload.velocity.set(0, 0, 0)
    physics.payload.acceleration.set(0, 0, 0)
    await addDrone(box)
    const rope = createRope(drones[0].model)
    payload = { model: box, rope }
    animate()
    window.addEventListener("resize", () => {
        if (!canvasContainer.value) return
        const newWidth = canvasContainer.value.clientWidth
        const newHeight = canvasContainer.value.clientHeight
        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()
        renderer.setSize(newWidth, newHeight)
    })
}

const lockPayloadPosition = () => {
    physics.payload.position.copy(payloadInitialPosition)
    physics.payload.velocity.set(0, 0, 0)
    physics.payload.acceleration.set(0, 0, 0)
}

const addGround = () => {
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("/textures/ground.jpg");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({　map: groundTexture,　side: THREE.DoubleSide　});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.position.x = 30
    scene.add(ground);
};

const ROPE_STIFFNESS = 120
const ROPE_DAMPING = 8

const smcAttitude = (target: number, current: number, currentRate: number) => {
    const e = target - current
    const s = currentRate + SMC.lambda * e
    return SMC.lambda * s + SMC.eta * Math.sign(s)
}

const applyRopeForce = () => {
    const dir = physics.payload.position.clone().sub(physics.drone.position)
    const dist = dir.length()
    if (dist === 0) return
    const stretch = dist - ROPE_LENGTH
    if (stretch <= 0) return
    const dirNorm = dir.normalize()
    const relVel = physics.payload.velocity.clone().sub(physics.drone.velocity)
    const dampingForce = relVel.dot(dirNorm) * ROPE_DAMPING
    const forceMag = ROPE_STIFFNESS * stretch - dampingForce
    const force = dirNorm.multiplyScalar(forceMag)
    physics.payload.acceleration.add(force.clone().divideScalar(physics.payload.mass.value))
    physics.drone.acceleration.add(force.clone().multiplyScalar(-1 / physics.drone.mass.value))
}

const windShake = {
    droneOffset: new THREE.Vector3(),
    droneRotation: new THREE.Euler(),
    payloadOffset: new THREE.Vector3(),
    payloadRotation: new THREE.Euler(),
    maxTranslation: 0.2,
    maxRotation: THREE.MathUtils.degToRad(5)
}

const updatePhysics = () => {
    const dt = Math.min(clock.getDelta(), 0.02)
    updateControlByState()
    const thrust = new THREE.Vector3(control.roll * 2, control.thrust, control.pitch * 2)
    const gravityDrone = new THREE.Vector3(0, -physics.drone.mass.value * env.gravity.value, 0)
    const dragDrone = computeDrag(physics.drone.velocity)
    const graphInput = {
        nodes: [
            [
                physics.drone.position.x, physics.drone.position.y, physics.drone.position.z,
                physics.drone.velocity.x, physics.drone.velocity.y, physics.drone.velocity.z,
                physics.drone.acceleration.x, physics.drone.acceleration.y, physics.drone.acceleration.z
            ],
            [
                physics.payload.position.x, physics.payload.position.y, physics.payload.position.z,
                physics.payload.velocity.x, physics.payload.velocity.y, physics.payload.velocity.z,
                physics.payload.acceleration.x, physics.payload.acceleration.y, physics.payload.acceleration.z
            ]
        ],
        adjacency: [
            [1,1],
            [1,1]
        ]
    }
    const currentPos: [number, number, number] = [
    physics.drone.position.x,
        physics.drone.position.y,
        physics.drone.position.z
    ]

    const targetPosArray: [number, number, number] = [
        targetPos.value.x,
        targetPos.value.y,
        targetPos.value.z
    ]

    const ctrlOutput = droneController.predict(currentPos, targetPosArray, graphInput)

    const accelVec = new THREE.Vector3(...ctrlOutput.accel[0].map(v => isFinite(v) ? v : 0))
    physics.drone.acceleration.set(accelVec.x, accelVec.y, accelVec.z)

    control.pitch = isFinite(ctrlOutput.attitude[0]) ? ctrlOutput.attitude[0] : 0
    control.roll  = isFinite(ctrlOutput.attitude[1]) ? ctrlOutput.attitude[1] : 0
    control.yaw   = isFinite(ctrlOutput.attitude[2]) ? ctrlOutput.attitude[2] : 0
    control.yaw   = ctrlOutput.attitude[2]
    let windForceDrone = new THREE.Vector3(0, 0, 0)
    if (![FlightState.LANDING, FlightState.IDLE].includes(flightState.value)) {
        const windMag = getWindVector().length()
        windShake.droneOffset.x = Math.sin(clock.getElapsedTime() * 5) * Math.min(windMag * 0.02, windShake.maxTranslation)
        windShake.droneOffset.z = Math.cos(clock.getElapsedTime() * 4) * Math.min(windMag * 0.02, windShake.maxTranslation)
        windShake.droneOffset.y = Math.sin(clock.getElapsedTime() * 3) * Math.min(windMag * 0.01, windShake.maxTranslation * 0.5)

        windShake.droneRotation.x = Math.sin(clock.getElapsedTime() * 3) * Math.min(windMag * 0.005, windShake.maxRotation)
        windShake.droneRotation.z = Math.cos(clock.getElapsedTime() * 4) * Math.min(windMag * 0.005, windShake.maxRotation)
        windShake.droneRotation.y = Math.sin(clock.getElapsedTime() * 2) * Math.min(windMag * 0.003, windShake.maxRotation)

        windShake.payloadOffset.x = Math.cos(clock.getElapsedTime() * 5) * Math.min(windMag * 0.03, windShake.maxTranslation)
        windShake.payloadOffset.z = Math.sin(clock.getElapsedTime() * 4) * Math.min(windMag * 0.03, windShake.maxTranslation)
        windShake.payloadOffset.y = Math.sin(clock.getElapsedTime() * 2) * Math.min(windMag * 0.02, windShake.maxTranslation * 0.5)

        windShake.payloadRotation.x = Math.sin(clock.getElapsedTime() * 2) * Math.min(windMag * 0.01, windShake.maxRotation)
        windShake.payloadRotation.z = Math.cos(clock.getElapsedTime() * 3) * Math.min(windMag * 0.01, windShake.maxRotation)
        windShake.payloadRotation.y = Math.sin(clock.getElapsedTime() * 1.5) * Math.min(windMag * 0.005, windShake.maxRotation)
    } else {
        windShake.droneOffset.set(0,0,0)
        windShake.droneRotation.set(0,0,0)
        windShake.payloadOffset.set(0,0,0)
        windShake.payloadRotation.set(0,0,0)
    }
    
    physics.drone.acceleration.add(thrust.divideScalar(physics.drone.mass.value)).add(gravityDrone.divideScalar(physics.drone.mass.value)).add(dragDrone.divideScalar(physics.drone.mass.value)).add(windForceDrone.divideScalar(physics.drone.mass.value))
    targetPos.value.copy(physics.drone.position)
    if ([FlightState.FORWARD, FlightState.BACKWARD, FlightState.LEFT, FlightState.RIGHT].includes(flightState.value)) {
        const smcAcc = smcControl(targetPos.value, physics.drone.position, physics.drone.velocity, physics.drone.mass.value)
        physics.drone.acceleration.add(smcAcc)

        const allCtrl = droneController.predictAll(currentPos, targetPosArray, graphInput)

        plotRef.value?.addDataPoint(
            smcAcc.y ?? 0,
            allCtrl.gnn?.attitude[0] ?? 0,
            allCtrl.pso?.attitude[0] ?? 0,
            allCtrl.ga?.attitude[0] ?? 0
        )

        console.log('Adding chart point:',
            smcAcc.y,
            allCtrl.gnn?.attitude[1],
            allCtrl.pso?.attitude[1],
            allCtrl.ga?.attitude[1]
        )
    }


    integrate(physics.drone, dt)
    const gravityPayload = new THREE.Vector3(0, -physics.payload.mass.value * env.gravity.value, 0)
    const dragPayload = computeDrag(physics.payload.velocity)
    physics.payload.acceleration.add(gravityPayload.divideScalar(physics.payload.mass.value)).add(dragPayload.divideScalar(physics.payload.mass.value)).add(windForceDrone.divideScalar(physics.payload.mass.value))
    integrate(physics.payload, dt)
    if (flightState.value === FlightState.LANDING || flightState.value === FlightState.IDLE)  {
        lockPayloadPosition()
        applyGroundConstraint(physics.drone)
        applyGroundConstraint(physics.payload)
    } else {
        syncPayloadBelowDrone()
        updateRotorRPM()
        updatePropellers(dt)
    }
    if (flightState.value === FlightState.TAKEOFF && physics.drone.position.y >= TAKEOFF_HEIGHT) flightState.value = FlightState.HOVER
    applyGroundConstraint(physics.payload)
    applyDroneBoxConstraint()
    applyRopeConstraint()
    applyRopeForce()
    stabilize()
    if (flightState.value === FlightState.LANDING && physics.drone.position.y <= ground.height.value + 0.1) {
        flightState.value = FlightState.IDLE
        physics.drone.velocity.set(0, 0, 0)
        physics.drone.acceleration.set(0, 0, 0)
    }
    drones[0].model.position.copy(physics.drone.position)
    payload!.model.position.copy(physics.payload.position)
}

const animate = () => {
    requestAnimationFrame(animate)
    updatePhysics()
    if (physics.drone.position.y > MAX_HEIGHT) {
        physics.drone.position.y = MAX_HEIGHT
        physics.drone.velocity.y = Math.min(physics.drone.velocity.y, 0)
    }
    updateAttitude(clock.getDelta())
    const droneModel = drones[0].model
    droneModel.rotation.x = attitude.pitch
    droneModel.rotation.z = attitude.roll
    droneModel.rotation.y += attitude.yaw
    if (payload && drones.length > 0) {
        const drone = drones[0].model
        const attachPoint = drone.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.25, 0))
        const payloadPoint = payload.model.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.35, 0))
        const distance = attachPoint.distanceTo(payloadPoint)
        const sag = Math.min(distance * 0.3, 1.5)
        const midPoint = attachPoint.clone().lerp(payloadPoint, 0.5)
        midPoint.y -= sag
        payload.rope.points[0].copy(attachPoint)
        payload.rope.points[1].copy(midPoint)
        payload.rope.points[2].copy(payloadPoint)
        payload.rope.curve.points = payload.rope.points
        payload.rope.rope.geometry.dispose()
        payload.rope.rope.geometry = new THREE.TubeGeometry(payload.rope.curve, 24, 0.02, 8, false)
    }
    controls.update()
    if (cameraMode.value === CameraMode.FOLLOW && drones.length > 0) {
        const dronePos = drones[0].model.position
        const offset = cameraAngles[currentCameraAngle.value]
        const targetPos = dronePos.clone().add(offset)
        camera.position.lerp(targetPos, 0.1)
        camera.lookAt(dronePos)
    }
    if (drones.length > 0) {
        const drone = drones[0].model
        drone.position.copy(physics.drone.position).add(windShake.droneOffset)
        drone.rotation.x = attitude.pitch + windShake.droneRotation.x
        drone.rotation.z = attitude.roll + windShake.droneRotation.z
        drone.rotation.y += attitude.yaw + windShake.droneRotation.y
    }
    if (payload && drones.length > 0) {
        payload.model.position.copy(physics.payload.position).add(windShake.payloadOffset)
        payload.model.rotation.x = windShake.payloadRotation.x
        payload.model.rotation.y = windShake.payloadRotation.y
        payload.model.rotation.z = windShake.payloadRotation.z
    }
    renderer.render(scene, camera)
}

onMounted(async () => {
    await nextTick()
    await droneController.init()
    setTimeout(async () => {
        await startRendering()
        initRotorData(numDrones.value)
    }, 500)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'c') cameraMode.value = cameraMode.value === CameraMode.FREE ? CameraMode.FOLLOW : CameraMode.FREE
        if (e.key >= '1' && e.key <= '5') currentCameraAngle.value = Number(e.key) - 1
        switch (e.key) {
            case 'w': flightState.value = FlightState.FORWARD; break
            case 's': flightState.value = FlightState.BACKWARD; break
            case 'a': flightState.value = FlightState.LEFT; break
            case 'd': flightState.value = FlightState.RIGHT; break
            case 'z': flightState.value = FlightState.DOWN; break
            case 'c': flightState.value = FlightState.UP; break
            case ' ': if (flightState.value === FlightState.IDLE) flightState.value = FlightState.TAKEOFF; break
            case 'x': flightState.value = FlightState.LANDING; break
        }
    })
})
</script>



