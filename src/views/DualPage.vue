<template>
    <AppLayout>
        <div class="p-4">
            <div class="grid md:grid-cols-3 gap-6 grid-cols-1">
                <div>
                    <div class="w-full p-4 rounded-xl bg-base-200">
                        <div class="form-control w-full mb-3">
                            <label class="label cursor-pointer">
                                <span class="label-text">Implement for all drones</span>
                                <input v-model="implementAll" type="checkbox" class="toggle toggle-primary"/>
                            </label>
                        </div>
                        <h1 class="font-bold mb-3">Trajectory</h1>
                        <div v-if="implementAll" class="space-y-3">
                            <button @click="addWaypoint"
                                class="btn bg-blue-500/20 w-full hover:bg-blue-500/30 p-3 text-blue-600 rounded-xl">
                                Add Waypoint
                            </button>
                            <div v-for="(wp, idx) in waypoints" :key="idx"
                                class="p-3 bg-base-100 rounded-xl flex justify-between pr-20 items-center relative gap-3">
                                <select v-model="wp.action" class="select select-bordered select-sm w-36">
                                    <option value="Takeoff">Takeoff</option>
                                    <option value="Move Forward">Move Forward</option>
                                    <option value="Move Back">Move Back</option>
                                    <option value="Move Left">Move Left</option>
                                    <option value="Move Right">Move Right</option>
                                    <option value="Up">Up</option>
                                    <option value="Down">Down</option>
                                    <option value="Land">Land</option>
                                </select>
                                <input v-model="wp.value" type="number" 
                                    class="input input-bordered input-sm w-20 text-center" />
                                <button @click="removeWaypoint(idx)"
                                    class="btn btn-sm absolute right-2 top-1/2 -translate-y-1/2">
                                    <Icon icon="material-symbols:close-rounded" width="24" height="24" />
                                </button>
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-500 mt-2">
                            Rules are available per drone below each telemetry.
                        </p>
                        <button class="btn bg-blue-500 w-full mt-3 hover:bg-blue-600 text-white p-3 rounded-xl">
                            Run Waypoint
                        </button>
                    </div>
                </div>

                <div v-for="(drone, i) in drones" :key="drone.id" class="relative">
                    <div class="absolute left-0 top-0 p-3">
                        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Drone {{ drone.id }} - {{ drone.mode }}
                        </span>
                    </div>
                    <div class="bg-blue-800 rounded-3xl">
                        <canvas :ref="el => canvasRefs[i] = el"
                            class="w-full h-64 bg-blue-600 rounded-3xl relative">
                        </canvas>
                    </div>
                    <div>
                        <div role="tablist" class="tabs tabs-boxed mt-3">
                            <a role="tab" class="tab" @click="onClickMenu('Status', i)" :class="{'bg-blue-600 text-white': menuSelectedDrone[i].mode == 'Status'}">Status</a>
                            <a role="tab" class="tab" @click="onClickMenu('Param', i)" :class="{'bg-blue-600 text-white': menuSelectedDrone[i].mode == 'Param'}">Param</a>
                            <a role="tab" class="tab" @click="onClickMenu('Trajectory', i)" :class="{'bg-blue-600 text-white': menuSelectedDrone[i].mode == 'Trajectory'}">Trajectory</a>
                        </div>
                    </div>
                    <div v-if="menuSelectedDrone[i].mode == 'Status'" class="p-4 bg-base-200 mt-3 rounded-3xl gap-2 grid grid-cols-3 justify-between">
                        <div v-for="(val, key) in drone.telemetry" :key="key" class="p-2">
                            <span class="text-xs uppercase">{{ key }}</span>
                            <h2 class="text-xl font-bold">{{ val.toFixed(1) }}</h2>
                        </div>
                    </div>
                    <div v-if="menuSelectedDrone[i].mode == 'Param'" class="p-4 bg-base-200 mt-3 rounded-3xl gap-2 grid grid-cols-3 justify-between">
                        <div v-for="(val, key) in drone.gain" :key="key" class="p-2">
                            <span class="text-xs uppercase">{{ key }}</span>
                            <input
                                type="number"
                                class="input input-bordered w-full"
                                :value="val"
                                @keyup="onKeyUpParam(key, Number($event.target.value), i)"
                            />
                        </div>
                    </div>
                    <div v-if="menuSelectedDrone[i].mode == 'Trajectory'" class="mt-3 p-4 bg-base-200 rounded-3xl space-y-3">
                        <h2 class="font-bold mb-2">Rules for Drone {{ i + 1 }}</h2>
                        <button @click="addRule(i)"
                            class="btn mt-2 bg-blue-500/20 w-full hover:bg-blue-500/30 p-3 text-blue-600 rounded-xl">
                            Add Rule
                        </button>
                        <div v-for="(wp, idx) in drone.trajectory" :key="idx"
                            class="p-3 bg-base-100 rounded-xl flex justify-between items-center pr-20 relative gap-3">
                            <select @change="editRule(i, idx, 'mode', wp.mode)" v-model="wp.mode" class="select select-bordered select-sm w-36">
                                <option value="takeoff">Takeoff</option>
                                <option value="forward">Move Forward</option>
                                <option value="backward">Move Back</option>
                                <option value="left">Move Left</option>
                                <option value="right">Move Right</option>
                                <option value="up">Up</option>
                                <option value="down">Down</option>
                                <option value="hover">Hover</option>
                                <option value="land">Land</option>
                            </select>
                            <input v-model="wp.duration" type="number" 
                                class="input input-bordered input-sm w-24 text-center" />
                            <button @click="removeRule(i, idx)"
                                class="btn btn-sm absolute right-2 top-1/2 -translate-y-1/2">
                                <Icon icon="material-symbols:close-rounded" width="24" height="24" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Icon } from '@iconify/vue';
