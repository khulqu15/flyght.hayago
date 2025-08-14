<template>
    <app-layout>
        <div class="p-6 bg-base-300 min-h-screen w-full">
            <div role="tablist" class="tabs tabs-boxed mb-4">
              <a role="tab" class="tab bg-blue-600 text-white">Modul 1</a>
              <a role="tab" class="tab" @click="$router.replace('optimization-modul2')">Modul 2</a>
              <a role="tab" class="tab" @click="$router.replace('sphere-function')">Spheres</a>
            </div>
            <h1 class="text-2xl font-bold mb-4">Optimasi Fungsi dengan ART & Metode Konvensional</h1>
            <h1 class="mb-6">Developed by Mohammad Khusnul Khuluq (212160048)</h1>
            <div class="rounded-2xl bg-base-200 shadow p-4 mb-4">
                <p class="mb-2">Fungsi yang dioptimasi:</p>
                <div class="mockup-code">
                    <pre data-prefix=">">f(x, y) = x² + x*y + y² - 4x - 6y</pre>
                </div>

                <div class="flex flex-wrap gap-3">
                    <div class="mt-4">
                        <label class="label">Jumlah Iterasi Optimasi</label>
                        <input type="number" class="input input-bordered w-full max-w-xs" v-model.number="iterations" min="1" max="1000" />
                    </div>

                    <div class="mt-4">
                        <label class="label">Target Minimum f(x, y) (misal: -6.66)</label>
                        <input type="number" class="input input-bordered w-full max-w-xs" v-model.number="targetValue" step="0.01" />
                    </div>
                </div>
                <button class="btn" onclick="descriptionModal.showModal()">Detail</button>
                <button class="btn inline-block bg-blue-700 text-white mt-3" @click="runAllOptimizations">Run</button>
            </div>

            <div v-if="loading" class="flex items-center gap-2 mb-4">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <span class="text-primary font-medium">Menghitung optimasi...</span>
            </div>

            <div v-if="artSteps.length" class="card bg-base-100 ps-8 h-[12rem] overflow-y-auto text-neutral-content p-4 mb-4">
                <h2 class="text-lg font-semibold mb-2">Tahapan Optimasi Optimasi:</h2>
                <ul class="pl-5">
                    <li v-for="(step, index) in [...artSteps].reverse()" :key="index">
                        Iterasi {{ artSteps.length - index }}: x = {{ step.x.toFixed(2) }}, y = {{ step.y.toFixed(2) }}, f(x, y) = {{ step.value.toFixed(4) }}, error = {{ Math.abs(step.value - targetValue).toFixed(4) }}
                    </li>
                </ul>
            </div>

            <dialog id="descriptionModal" class="modal" ref="descriptionModalRef" @click="redrawCanvasOnOpen">
                <div class="modal-box max-w-3xl">
                    <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 class="text-lg font-bold">Penjelasan Mengenai Metode</h3>
                    <div role="tablist" class="tabs tabs-boxed my-3">
                        <a role="tab" @click="tabMode = 'art'" class="tab" :class="{'bg-blue-700 text-white': tabMode == 'art'}">ART</a>
                        <a role="tab" @click="tabMode = 'con'" class="tab" :class="{'bg-blue-700 text-white': tabMode == 'con'}">Convetional</a>
                    </div>
                    <div v-if="tabMode == 'art'" class="space-y-2">
                        <p><strong>Automatic Random Technique (ART)</strong> adalah metode optimasi berbasis pencarian acak yang bertujuan untuk menemukan nilai x dan y terbaik yang menghasilkan nilai fungsi <code>f(x, y)</code> mendekati target atau minimum.</p>
                        <canvas id="canvasART" class="w-full h-60 rounded-lg border border-base-200"></canvas>
                        <div class="alert alert-warning">Click modal jika animasi tidak keluar</div>
                        <p>Pada setiap iterasi, algoritma akan menghasilkan pasangan (x, y) secara acak, menghitung nilai <code>f(x, y)</code>, lalu menyimpan hasil terbaik yang paling mendekati target.</p>
                        <p>Keunggulan dari metode ini adalah fleksibel, sederhana, dan tidak memerlukan turunan fungsi. Namun, karena bersifat acak, hasil yang didapat tidak selalu konsisten, dan bisa membutuhkan banyak iterasi.</p>
                        <p>Fungsi yang dioptimasi dalam aplikasi ini adalah:</p>
                        <div class="mockup-code">
                            <pre data-prefix=">">f(x, y) = x² + xy + y² - 4x - 6y</pre>
                        </div>
                        <p>
                            Proses ART dilakukan dalam <em>n</em> iterasi. Pada setiap iterasi, nilai <code>x</code> dan <code>y</code> diambil secara acak dari rentang tertentu (misalnya -10 hingga 10), lalu dihitung nilai fungsi <code>f(x, y)</code>.
                        </p>
                        <p>
                            Hasil terbaik adalah titik dengan nilai <code>f(x, y)</code> paling mendekati nilai target:
                            <br />
                            <strong>error = |f(x, y) - target|</strong>
                        </p>
                        <p>
                            ART tidak memerlukan turunan atau sifat khusus dari fungsi, sehingga cocok untuk fungsi kompleks, diskrit, atau tidak terdiferensialkan.
                        </p>
                        <h4 class="font-semibold mt-4">Algoritma ART:</h4>
                        <div class="mockup-code text-sm">
                            <pre data-prefix="1"><code>Inisialisasi targetValue, maxIterasi</code></pre>
                            <pre data-prefix="2"><code>bestError ← ∞</code></pre>
                            <pre data-prefix="3"><code>Untuk i dari 1 sampai maxIterasi:</code></pre>
                            <pre data-prefix="4"><code>  x ← random(-10, 10)</code></pre>
                            <pre data-prefix="5"><code>  y ← random(-10, 10)</code></pre>
                            <pre data-prefix="6"><code>  fxy ← f(x, y)</code></pre>
                            <pre data-prefix="7"><code>  error ← |fxy - targetValue|</code></pre>
                            <pre data-prefix="8"><code>  Jika error < bestError:</code></pre>
                            <pre data-prefix="9"><code>    Simpan x, y, dan fxy sebagai solusi terbaik</code></pre>
                            <pre data-prefix="10"><code>Selesai</code></pre>
                        </div>
                        <h4 class="font-semibold mt-4">Conventional Flowchart:</h4>
                        <img src="/images/art1.png" alt="Conventional Flowchart" class="w-full rounded-lg border border-base-200">
                    </div>
                    <div v-if="tabMode == 'con'" class="space-y-2">
                        <p><strong>Metode Konvensional</strong> menggunakan pendekatan kalkulus, yaitu mencari titik ekstrem dari fungsi melalui turunan parsial pertama.</p>
                        <canvas id="canvasConventional" class="w-full h-60 rounded-lg border border-base-200"></canvas>
                        <p>Langkahnya dimulai dengan menurunkan fungsi <code>f(x, y)</code> terhadap x dan y, kemudian menyelesaikan sistem persamaan untuk menemukan titik stasioner (biasanya minimum atau maksimum lokal).</p>
                        <p>Dalam aplikasi ini, metode konvensional juga dapat digunakan untuk menghitung nilai <code>f(x, y)</code> dari hasil ART — berguna untuk menganalisis hasil random dengan perhitungan matematis lebih rinci.</p>
                        <p>Fungsi yang digunakan:</p>
                        <div class="mockup-code">
                            <pre data-prefix=">">f(x, y) = x² + xy + y² - 4x - 6y</pre>
                        </div>
                        <p>
                            Langkah-langkah utama metode ini:
                            <ol class="list-decimal list-inside space-y-1">
                            <li>Hitung turunan parsial pertama terhadap x dan y:
                                <ul class="list-disc list-inside ml-4">
                                <li>∂f/∂x = 2x + y - 4</li>
                                <li>∂f/∂y = x + 2y - 6</li>
                                </ul>
                            </li>
                            <li>Selesaikan sistem persamaan ∂f/∂x = 0 dan ∂f/∂y = 0 untuk mencari titik stasioner.</li>
                            <li>Evaluasi nilai fungsi <code>f(x, y)</code> pada titik tersebut.</li>
                            </ol>
                        </p>
                        <p>
                            Jika menggunakan hasil dari ART (x, y), maka fungsi dihitung langsung:
                            <br />
                            <strong>f(x, y) = x² + x·y + y² - 4x - 6y</strong>
                        </p>
                        <p>
                            Error terhadap target tetap dihitung sebagai:
                            <br />
                            <strong>error = |f(x, y) - target|</strong>
                        </p>
                        <h4 class="font-semibold mt-4">Algoritma Konvensional:</h4>
                        <div class="mockup-code text-sm">
                            <pre data-prefix="1"><code>Definisikan f(x, y)</code></pre>
                            <pre data-prefix="2"><code>Hitung turunan parsial:</code></pre>
                            <pre data-prefix="3"><code>  ∂f/∂x = 2x + y - 4</code></pre>
                            <pre data-prefix="4"><code>  ∂f/∂y = x + 2y - 6</code></pre>
                            <pre data-prefix="5"><code>Selesaikan sistem:</code></pre>
                            <pre data-prefix="6"><code>  2x + y = 4</code></pre>
                            <pre data-prefix="7"><code>  x + 2y = 6</code></pre>
                            <pre data-prefix="8"><code>Gunakan substitusi atau eliminasi → dapatkan x*, y*</code></pre>
                            <pre data-prefix="9"><code>Hitung f(x*, y*)</code></pre>
                        </div>
                        <h4 class="font-semibold mt-4">Conventional Flowchart:</h4>
                        <img src="/images/con1.png" alt="Conventional Flowchart" class="w-full rounded-lg border border-base-200">
                    </div>
                </div>
            </dialog>

            <div v-if="result" class="card bg-success text-success-content p-4 mb-4">
                <h2 class="text-lg font-semibold mb-2">Hasil Optimasi:</h2>
                <p><strong>x:</strong> {{ result.x.toFixed(4) }}</p>
                <p><strong>y:</strong> {{ result.y.toFixed(4) }}</p>
                <p><strong>f(x, y):</strong> {{ result.value.toFixed(4) }}</p>
            </div>

            <div v-if="conventional" class="card bg-info text-info-content p-4">
                <h2 class="text-lg font-semibold mb-2">Hasil Metode Konvensional:</h2>
                <p><strong>Langkah-langkah:</strong></p>
                <ul class="list-disc pl-5">
                    <li v-for="(step, index) in conventionalSteps" :key="index">{{ step }}</li>
                </ul>
                <p class="mt-2">
                    <strong>Hasil:</strong> x = {{ conventional.x.toFixed(4) }}, y = {{ conventional.y.toFixed(4) }}, f(x, y) = {{ conventional.value.toFixed(4) }}
                </p>
            </div>
        </div>
    </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { onMounted, ref, watch } from 'vue'

