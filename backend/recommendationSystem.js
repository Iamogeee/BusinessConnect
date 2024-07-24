const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const initialWeights = {
  favoriteCategories: 0.8,
  location: 0.2,
};

const parseLocation = (location) => {
  const [lat, lng] = location
    .split(",")
    .map((coord) => parseFloat(coord.trim()));
  return { lat, lng };
};

async function fetchUserData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interactions: true,
    },
  });

  if (user && user.location) {
    const { lat, lng } = parseLocation(user.location);
    return { ...user, coordinates: { lat, lng } };
  }

  return user;
}

async function fetchBusinessData() {
  const businesses = await prisma.business.findMany();
  return businesses.map((business) => {
    const { lat, lng } = parseLocation(business.location);
    return { ...business, coordinates: { lat, lng } };
  });
}

async function fetchUniqueCategories() {
  const categories = await prisma.business.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return categories.map((categoryObj) => categoryObj.category);
}

function normalize(value, min, max) {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return (value - min) / (max - min);
}

function oneHotEncode(categories, allCategories) {
  return allCategories.map((category) =>
    categories.includes(category) ? 1 : 0
  );
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degree) => degree * (Math.PI / 180);
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function combineInitialFeatures(user, business, initialWeights, allCategories) {
  const categoryScore = oneHotEncode(
    user.favoriteCategories,
    allCategories
  ).reduce((sum, val) => sum + val * initialWeights.favoriteCategories, 0);

  const distance = haversineDistance(
    user.coordinates.lat,
    user.coordinates.lng,
    business.coordinates.lat,
    business.coordinates.lng
  );
  const normalizedDistance = normalize(distance, 0, 50);
  const locationScore = (1 - normalizedDistance) * initialWeights.location;

  return categoryScore + locationScore;
}

async function provideInitialRecommendations(userId) {
  const user = await fetchUserData(userId);
  const businessData = await fetchBusinessData();
  const allCategories = await fetchUniqueCategories();

  const initialScores = businessData.map((business) => {
    const score = combineInitialFeatures(
      user,
      business,
      initialWeights,
      allCategories
    );
    return { businessId: business.id, score };
  });

  const rankedInitialScores = initialScores.sort((a, b) => b.score - a.score);
  const recommendations = rankedInitialScores.slice(0, 20);

  const businessIds = recommendations.map((rec) => rec.businessId);
  const businessDetails = await prisma.business.findMany({
    where: { id: { in: businessIds } },
  });

  const detailedRecommendations = recommendations.map((rec) => ({
    ...rec,
    business: businessDetails.find((b) => b.id === rec.businessId),
  }));

  return detailedRecommendations;
}

let interactionCount = 0;

async function handleUserInteraction(userId, businessId, rating) {
  interactionCount++;

  if (interactionCount % 2 === 0) {
    const user = await fetchUserData(userId);
    const businessData = await fetchBusinessData();
    const model = await trainLogisticRegression(user, businessData);

    fs.writeFileSync("model.json", JSON.stringify(model, null, 2));
  }
}

function getUserProfileVector(user, allCategories) {
  const numberOfInteractions = user.interactions.length;
  const averageRatingGiven =
    user.interactions.reduce(
      (sum, interaction) => sum + (interaction.rated || 0),
      0
    ) / numberOfInteractions;
  const { lat: latitude, lng: longitude } = user.coordinates || {
    lat: 0,
    lng: 0,
  };

  const categoryCounts = user.interactions.reduce((acc, interaction) => {
    const category = interaction.businessCategory;
    if (acc[category]) acc[category]++;
    else acc[category] = 1;
    return acc;
  }, {});

  const categoryPreferences = allCategories.map((category) =>
    categoryCounts[category]
      ? categoryCounts[category] / numberOfInteractions
      : 0
  );

  const totalDistance = user.interactions.reduce(
    (sum, interaction) =>
      sum +
      haversineDistance(
        latitude,
        longitude,
        interaction.businessLat,
        interaction.businessLng
      ),
    0
  );
  const averageDistance = totalDistance / numberOfInteractions;

  return [
    numberOfInteractions,
    ...categoryPreferences,
    latitude,
    longitude,
    normalize(averageDistance, 0, 50),
  ];
}

function getBusinessFeatureVector(business, allCategories) {
  const { lat: latitude, lng: longitude } = business.coordinates || {
    lat: 0,
    lng: 0,
  };
  const businessHours = business.businessHours.length;
  const userRatingsTotal = business.numberOfRatings || 0;

  return [
    ...oneHotEncode([business.category], allCategories),
    business.priceLevel || 0,
    businessHours,
    normalize(userRatingsTotal, 0, 10000),
    latitude,
    longitude,
  ];
}

