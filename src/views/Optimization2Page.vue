<template>
    <app-layout>
        <div class="p-6 bg-base-300 min-h-screen w-full">
            <div role="tablist" class="tabs tabs-boxed mb-4">
                <a role="tab" class="tab" @click="$router.replace('optimization')">Modul 1</a>
                <a role="tab" class="tab bg-blue-600 text-white">Modul 2</a>
                <a role="tab" class="tab" @click="$router.replace('sphere-function')">Spheres</a>
            </div>
            <h1 class="text-2xl font-bold mb-4">Optimasi Produk A & B</h1>
            <h1 class="mb-6">Developed by Mohammad Khusnul Khuluq (212160048)</h1>

            <div class="rounded-2xl bg-base-200 shadow p-4 mb-4">
                <p class="mb-2">Optimasi Linear & Metaheuristik (Konvensional + ART):</p>
                <div class="bg-base-200 py-6 rounded-xl shadow mb-6">

                  <p class="mb-4">
                    Sebuah perusahaan memproduksi dua jenis produk: 
                    <strong>Produk A</strong> dan <strong>Produk B</strong>.
                  </p>

                  <p class="mb-4">
                    Masing-masing produk memberikan keuntungan sebagai berikut:
                    <ul class="list-disc list-inside pl-2">
                      <li><strong>Produk A:</strong> Rp40.000 per unit</li>
                      <li><strong>Produk B:</strong> Rp30.000 per unit</li>
                    </ul>
                  </p>

                  <p class="mb-4">
                    Setiap produk membutuhkan waktu pada dua mesin:
                    <ul class="list-disc list-inside pl-2">
                      <li><strong>Mesin 1 tersedia maksimal:</strong> 100 jam per minggu</li>
                      <li><strong>Mesin 2 tersedia maksimal:</strong> 80 jam per minggu</li>
                    </ul>
                  </p>

                  <p class="mb-2 font-semibold">Penggunaan waktu tiap unit produk:</p>
                  <table class="table-auto text-sm border border-base-300 mb-4 w-full">
                    <thead class="bg-base-300">
                      <tr>
                        <th class="border px-2 py-1">Produk</th>
                        <th class="border px-2 py-1">Mesin 1 (jam/unit)</th>
                        <th class="border px-2 py-1">Mesin 2 (jam/unit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border px-2 py-1">Produk A</td>
                        <td class="border px-2 py-1 text-center">2</td>
                        <td class="border px-2 py-1 text-center">1</td>
                      </tr>
                      <tr>
                        <td class="border px-2 py-1">Produk B</td>
                        <td class="border px-2 py-1 text-center">1</td>
                        <td class="border px-2 py-1 text-center">2</td>
                      </tr>
                    </tbody>
                  </table>

                  <p class="mb-4">
                    <span class="font-semibold">Berapa unit dari Produk A dan Produk B</span> 
                    yang harus diproduksi untuk <span class="text-blue-700 font-semibold">memaksimalkan keuntungan</span>?
                  </p>
                </div>

                <button class="btn bg-gradient-to-r from-blue-600 to-blue-900 text-white" @click="startBothOptimizations" :disabled="isRunning">
                    {{ isRunning ? 'Sedang Menghitung...' : 'Mulai Optimasi Keduanya' }}
                </button>
                <button class="btn mx-3" onclick="my_modal_3.showModal()">Result</button>
                <dialog id="my_modal_3" class="modal">
                  <div class="modal-box max-w-3xl">
                    <form method="dialog">
                      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 class="text-lg font-bold">Penyelesaian Metode</h3>
                    <div role="tablist" class="tabs tabs-boxed my-3">
                        <a role="tab" @click="tabMode = 'art'" class="tab" :class="{'bg-blue-700 text-white': tabMode == 'art'}">ART</a>
                        <a role="tab" @click="tabMode = 'con'" class="tab" :class="{'bg-blue-700 text-white': tabMode == 'con'}">Convetional</a>
                    </div>
                    <div class="mt-3 space-y-3" v-if="tabMode == 'art'">
                        <h4 class="text-base font-semibold">Automatic Random Technique (ART)</h4>
                        <p>Langkah-langkah penyelesaian dengan metode <strong>metaheuristik ART</strong> adalah sebagai berikut:</p>
                        <ul class="list-decimal list-inside pl-2 space-y-1">
                          <li>
                            Tentukan fungsi objektif:
                            <div class="bg-base-100 p-2 rounded-md mt-1 italic">
                              Maksimalkan Z = 40.000x + 30.000y
                            </div>
                          </li>
                          <li>
                            Tentukan fungsi kendala:
                            <div class="bg-base-100 p-2 rounded-md mt-1 space-y-1">
                              <div>2x + y ≤ 100 &nbsp; <span class="text-gray-500">// Mesin 1</span></div>
                              <div>x + 2y ≤ 80 &nbsp; <span class="text-gray-500">// Mesin 2</span></div>
                              <div>x ≥ 0, y ≥ 0</div>
                            </div>
                          </li>
                          <li>
                            Lakukan generate <strong>nilai acak</strong> x dan y sebanyak <code>N</code> iterasi (misal: 1000):
                            <div class="bg-base-100 p-2 rounded-md mt-1">
                              x = Math.random() × 50<br />
                              y = Math.random() × 50
                            </div>
                          </li>
                          <li>
                            Hitung nilai waktu mesin dari solusi acak tersebut:
                            <div class="bg-base-100 p-2 rounded-md mt-1">
                              m1 = 2x + y<br />
                              m2 = x + 2y
                            </div>
                          </li>k
                          <li>
                            Cek apakah solusi acak memenuhi batasan:
                            <div class="bg-base-100 p-2 rounded-md mt-1">
                              m1 ≤ 100 dan m2 ≤ 80
                            </div>
                          </li>
                          <li>
                            Jika solusi valid, hitung keuntungan Z:
                            <div class="bg-base-100 p-2 rounded-md mt-1 italic">
                              Z = 40.000x + 30.000y
                            </div>
                            Simpan solusi jika Z tersebut adalah yang terbesar sejauh ini.
                          </li>
                          <li>
                            Setelah selesai iterasi, hasilkan solusi terbaik:
                            <div class="bg-base-100 p-2 rounded-md mt-1">
                              x<sub>opt</sub>, y<sub>opt</sub>, Z<sub>max</sub>
                            </div>
                          </li>
                        </ul>

                        <div class="bg-blue-100 border-l-4 border-blue-500 p-4 text-sm text-blue-900 rounded-md">
                          <p><strong>Contoh hasil akhir:</strong></p>
                          <p>x = {{ artResult?.x?.toFixed(2) ?? '41.07' }}, y = {{ artResult?.y?.toFixed(2) ?? '17.85' }}</p>
                          <p>m1 = {{ artResult ? (2 * artResult.x + artResult.y).toFixed(2) : '99.99' }} jam, m2 = {{ artResult ? (artResult.x + 2 * artResult.y).toFixed(2) : '76.77' }} jam</p>
                          <p>Z = Rp {{ artResult ? formatRupiah(artResult.z) : formatRupiah(2178300) }}</p>
                        </div>
                    </div>
                    <div class="mt-3 space-y-3" v-if="tabMode == 'con'">
                      <h4 class="text-base font-semibold">Metode Konvensional (Brute Force Terbatas)</h4>

                      <p>Langkah-langkah penyelesaian dengan metode konvensional iteratif (brute force dengan batasan):</p>

                      <ul class="list-decimal list-inside pl-2 space-y-1">
                        <li>
                          Tentukan fungsi objektif:
                          <div class="bg-base-100 p-2 rounded-md mt-1 italic">
                            Maksimalkan Z = 40.000x + 30.000y
                          </div>
                        </li>
                        <li>
                          Tentukan batasan dari masing-masing mesin:
                          <div class="bg-base-100 p-2 rounded-md mt-1 space-y-1">
                            <div>2x + y ≤ 100 &nbsp; <span class="text-gray-500">// Mesin 1</span></div>
                            <div>x + 2y ≤ 80 &nbsp; <span class="text-gray-500">// Mesin 2</span></div>
                            <div>x, y ∈ bilangan bulat ≥ 0</div>
                          </div>
                        </li>
                        <li>
                          Lakukan iterasi dua tingkat:
                          <ul class="list-disc list-inside ml-4 mt-1">
                            <li>Loop untuk x dari 0 hingga 50 (langkah 2)</li>
                            <li>Loop untuk y dari 0 hingga 50 (langkah 1)</li>
                          </ul>
                        </li>
                        <li>
                          Hitung waktu penggunaan mesin:
                          <div class="bg-base-100 p-2 rounded-md mt-1">
                            m1 = 2x + y<br />
                            m2 = x + 2y
                          </div>
                        </li>
                        <li>
                          Jika m1 ≤ 100 dan m2 ≤ 80, hitung:
                          <div class="bg-base-100 p-2 rounded-md mt-1 italic">
                            Z = 40.000x + 30.000y
                          </div>
                          Simpan solusi jika Z lebih besar dari sebelumnya.
                        </li>
                        <li>
                          Setelah seluruh iterasi selesai, tampilkan solusi terbaik.
                        </li>
                      </ul>

                      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-900 rounded-md">
                        <p><strong>Contoh hasil akhir:</strong></p>
                        <p>x = {{ result?.x ?? '40' }}, y = {{ result?.y ?? '20' }}</p>
                        <p>m1 = {{ result ? (2 * result.x + result.y) : '100' }} jam, m2 = {{ result ? (result.x + 2 * result.y) : '80' }} jam</p>
                        <p>Z = Rp {{ result ? formatRupiah(result.z) : formatRupiah(2200000) }}</p>
                      </div>
                    </div>

                  </div>
                </dialog>
            </div>

            <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
                <div>
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <h2 class="text-lg font-semibold mb-2">History Conventional:</h2>
                        </div>
                        <div>
                            deltaT: {{ (deltaTConventional / 1000).toFixed(3) }} s
                        </div>
                    </div>
                    <div v-if="conventionalHistory.length" class="grid grid-cols-1">
                      <div class="mb-4 max-h-[20rem] rounded-xl overflow-y-auto bg-base-100 p-3 h-full">
                          <div>
                              <div v-for="(step, index) in conventionalHistory" :key="index" class="flex items-center justify-start bg-base-100 gap-2 text-xs">
                                  <p><strong>x:</strong> {{ step.x }}, <strong>y:</strong> {{ step.y }}</p>
                                  <p><strong>Mesin 1</strong>: {{ step.m1 }} h, <strong>Mesin 2</strong>: {{ step.m2 }} h</p>
                                  <p><strong>z</strong>: Rp {{ formatRupiah(step.z) }}</p>
                              </div>
                          </div>
                      </div>
                      <div>
                        <canvas class="h-full max-h-[30rem] w-full" id="statusConventionallRealtimeCanvas"></canvas>
                      </div>
                    </div>

                    <h2 class="text-lg font-semibold mb-2">Result Convensional:</h2>
                    <div v-if="result" class="card bg-blue-100 text-blue-700 p-4 mb-4">
                        <p><strong>Produk A (x):</strong> {{ result.x }}</p>
                        <p><strong>Produk B (y):</strong> {{ result.y }}</p>
                        <p><strong>Keuntungan Maksimum:</strong> Rp {{ formatRupiah(result.z) }}</p>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <h2 class="text-lg font-semibold mb-2">History ART:</h2>
                        </div>
                        <div>
                            deltaT: {{ (deltaTART / 1000).toFixed(3) }} s
                        </div>
                    </div>
                    <div v-if="artHistory.length" class="grid grid-cols-1">
                      <div class="mb-4 max-h-[20rem] rounded-xl overflow-y-auto h-full bg-base-100 p-3">
                          <div>
                              <div v-for="(step, index) in artHistory" :key="index" class="flex items-center justify-start bg-base-100 gap-2 text-xs">
                                  <p><strong>x:</strong> {{ step.x.toFixed(2) }}, <strong>y:</strong> {{ step.y.toFixed(2) }}</p>
                                  <p><strong>Mesin 1</strong>: {{ step.m1.toFixed(2) }} h, <strong>Mesin 2</strong>: {{ step.m2.toFixed(2) }} h</p>
                                  <p><strong>z</strong>: Rp {{ formatRupiah(step.z) }}</p>
                              </div>
                          </div>
                      </div>
                      <div>
                        <canvas class="h-full max-h-[30rem] w-full" id="statusArtRealtimeCanvas"></canvas>
                      </div>
                    </div>
        
                    <h2 class="text-lg font-semibold mb-2">Result ART:</h2>
                    <div v-if="artResult" class="card bg-blue-700 text-white p-4 mb-4">
                        <p><strong>x:</strong> {{ artResult.x.toFixed(2) }}</p>
                        <p><strong>y:</strong> {{ artResult.y.toFixed(2) }}</p>
                        <p><strong>Keuntungan:</strong> Rp {{ formatRupiah(artResult.z) }}</p>
                    </div>
                </div>
            </div>

        </div>
    </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { ref } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, annotationPlugin)

