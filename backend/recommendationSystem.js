const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { Worker } = require("worker_threads");

// Fetch user data including interactions and preferences
async function fetchUserData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interactions: true,
    },
  });
  return user;
}

// Fetch all businesses
async function fetchBusinessData() {
  const businesses = await prisma.business.findMany();
  return businesses;
}

// Fetch all unique categories
async function fetchUniqueCategories() {
  const categories = await prisma.business.findMany({
    select: {
      category: true,
    },
    distinct: ["category"],
  });
  return categories.map((categoryObj) => categoryObj.category);
}

// Dot product function
function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Add two vectors
function addVectors(a, b) {
  return a.map((val, i) => val + b[i]);
}

// Scale a vector
function scaleVector(a, scalar) {
  return a.map((val) => val * scalar);
}

// Sigmoid function
// converts the output of the output of the linear combination of weights and features plus the bias into a probability between 0 and 1.
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// Train logistic regression model
async function trainLogisticRegression(
  userData,
  businessData,
  learningRate = 0.01,
  epochs = 1000,
  batchSize = 32
) {
  const allCategories = await fetchUniqueCategories();

  let X = [];
  let y = [];

  // Use worker threads to prepare data in parallel
  const promises = [];
  userData.forEach((user) => {
    businessData.forEach((business) => {
      promises.push(
        new Promise((resolve, reject) => {
          const worker = new Worker("./dataPreparer.js", {
            workerData: { user, business, allCategories },
          });
          worker.on("message", (result) => resolve(result));
          worker.on("error", reject);
        })
      );
    });
  });

  // Collect results from workers
  const results = await Promise.all(promises);
  results.forEach(({ combinedVector, label }) => {
    X.push(combinedVector);
    y.push(label);
  });

  const numFeatures = X[0].length;
  //Array.from is a mapping function that initializes each element of the array
  //weights is an array of length numFeatures, with each element initialized to a small random value between 0 and 0.01.
  let weights = Array.from({ length: numFeatures }, () => Math.random() * 0.01);

  //bias serves as an intercept term in the logistic regression model.
  let bias = Math.random() * 0.01;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalError = 0;

    for (let i = 0; i < X.length; i += batchSize) {
      const batchX = X.slice(i, i + batchSize);
      const batchY = y.slice(i, i + batchSize);

      batchX.forEach((features, j) => {
        const z = dotProduct(weights, features) + bias;
        const prediction = sigmoid(z);
        const error = prediction - batchY[j];
        totalError += error ** 2;

        weights = addVectors(
          weights,
          scaleVector(
            features,
            -learningRate * error * prediction * (1 - prediction)
          )
        );
        bias -= learningRate * error * prediction * (1 - prediction);
      });
    }

    totalError /= X.length;
  }

  return { weights, bias };
}

// Predict preference
function predictPreference(userProfileVector, businessFeatureVector, model) {
  const combinedVector = combineFeatures(
    userProfileVector,
    businessFeatureVector
  );

  //   Computes the linear combination of the weights and combined feature vector, plus the bias.
  const z = dotProduct(model.weights, combinedVector) + model.bias;
  const rawPrediction = sigmoid(z);
  return Math.max(0, Math.min(1, rawPrediction));
}

// Function to provide recommendations for a given user ID
async function provideRecommendations(userId) {
  const user = await fetchUserData(userId);
  const businessData = await fetchBusinessData();
  const allCategories = await fetchUniqueCategories();

  if (!user) {
    console.error("User not found");
    return;
  }

  // Preprocess user data to create profile vector
  const userProfileVector = [
    ...oneHotEncode(user.favoriteCategories, allCategories),
    normalizeRating(user.preferredRating || 0),
  ];

  // Preprocess business data to create feature vectors
  const businessVectors = businessData.map((business) => ({
    id: business.id,
    vector: [
      normalizeRating(business.averageRating || 0),
      ...oneHotEncode([business.category], allCategories),
    ],
  }));

  // Train the model
  const model = await trainLogisticRegression([user], businessData);

  // Save the model to a file
  fs.writeFileSync("model.json", JSON.stringify(model, null, 2));

  // Make predictions
  const predictions = businessVectors.map((business) => {
    const predictedRating = predictPreference(
      userProfileVector,
      business.vector,
      model
    );
    return { businessId: business.id, predictedRating };
  });

  // Rank predictions based on predicted rating
  const rankedPredictions = predictions.sort(
    (a, b) => b.predictedRating - a.predictedRating
  );

  // Number of recommendations to generate
  const numRecommendations = 20;

  // Generate recommendations by selecting the top N ranked predictions
  const recommendations = rankedPredictions.slice(0, numRecommendations);

  const businessIds = recommendations.map((rec) => rec.businessId);
  const businessDetails = await prisma.business.findMany({
    where: {
      id: { in: businessIds },
    },
  });

  // Combine recommendations with business details
  const detailedRecommendations = recommendations.map((rec) => ({
    ...rec,
    business: businessDetails.find((b) => b.id === rec.businessId),
  }));

  return detailedRecommendations;
}

module.exports = { provideRecommendations };

/*
In a logistic regression model, each feature is multiplied by a corresponding weight, 
and the sum of these weighted features plus the bias is passed through a sigmoid function to produce a probability.
The weights and bias are adjusted during the training process to minimize the prediction error.
*/
