export type PSOConfig = {
    numParticles?: number
    inertia?: number
    cognitive?: number
    social?: number
    maxVelocity?: number
}

export class PSOController {
    numParticles: number
    inertia: number
    cognitive: number
    social: number
    maxVelocity: number

    particles: { position: number[], velocity: number[], bestPos: number[], bestScore: number }[]
    globalBestPos: number[]
    globalBestScore: number

    constructor(config: PSOConfig = {}) {
        this.numParticles = config.numParticles ?? 10
        this.inertia = config.inertia ?? 0.5
        this.cognitive = config.cognitive ?? 1
        this.social = config.social ?? 1
        this.maxVelocity = config.maxVelocity ?? 8

        this.particles = []
        this.globalBestPos = [0,0,0]
        this.globalBestScore = Infinity

        this.initParticles()
    }

    private initParticles() {
        for(let i=0;i<this.numParticles;i++){
            const pos = [Math.random()*10, Math.random()*10, Math.random()*10]
            const vel = [0,0,0]
            const score = Infinity
            this.particles.push({ position: pos, velocity: vel, bestPos: [...pos], bestScore: score })
        }
    }

    private fitness(pos: number[], target: number[]): number {
        const dx = pos[0]-target[0]
        const dy = pos[1]-target[1]
        const dz = pos[2]-target[2]
        return dx*dx + dy*dy + dz*dz
    }

    public predict(currentPos: number[], targetPos: number[]): { accel: [number, number, number], attitude: [number, number, number] } {
        const target = targetPos
        for(const p of this.particles) {
            const score = this.fitness(p.position, target)
            if(score < p.bestScore){
                p.bestScore = score
                p.bestPos = [...p.position]
            }
            if(score < this.globalBestScore){
                this.globalBestScore = score
                this.globalBestPos = [...p.position]
            }

            for(let i=0;i<3;i++){
                const r1 = Math.random()
                const r2 = Math.random()
                p.velocity[i] = this.inertia*p.velocity[i] + 
                                this.cognitive*r1*(p.bestPos[i]-p.position[i]) +
                                this.social*r2*(this.globalBestPos[i]-p.position[i])
                p.velocity[i] = Math.max(Math.min(p.velocity[i], this.maxVelocity), -this.maxVelocity)
                p.position[i] += p.velocity[i]
            }
        }

        const accel: [number, number, number] = [
            this.globalBestPos[0] - currentPos[0],
            this.globalBestPos[1] - currentPos[1],
            this.globalBestPos[2] - currentPos[2],
        ].map(v => v) as [number, number, number]

        const dx = this.globalBestPos[0] - currentPos[0]
        const dy = this.globalBestPos[1] - currentPos[1]
        const dz = this.globalBestPos[2] - currentPos[2]
        const scale = 5
        const attitude: [number, number, number] = [
            accel[0], 
            accel[1], 
            accel[2]
        ]
        return { accel, attitude }
    }
}