import { ref, Ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { database, ref as dbRef, onValue } from '@/firebase'

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { remove, set, update } from 'firebase/database';
interface Gain {
  lambda_roll: number;
  k_roll: number;
  phi_roll: number;
  lambda_pitch: number;
  k_pitch: number;
  phi_pitch: number;
  u_max: number;
  roll_sp_min: number;
  roll_sp_max: number;
  pitch_sp_min: number;
  pitch_sp_max: number;
  roll_sp: number;
  pitch_sp: number;
}
interface Waypoint {
  mode: string;
  duration: number;
}
interface Drone {
  trajectory: Waypoint[];
}
const canvasRefs: Ref<HTMLCanvasElement[]> = ref([]);
const implementAll = ref(true);
const drones: Ref<any> = ref([
    {
        id: 1,
        mode: "Idle",
        trajectory: [],
        gain: {} as Gain,
        telemetry: { x: 2, y: 4, z: 2, roll: 12, pitch: 3, yaw: 90, pwm1: 0, pwm2: 0, pwm3: 0, pwm4: 0 }
    },
    {
        id: 2,
        mode: "Idle",
        trajectory: [],
        gain: {} as Gain,
        telemetry: { x: 0, y: 1, z: 1, roll: 10, pitch: 10, yaw: 45, pwm1: 0, pwm2: 0, pwm3: 0, pwm4: 0 }
    }
]);
const waypoints = ref([
    { action: "Takeoff", value: 5 },
    { action: "Move Forward", value: 5 },
]);
const addWaypoint = () => {
    waypoints.value.push({ action: "Move Forward", value: 5 });
};
const removeWaypoint = (i: number) => {
    waypoints.value.splice(i, 1);
};
const perDroneRules = ref(
    drones.value.map(() => [
        { action: "Takeoff", value: 5 }
    ])
);
const addRule = async (index: number) => {
  const newRule = {
    mode: "hover",
    duration: 1000,
  };
  drones.value[index].trajectory.push(newRule);
  const droneId = `drone${index + 1}`;
  const newIndex = drones.value[index].trajectory.length - 1;
  await set(
    dbRef(database, `/${droneId}/trajectory/${newIndex}`),
    newRule
  );
};


const editRule = async (
  droneIndex: number,
  ruleIndex: number,
  key: "mode" | "duration",
  value: any
) => {
  drones.value[droneIndex].trajectory[ruleIndex][key] = value;
  const droneId = `drone${droneIndex + 1}`;
  await update(
    dbRef(database, `/${droneId}/trajectory/${ruleIndex}`),
    { [key]: value }
  );
};

const removeRule = async (droneIndex: number, ruleIndex: number) => {
  const droneId = `drone${droneIndex + 1}`;
  await remove(dbRef(database, `/${droneId}/trajectory/${ruleIndex}`));
  drones.value[droneIndex].trajectory.splice(ruleIndex, 1);
  const updatedList = drones.value[droneIndex].trajectory;
  await set(dbRef(database, `/${droneId}/trajectory`), updatedList);
};
const modelUrl = '/3d/drone.glb';
const scenes: any[] = [];
const cameras: any[] = [];
const renderers: any[] = [];
const controlsArr: any[] = [];
const modelClones: (THREE.Object3D | null)[] = [];
const animIds: (number | null)[] = [];
const mixers: any[] = [];
let gltfSceneMaster: THREE.Object3D | null = null;
let gltfAnimations: any[] = [];

const menuSelectedDrone = ref([
    { mode: "Status" },
    { mode: "Status" }
])

const onClickMenu = (mode: string, index: number) => {
    menuSelectedDrone.value[index].mode = mode;
    localStorage.setItem(`drone_${index + 1}_menu_mode`, mode);
}

let debounceTimer: any = null;

const onKeyUpParam = (key: keyof Gain, val: number, index: number) => {
  if (Number.isNaN(val)) return;
  drones.value[index].gain[key] = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateGainToFirebase(key, val);
  }, 300);
};