let conventionalChart: Chart | null = null
let artChart: Chart | null = null

interface Step {
  x: number
  y: number
  m1: number
  m2: number
  z: number
}

const deltaTConventional = ref(0)
const deltaTART = ref(0)

let deltaTConventionalStart = 0
let deltaTARTStart = 0

let deltaTConventionalTimer: ReturnType<typeof setInterval> | null = null
let deltaTARTTimer: ReturnType<typeof setInterval> | null = null
const result = ref<Step | null>(null)
const currentStep = ref<Step | null>(null)
const isRunning = ref(false)
const isRunningConventional = ref(false)
const isRunningART = ref(false)
const artResult = ref<Step | null>(null)
const conventionalHistory = ref<Step[]>([])
const artHistory = ref<Step[]>([])
const tabMode = ref('art')
function formatRupiah(value: number): string {
  return value.toLocaleString('id-ID')
}

function renderConventionalChart() {
  const ctx = document.getElementById('statusConventionallRealtimeCanvas') as HTMLCanvasElement
  if (!ctx) return

  const history = conventionalHistory.value.slice().reverse()
  const labels = history.map((_, index) => index)
  const zData = history.map(step => step.z)
  const xData = history.map(step => step.x)
  const yData = history.map(step => step.y)

  let maxIndex = -1
  let maxZ = -Infinity
  for (let i = 0; i < history.length; i++) {
    const step = history[i]
    if (step.m1 <= 100 && step.m2 <= 80 && step.z > maxZ) {
      maxZ = step.z
      maxIndex = i
    }
  }

  if (conventionalChart) conventionalChart.destroy()
  conventionalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Z (Keuntungan)',
          data: zData,
          borderColor: 'rgba(59,130,246,1)',
          backgroundColor: 'rgba(59,130,246,0.2)',
          yAxisID: 'y',
          pointRadius: (ctx) => ctx.dataIndex === maxIndex ? 8 : 1,
          pointBackgroundColor: (ctx) => ctx.dataIndex === maxIndex ? 'rgba(255,0,0,1)' : 'rgba(59,130,246,1)',
          tension: 0.1,
        },
        {
          label: 'x (Produk A)',
          data: xData,
          borderColor: 'rgba(16,185,129,1)',
          backgroundColor: 'rgba(16,185,129,0.2)',
          yAxisID: 'y1',
          pointRadius: 0.8,
          tension: 0.1,
          borderWidth: 0.7,
        },
        {
          label: 'y (Produk B)',
          data: yData,
          borderColor: 'rgba(245,158,11,1)',
          backgroundColor: 'rgba(245,158,11,0.2)',
          yAxisID: 'y2',
          pointRadius: 0.8,
          tension: 0.1,
          borderWidth: 0.7,
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Grafik Realtime Konvensional',
          color: '#1e3a8a'
        },
        annotation: {
          annotations: {
            lineX: {
              type: 'line',
              xMin: maxIndex,
              xMax: maxIndex,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: 'Iterasi Max',
                display: true,
                position: 'start',
                backgroundColor: 'red',
                color: 'white',
              }
            },
            lineY: {
              type: 'line',
              yMin: maxZ,
              yMax: maxZ,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: 'Z Max',
                display: true,
                position: 'start',
                backgroundColor: 'red',
                color: 'white',
              }
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Iterasi' } },
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Z (Keuntungan)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'x (Produk A)' },
          grid: { drawOnChartArea: false },
        },
        y2: {
          type: 'linear',
          position: 'right',
          offset: true,
          title: { display: true, text: 'y (Produk B)' },
          grid: { drawOnChartArea: false },
        }
      }
    }
  })
}