interface Result {
  x: number,
  y: number,
  value: number
}

interface Step {
  x: number,
  y: number,
  value: number
}

const result = ref<Result | null>(null)
const conventional = ref<Result | null>(null)
const artSteps = ref<Step[]>([])
const loading = ref(false)
const iterations = ref(1000)
const targetValue = ref(12.66)
const epsilon = 0.1
const conventionalSteps = ref<string[]>([])
const tabMode = ref<'art' | 'con'>('art')
const descriptionModalRef = ref<HTMLDialogElement | null>(null)

onMounted(() => {
  watch(tabMode, (mode) => {
    if (mode === 'art') {
      drawART()
    } else if (mode === 'con') {
      drawConventional()
    }
  })

  drawART() // default saat modal pertama dibuka
})

function redrawCanvasOnOpen() {
  setTimeout(() => {
    if (tabMode.value === 'art') {
      drawART()
    } else if (tabMode.value === 'con') {
      drawConventional()
    }
  }, 100) // tunggu modal selesai render
}

function drawART() {
  const canvas = document.getElementById('canvasART') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  const width = canvas.width
  const height = canvas.height

  const points: { x: number; y: number; fx: number }[] = []
  let bestPoint: { x: number; y: number; fx: number } | null = null

  let iteration = 0
  let pulseRadius = 5
  let pulseGrowing = true

  const setpoint = { x: width / 2, y: height / 2 } // titik target (hijau)

  function animate() {
    ctx!.clearRect(0, 0, width, height)

    // Simpan titik baru
    if (iteration < 100) {
      const x = Math.random() * width
      const y = Math.random() * height
      const fx = simulateFunctionValue(x, y, width, height)

      points.push({ x, y, fx })

      const distance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
        }

        if (
        !bestPoint ||
        distance(x, y, setpoint.x, setpoint.y) < distance(bestPoint.x, bestPoint.y, setpoint.x, setpoint.y)
        ) {
        bestPoint = { x, y, fx }
        }

      iteration++
    }

    // Semua titik
    for (const point of points) {
      ctx!.fillStyle = 'rgba(59, 130, 246, 0.8)' // biru
      ctx!.beginPath()
      ctx!.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx!.fill()
    }

    // Titik setpoint (hijau)
    ctx!.fillStyle = 'rgba(34, 197, 94, 1)' // hijau
    ctx!.beginPath()
    ctx!.arc(setpoint.x, setpoint.y, 5, 0, Math.PI * 2)
    ctx!.fill()

    // Titik terbaik + animasi pulse
    if (bestPoint) {
      ctx!.fillStyle = 'red'
      ctx!.beginPath()
      ctx!.arc(bestPoint.x, bestPoint.y, 5, 0, Math.PI * 2)
      ctx!.fill()

      ctx!.strokeStyle = 'rgba(255, 0, 0, 0.4)'
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.arc(bestPoint.x, bestPoint.y, pulseRadius, 0, Math.PI * 2)
      ctx!.stroke()

      pulseRadius += pulseGrowing ? 0.8 : -0.8
      if (pulseRadius > 15) pulseGrowing = false
      if (pulseRadius < 5) pulseGrowing = true
    }

    requestAnimationFrame(animate)
  }

  animate()
}

