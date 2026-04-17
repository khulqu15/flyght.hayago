<template>
    <div class="min-h-screen w-full overflow-hidden bg-base-200 relative">
        <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover absolute"></video>
        <canvas ref="canvasRef" class="bg-black/60 absolute left-0 top-0 z-10 w-full h-full"></canvas>
        <div class="absolute left-0 right-0 z-20 p-3">
            <div class="p-3 capitalize absolute rounde-xl bg-base-100 text-base-content">
                {{ gesture }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref} from 'vue';
import * as tf from "@tensorflow/tfjs"
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection"
import "@tensorflow/tfjs-backend-webgl"

const gesture = ref('NONE')
const videoRef: Ref<HTMLVideoElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
let detector: handPoseDetection.HandDetector
const emit = defineEmits<{
    (e: 'gesture', gestureName: string): void
}>();

const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
    })
    videoRef.value!.srcObject = stream
    await new Promise(resolve => {
        videoRef.value!.onloadedmetadata = resolve
    })
    await videoRef.value!.play() 
}

const detectHands = async () => {
    if (!videoRef.value || videoRef.value.readyState < 2) {
        requestAnimationFrame(detectHands)
        return
    }

    const hands = await detector.estimateHands(videoRef.value, {
        flipHorizontal: false
    })
    console.log("hands:", hands)

    if (hands.length > 0) {
        drawClear() 
        hands.forEach((hand, index) => {
            const landmarks = hand.keypoints;
            const isRightHand = hand.handedness === "Right"; // MediaPipe memberikan Right/Left
            const gestureName = classifyGesture(landmarks, isRightHand);
            gesture.value = gestureName; // tampilkan di UI
            drawHand(landmarks, index);
            emit('gesture', gestureName);
        });
    } else {
        drawClear()
    }


    requestAnimationFrame(detectHands)
}

function drawClear() {
    const canvas = canvasRef.value!
    const video = videoRef.value!
    const ctx = canvas.getContext("2d")!

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function angle(a: any, b: any, c: any) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }

  const dot = ab.x * cb.x + ab.y * cb.y
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y)

  return Math.acos(dot / mag) * 180 / Math.PI
}

function isFingerStraight(mcp: any, pip: any, dip: any, tip: any) {
  const a = angle(mcp, pip, dip)
  const b = angle(pip, dip, tip)
  return a > 160 && b > 160
}

function palmOrientation(lm: any[]) {
    return lm[0].y < lm[9].y ? 'UP' : 'DOWN';
}

function classifyGesture(lm: any[], isRightHand: boolean) {
    const fingers = {
        thumb: isFingerStraight(lm[1], lm[2], lm[3], lm[4]),
        index: isFingerStraight(lm[5], lm[6], lm[7], lm[8]),
        middle: isFingerStraight(lm[9], lm[10], lm[11], lm[12]),
        ring: isFingerStraight(lm[13], lm[14], lm[15], lm[16]),
        pinky: isFingerStraight(lm[17], lm[18], lm[19], lm[20]),
    };

    const extendedCount = Object.values(fingers).filter(Boolean).length;
    const palm = palmOrientation(lm); // UP atau DOWN

    let gestureName = "UNKNOWN";

    // --- HAND RIGHT: Drone Control ---
    if (isRightHand) {
        if (extendedCount === 5 && palm === 'UP') gestureName = "TAKEOFF";       // OPEN_HAND UP
        else if (extendedCount === 1 && fingers.index) gestureName = "FORWARD";  // Angka 1
        else if (extendedCount === 2 && fingers.index && fingers.middle) gestureName = "RIGHT"; // Angka 2
        else if (extendedCount === 3 && fingers.index && fingers.middle && fingers.ring) gestureName = "LEFT"; // Angka 3
        else if (extendedCount === 4 && !fingers.thumb) gestureName = "UP";       // Angka 4
        else if (extendedCount === 5 && palm === 'DOWN') gestureName = "TAKEOFF";    // OPEN_HAND DOWN
        else if (extendedCount === 0) gestureName = "LANDING";                    // FIST
    }

    // --- HAND LEFT: Camera Control ---
    if (!isRightHand) {
        if (extendedCount === 5 && palm === 'UP') gestureName = "CAMERA FOLLOW";
        else if (extendedCount === 1 && fingers.index) gestureName = "CAMERA ANGLE 1";
        else if (extendedCount === 2 && fingers.index && fingers.middle) gestureName = "CAMERA ANGLE 2";
        else if (extendedCount === 3 && fingers.index && fingers.middle && fingers.ring) gestureName = "CAMERA ANGLE 3";
        else if (extendedCount === 4 && !fingers.thumb) gestureName = "CAMERA ANGLE 4";
        else if (extendedCount === 5 && palm === 'DOWN') gestureName = "CAMERA ANGLE 5";
        else if (extendedCount === 0) gestureName = "CAMERA UNFOLLOW";
    }

    return gestureName;
}

const loadDetector = async () => {
  detector = await handPoseDetection.createDetector(
    handPoseDetection.SupportedModels.MediaPipeHands,
    {
      runtime: "mediapipe",
      modelType: "lite",
      maxHands: 2,
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands"
    }
  )
}

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],        // Thumb
  [0,5],[5,6],[6,7],[7,8],        // Index
  [0,9],[9,10],[10,11],[11,12],   // Middle
  [0,13],[13,14],[14,15],[15,16], // Ring
  [0,17],[17,18],[18,19],[19,20]  // Pinky
]

function drawHand(landmarks: any[], handIndex: number) {
    const canvas = canvasRef.value!
    const ctx = canvas.getContext("2d")!

    const colors = [
        "rgba(0, 255, 255, 0.9)",   // cyan
        "rgba(255, 180, 0, 0.9)"    // orange
    ]
    const color = colors[handIndex % colors.length]

    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 1.8
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = landmarks[i]
        const p2 = landmarks[j]

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
    })

    landmarks.forEach((p, idx) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, idx === 0 ? 4 : 3, 0, Math.PI * 2)
        ctx.fill()
    })
}



onMounted(async () => {
    await startCamera()
    await loadDetector()
    detectHands()
})
</script>

<style>
    canvas {
  pointer-events: none;
}
</style>