function combineFeatures(userProfileVector, businessFeatureVector) {
  const userLatitude = userProfileVector[userProfileVector.length - 3];
  const userLongitude = userProfileVector[userProfileVector.length - 2];
  const businessLatitude =
    businessFeatureVector[businessFeatureVector.length - 2];
  const businessLongitude =
    businessFeatureVector[businessFeatureVector.length - 1];

  const distance = haversineDistance(
    userLatitude,
    userLongitude,
    businessLatitude,
    businessLongitude
  );

  const userProfileWithoutCoordinates = userProfileVector.slice(0, -3);
  const businessProfileWithoutCoordinates = businessFeatureVector.slice(0, -2);

  return [
    ...userProfileWithoutCoordinates,
    ...businessProfileWithoutCoordinates,
    distance,
  ];
}

async function trainLogisticRegression(
  user,
  businessData,
  learningRate = 0.01,
  epochs = 1000
) {
  const allCategories = await fetchUniqueCategories();

  let featureMatrix = [];
  let targetVector = [];

  businessData.forEach((business) => {
    const userProfileVector = getUserProfileVector(user, allCategories);
    const businessFeatureVector = getBusinessFeatureVector(
      business,
      allCategories
    );
    const combinedVector = combineFeatures(
      userProfileVector,
      businessFeatureVector
    );

    featureMatrix.push(combinedVector);

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
    targetVector.push(rating > 4 ? 1 : 0);
  });

  const numFeatures = featureMatrix[0].length;

  let weights = Array.from({ length: numFeatures }, () => Math.random() * 0.01);
  let bias = Math.random() * 0.01;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalError = 0;

    featureMatrix.forEach((features, i) => {
      const weightedSum = dotProduct(weights, features) + bias;
      const prediction = sigmoid(weightedSum);
      const error = prediction - targetVector[i];
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

    totalError /= featureMatrix.length;
  }

  return { weights, bias };
}

function predictPreference(userProfileVector, businessFeatureVector, model) {
  const combinedVector = combineFeatures(
    userProfileVector,
    businessFeatureVector
  );

  const weightedSum = dotProduct(model.weights, combinedVector) + model.bias;
  const rawPrediction = sigmoid(weightedSum);
  return Math.max(0, Math.min(1, rawPrediction));
}

async function provideRecommendations(userId, useModel = false) {
  const user = await fetchUserData(userId);
  const businessData = await fetchBusinessData();
  const allCategories = await fetchUniqueCategories();

  if (!user || !user.interactions) {
    console.error("User not found");
    return [];
  }

  if (useModel) {
    const model = loadModel();

    if (!model) {
      console.error("Model not found or failed to load");
      return [];
    }

    const userProfileVector = getUserProfileVector(user, allCategories);

    const businessVectors = businessData.map((business) => ({
      id: business.id,
      vector: getBusinessFeatureVector(business, allCategories),
    }));

    const predictions = businessVectors.map((business) => {
      const predictedRating = predictPreference(
        userProfileVector,
        business.vector,
        model
      );
      return { businessId: business.id, predictedRating };
    });

    const rankedPredictions = predictions.sort(
      (a, b) => b.predictedRating - a.predictedRating
    );

    const numRecommendations = 20;
    const recommendations = rankedPredictions.slice(0, numRecommendations);

    const businessIds = recommendations.map((rec) => rec.businessId);
    const businessDetails = await prisma.business.findMany({
      where: { id: { in: businessIds } },
    });

    const detailedRecommendations = recommendations.map((rec) => ({
      ...rec,
      business: businessDetails.find((b) => b.id === rec.businessId),
    }));

    return detailedRecommendations;
  } else {
    return provideInitialRecommendations(userId);
  }
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function addVectors(a, b) {
  return a.map((val, i) => val + b[i]);
}

function scaleVector(a, scalar) {
  return a.map((val) => val * scalar);
}

function sigmoid(weightedSum) {
  return 1 / (1 + Math.exp(-weightedSum));
}

function loadModel() {
  try {
    const modelData = fs.readFileSync("model.json");
    return JSON.parse(modelData);
  } catch (error) {
    console.error("Failed to load model:", error);
    return null;
  }
}

module.exports = {
  provideRecommendations,
  handleUserInteraction,
  provideInitialRecommendations,
};
