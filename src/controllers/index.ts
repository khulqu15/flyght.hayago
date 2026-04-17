import { PSOController } from './PSOController'
import { GNNController } from './GNNController'
import { GAController } from './GAController'
export type ControllerType = 'gnn' | 'pso' | 'ga'

export class DroneController {
    gnn?: GNNController
    pso?: PSOController
    ga?: GAController
    active: ControllerType

    constructor(type: ControllerType) {
        this.active = type
        if(type === 'gnn') this.gnn = new GNNController(2)  // buat sekali
        if(type === 'pso') this.pso = new PSOController()
        if(type === 'ga') this.ga = new GAController()
    }

    async init() {
        if(this.gnn) await this.gnn.init()  // pastikan model siap
    }

    predictAll(currentPos: number[], targetPos: number[], graphInput?: any) {
        const outputs: Record<string, { accel: [number,number,number][], attitude: [number,number,number] }> = {}

        if(this.gnn && graphInput) {
            console.log("RUN GNN")
            outputs.gnn = this.gnn.predict(graphInput)
        }

        this.pso = new PSOController()
        const psoOut = this.pso.predict(currentPos, targetPos)
        outputs.pso = { accel: [psoOut.accel], attitude: psoOut.attitude }

        this.ga = new GAController()
        const posTuple: [number,number,number] = [currentPos[0], currentPos[1], currentPos[2]]
        const targetTuple: [number,number,number] = [targetPos[0], targetPos[1], targetPos[2]]
        const gaOut = this.ga.predict(posTuple, targetTuple)
        outputs.ga = { accel: [gaOut.accel], attitude: gaOut.attitude }

        return outputs
    }

    predict(currentPos: number[], targetPos: number[], graphInput?: any, type: string|null = null) {
        if(type != null) {
            if(type === 'gnn' && this.gnn) {
                return this.gnn.predict(graphInput)  // gunakan instance yg sudah diinit
            }
            if(type === 'pso' && this.pso) {
                const output = this.pso.predict(currentPos, targetPos)
                return { accel: [output.accel], attitude: output.attitude }
            }
            if(type === 'ga' && this.ga) {
                const posTuple: [number,number,number] = [currentPos[0], currentPos[1], currentPos[2]]
                const targetTuple: [number,number,number] = [targetPos[0], targetPos[1], targetPos[2]]
                const output = this.ga.predict(posTuple, targetTuple)
                return { accel: [output.accel], attitude: output.attitude } 
            }
        } else {
            if(this.active === 'gnn' && this.gnn) return this.gnn.predict(graphInput)
            if(this.active === 'pso' && this.pso) {
                const output = this.pso.predict(currentPos, targetPos)
                return { accel: [output.accel], attitude: output.attitude }
            }
            if(this.active === 'ga' && this.ga) {
                const posTuple: [number,number,number] = [currentPos[0], currentPos[1], currentPos[2]]
                const targetTuple: [number,number,number] = [targetPos[0], targetPos[1], targetPos[2]]
                const output = this.ga.predict(posTuple, targetTuple)
                return { accel: [output.accel], attitude: output.attitude } 
            }
        }

        return { accel: [0,0,0], attitude: [0,0,0] }
    }
}