function renderArtChart() {
  const ctx = document.getElementById('statusArtRealtimeCanvas') as HTMLCanvasElement
  if (!ctx) return

  const history = artHistory.value.slice().reverse()
  const labels = history.map((_, index) => index)
  const zData = history.map(step => step.z)
  const xData = history.map(step => step.x)
  const yData = history.map(step => step.y)

  let maxIndex = -1
  let maxZ = -Infinity
  for (let i = 0; i < history.length; i++) {
    const step = history[i]
    if (step.m1 <= 100 && step.m2 <= 80 && step.z > maxZ) {
      maxZ = step.z
      maxIndex = i
    }
  }

  if (artChart) artChart.destroy()
  artChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Z (Keuntungan)',
          data: zData,
          borderColor: 'rgba(139,92,246,1)',
          backgroundColor: 'rgba(139,92,246,0.2)',
          yAxisID: 'y',
          pointRadius: (ctx) => ctx.dataIndex === maxIndex ? 8 : 1,
          pointBackgroundColor: (ctx) => ctx.dataIndex === maxIndex ? 'rgba(255,0,0,1)' : 'rgba(139,92,246,1)',
          tension: 0.1,
        },
        {
          label: 'x (Produk A)',
          data: xData,
          borderColor: 'rgba(34,197,94,1)',
          backgroundColor: 'rgba(34,197,94,0.2)',
          yAxisID: 'y1',
          pointRadius: 0.8,
          tension: 0.1,
          borderWidth: 0.7,
        },
        {
          label: 'y (Produk B)',
          data: yData,
          borderColor: 'rgba(251,191,36,1)',
          backgroundColor: 'rgba(251,191,36,0.2)',
          yAxisID: 'y2',
          pointRadius: 0.8,
          tension: 0.1,
          borderWidth: 0.7,
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Grafik Realtime ART',
          color: '#6b21a8'
        },
        annotation: {
          annotations: {
            lineX: {
              type: 'line',
              xMin: maxIndex,
              xMax: maxIndex,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: 'Iterasi Max',
                display: true,
                position: 'start',
                backgroundColor: 'red',
                color: 'white',
              }
            },
            lineY: {
              type: 'line',
              yMin: maxZ,
              yMax: maxZ,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: 'Z Max',
                display: true,
                position: 'start',
                backgroundColor: 'red',
                color: 'white',
              }
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Iterasi' } },
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Z (Keuntungan)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'x (Produk A)' },
          grid: { drawOnChartArea: false },
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'y (Produk B)' },
          grid: { drawOnChartArea: false },
          offset: true
        }
      }
    }
  })
}

