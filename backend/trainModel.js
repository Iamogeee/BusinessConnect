const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");

// Loads preprocessed data
const rawData = fs.readFileSync("preprocessed_interactions.json");
const data = JSON.parse(rawData);

// Extracts features and labels
const features = data.map((d) => {
  const { liked, saved, viewed, rated, reviewed } = d;
  return [liked, saved, viewed, rated];
});
const labels = data.map((d) => d.rated);

try {
  // Ensures all feature vectors have the same length
  const featureLength = features[0].length;
  const allSameLength = features.every((f) => f.length === featureLength);
  if (!allSameLength) {
    throw new Error("Feature vectors have inconsistent lengths");
  }

  // Ensures labels are valid numbers
  const allLabelsValid = labels.every((l) => typeof l === "number");
  if (!allLabelsValid) {
    throw new Error("Labels contain non-numeric values");
  }

  const inputTensor = tf.tensor2d(features);
  const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

  // Defining the model
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 10,
      activation: "relu",
      inputShape: [inputTensor.shape[1]],
    })
  );
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  // Compiles the model
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

  // Training the model
  (async () => {
    await model.fit(inputTensor, labelTensor, { epochs: 100 });
    console.log("Model training complete");

    // Saves the model to my backend
    await model.save("file://./model");
  })();
} catch (error) {
  console.error("Error during model training:", error);
}
