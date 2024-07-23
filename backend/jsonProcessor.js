const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { API_KEY } = require("./config");

const prisma = new PrismaClient();

const jsonFilePath = path.join(
  __dirname,
  "/public",
  "businessApiResponse.json"
);

async function fetchPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=name,rating,formatted_phone_number,photos,reviews,current_opening_hours,editorial_summary&place_id=${placeId}&key=${API_KEY}`;
  const response = await axios.get(url);
  return response.data.result;
}

async function processJsonFile() {
  fs.readFile(jsonFilePath, "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);

      for (const business of jsonData.results) {
        const location = `${business.geometry.location.lat}, ${business.geometry.location.lng}`;
        const businessType = business.types.join(", ");
        const firstType = business.types[0]
          ? business.types[0].trim()
          : "Uncategorized";
        const businessHours = business.opening_hours
          ? business.opening_hours.weekday_text || ["Unknown"]
          : ["Unknown"];
        const userRatingsTotal = business.user_ratings_total || 0;
        const priceLevel = business.price_level || null;

        // Fetch additional details from Google Places API
        const placeDetails = await fetchPlaceDetails(business.place_id);

        const upsertedBusiness = await prisma.business.upsert({
          where: { placeId: business.place_id },
          update: {
            name: placeDetails.name || business.name,
            location,
            contactInformation: placeDetails.formatted_phone_number || null,
            overview: placeDetails.editorial_summary
              ? placeDetails.editorial_summary.overview
              : "",
            businessHours: placeDetails.current_opening_hours
              ? placeDetails.current_opening_hours.weekday_text
              : [],
            averageRating: placeDetails.rating || business.rating,
            businessType,
            photoReference: placeDetails.photos
              ? placeDetails.photos[0].photo_reference
              : null,
            photos: placeDetails.photos
              ? placeDetails.photos.map((photo) => photo.photo_reference)
              : [],
            category: firstType,
            priceLevel,
            numberOfRatings: userRatingsTotal,
          },
          create: {
            placeId: business.place_id,
            name: placeDetails.name || business.name,
            location,
            contactInformation: placeDetails.formatted_phone_number || null,
            overview: placeDetails.editorial_summary
              ? placeDetails.editorial_summary.overview
              : "",
            businessHours: placeDetails.current_opening_hours
              ? placeDetails.current_opening_hours.weekday_text
              : [],
            averageRating: placeDetails.rating || business.rating,
            businessType,
            photoReference: placeDetails.photos
              ? placeDetails.photos[0].photo_reference
              : null,
            photos: placeDetails.photos
              ? placeDetails.photos.map((photo) => photo.photo_reference)
              : [],
            category: firstType,
            priceLevel,
            numberOfRatings: userRatingsTotal,
          },
        });

        if (placeDetails.reviews) {
          for (const review of placeDetails.reviews) {
            const existingReview = await prisma.review.findFirst({
              where: {
                name: review.author_name,
                businessId: upsertedBusiness.id,
              },
            });

            if (!existingReview) {
              await prisma.review.create({
                data: {
                  rating: review.rating,
                  reviewText: review.text,
                  name: review.author_name,
                  businessId: upsertedBusiness.id,
                  profilePhoto: review.profile_photo_url,
                },
              });
            } else {
              await prisma.review.update({
                where: {
                  id: existingReview.id,
                },
                data: {
                  profilePhoto: review.profile_photo_url,
                },
              });
            }
          }
        }
        const allReviews = await prisma.review.findMany({
          where: {
            businessId: upsertedBusiness.id,
          },
        });

        const totalRating = allReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const rating = (totalRating / allReviews.length).toFixed(1);
        const averageRating = parseFloat(rating);
        // Update the business with the calculated average rating
        await prisma.business.update({
          where: { id: upsertedBusiness.id },
          data: { averageRating },
        });
      }
    } catch (parseErr) {
      console.error("Error parsing JSON data:", parseErr);
    } finally {
      await prisma.$disconnect();
    }
  });
}

module.exports = {
  processJsonFile,
};