const updateGainToFirebase = async (param: any, value: any) => {
  await set(dbRef(database, `/drone1/gain/${param}`), value);
};

const getDrone1 = () => {
    const drone1Data = dbRef(database, 'drone1/data/droneData');
    onValue(drone1Data, (snapshot) => {
        const data = snapshot.val();
        console.log('Drone 1 data:', data);
        const pitch = data.pitch || 0;
        const roll = data.roll || 0;
        const yaw = data.yaw || 0;
        const posX = data.posX || 0;
        const posY = data.posY || 0;
        const posZ = data.posZ || 0;
        drones.value[0].telemetry = {
            x: posX,
            y: posY,
            z: posZ,
            roll: roll,
            pitch: pitch,
            yaw: yaw,
            pwm1: data.pwm1 || 0,
            pwm2: data.pwm1 || 0,
            pwm3: data.pwm1 || 0,
            pwm4: data.pwm1 || 0,
        };
    });
    const drone1Mode = dbRef(database, 'drone1/mode/droneCommand/mode');
    onValue(drone1Mode, (snapshot) => {
        const mode = snapshot.val();
        drones.value[0].mode = mode;
    });
    const drone1Trajectory = dbRef(database, 'drone1/trajectory');
    onValue(drone1Trajectory, (snapshot) => {
        const trajectory = snapshot.val();
        drones.value[0].trajectory = trajectory || [];
    });
    const drone1Gain = dbRef(database, 'drone1/gain');
    onValue(drone1Gain, (snapshot) => {
        const gain = snapshot.val();
        drones.value[0].gain = gain || {};
    });
    console.log(drones.value)
}
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

const loadMasterModel = async () => {
    if (gltfSceneMaster) return { scene: gltfSceneMaster, animations: gltfAnimations };
    return new Promise<{ scene: THREE.Object3D, animations: any[] }>((resolve, reject) => {
        gltfLoader.load(
            modelUrl,
            (gltf: any) => {
                if (!gltf || !gltf.scene) {
                    reject(new Error('Invalid GLTF'))
                    return;
                }
                gltfSceneMaster = gltf.scene;
                gltfAnimations = gltf.animations || [];
                resolve({ scene: gltf.scene, animations: gltf.animations || [] });
            },
            (xhr) => {
                // optional progress
                // console.log(`GLB load: ${(xhr.loaded / (xhr.total || 1)) * 100}%`);
            },
            (err) => {
                console.error('GLTF load error', err);
                reject(err);
            }
        );
    });
};

