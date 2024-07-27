const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cache = require("./cache");
const { tokenizeAndNormalize, buildInvertedIndex } = require("./invertedIndex");

// Function to personalize the search results based on user interactions
const personalizeResults = (userId, results) => {
  if (!Array.isArray(results)) {
    console.error("Results is not an array:", results);
    return [];
  }

  // Sort results based on user interactions
  const sortedResults = results.sort((a, b) => {
    const aInteraction = a.interactions[0] || {};
    const bInteraction = b.interactions[0] || {};

    // Define a scoring mechanism
    const aScore =
      (aInteraction.liked ? 1 : 0) +
      (aInteraction.saved ? 1 : 0) +
      (aInteraction.viewed ? 0.5 : 0) +
      (aInteraction.rated || 0);
    const bScore =
      (bInteraction.liked ? 1 : 0) +
      (bInteraction.saved ? 1 : 0) +
      (bInteraction.viewed ? 0.5 : 0) +
      (bInteraction.rated || 0);

    return bScore - aScore;
  });

  return sortedResults;
};

// Function to search for businesses based on a user's query
const searchBusinesses = async (userId, query) => {
  // Normalize the query for cache key
  const normalizedQuery = tokenizeAndNormalize(query).join(" ");
  const cacheKey = `search:${normalizedQuery}`;

  // Try to get cached results for this query
  let cacheEntry = cache.get(cacheKey);
  let results = cacheEntry ? cacheEntry.results : null;
  let users = cacheEntry ? cacheEntry.users : [];

  // If no cached results, perform a search
  if (!results) {
    // Tokenize and normalize the search query
    const keywords = tokenizeAndNormalize(query);

    // Create a map to store the results with their match count
    const resultsMap = new Map();

    // Build or retrieve the inverted index from the business data
    const invertedIndex = await buildInvertedIndex();

    // Iterate over each keyword to find matching businesses in the inverted index
    keywords.forEach((keyword) => {
      if (invertedIndex[keyword]) {
        // If the keyword is found in the inverted index, iterate over the matching businesses
        invertedIndex[keyword].forEach((business) => {
          // If the business is not already in the results map, add it with an initial match count of 0
          if (!resultsMap.has(business.id)) {
            resultsMap.set(business.id, { business, matchCount: 0 });
          }
          // Increment the match count for the business
          resultsMap.get(business.id).matchCount++;
        });
      }
    });

    // Convert the results map to an array and sort by match count in descending order
    results = Array.from(resultsMap.values())
      .sort((a, b) => b.matchCount - a.matchCount)
      .map((entry) => entry.business);

    // Only cache the search results if there is at least one result
    if (results.length > 0) {
      users.push(userId); // Add the user ID to the list of users who have cached this query
      cache.set(cacheKey, { results, users });
    }
  } else if (!users.includes(userId)) {
    // If the results are cached but the user ID is not in the list, add the user ID
    users.push(userId);
    cache.set(cacheKey, { results, users });
  }

  // Ensure results is an array
  if (!Array.isArray(results)) {
    results = [];
  }

  // Fetch interactions for personalization
  for (const result of results) {
    result.interactions = await prisma.interaction.findMany({
      where: {
        businessId: result.id,
        userId: parseInt(userId),
      },
    });
  }

  // Personalize the results for the specific user
  results = personalizeResults(userId, results);

  // Return the search results
  return results;
};

module.exports = { searchBusinesses };
