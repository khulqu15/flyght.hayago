<template>
    <app-layout>
        <div class="p-6 bg-base-300 min-h-screen w-full">
            <div role="tablist" class="tabs tabs-boxed mb-4">
              <a role="tab" class="tab" @click="$router.replace('optimization-modul')">Modul 1</a>
              <a role="tab" class="tab" @click="$router.replace('optimization-modul2')">Modul 2</a>
              <a role="tab" class="tab bg-blue-600 text-white" @click="$router.replace('sphere-function')">Spheres</a>
            </div>
            <h1 class="text-2xl font-bold mb-4">Sphere Function Optimization (ART)</h1>
            <h1 class="mb-6">Developed by Mohammad Khusnul Khuluq (212160048)</h1>

            <div role="tablist" class="tabs tabs-boxed mb-4">
              <a role="tab" class="tab" :class="{'bg-blue-600 text-white': tab == 'configure'}" @click="tab = 'configure'">Configure</a>
              <a role="tab" class="tab" :class="{'bg-blue-600 text-white': tab == 'programs'}" @click="tab = 'programs'">Programs</a>
            </div>

            <div class="rounded-2xl bg-base-200 shadow p-4 mb-4">
                <div v-if="tab == 'configure'">
                    <p class="mb-2">Fungsi yang dioptimasi:</p>
                    <div class="mockup-code">
                        <div class="px-5">
                            <div>
                                <label class="label" for="eqiation">Persamaan</label>
                                <input v-model="sphereFunction" class="input bg-base-100 w-full"/>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <div class="mt-4">
                                    <label class="label" for="iterasi">Jumlah Iterasi Optimasi</label>
                                    <input type="number" id="iterasi" class="input input-bordered w-full max-w-xs" v-model.number="iterations" min="1" max="1000" />
                                </div>
            
                                <div class="mt-4">
                                    <label class="label" for="target-input">Target Minimum f(x, y) (misal: -6.66)</label>
                                    <input type="number" id="target-input" class="input input-bordered w-full max-w-xs" v-model.number="targetValue" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-full" v-if="tab == 'programs'">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="card bg-base-200 shadow-md">
                            <div class="card-body">
                                <h2 class="card-title">Python Version (ART)</h2>
                                <pre class="mockup-code text-sm whitespace-pre-wrap overflow-auto">
    import numpy as np
    import matplotlib.pyplot as plt

    def f(x, y): return (x - 10)**2 + (y - 15)**2

    def ART(f, lb=-100, ub=100, max_iter=1000):
        best = np.random.uniform(lb, ub, size=2)
        best_fit = f(*best)

        for i in range(max_iter):
            cand = np.random.uniform(lb, ub, size=2)
            fit = f(*cand)
            if fit < best_fit:
                best, best_fit = cand, fit
            if i % 100 == 0 or i == max_iter - 1:
                print(f"Iter {i+1}: Fitness = {best_fit:.4f}")

        return best, best_fit

    (best_x, best_y), best_fit = ART(f)

    x, y = np.linspace(0, 20, 100), np.linspace(0, 30, 100)
    X, Y = np.meshgrid(x, y)
    Z = f(X, Y)

    fig = plt.figure(figsize=(10, 6))
    ax = fig.add_subplot(111, projection='3d')
    ax.plot_surface(X, Y, Z, cmap='viridis', alpha=0.7)
    ax.scatter(best_x, best_y, best_fit, color='red', s=50, label='Best')
    ax.set(xlabel='X', ylabel='Y', zlabel='f(x,y)', title='ART on Shifted Sphere')
    ax.legend()
    plt.show()
                                </pre>
                            </div>
                        </div>

                        <div class="card bg-base-200 shadow-md">
                            <div class="card-body">
                                <h2 class="card-title">MATLAB Version (ART)</h2>
                                <pre class="mockup-code text-sm whitespace-pre-wrap overflow-auto">
    shifted_sphere = @(x, y) (x - 10).^2 + (y - 15).^2;

    lower_bound = -100;
    upper_bound = 100;
    max_iter = 1000;

    best_x = (upper_bound - lower_bound).*rand() + lower_bound;
    best_y = (upper_bound - lower_bound).*rand() + lower_bound;
    best_fitness = shifted_sphere(best_x, best_y);

    for i = 1:max_iter
        candidate_x = (upper_bound - lower_bound).*rand() + lower_bound;
        candidate_y = (upper_bound - lower_bound).*rand() + lower_bound;
        fitness = shifted_sphere(candidate_x, candidate_y);

        if fitness < best_fitness
            best_x = candidate_x;
            best_y = candidate_y;
            best_fitness = fitness;
        end

        if mod(i, 100) == 0 || i == max_iter
            fprintf("Iterasi %d, Fitness: %.6f\n", i, best_fitness);
        end
    end

    fprintf("Solusi terbaik: x = %.6f, y = %.6f\n", best_x, best_y);
    fprintf("Fitness terbaik: %.6f\n", best_fitness);

    [x, y] = meshgrid(0:0.5:20, 0:0.5:30);
    z = shifted_sphere(x, y);

    surf(x, y, z)
    xlabel('x'); ylabel('y'); zlabel('f(x,y)')
    title('Shifted Sphere Function with ART Best Solution')
    hold on
    scatter3(best_x, best_y, best_fitness, 100, 'r', 'filled')
    legend('Sphere Surface', 'Best Solution')
                            </pre>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-4">
                        <button class="btn btn-sm bg-green-600 text-white" @click="downloadPythonCode">Download Python</button>
                        <button class="btn btn-sm bg-yellow-600 text-white" @click="downloadMatlabCode">Download MATLAB</button>
                    </div>
                </div>
                <button class="btn inline-block bg-blue-700 text-white mt-3" @click="runOptimization" :disabled="isRunning">Run</button>
            </div>
            <div class="grid lg:grid-cols-2 grid-cols-1 gap-3">
                <div>
                    <h1 class="text-2xl  font-bold">Python Computation</h1>
                    <div v-if="isRunning" class="mt-4 flex items-center gap-2">
                        <span class="loading loading-spinner text-info"></span>
                        <span class="font-medium">Running optimization...</span>
                    </div>
                    <div v-if="logs.length > 0" class="mt-4">
                        <h2 class="font-bold text-lg mb-2">Log Iterasi</h2>
                        <div class="mockup-code max-h-48 overflow-auto text-sm">
                            <div v-for="(log, index) in [...logs].reverse()" :key="index" class="px-4 py-1">{{ log }}</div>
                        </div>
                    </div>
                    <div v-if="bestResult" class="mt-4">
                        <h2 class="font-bold text-lg mb-2">Hasil Terbaik</h2>
                        <div class="bg-base-100 p-4 rounded-xl shadow">
                            x = {{ bestResult.x.toFixed(4) }},
                            y = {{ bestResult.y.toFixed(4) }},
                            f(x, y) = {{ bestResult.fitness.toFixed(4) }}
                            <div v-if="pythonSuccessIter !== null" class="text-sm mt-1 text-green-600">
                                Target ≤ 0.1 tercapai pada iterasi ke-{{ pythonSuccessIter }} ({{ 100 - (pythonSuccessIter / iterations * 100) }} %)
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h1 class="text-2xl font-bold mt-6">MATLAB Computation (Simulated)</h1>
                    <div v-if="isRunning" sclass="mt-4 flex items-center gap-2">
                        <span class="loading loading-spinner text-info"></span>
                        <span class="font-medium">Running optimization...</span>
                    </div>
                    <div v-if="matlabLogs.length > 0" class="mt-4">
                        <h2 class="font-bold text-lg mb-2">Log Iterasi MATLAB</h2>
                        <div class="mockup-code max-h-48 overflow-auto text-sm">
                        <div v-for="(log, index) in [...matlabLogs].reverse()" :key="index" class="px-4 py-1">{{ log }}</div>
                        </div>
                    </div>
                    <div v-if="matlabBestResult" class="mt-4">
                        <h2 class="font-bold text-lg mb-2">Hasil MATLAB</h2>
                        <div class="bg-base-100 p-4 rounded-xl shadow">
                        best\_x = {{ matlabBestResult.x.toFixed(4) }},
                        best\_y = {{ matlabBestResult.y.toFixed(4) }},
                        best\_fitness = {{ matlabBestResult.fitness.toFixed(4) }}
                        <div v-if="matlabSuccessIter !== null" class="text-sm mt-1 text-green-600">
                            Target ≤ 0.1 tercapai pada iterasi ke-{{ matlabSuccessIter }} ({{ 100 - (matlabSuccessIter / iterations * 100) }}%)
                        </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-2 mt-6 w-full" :class="{'opacity-0': logs.length == 0}">
                    <h2 class="font-bold mb-2">Chart 2D: Fitness per Iterasi</h2>
                    <canvas ref="chartRef" class="w-full h-full max-h-[40vh] mx-auto bg-base-100 rounded-xl p-4" willReadFrequently></canvas>
                </div>
            </div>
            <div v-if="bestResult" id="plot3d" class="w-full h-[400px] mt-6"></div>
            <div class="flex flex-wrap gap-2 mt-4" v-if="bestResult">
                <button class="btn btn-sm bg-blue-600 text-white" @click="download2DChart">Download 2D Chart</button>
                <button class="btn btn-sm bg-purple-600 text-white" @click="download3DChart">Download 3D Chart</button>
            </div>

        </div>
    </app-layout>
