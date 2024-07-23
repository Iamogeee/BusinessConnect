const { parentPort, workerData } = require("worker_threads");

// Functions to prepare data
function normalizeRating(rating, min = 1, max = 5) {
  return (rating - min) / (max - min);
}

function oneHotEncode(categories, allCategories) {
  return allCategories.map((category) =>
    categories.includes(category) ? 1 : 0
  );
}

function combineFeatures(userProfileVector, businessFeatureVector) {
  return [...userProfileVector, ...businessFeatureVector];
}

// Get data from main script
const { user, business, allCategories } = workerData;

// Prepare data
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

// Send result back to main script
const result = { combinedVector, label: rating > 3 ? 1 : 0 };
parentPort.postMessage(result);
