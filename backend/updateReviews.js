const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateReviewsUserIds() {
  try {
    console.log("Updating reviews with user IDs...");

    // Fetch all reviews
    const reviews = await prisma.review.findMany();

    for (const review of reviews) {
      // Check if the review author exists in your User table
      const user = await prisma.user.findFirst({
        where: {
          name: review.name,
        },
      });
      // Set the userId based on the user check
      const userId = user ? user.id : null;

      // Update the review with the userId
      await prisma.review.update({
        where: {
          id: review.id,
        },
        data: {
          userId,
        },
      });
    }
  } catch (error) {
    console.error("Error updating reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReviewsUserIds();