</template>


<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { nextTick, ref, onMounted, watch } from 'vue';
import Plotly from 'plotly.js-dist-min'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title)

const chartRef = ref<HTMLCanvasElement | null>(null)
let fitnessChart: Chart | null = null
const matlabLogs = ref<string[]>([])

const iterations = ref(500)
const targetValue = ref(null)
const sphereFunction = ref<string>('(x-10)**2 + (y-15)**2');
const tab = ref('configure')

const isRunning = ref(false)
const logs = ref<string[]>([])
const bestResult: any = ref<{ x: number, y: number, fitness: number } | null>(null)
const matlabBestResult = ref<{ x: number, y: number, fitness: number } | null>(null)
const tracePoints = ref<{ x: number[], y: number[], z: number[] }>({x: [], y: [], z: []})

function f(x: number, y: number): number {
    try {
        const fx = new Function('x', 'y', `return ${sphereFunction.value};`)
        return fx(x, y)
    } catch (e) {
        console.error('Invalid function expression:', e)
        return Infinity
    }
}

watch(sphereFunction, (newVal) => {
  try {
    new Function('x', 'y', `return ${newVal};`)
  } catch (e) {
      alert('Persamaan tidak valid. Periksa kembali.')
  }
})

let best = [randRange(-20, 40), randRange(-20, 40)]
const candidate = [randRange(-20, 40), randRange(-20, 40)]

