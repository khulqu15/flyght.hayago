export interface GAIndividual {
    genes: [number, number, number]  // kandidat posisi drone
    fitness: number
}

export class GAController {
    population: GAIndividual[] = []
    populationSize: number
    mutationRate: number
    globalBest: GAIndividual

    constructor(populationSize = 10, mutationRate = 0.1) {
        this.populationSize = populationSize
        this.mutationRate = mutationRate
        this.globalBest = { genes: [0,0,0], fitness: Infinity }
        // init population random
        for(let i=0;i<this.populationSize;i++){
            const genes: [number, number, number] = [
                Math.random()*2-1,
                Math.random()*2-1,
                Math.random()*2-1
            ]
            this.population.push({ genes, fitness: Infinity })
        }
    }

    fitness(pos: [number, number, number], target: [number, number, number]) {
        // Euclidean distance
        const dx = pos[0]-target[0]
        const dy = pos[1]-target[1]
        const dz = pos[2]-target[2]
        return Math.sqrt(dx*dx + dy*dy + dz*dz)
    }

    selectParent(): GAIndividual {
        // tournament selection sederhana
        const a = this.population[Math.floor(Math.random()*this.populationSize)]
        const b = this.population[Math.floor(Math.random()*this.populationSize)]
        return a.fitness < b.fitness ? a : b
    }

    crossover(p1: GAIndividual, p2: GAIndividual): [number, number, number] {
        // single-point crossover
        const genes: [number, number, number] = [
            Math.random() < 0.5 ? p1.genes[0] : p2.genes[0],
            Math.random() < 0.5 ? p1.genes[1] : p2.genes[1],
            Math.random() < 0.5 ? p1.genes[2] : p2.genes[2],
        ]
        return genes
    }

    mutate(genes: [number, number, number]): [number, number, number] {
        return genes.map(g => Math.random() < this.mutationRate ? g + (Math.random()*0.2-0.1) : g) as [number, number, number]
    }

    predict(currentPos: [number, number, number], targetPos: [number, number, number]): { accel: [number, number, number], attitude: [number, number, number] } {
        // update fitness
        for(const ind of this.population){
            ind.fitness = this.fitness(ind.genes, targetPos)
            if(ind.fitness < this.globalBest.fitness){
                this.globalBest = { genes: [...ind.genes], fitness: ind.fitness }
            }
        }

        // create next generation
        const newPopulation: GAIndividual[] = []
        for(let i=0;i<this.populationSize;i++){
            const parent1 = this.selectParent()
            const parent2 = this.selectParent()
            let childGenes = this.crossover(parent1, parent2)
            childGenes = this.mutate(childGenes)
            newPopulation.push({ genes: childGenes, fitness: Infinity })
        }
        this.population = newPopulation

        // acceleration = arah ke globalBest
        const accel: [number, number, number] = [
            (this.globalBest.genes[0]-currentPos[0]),
            (this.globalBest.genes[1]-currentPos[1]),
            (this.globalBest.genes[2]-currentPos[2])
        ]
        const attitude: [number, number, number] = [
            -accel[2],
            accel[0],
            accel[1]
        ]

        return { accel, attitude }
    }
}
