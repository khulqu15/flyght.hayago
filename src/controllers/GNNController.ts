import * as tf from '@tensorflow/tfjs';

export class GNNController {
    numNodes: number;
    model: tf.LayersModel | null = null;

    constructor(numNodes: number) {
        this.numNodes = numNodes;
    }

    async init() {
        const nodeInput = tf.input({ shape: [9] });
        const dense1 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(nodeInput) as tf.SymbolicTensor;
        const dense2 = tf.layers.dense({ units: 6, activation: 'linear' }).apply(dense1) as tf.SymbolicTensor;
        this.model = tf.model({ inputs: nodeInput, outputs: dense2 });
    }

    predict(graphInput: { nodes: number[][], adjacency: number[][] }) {
        if (!this.model) throw new Error('Model not initialized');

        const nodeTensor = tf.tensor2d(graphInput.nodes);

        const outputTensor = this.model.predict(nodeTensor) as tf.Tensor;

        const outputArr = outputTensor.arraySync() as number[][];
        const accel = outputArr.map(row => row.slice(0, 3));     // 3 fitur pertama = accel
        const attitude = outputArr[0].slice(3, 6);                // 3 fitur terakhir = attitude (drone saja)
        for (let i = 0; i < accel.length; i++) {
            for (let j = 0; j < 3; j++) {
                if (isNaN(accel[i][j]) || !isFinite(accel[i][j])) accel[i][j] = 0
            }
        }
        for (let i = 0; i < 3; i++) {
            if (isNaN(attitude[i]) || !isFinite(attitude[i])) attitude[i] = 0
        }
        return { accel, attitude };
    }
}
