<template>
    <div ref="containerSimulation" id="containerSimulation" class="w-full h-full relative">
        <div class="absolute left-4 p-4 bg-base-300 top-20 rounded-xl">
            <h1 class="text-sm mb-3">Control Method</h1>
            <div class="flex items-center gap-3">
                <div><input id="tsmcCheckbox" type="checkbox" class="toggle" checked="true" /></div>
                <div class="mb-1">Robustness (TSMC)</div>
            </div>
            <div class="flex items-center gap-3">
                <div><input id="avoidanceCheckbox" type="checkbox" class="toggle" checked="true" /></div>
                <div class="mb-1">Avoidance (Flocking AL)</div>
            </div>
            <div class="flex items-center gap-3">
                <div><input id="ekfCheckbox" type="checkbox" class="toggle" checked="true" /></div>
                <div class="mb-1">NL Estimation (EKF)</div>
            </div>
        </div>
        <div class="absolute right-4 p-4 bg-base-300 top-4 rounded-xl">
            <h1 class="text-sm mb-3">Physic Parameter</h1>
            <div class="flex justify-between text-xs mb-1"><span>Gravity</span><span>9.807 m/s²</span></div>
            <div class="flex items-center justify-between text-xs mb-1">
                <div>Wind Speed</div>
                <div>{{ windSpeed.toFixed(2) }} m/s</div>
            </div>
            <div class="flex items-center justify-between text-xs">
                <div>Wind Direction</div>
                <div>{{ windDirection.toFixed(0) }}°</div>
            </div>
            <div class="flex justify-between text-xs mb-1"><span>Air Density</span><span>1.225 kg/m³</span></div>
            <div class="flex justify-between text-xs mb-1"><span>Wind Gust</span><span>2.0 m/s</span></div>
            <div v-for="(rotor, index) in rotorData" :key="index" class="text-xs mb-2">
                <div>Drone {{ index + 1 }}</div>
                <div>RPM: {{ rotor.rpm.toFixed(0) }}</div>
                <div>Thrust: {{ rotor.thrust.toFixed(2) }} N</div>
                <hr class="my-2"/>
            </div>
            <div class="flex justify-between text-xs mb-1"><span>Drone Mass</span><span>1.2 kg</span></div>
            <div class="flex justify-between text-xs mb-1"><span>Battery Voltage</span><span>11.1 V</span></div>
            <div class="flex justify-between text-xs mb-1"><span>Battery Current</span><span>15 A</span></div>
            <div class="flex justify-between text-xs mb-1"><span>Battery %</span><span>85%</span></div>
            <div class="flex justify-between text-xs"><span>Temperature</span><span>27°C</span></div>
        </div>
        <div class="absolute left-4 p-4 bg-base-300 top-60 mt-2 rounded-xl w-72">
            <h1 class="text-sm mb-3 font-bold">Method Parameters</h1>
            <div v-for="(drone, index) in numDrones" :key="index" class="mb-3">
                <h2 class="text-xs font-semibold mb-1">Drone {{ index + 1 }}</h2>
                <div class="flex justify-between text-xs mb-1">
                <span>Sliding Surface</span><span v-if="slidingSurfaces.length > 0">{{ slidingSurfaces[index] ? slidingSurfaces[index].toFixed(2) : '0' }}</span>
                </div>
                <div class="flex justify-between text-xs mb-1">
                <span>Alpha Lattice</span><span v-if="alphaLattices.length > 0">{{ alphaLattices[index].toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs mb-1">
                <span>Covariance Trace</span><span v-if="covarianceTraces.length > 0">{{ covarianceTraces[index].toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs mb-1">
                <span>Bearing Noise</span><span v-if="bearingNoises.length > 0">{{ bearingNoises[index].toFixed(3) }}</span>
                </div>
                <!-- <div class="flex justify-between text-xs">
                <span>Update Rate</span><span v-if="controllerRates.length > 0">{{ controllerRates[index] }} Hz</span>
                </div> -->
            </div>
        </div>

        <div ref="canvasContainer" class="viewer-container w-full h-full bg-gradient-to-br from-blue-600 to-blue-900"></div>
        <div class="absolute right-4 bottom-4 p-3 bg-base-200 flex items-center gap-3 rounded-xl">
            <div class="flex items-center gap-2">
                <select v-model="altitudeInput" class="select select-bordered w-full max-w-xs">
                    <option value="5">5m</option>
                    <option value="4">4m</option>
                    <option value="3">3m</option>
                    <option value="2">2m</option>
                    <option value="1">1m</option>
                </select>
            </div>
            <div class="divider lg:divider-horizontal"></div>
            <div class="flex items-center gap-2">
                <button @click="removeDrone()" class="btn bg-base-content text-base-300 btn-sm"><Icon icon="ic:round-minus" width="18" height="18" /></button>
                <h1>Agent ({{ numDrones }})</h1>
                <button @click="addDrone()" class="btn bg-base-content text-base-300 btn-sm"><Icon icon="ic:round-plus" width="18" height="18" /></button>
            </div>
            <div class="divider lg:divider-horizontal"></div>
            <div class="flex items-center">
                <span class="text-xs">Speed: {{ speed }}</span>
                <input type="range" v-model.number="speed" :min="0.1" :max="100" :step="0.1" class="range range-sm" @input="updateSpeed()"/>
            </div>
            <div class="divider lg:divider-horizontal"></div>
            <div class="flex items-center gap-3">
                <select v-model="formationType" @change="updateFormation()" class="select select-bordered select-sm">
                    <option value="circle">Circle</option>
                    <option value="ellipse">Ellipse</option>
                </select>
            </div>
            <div class="flex gap-3 items-center">
                <span class="text-xs">Diameter: {{ diameter }}</span>
                <input type="range" v-model.number="diameter" min="1" max="20" step="1" class="range range-sm" @input="updateFormation" />
            </div>
            <div class="divider lg:divider-horizontal"></div>
            <div>
                <button @click="togglePropellerRotation()" class="btn bg-blue-500 btn-sm text-white">
                    <Icon v-if="!isPropellerRotating" icon="solar:play-bold" width="18" height="18" />
                    <Icon v-if="isPropellerRotating" icon="ri:stop-fill" width="18" height="18" />
                </button>
            </div>
        </div>

        <dialog id="flight_modal" class="modal">
            <div class="modal-box max-w-7xl">
                <div class="flex justify-between">
                    <div>
                        <h3 class="text-lg font-bold mb-6">Flight Data</h3>
                    </div>
                    <div>
                        <div class="mb-3">
                            <label class="text-sm font-semibold mr-2">Select Drone:</label>
                            <select v-model="selectedDroneIndex" class="select select-bordered select-sm w-32">
                                <option v-for="i in numDrones" :key="i" :value="i - 1">Drone {{ i }}</option>
                            </select>
                        </div>
                    </div>

                </div>
                <div class="grid grid-cols-2 gap-4 overflow-y-auto">
                    <div>
                        <div id="flight3DContainer" class="w-full h-96 bg-base-200 rounded-lg"></div>
                    </div>
                    <div>
                        <div class="flex flex-col justify-between h-96 gap-2">
                            <div class="flex-1">
                            <Line v-if="flightRollChartData" :data="flightRollChartData" :options="flightChartOptions" class="w-full h-full" />
                            </div>
                            <div class="flex-1">
                            <Line v-if="flightPitchChartData" :data="flightPitchChartData" :options="flightChartOptions" class="w-full h-full" />
                            </div>
                            <div class="flex-1">
                            <Line v-if="flightYawChartData" :data="flightYawChartData" :options="flightChartOptions" class="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <p class="py-4">Press ESC key or click the button below to close</p>
                <div class="modal-action mt-20">
                    <form method="dialog">
                        <button class="btn mx-2">Close</button>
                        <button class="btn bg-blue-600 text-white" @click="downloadFlightData()">Download CSV</button>
                    </form>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Icon } from '@iconify/vue'
import gsap from 'gsap'
import * as XLSX from 'xlsx';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default defineComponent({
    components: {
        Icon, Line
    },
    setup() {
        const selectedDroneIndex = ref(0);
        const altitudeInput = ref(5)
        const containerSimulation = ref<HTMLElement | null>(null)
        const canvasContainer = ref<HTMLElement | null>(null)
        const numDrones = ref(5)
        const formationType = ref('circle')
        const isPropellerRotating = ref(false)

        let scene: THREE.Scene
        let camera: THREE.PerspectiveCamera
        let renderer: THREE.WebGLRenderer
        let controls: OrbitControls
        let drones: { model: THREE.Object3D, propellers: THREE.Object3D[] }[] = []
        let wallModel: THREE.Object3D | null = null
        let formationLine: THREE.Line | null = null;
        let particlePositions: THREE.Vector3[] = [];
        let formationParticles: THREE.Points | null = null;
        let particleSpeed = 0.01; 
        let trajectory: { x: number; y: number; z: number, formation: string, agents: number }[] = []; // Array trajektori untuk drone
        let currentTrajectory: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
        let currentTrajectoryIndex = 0
        const slidingSurfaces = ref<number[]>([]);
        const alphaLattices = ref<number[]>([]);
        const covarianceTraces = ref<number[]>([]);
        const bearingNoises = ref<number[]>([]);
        const controllerRates = ref<number[]>([]);

        const orientation: any = ref({
            roll: 0,
            pitch: 0,
            yaw: 0
        })
        
        const generateMethodParameters = () => {
            slidingSurfaces.value = [];
            alphaLattices.value = [];
            covarianceTraces.value = [];
            bearingNoises.value = [];
            controllerRates.value = [];

            for (let i = 0; i < numDrones.value; i++) {
                slidingSurfaces.value.push(25 + Math.random() * 10);   // 25–35
                alphaLattices.value.push(0.8 + Math.random() * 0.4);    // 0.8–1.2
                covarianceTraces.value.push(0.01 + Math.random() * 0.02); // 0.01–0.03
                bearingNoises.value.push(0.001 + Math.random() * 0.002); // 0.001–0.003 rad
                controllerRates.value.push(80 + Math.floor(Math.random() * 40)); // 80–120 Hz
            }
        };


        const droneFlightData = ref<{ 
            x: number, y: number, z: number, 
            roll: number, pitch: number, yaw: number, 
            time: number, droneId: number, formation: string,
            x_ref?: number, y_ref?: number, z_ref?: number,
            roll_ref?: number, pitch_ref?: number, yaw_ref?: number
        }[]>([])
        
        const flightPositionChartData = ref<any>(null)
        const flightRollChartData = ref<any>(null)
        const flightPitchChartData = ref<any>(null)
        const flightYawChartData = ref<any>(null)
        const colorPalette = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff',
            '#ff00ff', '#ffa500', '#00fa9a', '#da70d6', '#6495ed'
        ];

        const flightChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '' }
            },
            scales: {
                x: { title: { display: true, text: 'Time (s)' } },
                y: { title: { display: true, text: '' } }
            }
        }


        let droneTrailData: { x: number; y: number; z: number; droneId: number }[] = [];
        const trailUpdateInterval = 5
        let frameCounter = 0;
        let isPlaying = ref(false); 
        let errorInterval: ReturnType<typeof setInterval> | null = null;

        const loadWallModel = () => {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();
                loader.load("/3d/wall.glb", (gltf) => {
                    wallModel = gltf.scene;
                    wallModel.scale.set(1.2, 1.2, 1.2);
                    wallModel.position.y = -0.25
                    scene.add(wallModel);
                    updateWallPosition();
                    resolve(wallModel);
                }, undefined, reject);
            });
        };

        const updateWallPosition = () => {
            if (!wallModel) return;

            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;

            const wallDistance = 8;
            wallModel.position.set(50, 0, -8);
            wallModel.rotation.set(0, 0, 0);
        };

        const rotorData = ref<{ rpm: number, thrust: number }[]>([]);
        
        const initRotorData = (num: number) => {
            rotorData.value = Array.from({ length: num }, () => ({
                rpm: 0,
                thrust: 0
            }));
        };

        const renderDroneTrail3D = () => {
            scene.children
                .filter(child => child.name === "droneTrail")
                .forEach(trail => scene.remove(trail));

            for (let i = 0; i < numDrones.value; i++) {
                const droneTrail = droneTrailData.filter(d => d.droneId === i);
                if (droneTrail.length < 2) continue;

                const trailGeometry = new THREE.BufferGeometry();
                const trailMaterial = new THREE.LineBasicMaterial({
                    color: `hsl(${(i * 60) % 360}, 100%, 50%)`,
                    linewidth: 2
                });

                const positions = new Float32Array(droneTrail.length * 3);
                droneTrail.forEach((point, index) => {
                    positions[index * 3] = point.x;
                    positions[index * 3 + 1] = point.y;
                    positions[index * 3 + 2] = point.z;
                });

                trailGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                const trailLine = new THREE.Line(trailGeometry, trailMaterial);
                trailLine.name = "droneTrail";

                scene.add(trailLine);
            }
        };
        
        const renderStartEndMarkers = () => {
            scene.children
                .filter(child => child.name === "startMarkerF" || child.name === "endMarker")
                .forEach(marker => scene.remove(marker));

            const startGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const startMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const startMarker = new THREE.Mesh(startGeometry, startMaterial);
            startMarker.position.set(trajectory[0].x, trajectory[0].y, trajectory[0].z);
            startMarker.name = "startMarker";
            scene.add(startMarker);

            const endGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const endMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const endMarker = new THREE.Mesh(endGeometry, endMaterial);
            endMarker.position.set(
                trajectory[trajectory.length - 1].x,
                trajectory[trajectory.length - 1].y,
                trajectory[trajectory.length - 1].z
            );
            endMarker.name = "endMarker";
            scene.add(endMarker);
        };

        const recordDronePositions = () => {
            if (frameCounter % trailUpdateInterval === 0) { 
                const errorFactor = calculateErrorFactor();

                drones.forEach((drone, i) => {
                droneTrailData.push({
                    x: drone.model.position.x,
                    y: drone.model.position.y,
                    z: drone.model.position.z,
                    droneId: i
                });
                droneFlightData.value.push({
                    x: applyError(drone.model.position.x, errorFactor/2),
                    y: applyError(drone.model.position.y, errorFactor/2),
                    z: applyError(drone.model.position.z, errorFactor/2),
                    x_ref: drone.model.position.x,
                    y_ref: drone.model.position.y,
                    z_ref: drone.model.position.z,
                    roll: applyError(orientation.value.roll + 0.05, errorFactor*2),
                    pitch: applyError(orientation.value.pitch + 0.05, errorFactor*2),
                    yaw: applyError(orientation.value.yaw + 0.05, errorFactor*2),
                    roll_ref: orientation.value.roll,
                    pitch_ref: orientation.value.pitch,
                    yaw_ref: orientation.value.yaw,
                    time: performance.now() / 1000,
                    droneId: i,
                    formation: formationType.value
                });

            });
            renderDroneTrail3D();

            }
            frameCounter++;
        };


        const addGround = () => {
            const textureLoader = new THREE.TextureLoader();
            const groundTexture = textureLoader.load("/textures/ground.jpg");

            groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(50, 50);

            const groundGeometry = new THREE.PlaneGeometry(200, 200);
            const groundMaterial = new THREE.MeshStandardMaterial({
                map: groundTexture,
                side: THREE.DoubleSide,
            });

            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.25;
            ground.position.x = 30

            scene.add(ground);
        };

        const speed = ref(0.5)
        const diameter = ref(Math.max(5, numDrones.value * 0.8))

        
        watch([formationType, diameter], () => {
            updateFormationRadius();
        });

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

        const loadDroneModel = async (): Promise<{ model: THREE.Object3D, propellers: THREE.Object3D[] }> => {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader()
                const dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath("/draco/")
                loader.setDRACOLoader(dracoLoader)

                loader.load("/3d/drone_without_prop.glb", (gltf) => {
                    const drone = gltf.scene
                    drone.scale.set(3, 3, 3)
                    scene.add(drone)
                    
                    loader.load("/3d/prop.glb", (propGltf) => {
                        const prop = propGltf.scene
                        prop.scale.set(1, 1, 1)
                        drone.add(prop)
                        let propellerParts: THREE.Object3D[] = []

                        prop.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                propellerParts.push(child)
                            }
                        })

                        const propPositions = [
                            [0.28, 0.05, 0],  // Propeller 1 (depan kanan)
                            [0, 0.05, -0.28], // Propeller 2 (depan kiri)
                            [0, 0.05, 0.28], // Propeller 3 (belakang kanan)
                            [-0.28, 0.05, 0] // Propeller 4 (belakang kiri)
                        ]

                        propellerParts.forEach((part, index) => {
                            if (index < propPositions.length) {
                                const [x, y, z] = propPositions[index]
                                part.position.set(x, y, z)

                                drone.traverse((child) => {
                                    if (child instanceof THREE.Mesh) {
                                        child.material.transparent = true;
                                        child.material.opacity = 0.4;
                                    }
                                });
                            }
                        })


                        drone.add(prop)
                        
                        resolve({ model: drone, propellers: propellerParts })
                    }, undefined, reject)
                }, undefined, reject)
            })
        }

        const drawFormationLine = () => {
            if (formationLine) { scene.remove(formationLine); }

            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
            const points: THREE.Vector3[] = [];

            for (let i = 0; i <= 100; i++) {
                const angle = (i / 100) * Math.PI * 2;
                const x = currentTrajectory.x + radiusX * Math.cos(angle);
                const z = currentTrajectory.x + radiusY * Math.sin(angle);
                points.push(new THREE.Vector3(x, 0.1, z));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
            formationLine = new THREE.Line(geometry, material);
            formationLine.position.set(0, 0.1, 0);
            scene.add(formationLine);
        };

        const windSpeed = ref(0); 
        const windDirection = ref(0); 


        const updateWind = () => {
            windSpeed.value += (Math.random() - 0.5) * 0.2; // naik turun ±0.2 m/s
            windSpeed.value = Math.max(0, Math.min(windSpeed.value, 10)); // batas 0–10 m/s

            windDirection.value += (Math.random() - 0.5) * 5; // naik turun ±5°
            windDirection.value = (windDirection.value + 360) % 360; // wrap 0–360
        };


        const updateFormationLine = () => {
            if (!formationLine) return;

            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
            const points: THREE.Vector3[] = [];

            for (let i = 0; i <= 100; i++) {
                const angle = (i / 100) * Math.PI * 2;
                const x = currentTrajectory.x + radiusX * Math.cos(angle);
                const z = currentTrajectory.z + radiusY * Math.sin(angle);
                points.push(new THREE.Vector3(x, currentTrajectory.y, z));
            }

            gsap.to(formationLine!.geometry.attributes.position.array, {
                endArray: points.flat(),
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                    formationLine!.geometry.setFromPoints(points);
                    checkEachDist()
                    formationLine!.geometry.attributes.position.needsUpdate = true;
                }
            });
        };

        const calculateErrorFactor = () => {
            let errorPercent = 2

            const tsmcChecked = (document.querySelector("#tsmcCheckbox") as HTMLInputElement)?.checked ?? true;
            const avoidanceChecked = (document.querySelector("#avoidanceCheckbox") as HTMLInputElement)?.checked ?? true;
            const ekfChecked = (document.querySelector("#ekfCheckbox") as HTMLInputElement)?.checked ?? true;

            if (!tsmcChecked) errorPercent += 40;
            if (!avoidanceChecked) errorPercent += 20;
            if (!ekfChecked) errorPercent += 10;

            return errorPercent / 100
        };

        const applyError = (value: number, errorFactor: number) => {
            const randomSign = Math.random() > 0.5 ? 1 : -1;
            return value + randomSign * value * errorFactor * Math.random();
        };
 
        const updateFormation = () => {
            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;

            drones.forEach((drone, i) => {
                const angle = (i / numDrones.value) * Math.PI * 2;
                const formationX = radiusX * Math.cos(angle);
                const formationZ = radiusY * Math.sin(angle);

                if (isPlaying.value) {
                    gsap.to(drone.model.position, {
                        x: drone.model.position.x + (formationX - (drone.model.position.x % radiusX)),
                        z: drone.model.position.z + (formationZ - (drone.model.position.z % radiusY)),
                        duration: 1,
                        ease: "power2.out",
                    });
                } else {
                    gsap.to(drone.model.position, {
                        x: formationX,
                        y: 0.1,
                        z: formationZ,
                        duration: 1,
                        ease: "power2.out",
                    });
                }

                gsap.to(drone.model.rotation, {
                    y: Math.atan2(formationZ, formationX),
                    duration: 1,
                    ease: "power2.out",
                });
            });

            if (isPlaying.value) {
                gsap.to(formationLine!.position, {
                    x: formationLine!.position.x,
                    y: formationLine!.position.y,
                    z: formationLine!.position.z,
                    duration: 1,
                    ease: "power2.out",
                    onUpdate: updateFormationLine
                });
            } else {
                updateFormationLine();
            }

            updateWallPosition();
        };


        const checkEachDist = () => {
            // if(!isPlaying.value) {
                if (numDrones.value * 0.8 > diameter.value) {
                    gsap.to(diameter, {
                        value: numDrones.value * 0.8,
                        duration: 1,
                        ease: "power2.out",
                        onUpdate: updateFormation
                    })
                }
            // }
        } 

        const formationCenter = ref({ x: 0, y: 0, z: 0 })
        const formationRadius = ref({ x: diameter.value / 2, y: diameter.value / 2 })

        const updateRotation = (roll: number, pitch: number, yaw: number) => {
            drones.forEach(drone => {
                drone.model.rotation.x += (THREE.MathUtils.degToRad(pitch) - drone.model.rotation.x) * 0.1
                drone.model.rotation.y += (THREE.MathUtils.degToRad(yaw) - drone.model.rotation.y) * 0.1
                drone.model.rotation.z += (THREE.MathUtils.degToRad(roll) - drone.model.rotation.z) * 0.1
            })
        }

        const updateFormationRadius = () => {
            const targetRadiusX = diameter.value / 2;
            const targetRadiusY = formationType.value === "circle" ? targetRadiusX : targetRadiusX * 0.6;

            gsap.to(formationRadius.value, {
                x: targetRadiusX,
                y: targetRadiusY,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                    updateDronesPosition();
                }
            });
        };


        const updateDronesPosition = () => {
            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;

            drones.forEach((drone, i) => {
                const angle = (i / numDrones.value) * Math.PI * 2;
                const formationX = radiusX * Math.cos(angle);
                const formationZ = radiusY * Math.sin(angle);

                drone.model.position.x = formationCenter.value.x + formationX;
                // drone.model.position.y = formationCenter.value.y;
                drone.model.position.y = altitudeInput.value;
                drone.model.position.z = formationCenter.value.z + formationZ;
            });
        };

        const showFlightCharts = () => {
            const errorFactor = calculateErrorFactor();
            const droneId = selectedDroneIndex.value;

            const droneData = droneFlightData.value.filter(d => d.droneId === droneId);
            const times = droneData.map(d => d.time.toFixed(2));
            const roll = droneData.map(d => applyError(d.roll, errorFactor));
            const pitch = droneData.map(d => applyError(d.pitch, errorFactor));
            const yaw = droneData.map(d => applyError(d.yaw, errorFactor));

            flightRollChartData.value = {
                labels: times,
                datasets: [
                    {
                        label: `Drone ${droneId + 1} - Roll (°)`,
                        data: roll,
                        borderColor: 'purple',
                        backgroundColor: 'purple',
                        fill: false
                    }
                ]
            }

            flightPitchChartData.value = {
                labels: times,
                datasets: [
                    {
                        label: `Drone ${droneId + 1} - Pitch (°)`,
                        data: pitch,
                        borderColor: 'orange',
                        backgroundColor: 'orange',
                        fill: false
                    }
                ]
            }

            flightYawChartData.value = {
                labels: times,
                datasets: [
                    {
                        label: `Drone ${droneId + 1} - Yaw (°)`,
                        data: yaw,
                        borderColor: 'cyan',
                        backgroundColor: 'cyan',
                        fill: false
                    }
                ]
            }

            const container = document.getElementById('flight3DContainer');
            if (!container) return;
            container.innerHTML = '';

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            camera.position.set(20, 20, 20);
            camera.lookAt(0, 0, 0);

            const light = new THREE.PointLight(0xffffff, 1);
            light.position.set(10, 10, 10);
            scene.add(light);

            const controls = new OrbitControls(camera, renderer.domElement);

            const droneCount = Math.max(...droneFlightData.value.map(d => d.droneId)) + 1;

            for (let i = 0; i < droneCount; i++) {
                const data = droneFlightData.value.filter(d => d.droneId === i);
                const points = data.map(d => new THREE.Vector3(d.x, d.y, d.z));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: colorPalette[i % colorPalette.length],
                    linewidth: 2
                });
                const line = new THREE.Line(geometry, material);
                scene.add(line);
            }

            const formationSnapshots: { time: number, type: string, positions: THREE.Vector3[] }[] = [];
            let lastFormation = '';
            let snapshot: { time: number, type: string, positions: THREE.Vector3[] } | null = null;

            droneFlightData.value.forEach(data => {
                if (data.formation !== lastFormation) {
                    if (snapshot) formationSnapshots.push(snapshot);
                    snapshot = {
                        time: data.time,
                        type: data.formation,
                        positions: []
                    };
                    lastFormation = data.formation;
                }
                if (snapshot) {
                    snapshot.positions.push(new THREE.Vector3(data.x, data.y, data.z));
                }
            });
            if (snapshot) formationSnapshots.push(snapshot);

            formationSnapshots.forEach(snap => {
                if (snap.positions.length > 1) {
                    const points = [...snap.positions, snap.positions[0].clone()];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineDashedMaterial({
                        color: 0xffffff,
                        linewidth: 1,
                        dashSize: 1,
                        gapSize: 0.5,
                        transparent: true
                    });
                    const line = new THREE.Line(geometry, material);
                    line.computeLineDistances();
                    if (snap.type === 'ellipse') {
                        line.scale.set(1.2, 1, 0.6);
                    }
                    scene.add(line);
                }
            });

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            const modal = document.getElementById('flight_modal') as HTMLDialogElement;
            if (modal) modal.showModal();
        };

        const playSimulation = (continueSimulation = false) => {
            isPlaying.value = true;
                
            trajectory.forEach((point, index) => {
                let delay = (index) * (2 / speed.value);

                let targetX = point.x + 2;
                let targetY = point.y + 3;
                let targetZ = point.z + 5;

                if (index === 2) {
                    targetX = point.x + 20;
                    targetY = point.y + 10; 
                    targetZ = point.z + 8;
                } else if (index === 5) { 
                    targetX = point.x + 20;
                    targetY = point.y + 3;
                    targetZ = point.z + 12;
                }

                gsap.to(camera.position, {
                    x: targetX,
                    y: targetY,
                    z: targetZ,
                    duration: 2 / speed.value,
                    delay: delay,
                    ease: "power2.out",
                    onUpdate: () => {
                        camera.lookAt(point.x, point.y, point.z);
                    }
                });
                gsap.to(formationLine!.position, {
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    duration: 2 / speed.value,
                    delay: delay,
                    ease: "power2.out",
                    onUpdate: updateFormationLine
                });

                gsap.to(formationCenter.value, {
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    duration: 2 / speed.value,
                    delay: delay,
                    ease: "power2.out",
                    onUpdate: () => {
                        formationType.value = point.formation
                        updateDronesPosition()
                    },
                    onStart: () => {
                        if (typeof point.agents === 'number') adjustAgentsToWaypoint(point.agents)
                    }
                });

                drones.forEach((drone, i) => {
                    const formationAngle = (i / numDrones.value) * Math.PI * 2;
                    const radiusX = diameter.value / 2;
                    const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
                    const formationX = radiusX * Math.cos(formationAngle);
                    const formationZ = radiusY * Math.sin(formationAngle);
                    
                    gsap.to(drone.model.position, {
                        x: point.x + formationX,
                        y: (index === 0 || index === 1) 
                            ? point.y 
                            : point.y + Math.cos(formationAngle) * 1.2,
                        z: point.z + formationZ,
                        duration: 2 / speed.value,
                        delay: delay,
                        ease: "power2.out",
                        onUpdate: updateFormationLine,
                        onComplete: () => {
                            if (index === trajectory.length - 1) {
                                updateFormation();
                                isPlaying.value = false;
                                isPropellerRotating.value = false;
                                showFlightCharts();
                            }
                        },
                    });

                    gsap.to(drone.model.rotation, {
                        y: Math.atan2(point.z + formationZ, point.x + formationX),
                        duration: 2 / speed.value,
                        delay: delay,
                        ease: "power2.out",
                    });
                });
            });
            startRealtimeError();
        };
        
        const getReferencePosition = (index: number, timeSec: number) => {
            const radiusX = diameter.value / 2;
            const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
            const angle = (index / numDrones.value) * Math.PI * 2;
            const x = formationCenter.value.x + radiusX * Math.cos(angle);
            const y = altitudeInput.value;
            const z = formationCenter.value.z + radiusY * Math.sin(angle);
            return { x, y, z };
        }

        const twistingSlidingControl = (e: number, edot: number, edotdot: number, lambda: number, k: number, eta: number) => {
            const s = edot + lambda * e;
            const sdot = edotdot + lambda * edot;

            const u_tsmc = -k * Math.sign(s) - eta * Math.sign(sdot);
            return u_tsmc;
        }

        const startRealtimeError = () => {
            if (errorInterval) clearInterval(errorInterval);

            errorInterval = setInterval(() => {
                drones.forEach(drone => {
                    const errorFactor = 0.05 * diameter.value;
                    const errorX = (Math.random() - 0.5) * errorFactor;
                    const errorY = (Math.random() - 0.5) * errorFactor;
                    const errorZ = (Math.random() - 0.5) * errorFactor;

                    gsap.to(drone.model.position, {
                        x: `+=${errorX}`,
                        y: `+=${errorY}`,
                        z: `+=${errorZ}`,
                        duration: 0.8,
                        ease: "power1.inOut",
                    });
                });
            }, 5000);
        };

        const togglePropellerRotation = () => {
            isPropellerRotating.value = !isPropellerRotating.value
            playSimulation()
        }


        const initializeTrajectory = () => {
            trajectory = [
                { x: 0, y: altitudeInput.value, z: 0, formation: 'circle', agents: 5},
                { x: 28, y: altitudeInput.value, z: 0, formation: 'ellipse', agents: 5},
                { x: 50, y: altitudeInput.value, z: -10, formation: 'circle', agents: 5},
                { x: 75, y: altitudeInput.value + 1, z: 0, formation: 'cricle', agents: 4},
                { x: 75, y: altitudeInput.value - 1, z: 0, formation: 'ellipse', agents: 4},
                { x: 98, y: altitudeInput.value + 1, z: 0, formation: 'circle', agents: 5},
                { x: 110, y: altitudeInput.value, z: 0, formation: 'circle', agents: 5},
                { x: 110, y: altitudeInput.value, z: 20, formation: 'circle', agents: 6},
                { x: 0, y: altitudeInput.value, z: 20, formation: 'circle', agents: 5},
                { x: 0, y: altitudeInput.value, z: 0, formation: 'circle', agents: 4},
                { x: 0, y: 0.1, z: 0, formation: 'circle', agents: 5},
            ];
        };

        const adjustAgentsToWaypoint = async (desiredCount: number) => {
            const currentCount = numDrones.value;
            if (desiredCount > currentCount) {
                for (let i = 0; i < desiredCount - currentCount; i++) {
                    for (let i = 0; i < desiredCount - currentCount; i++) await addDrone(true);
                }
            } else if (desiredCount < currentCount) {
                for (let i = 0; i < currentCount - desiredCount; i++) removeDrone(true);
            }
            updateFormation()
        };


        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            updateRotation(orientation.value.roll, orientation.value.pitch, orientation.value.yaw);

            if (isPropellerRotating.value) {
                updateSpeed();
            }

            if (isPlaying.value) {
                recordDronePositions();

                const timeSec = performance.now() / 1000;
                const lambda = 1.2;
                const k = 0.8;
                const eta = 0.3;

                const tsmcChecked = (document.querySelector("#tsmcCheckbox") as HTMLInputElement)?.checked ?? true;

                drones.forEach((drone, i) => {
                    const ref = getReferencePosition(i, timeSec);
                    const pos = drone.model.position;

                    const error = {
                        x: ref.x - pos.x,
                        y: ref.y - pos.y,
                        z: ref.z - pos.z
                    };
                    const edot = {
                        x: (Math.random() - 0.5) * 0.02,
                        y: (Math.random() - 0.5) * 0.02,
                        z: (Math.random() - 0.5) * 0.02
                    };

                    const edotdot = { x: 0, y: 0, z: 0 }; // second derivative not modeled in this simulation

                    if (tsmcChecked) {
                        const ux = twistingSlidingControl(error.x, edot.x, edotdot.x, lambda, k, eta);
                        const uy = twistingSlidingControl(error.y, edot.y, edotdot.y, lambda, k, eta);
                        const uz = twistingSlidingControl(error.z, edot.z, edotdot.z, lambda, k, eta);

                        drone.model.position.x += ux * 0.05;
                        drone.model.position.y += uy * 0.05;
                        drone.model.position.z += uz * 0.05;
                    }

                    rotorData.value[i].rpm = 5000 + Math.random() * 500;
                    rotorData.value[i].thrust = 2.0 + Math.random() * 0.2;

                    calculateTSMCAdjustment(i, timeSec);
                    calculateFlockingAlphaAdjustment(i, timeSec);
                    calculateEKFEstimationQuality(i, timeSec);
                    calculateBearingMeasurementError(i, timeSec);
                });

                generateMethodParameters();
            }

            updateWind();
            renderer.render(scene, camera);
        };

        const addDrone = async (increment = true) => {
            const newDrone = await loadDroneModel()
            drones.push(newDrone)
            if(increment) {
                numDrones.value++
                rotorData.value.push({ rpm: 0, thrust: 0 });
                if (isPlaying.value) {
                    const startX = currentTrajectory.x + (Math.random() - 0.5) * 10;
                    const startZ = currentTrajectory.z + (Math.random() - 0.5) * 10;
                    newDrone.model.position.set(startX, currentTrajectory.y, startZ);

                    const formationAngle = ((numDrones.value - 1) / numDrones.value) * Math.PI * 2;
                    const radiusX = diameter.value / 2;
                    const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
                    const targetX = currentTrajectory.x + radiusX * Math.cos(formationAngle);
                    const targetZ = currentTrajectory.z + radiusY * Math.sin(formationAngle);

                    gsap.to(newDrone.model.position, {
                        x: targetX,
                        y: currentTrajectory.y,
                        z: targetZ,
                        duration: 2,
                        ease: "power2.out",
                        onComplete: () => {
                            console.log("Drone baru berhasil masuk ke formasi.");
                            updateFormation()
                        }
                    });
                    gsap.to(newDrone.model.rotation, {
                        y: Math.atan2(targetZ, targetX),
                        duration: 1.5,
                        ease: "power2.out"
                    });

                    setTimeout(() => updateFormation(), 2100);
                } else {
                    const randomX = (Math.random() - 0.5) * 5
                    const randomZ = (Math.random() - 0.5) * 5
                    const altitude = trajectory[0]?.y ?? 0.1;
                    newDrone.model.position.set(randomX, altitude, randomZ)
                    
                    const i = drones.length - 1;
                    const angle = (i / numDrones.value) * Math.PI * 2;
                    const radiusX = diameter.value / 2;
                    const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6;
                    const formationX = radiusX * Math.cos(angle);
                    const formationZ = radiusY * Math.sin(angle);

                    gsap.to(newDrone.model.position, {
                        x: formationX,
                        y: 0.1,
                        z: formationZ,
                        duration: 1.5,
                        ease: "power2.out"
                    })

                    gsap.to(newDrone.model.rotation, {
                        y: Math.atan2(formationZ, formationX),
                        duration: 1.2,
                        ease: "power2.out"
                    });

                    drones.forEach((drone, i) => {
                        const angle = (i / numDrones.value) * Math.PI * 2
                        const radiusX = diameter.value / 2
                        const radiusY = formationType.value === "circle" ? radiusX : radiusX * 0.6
                        const x = radiusX * Math.cos(angle)
                        const y = radiusY * Math.sin(angle)
                        
                        let step = 0
                        const transition = () => {
                            if (step < 1) {
                                step += 0.02
                                drone.model.position.lerp(new THREE.Vector3(x, 0, y), step)
                                requestAnimationFrame(transition)
                            }
                        }
                        transition()
                    })
                    setTimeout(() => updateFormation(), 1600);
                }
            }
        }

        const removeDrone = (smooth: boolean = false) => {
            if (drones.length > 0) {
                const drone = drones.pop();
                if (drone) {
                    if(smooth) {
                        gsap.to(drone.model.position, {
                            y: 10,
                            duration: 1,
                            ease: "power2.out",
                            onComplete: () => {
                                scene.remove(drone.model);
                                numDrones.value--;
                                rotorData.value.pop();
                                updateFormation();
                            }
                        });
                    } else {
                        scene.remove(drone.model)
                        numDrones.value--;
                        rotorData.value.pop();
                        updateFormation();
                    }
                }
            }
        };

        const calculateTSMCAdjustment = (droneIndex: number, timeSec: number) => {
            const slidingSurface = slidingSurfaces.value[droneIndex] || 30;
            const rpm = rotorData.value[droneIndex]?.rpm ?? 5000;
            const wind = windSpeed.value;
            const dynamicDisturbance = Math.sin(timeSec * 0.5) * wind * 0.05;
            const gravityCompensation = 9.807 - 0.01 * rpm / 100;

            const robustness = slidingSurface / (1 + dynamicDisturbance) - gravityCompensation;

            return Math.max(0, robustness);
        };

        const calculateFlockingAlphaAdjustment = (droneIndex: number, timeSec: number) => {
            const alphaLattice = alphaLattices.value[droneIndex] || 1;
            const thrust = rotorData.value[droneIndex]?.thrust ?? 2.0;
            const rotationalNoise = Math.abs(Math.cos(timeSec * 0.3)) * 0.1;
            const windImpact = Math.pow(windSpeed.value * 0.02, 2);

            const spacingError = (alphaLattice + windImpact + rotationalNoise) / (1 + thrust);

            return spacingError;
        };

            const calculateEKFEstimationQuality = (droneIndex: number, timeSec: number) => {
            const baseCovariance = covarianceTraces.value[droneIndex] || 0.02;
            const windEffect = Math.exp(-windSpeed.value * 0.1);
            const updateRateImpact = 1 / (controllerRates.value[droneIndex] ?? 100);
            const timeDecay = 1 + 0.02 * timeSec;

            const covariance = baseCovariance * windEffect * updateRateImpact * timeDecay;

            return Math.min(covariance, 1);
            };

            const calculateBearingMeasurementError = (droneIndex: number, timeSec: number) => {
            const baseNoise = bearingNoises.value[droneIndex] || 0.002;
            const windEffect = Math.abs(Math.sin(timeSec * 0.2)) * (windSpeed.value * 0.001);
            const vibrationEffect = (rotorData.value[droneIndex]?.rpm ?? 5000) * 0.0000005;
            const randomDrift = (Math.random() - 0.5) * 0.0005;

            const totalError = baseNoise + windEffect + vibrationEffect + randomDrift;

            return Math.max(0, totalError);
            };


        const updateSpeed = () => {
            drones.forEach(drone => {
                drone.propellers.forEach(propeller => {
                    propeller.rotation.y += speed.value
                })
            })
        }

        const startRendering = async () => {
            await initThreeJs()
            await loadWallModel()
            addGround()
            drawFormationLine()
            
            initializeTrajectory();

            for (let i = 0; i < numDrones.value; i++) {
                await addDrone(false)
                await updateFormation()
            }
            // listenGyroData()
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

        const downloadFlightData = () => {
            const errorFactor = calculateErrorFactor();
            const droneCount = Math.max(...droneFlightData.value.map(d => d.droneId)) + 1;

            const workbook = XLSX.utils.book_new();

            for (let droneId = 0; droneId < droneCount; droneId++) {
                const data = droneFlightData.value.filter(d => d.droneId === droneId);

                const rows = data.map(row => ({
                    Time: row.time.toFixed(2),
                    DroneID: row.droneId,
                    X: row.x.toFixed(3),
                    Y: row.y.toFixed(3),
                    Z: row.z.toFixed(3),
                    X_ref: row.x_ref?.toFixed(3),
                    Y_ref: row.y_ref?.toFixed(3),
                    Z_ref: row.z_ref?.toFixed(3),
                    Error_X: row.x_ref ? (row.x - row.x_ref).toFixed(3) : '',
                    Error_Y: row.y_ref ? (row.y - row.y_ref).toFixed(3) : '',
                    Error_Z: row.z_ref ? (row.z - row.z_ref).toFixed(3) : '',
                    Roll: row.roll.toFixed(2),
                    Pitch: row.pitch.toFixed(2),
                    Yaw: row.yaw.toFixed(2),
                    Roll_ref: row.roll_ref?.toFixed(2),
                    Pitch_ref: row.pitch_ref?.toFixed(2),
                    Yaw_ref: row.yaw_ref?.toFixed(2),
                    Error_Roll: row.roll_ref ? (row.roll - row.roll_ref).toFixed(2) : '',
                    Error_Pitch: row.pitch_ref ? (row.pitch - row.pitch_ref).toFixed(2) : '',
                    Error_Yaw: row.yaw_ref ? (row.yaw - row.yaw_ref).toFixed(2) : '',
                    Formation: row.formation
                }));

                const worksheet = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(workbook, worksheet, `Drone_${droneId + 1}`);
            }

            XLSX.writeFile(workbook, 'FlightData_AllDrones.xlsx');
        };


        onMounted(async () => {
            await nextTick()
            setTimeout(async () => {
                await startRendering()
                generateMethodParameters()
                initRotorData(numDrones.value)
            }, 500)
        })

        watch(speed, updateSpeed)
        watch(diameter, updateFormation)
        watch(formationType, updateFormation)
        watch(selectedDroneIndex, showFlightCharts)

        return { 
            canvasContainer, 
            altitudeInput,
            selectedDroneIndex,
            containerSimulation, 
            orientation,
            updateSpeed,
            numDrones, 
            togglePropellerRotation,
            formationType, 
            updateFormation,
            addDrone,
            removeDrone,
            speed,
            diameter,
            isPropellerRotating,
            flightPositionChartData,
            flightRollChartData,
            flightPitchChartData,
            flightYawChartData,
            flightChartOptions,
            showFlightCharts,
            downloadFlightData,
            rotorData,
            windSpeed,
            windDirection,
            slidingSurfaces,
            alphaLattices,
            covarianceTraces,
            bearingNoises,
            controllerRates,
        }
    }
})
</script>