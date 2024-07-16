const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

// Normalize ratings
function normalizeRating(rating, min = 1, max = 5) {
  return (rating - min) / (max - min);
}

// One-hot encode categories
function oneHotEncode(categories, allCategories) {
  return allCategories.map((category) =>
    categories.includes(category) ? 1 : 0
  );
}

// Combine user and business features
function combineFeatures(userProfileVector, businessFeatureVector) {
  return [...userProfileVector, ...businessFeatureVector];
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

// Train linear regression model
async function trainLinearRegression(
  userData,
  businessData,
  learningRate = 0.01,
  epochs = 1000
) {
  const allCategories = await fetchUniqueCategories();

  let X = [];
  let y = [];

  userData.forEach((user) => {
    businessData.forEach((business) => {
      const userProfileVector = [
        ...oneHotEncode(user.favoriteCategories, allCategories),
        normalizeRating(user.preferredRating || 0),
      ];
      const businessFeatureVector = [
        normalizeRating(business.averageRating || 0),
        ...oneHotEncode([business.category], allCategories),
      ];
      const combinedVector = combineFeatures(
        userProfileVector,
        businessFeatureVector
      );
      X.push(combinedVector);

      const interaction = user.interactions.find(
        (interaction) => interaction.businessId === business.id
      );

      let rating;
      if (interaction) {
        if (interaction.rated !== null) {
          rating = interaction.rated;
        } else if (interaction.liked) {
          rating =
            user.preferredRating !== null
              ? user.preferredRating
              : business.averageRating;
        } else {
          rating = 0;
        }
      } else {
        rating = 0;
      }

      y.push(rating);
    });
  });

  const numFeatures = X[0].length;
  let weights = Array.from({ length: numFeatures }, () => Math.random() * 0.01);
  let bias = Math.random() * 0.01;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalError = 0;

    X.forEach((features, i) => {
      const prediction = dotProduct(weights, features) + bias;
      const error = prediction - y[i];
      totalError += error ** 2;

      weights = addVectors(
        weights,
        scaleVector(features, -learningRate * error)
      );
      bias -= learningRate * error;
    });

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
  const rawPrediction = dotProduct(model.weights, combinedVector) + model.bias;
  return Math.max(0, Math.min(1, rawPrediction)); // Clamp prediction to [0, 1]
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
  const model = await trainLinearRegression([user], businessData);

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