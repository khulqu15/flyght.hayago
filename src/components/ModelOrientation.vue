<template>
    <div class="w-full">
        <div ref="containerThree" id="containerThree" class="rounded-2xl overflow-hidden h-[20rem] w-full">
            <div ref="canvasContainer" class="viewer-container w-full h-full bg-gradient-to-br from-blue-600 to-blue-900"></div>
        </div>
        <div class="flex flex-wrap gap-5 p-4 bg-base-100 mt-3 justify-between items-center rounded-xl w-full">
            <div class="flex items-center gap-3">
                <p class="text-xs">X</p>
                <h2 class="text-xl font-bold">{{ acceleration.x.toFixed(2) }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Y</p>
                <h2 class="text-xl font-bold">{{ acceleration.y.toFixed(2) }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Z</p>
                <h2 class="text-xl font-bold">{{ acceleration.z.toFixed(2) }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Lat</p>
                <h2 class="text-xl font-bold">{{ gps.lat }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Lon</p>
                <h2 class="text-xl font-bold">{{ gps.lon }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Alt</p>
                <h2 class="text-xl font-bold">{{ gps.alt }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Speed</p>
                <h2 class="text-xl font-bold">{{ gps.speed }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Roll</p>
                <h2 class="text-xl font-bold">{{ orientation.roll.toFixed(2) }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Pitch</p>
                <h2 class="text-xl font-bold">{{ orientation.pitch.toFixed(2) }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <p class="text-xs">Yaw</p>
                <h2 class="text-xl font-bold">{{ orientation.yaw.toFixed(2) }}</h2>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { defineComponent, nextTick, onMounted, ref } from 'vue'
import { database, ref as dbRef, onValue } from '@/firebase'

export default defineComponent({
    setup() {
        const canvasContainer = ref<HTMLElement | null>(null)
        const containerThree = ref<HTMLElement | null>(null)

        let scene: THREE.Scene
        let camera: THREE.PerspectiveCamera
        let renderer: THREE.WebGLRenderer
        let controls: OrbitControls
        let model: THREE.Object3D | null = null

        const orientation: any = ref({
            roll: 0,
            pitch: 0,
            yaw: 0
        })
        const acceleration: any = ref({
            x: 0,
            y: 0,
            z: 0
        })
        const gps: any = ref({
            lat: 0,
            lon: 0,
            alt: 0,
            speed: 0,
        })

        const listenData = () => {
            const gyroRef = dbRef(database, 'sensor_data/')
            
            onValue(gyroRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                    orientation.value.roll = data.gyro.roll || 0
                    orientation.value.pitch = data.gyro.pitch || 0
                    orientation.value.yaw = data.gyro.yaw || 0
                    acceleration.value.x = data.imu.x
                    acceleration.value.y = data.imu.y
                    acceleration.value.z = data.imu.z
                    gps.value.lat = data.gps.lat
                    gps.value.lon = data.gps.lon
                    gps.value.alt = data.gps.alt
                    gps.value.speed = data.gps.speed
                    updateRotation(orientation.value.roll, orientation.value.pitch, orientation.value.yaw)
                }
            })
        }

        const initThreeJs = async () => {
            await nextTick()

            if(!canvasContainer.value && !containerThree.value) return
            const containerThreeId = document.getElementById("containerThree")

            const containerWidth = containerThreeId?.clientWidth || 600
            const containerHeight = containerThreeId?.clientHeight || 500
            
            scene = new THREE.Scene()
            camera = new THREE.PerspectiveCamera(75, containerWidth! / containerHeight!, 1, 1000)
            camera.position.set(2, 0, 2)

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
            renderer.setSize(containerWidth, containerHeight)
            canvasContainer.value?.appendChild(renderer.domElement)

            const light = new THREE.AmbientLight(0xffffff, 1)
            scene.add(light)
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
            directionalLight.position.set(5, 10, 0)
            scene.add(directionalLight)

            controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = false
            controls.dampingFactor = 0.01
            // controls.enabled = false
        }

        const loadModel = async (url: string) => {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader()
                const dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath("/draco/")
                loader.setDRACOLoader(dracoLoader)

                loader.load(url, onLoad(resolve), onProgress, onError(reject))
            })
        }

        const onLoad = (resolve: (value: unknown) => void) => (gltf: any) => {
            console.log("GLB Loaded Successfully", gltf)

            if (gltf.scene) {
                setTimeout(() => {
                    setupModel(gltf.scene)
                    listenData()        // Pindah ke sini
                    animate()
                }, 500)
            } else if (gltf.scenes && gltf.scenes.length > 0) {
                gltf.scenes.forEach((sceneItem: any) => {
                    scene.add(sceneItem)
                })
            } else {
                console.error("Model tidak memiliki scene yang valid!")
            }

            resolve(gltf)
        }

        const onProgress = (xhr: ProgressEvent) => {
            console.log(`Loading GLB: ${(xhr.loaded / xhr.total) * 100}%`)
        }

        const onError = (reject: (reason?: any) => void) => (error: any) => {
            console.error("Error loading GLB:", error)
            reject(error)
        }

        const setupModel = (model3d: any) => {
            model = model3d
            const box = new THREE.Box3().setFromObject(model!)
            const center = new THREE.Vector3()
            box.getCenter(center)
            model?.position.sub(center)
            model?.scale.set(5, 5, 5)
            model?.position.set(0, 0, 0)
            scene.add(model!)
        }
        
        const updateRotation = (roll: number, pitch: number, yaw: number) => {
            if (!model) return
            model.rotation.x += (THREE.MathUtils.degToRad(pitch) - model.rotation.x) * 0.1;
            model.rotation.y += (THREE.MathUtils.degToRad(yaw) - model.rotation.y) * 0.1;
            model.rotation.z += (THREE.MathUtils.degToRad(roll) - model.rotation.z) * 0.1;
        }

        const animate = () => {
            requestAnimationFrame(animate)
            if(controls) controls.update()
            updateRotation(orientation.value.roll, orientation.value.pitch, orientation.value.yaw);
            renderer.render(scene, camera)
        }

        const startRendering = async () => {
            await initThreeJs()
            await loadModel("/3d/drone.glb")
            listenData()
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

        onMounted( async() => {
            await nextTick()
            setTimeout(() => {
                startRendering()
            }, 1000)
        })
        return { canvasContainer, containerThree, orientation, acceleration, gps }
    }
})
</script>

<style scoped>
.containerThree canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
}
</style>