async function runOptimization() {
    isRunning.value = true
    logs.value = []
    matlabLogs.value = []
    bestResult.value = null
    matlabBestResult.value = null
    await nextTick()
    await initFitnessChart()
    await nextTick()

    await runAll()

    if (bestResult.value) {
        plotSphereSurface(
            bestResult.value.x,
            bestResult.value.y,
            bestResult.value.fitness
        )
    }


    isRunning.value = false
}

const pythonSuccessIter = ref<number | null>(null)
const matlabSuccessIter = ref<number | null>(null)

async function runAll() {
    await Promise.all([
        runPythonOptimization(),
        runMatlabSimulation()
    ])
}

async function runPythonOptimization() {
    let best = randRangeXY()
    let bestFit = f(best[0], best[1])
    tracePoints.value = { x: [], y: [], z: [] }
    for (let i = 0; i < iterations.value; i++) {
      const candidate = randRangeXY()
      const fit = f(candidate[0], candidate[1])
      if (fit < bestFit) {
        best = candidate
        bestFit = fit
        updateFitnessChart(i + 1, bestFit, best[0], best[1])
        logs.value.push(`Iterasi ${i + 1}: X = ${best[0]}, Y = ${best[1]}, Fitness = ${bestFit.toFixed(4)}`)
        if (bestFit <= 0.15 && pythonSuccessIter.value === null) pythonSuccessIter.value = i + 1
      }
      tracePoints.value.x.push(candidate[0])
      tracePoints.value.y.push(candidate[1])
      tracePoints.value.z.push(fit)
      if (i % 10 === 0 || i === iterations.value - 1)
      logs.value.push(`Iterasi ${i + 1}: X = ${best[0]}, Y = ${best[1]}, Fitness = ${bestFit.toFixed(4)}`)
      await new Promise(r => setTimeout(r, 2))
    }
    bestResult.value = { x: best[0], y: best[1], fitness: bestFit }
}

