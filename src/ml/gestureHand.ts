import * as tf from "@tensorflow/tfjs"

export const NUM_CLASSES = 5

export function createGestureModel() {
    const model = tf.sequential()

    model.add(tf.layers.dense({
        inputShape: [63],
        units: 64,
        activation: "relu"
    }))

    model.add(tf.layers.dense({
        units: 32,
        activation: "relu"
    }))

    model.add(tf.layers.dense({
        units: NUM_CLASSES,
        activation: "softmax"
    }))

    return model
}