// Simulasi nilai fungsi berdasarkan posisi titik (x, y)
function simulateFunctionValue(x: number, y: number, w: number, h: number): number {
  const realX = (x / w) * 20 - 10 // mapping ke -10..10
  const realY = (y / h) * 20 - 10
  return f(realX, realY)
}

function drawConventional() {
  const canvas = document.getElementById('canvasConventional') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const steps = 30
  let x = canvas.width - 20
  let y = 20
  const targetX = canvas.width / 3
  const targetY = canvas.height / 2

  let step = 0

  function animate() {
    if (step >= steps) return
    ctx!.clearRect(0, 0, canvas.width, canvas.height)

    ctx!.fillStyle = 'rgba(96, 165, 250, 0.8)' // biru muda
    ctx!.beginPath()
    ctx!.arc(targetX, targetY, 6, 0, Math.PI * 2)
    ctx!.fill()

    ctx!.strokeStyle = 'rgba(34, 197, 94, 0.8)' // hijau
    ctx!.lineWidth = 2
    ctx!.beginPath()
    ctx!.moveTo(x, y)
    x += (targetX - x) * 0.15
    y += (targetY - y) * 0.15
    ctx!.lineTo(x, y)
    ctx!.stroke()

    ctx!.fillStyle = 'red'
    ctx!.beginPath()
    ctx!.arc(x, y, 4, 0, Math.PI * 2)
    ctx!.fill()

    step++
    requestAnimationFrame(animate)
  }

  animate()
}