const searchRange = { minX: 5, maxX: 15, minY: 10, maxY: 20 }

function randRangeXY() {
  return [
    Math.random() * (searchRange.maxX - searchRange.minX) + searchRange.minX,
    Math.random() * (searchRange.maxY - searchRange.minY) + searchRange.minY
  ]
}
function randRange(min = searchRange.minX, max = searchRange.maxY) {
  return Math.random() * (max - min) + min
}


async function runMatlabSimulation() {
  let best = randRangeXY()
  let bestFit = f(best[0], best[1])
  
  for (let i = 0; i < iterations.value; i++) {
    const candidate = randRange(0, 20)
    const candidateY = randRange(0, 20)
    const fit = f(candidate, candidateY)

    if (fit < bestFit) {
        best = [candidate, candidateY]
        bestFit = fit
        updateFitnessChart(i + 1, 0, 0, 0, bestFit, best[0], best[1])
        if (bestFit <= 0.15 && matlabSuccessIter.value === null) matlabSuccessIter.value = i + 1
    }

    if (i % 10 === 0 || i === iterations.value - 1) {
      matlabLogs.value.push(`Iterasi ${i + 1}: X = ${best[0]}, Y = ${best[1]}, Fitness = ${bestFit.toFixed(4)}`)
    }

    await new Promise(r => setTimeout(r, 2))
  }

  matlabBestResult.value = {
    x: best[0],
    y: best[1],
    fitness: bestFit
  }
}


function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPythonCode() {
  const content = `import numpy as np
import matplotlib.pyplot as plt

def f(x, y): return ${sphereFunction.value}

def ART(f, lb=-100, ub=100, max_iter=${iterations.value}):
    best = np.random.uniform(lb, ub, size=2)
    best_fit = f(*best)

    for i in range(max_iter):
        cand = np.random.uniform(lb, ub, size=2)
        fit = f(*cand)
        if fit < best_fit:
            best, best_fit = cand, fit
        if i % 100 == 0 or i == max_iter - 1:
            print(f"Iter {i+1}: Fitness = {best_fit:.4f}")

    return best, best_fit

(best_x, best_y), best_fit = ART(f)

x, y = np.linspace(0, 20, 100), np.linspace(0, 30, 100)
X, Y = np.meshgrid(x, y)
Z = f(X, Y)

fig = plt.figure(figsize=(10, 6))
ax = fig.add_subplot(111, projection='3d')
ax.plot_surface(X, Y, Z, cmap='viridis', alpha=0.7)
ax.scatter(best_x, best_y, best_fit, color='red', s=50, label='Best')
ax.set(xlabel='X', ylabel='Y', zlabel='f(x,y)', title='ART on Shifted Sphere')
ax.legend()
plt.show()`
  downloadTextFile('art_sphere.py', content)
}

function downloadMatlabCode() {
  const content = `shifted_sphere = @(x, y) ${sphereFunction.value.replaceAll('**', '.^')};

lower_bound = -100;
upper_bound = 100;
max_iter = ${iterations.value};

best_x = (upper_bound - lower_bound).*rand() + lower_bound;
best_y = (upper_bound - lower_bound).*rand() + lower_bound;
best_fitness = shifted_sphere(best_x, best_y);

for i = 1:max_iter
    candidate_x = (upper_bound - lower_bound).*rand() + lower_bound;
    candidate_y = (upper_bound - lower_bound).*rand() + lower_bound;
    fitness = shifted_sphere(candidate_x, candidate_y);

    if fitness < best_fitness
        best_x = candidate_x;
        best_y = candidate_y;
        best_fitness = fitness;
    end

    if mod(i, 100) == 0 || i == max_iter
        fprintf("Iterasi %d, Fitness: %.6f\\n", i, best_fitness);
    end
end

fprintf("Solusi terbaik: x = %.6f, y = %.6f\\n", best_x, best_y);
fprintf("Fitness terbaik: %.6f\\n", best_fitness);

[x, y] = meshgrid(0:0.5:20, 0:0.5:30);
z = shifted_sphere(x, y);

surf(x, y, z)
xlabel('x'); ylabel('y'); zlabel('f(x,y)')
title('Shifted Sphere Function with ART Best Solution')
hold on
scatter3(best_x, best_y, best_fitness, 100, 'r', 'filled')
legend('Sphere Surface', 'Best Solution')`
  downloadTextFile('art_sphere.m', content)
}