function startConventionalOptimization() {
  if (isRunningConventional.value) return

  let x = 0
  let y = 0
  let best: Step = { x: 0, y: 0, m1: 0, m2: 0, z: 0 }

  isRunningConventional.value = true
  result.value = null
  currentStep.value = null
  conventionalHistory.value = []

  deltaTConventional.value = 0
  deltaTConventionalStart = performance.now()

  deltaTConventionalTimer = setInterval(() => {
    deltaTConventional.value = performance.now() - deltaTConventionalStart
  }, 50)

  const interval = setInterval(() => {
    if (y > 50) {
      y = 0
      x+=2
    }

    if (x > 50) {
      clearInterval(interval)
      isRunningConventional.value = false
      result.value = best
      if (deltaTConventionalTimer) clearInterval(deltaTConventionalTimer)
      deltaTConventional.value = performance.now() - deltaTConventionalStart
      return
    }

    const m1 = 2 * x + y
    const m2 = x + 2 * y
    const z = 40000 * x + 30000 * y
    currentStep.value = { x, y, m1, m2, z }
    if (m1 <= 100 && m2 <= 80 && z > best.z) best = { x, y, m1, m2, z }
    conventionalHistory.value.unshift(currentStep.value)
    renderConventionalChart()
    y++
  }, 0)
}

