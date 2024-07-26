const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { recommendBusinesses } = require("./initialRecommendations");
const { provideRecommendationsWithModel } = require("./modelTraining");

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

// Recommend businesses based on user preferences and interactions
async function recommendMainBusinesses(userId) {
  const user = await fetchUserData(userId);

  if (!user) {
    console.error("User not found");
    return [];
  }

  const interactions = user.interactions;

  if (!interactions || interactions.length < 12) {
    return recommendBusinesses(userId);
  }

  return provideRecommendationsWithModel(userId);
}

module.exports = {
  recommendBusinesses: recommendMainBusinesses,
};