function download2DChart() {
  if (!chartRef.value) return
  const canvas = chartRef.value
  const link = document.createElement('a')
  link.download = 'fitness_chart.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function download3DChart() {
  const plot3d = document.getElementById('plot3d')
  if (!plot3d) return
  Plotly.downloadImage(plot3d, {
    format: 'png',
    filename: 'sphere_3d_plot',
    height: 500,
    width: 800
  })
}

function initFitnessChart() {
  if (chartRef.value) {
    if (fitnessChart) fitnessChart.destroy()

    fitnessChart = new Chart(chartRef.value, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Fitness (Python)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            fill: false,
            tension: 0.2
          },
          {
            label: 'Fitness (MATLAB)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            fill: false,
            tension: 0.2
          },
          {
            label: 'x (Python)',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            fill: false,
            tension: 0.2
          },
          {
            label: 'x (MATLAB)',
            data: [],
            borderColor: '#b91c1c',
            backgroundColor: '#b91c1c',
            fill: false,
            tension: 0.2
          },
          {
            label: 'y (Python)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            fill: false,
            tension: 0.2
          },
          {
            label: 'y (MATLAB)',
            data: [],
            borderColor: '#047857',
            backgroundColor: '#047857',
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: { display: true, text: 'Fitness, X, Y - Python vs MATLAB' },
          legend: { position: 'top' }
        },
        scales: {
          x: { title: { display: true, text: 'Iterasi' } },
          y: { title: { display: true, text: 'Nilai' } }
        }
      }
    })
  }
}

function updateFitnessChart(iter: number, pythonFitness: number, pythonX: number, pythonY: number, matlabFitness?: number, matlabX?: number, matlabY?: number) {
  if (!fitnessChart) return

  fitnessChart.data.labels?.push(iter.toString())
  const ds = fitnessChart.data.datasets

  // Python
  ds[0].data.push(pythonFitness)
  ds[2].data.push(pythonX)
  ds[4].data.push(pythonY)

  // MATLAB (jika tersedia)
  if (matlabFitness !== undefined && matlabX !== undefined && matlabY !== undefined) {
    ds[1].data.push(matlabFitness)
    ds[3].data.push(matlabX)
    ds[5].data.push(matlabY)
  }

  fitnessChart.update()
}

function plotSphereSurface(bestX: number, bestY: number, bestZ: number) {
  const x = Array.from({ length: 50 }, (_, i) => i * 0.4)
  const y = Array.from({ length: 50 }, (_, i) => i * 0.6)
  const z: number[][] = []

  for (let i = 0; i < y.length; i++) {
    z[i] = []
    for (let j = 0; j < x.length; j++) {
      z[i][j] = f(x[j], y[i])
    }
  }

  const surface = {
    z,
    x,
    y,
    type: 'surface',
    colorscale: 'Viridis',
    opacity: 0.7,
    name: 'Sphere Surface'
  }

  const best = {
    x: [bestX],
    y: [bestY],
    z: [bestZ],
    mode: 'markers+text',
    marker: { color: 'red', size: 6 },
    type: 'scatter3d',
    name: 'Best (Python)',
    text: [`(${bestX.toFixed(2)}, ${bestY.toFixed(2)})`],
    textposition: 'top center'
  }

  // ✅ Tambahkan titik MATLAB (jika ada)
  const matlab = matlabBestResult.value
    ? {
        x: [matlabBestResult.value.x],
        y: [matlabBestResult.value.y],
        z: [matlabBestResult.value.fitness],
        mode: 'markers+text',
        marker: { color: 'orange', size: 6 },
        type: 'scatter3d',
        name: 'Best (MATLAB)',
        text: [`(${matlabBestResult.value.x.toFixed(2)}, ${matlabBestResult.value.y.toFixed(2)})`],
        textposition: 'bottom center'
      }
    : null

  const plotData = matlab ? [surface, best, matlab] : [surface, best]

  Plotly.newPlot('plot3d', plotData, {
    margin: { t: 40 },
    scene: {
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' },
      zaxis: { title: 'f(x,y)' }
    },
    title: 'Shifted Sphere Optimization',
  })
}


</script>