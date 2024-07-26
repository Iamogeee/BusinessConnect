const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fetch liked interactions for a user
async function fetchLikedInteractions(userId) {
  const interactions = await prisma.interaction.findMany({
    where: {
      userId: userId,
      liked: true,
    },
    include: {
      Business: true,
      User: true,
    },
  });
  return interactions;
}

// Analyze user preferences from liked interactions
function analyzeUserPreferences(interactions) {
  const totalLikes = interactions.length;

  const preferences = {
    totalLikes: totalLikes,
    totalPriceLevel: 0,
    totalRating: 0,
    totalDistance: 0,
  };

  interactions.forEach((interaction) => {
    const business = interaction.Business;

    if (business.priceLevel !== null) {
      preferences.totalPriceLevel += business.priceLevel;
    }

    if (business.averageRating !== null) {
      preferences.totalRating += business.averageRating;
    }
    if (interaction.User && interaction.User.location && business.location) {
      const userLocation = parseLocation(interaction.User.location);
      const businessLocation = parseLocation(business.location);
      if (userLocation && businessLocation) {
        const distance = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          businessLocation.lat,
          businessLocation.lng
        );
        preferences.totalDistance += distance;
      }
    }
  });

  preferences.avgPriceLevel = preferences.totalPriceLevel / totalLikes;
  preferences.avgRating = preferences.totalRating / totalLikes;
  preferences.avgDistance = preferences.totalDistance / totalLikes;

  return preferences;
}

// Fetch all business data from the database
async function fetchBusinessData() {
  const businesses = await prisma.business.findMany();
  return businesses;
}

// Define weights for initial recommendations
const initialWeights = {
  favoriteCategories: 0.4,
  location: 0.4,
  rating: 0.2,
};

// Define weights for subsequent recommendations
const subsequentWeights = {
  priceLevel: 0.1,
  location: 0.5,
  rating: 0.4,
};

// Score a business based on initial user preferences
function scoreBusinessInitial(business, userPreferences) {
  const businessLocation = parseLocation(business.location);

  if (!businessLocation) {
    console.error("Invalid business location:", business.location);
    return 0;
  }

  const categoryScore = userPreferences.favoriteCategories.includes(
    business.category
  )
    ? 1
    : 0;
  const distanceScore =
    1 -
    haversineDistance(
      userPreferences.coordinates.lat,
      userPreferences.coordinates.lng,
      businessLocation.lat,
      businessLocation.lng
    ) /
      50;
  const ratingScore =
    business.averageRating >= userPreferences.preferredRating ? 1 : 0;

  const score =
    initialWeights.favoriteCategories * categoryScore +
    initialWeights.location * distanceScore +
    initialWeights.rating * ratingScore;

  return score;
}

// Score a business based on subsequent user preferences
function scoreBusinessSubsequent(business, userPreferences) {
  const priceScore =
    1 - Math.abs(business.priceLevel - userPreferences.avgPriceLevel) / 4;
  const distanceScore = 1 - userPreferences.avgDistance / 50;
  const ratingScore = business.averageRating / 5;

  const score =
    subsequentWeights.priceLevel * priceScore +
    subsequentWeights.location * distanceScore +
    subsequentWeights.rating * ratingScore;

  return score;
}

// Provide initial recommendations based on user's favorite categories, location, and preferred rating
async function provideInitialRecommendations(user) {
  const businesses = await fetchBusinessData();

  const userPreferences = {
    favoriteCategories: user.favoriteCategories,
    coordinates: parseLocation(user.location),
    preferredRating: user.preferredRating,
  };

  if (!userPreferences.coordinates) {
    console.error("Invalid user location:", user.location);
    return [];
  }

  const scoredBusinesses = businesses.map((business) => {
    const score = scoreBusinessInitial(business, userPreferences);
    return { ...business, score };
  });

  scoredBusinesses.sort((a, b) => b.score - a.score);

  return scoredBusinesses.slice(0, 20);
}

// Recommend businesses based on user preferences
async function recommendBusinesses(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interactions: true },
  });
  if (!user) {
    console.error("User not found");
    return [];
  }

  const interactions = await fetchLikedInteractions(userId);

  // If there are no interactions or the user has liked fewer than 3 businesses, provide initial recommendations
  if (!interactions || interactions.length < 3) {
    return await provideInitialRecommendations(user);
  }

  // Analyze user preferences based on liked interactions
  const userPreferences = analyzeUserPreferences(interactions);
  if (!userPreferences) {
    return await provideInitialRecommendations(user);
  }

  const businesses = await fetchBusinessData();

  const scoredBusinesses = businesses.map((business) => {
    const score = scoreBusinessSubsequent(business, userPreferences);
    return { ...business, score };
  });

  scoredBusinesses.sort((a, b) => b.score - a.score);

  return scoredBusinesses.slice(0, 20);
}

// Utility functions

// Function to parse location into latitude and longitude
const parseLocation = (location) => {
  if (!location) return null;
  const [lat, lng] = location
    .split(",")
    .map((coord) => parseFloat(coord.trim()));
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

// Calculate Haversine distance between two points (latitude and longitude)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => degree * (Math.PI / 180);
  const R = 3958.8; // Radius of the Earth in miles
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
};

module.exports = {
  recommendBusinesses,
  fetchLikedInteractions,
  analyzeUserPreferences,
  fetchBusinessData,
  parseLocation,
  haversineDistance,
  provideInitialRecommendations,
  scoreBusinessInitial,
  scoreBusinessSubsequent,
};