async function startBothOptimizations() {
    isRunning.value = true
    await runBitch()
    isRunning.value = false
}

function runBitch() {
    startConventionalOptimization()
    startARTOptimization()
}

function startARTOptimization() {
  if (isRunningART.value) return

  isRunningART.value = true
  artResult.value = null
  currentStep.value = null
  artHistory.value = []

  let bestZ = 0
  let bestX = 0
  let bestY = 0

  let i = 0
  const maxIter = 1000

  deltaTART.value = 0
  deltaTARTStart = performance.now()

  deltaTARTTimer = setInterval(() => {
    deltaTART.value = performance.now() - deltaTARTStart
  }, 50)

  const interval = setInterval(() => {
    const x = parseFloat((Math.random() * 50).toFixed(2))
    const y = parseFloat((Math.random() * 50).toFixed(2))

    const m1 = 2 * x + y
    const m2 = x + 2 * y

    if (m1 <= 100 && m2 <= 80) {
      const z = 40000 * x + 30000 * y
      currentStep.value = { x, y, m1, m2, z }
      artHistory.value.unshift(currentStep.value)
      renderArtChart()
      if (z > bestZ) {
        bestZ = z
        bestX = x
        bestY = y
      }
    }

    i++
    if (i >= maxIter) {
      clearInterval(interval)
      isRunningART.value = false
      if (deltaTARTTimer) clearInterval(deltaTARTTimer)
      deltaTART.value = performance.now() - deltaTARTStart
      artResult.value = {
        x: bestX,
        y: bestY,
        m1: 2 * bestX + bestY,
        m2: bestX + 2 * bestY,
        z: bestZ
      }
    }
  }, 0)
}
</script>


<style scoped>
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
}

.canvas-pulse-point::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
</style>