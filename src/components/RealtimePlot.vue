<template>
  <div class="absolute bottom-32 left-4 w-1/2 h-72 bg-black/50 p-2 rounded-xl flex flex-col gap-2">
    <canvas ref="chartCanvas" class="w-full flex-1"></canvas>
    <button @click="downloadCSV" class="bg-blue-600 text-white px-4 py-1 mt-2 rounded hover:bg-blue-500 w-fit">Download CSV</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, zoomPlugin)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'line', number[], string>

const MAX_POINTS = 5000 // bisa lebih besar sesuai kebutuhan
const seriesColors = {
  smc: 'rgba(255, 255, 255, 0.5)',
  smcGNN: 'rgba(0, 255, 255, 0.5)',
  smcPSO: 'rgba(0, 255, 0, 0.5)',
  smcGA: 'rgba(255, 0, 255, 0.5)'
}

const dataStore = {
  smc: [] as any,
  smcGNN: [] as any,
  smcPSO: [] as any,
  smcGA: [] as any,
}

const addDataPoint = (smcVal: any, smcGNNVal: any, smcPSOVal: any, smcGAVal: any) => {
  dataStore.smc.push(smcVal)
  dataStore.smcGNN.push(smcGNNVal)
  dataStore.smcPSO.push(smcPSOVal)
  dataStore.smcGA.push(smcGAVal)

  // trim data jika terlalu banyak (opsional)
  if (dataStore.smc.length > MAX_POINTS) {
    for (const key in dataStore) {
      (dataStore as any)[key].shift()
    }
  }

  chart.data.labels = dataStore.smc.map((_, i) => i.toString())
  chart.data.datasets[0].data = dataStore.smc
  chart.data.datasets[1].data = dataStore.smcGNN
  chart.data.datasets[2].data = dataStore.smcPSO
  chart.data.datasets[3].data = dataStore.smcGA
  chart.update('none') // update tanpa animasi
}

const downloadCSV = () => {
  const headers = ['Index', 'SMC', 'SMC+GNN', 'SMC+PSO', 'SMC+GA']
  let csv = headers.join(',') + '\n'
  const length = dataStore.smc.length
  for (let i = 0; i < length; i++) {
    csv += [
      i,
      dataStore.smc[i],
      dataStore.smcGNN[i],
      dataStore.smcPSO[i],
      dataStore.smcGA[i]
    ].join(',') + '\n'
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'drone_data.csv')
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  if (!chartCanvas.value) return
  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'SMC', data: [], borderColor: seriesColors.smc, borderWidth: 2, fill: false },
        { label: 'SMC+GNN', data: [], borderColor: seriesColors.smcGNN, borderWidth: 2, fill: false },
        { label: 'SMC+PSO', data: [], borderColor: seriesColors.smcPSO, borderWidth: 2, fill: false },
        { label: 'SMC+GA', data: [], borderColor: seriesColors.smcGA, borderWidth: 2, fill: false },
      ]
    },
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      scales: {
        x: { display: true, title: { display: true, text: 'Time Step', color: '#fff' } }
      },
      plugins: {
        title: { 
            display: true, 
            text: 'Drone Pitch Comparison (SMC, SMC+GNN, SMC+PSO, SMC+GA)',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' },
        },
        legend: { labels: { color: '#ffffff' } },
        zoom: {
          pan: { enabled: true, mode: 'x', modifierKey: 'ctrl' },
          zoom: { wheel: { enabled: true }, mode: 'x' }
        }
      }
    }
  }
  chart = new Chart(chartCanvas.value, config)
})

// expose function ke parent
defineExpose({
  addDataPoint,
  downloadCSV
})
</script>