function f(x: number, y: number): number {
  return x ** 2 + x * y + y ** 2 - 4 * x - 6 * y
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function runOptimization(): Promise<void> {
  return new Promise((resolve) => {
    let bestX = rand(-10, 10)
    let bestY = rand(-10, 10)
    let bestVal = f(bestX, bestY)
    artSteps.value = []
    result.value = null

    let i = 0
    const maxIterations = iterations.value

    const interval = setInterval(() => {
      const x = rand(-10, 10)
      const y = rand(-10, 10)
      const val = f(x, y)
      artSteps.value.push({ x, y, value: val })

      if (Math.abs(val - targetValue.value) < Math.abs(bestVal - targetValue.value)) {
        bestX = x
        bestY = y
        bestVal = val
    }

      i++

      if (Math.abs(bestVal - targetValue.value) <= epsilon || i >= maxIterations) {
        clearInterval(interval)
        result.value = {
          x: bestX,
          y: bestY,
          value: bestVal
        }
        resolve()
      }
    }, 0)
  })
}

function runConventional(x: number, y: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const val = f(x, y)

      const x2 = x ** 2
      const xy = x * y
      const y2 = y ** 2
      const neg4x = -4 * x
      const neg6y = -6 * y
      const total = x2 + xy + y2 + neg4x + neg6y
      const error = Math.abs(total - targetValue.value)

      conventionalSteps.value = []

      conventionalSteps.value.push('1. Gunakan titik dari hasil ART:')
      conventionalSteps.value.push(`   x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`)

      conventionalSteps.value.push('2. Hitung nilai fungsi:')
      conventionalSteps.value.push(`   f(x, y) = x² + x·y + y² - 4x - 6y`)
      conventionalSteps.value.push(`   = ${x2.toFixed(4)} + ${xy.toFixed(4)} + ${y2.toFixed(4)} + (${neg4x.toFixed(4)}) + (${neg6y.toFixed(4)})`)
      conventionalSteps.value.push(`   = ${total.toFixed(4)}`)

      conventionalSteps.value.push(`3. Error terhadap target: |${total.toFixed(4)} - ${targetValue.value.toFixed(4)}| = ${error.toFixed(4)}`)

      conventional.value = { x, y, value: val }
      resolve()
    }, 500)
  })
}

async function runAllOptimizations() {
  loading.value = true
  result.value = null
  conventional.value = null
  artSteps.value = []
  await runOptimization()
  if(result.value) await runConventional(result.value.x, result.value.y)
  loading.value = false
}
</script>