const initThreeForDrone = async (index: number) => {
    const canvasEl = canvasRefs.value[index];
    if (!canvasEl) return;
    if (renderers[index]) {
        try {
            const old = renderers[index];
            old.domElement.remove();
            old.dispose();
        } catch (e) { /* ignore */ }
    }

    const width = canvasEl.clientWidth || 600;
    const height = canvasEl.clientHeight || 400;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0.8, 0.4, 0.8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const parent = canvasEl.parentElement;
    if (parent) {
        const existing = parent.querySelector('.three-canvas-wrapper');
        if (existing) existing.remove();

        const wrapper = document.createElement('div');
        wrapper.className = 'three-canvas-wrapper';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.appendChild(renderer.domElement);
        parent.insertBefore(wrapper, canvasEl);
        canvasEl.style.display = 'none';
    } else {
        canvasEl.appendChild(renderer.domElement);
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // Save refs
    scenes[index] = scene;
    cameras[index] = camera;
    renderers[index] = renderer;
    controlsArr[index] = controls;
    modelClones[index] = null;
    animIds[index] = null;

    // ensure master model loaded then clone into scene
    try {
        const { scene: masterScene, animations } = await loadMasterModel();

        // clone the master scene for this drone
        const clone = masterScene.clone(true);
        // center and scale (tweak as needed)
        const box = new THREE.Box3().setFromObject(clone);
        const center = new THREE.Vector3();
        box.getCenter(center);
        clone.position.sub(center); // center at origin
        clone.scale.set(1, 1, 1); // adjust if master small/big
        clone.position.set(0, 0, 0);

        scene.add(clone);
        modelClones[index] = clone;

        // if animations exist, create mixer
        if (animations && animations.length > 0) {
            const mixer = new THREE.AnimationMixer(clone);
            animations.forEach((clip: any) => mixer.clipAction(clip).play());
            mixers[index] = mixer;
        }
    } catch (err) {
        console.error('Failed to load master model for drone', err);
    }

    const animate = () => {
        animIds[index] = requestAnimationFrame(animate);
        controls.update();
        const model = modelClones[index];
        if (model) {
            const t = drones.value[index]?.telemetry || { roll: 0, pitch: 0, yaw: 0 };
            const targetYaw = THREE.MathUtils.degToRad(t.yaw || 0);
            const targetPitch = THREE.MathUtils.degToRad(t.pitch || 0);
            const targetRoll = THREE.MathUtils.degToRad(t.roll || 0);
            const current = model.rotation;
            const lerp = (a: number, b: number, f = 0.12) => a + (b - a) * f;
            current.x = lerp(current.x, targetPitch, 0.12);
            current.y = lerp(current.y, targetYaw, 0.12);
            current.z = lerp(current.z, targetRoll, 0.12);

            model.rotation.order = 'ZYX';
        }
        if (mixers[index]) {
            mixers[index].update( (renderers[index]?.info?.render?.frameTime || 1/60) );
        }
        try {
            renderer.render(scene, camera);
        } catch (err) {
            // ignore render errors from context loss etc.
        }
    };

    animate();
    const resizeHandler = () => {
        const w = canvasEl.clientWidth || parent?.clientWidth || 600;
        const h = canvasEl.clientHeight || parent?.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', resizeHandler);
};

onMounted(async () => {
    await nextTick();
    setTimeout(async () => {
        for (let i = 0; i < drones.value.length; i++) {
            await initThreeForDrone(i);
            getDrone1();
        }
    }, 200);
    const localMenu1 = localStorage.getItem('drone_1_menu_mode');
    if (localMenu1) menuSelectedDrone.value[0].mode = localMenu1;
    const localMenu2 = localStorage.getItem('drone_2_menu_mode');
    if (localMenu2) menuSelectedDrone.value[1].mode = localMenu2;
});

onBeforeUnmount(() => {
    for (let i = 0; i < (animIds.length || 0); i++) {
        const id = animIds[i];
        if (id) cancelAnimationFrame(id);
        try {
            if (controlsArr[i]) controlsArr[i].dispose();
            if (renderers[i]) {
                const r = renderers[i];
                if (r.domElement && r.domElement.parentElement) r.domElement.parentElement.remove();
                r.dispose();
            }
            if (scenes[i]) {
                scenes[i].traverse((obj: any) => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach((m: any) => m.dispose && m.dispose());
                        } else {
                            obj.material.dispose && obj.material.dispose();
                        }
                    }
                });
            }
        } catch (e) {
            // ignore disposal errors
        }
    }
    try { dracoLoader.dispose && dracoLoader.dispose(); } catch (e) {}
});
</script>
