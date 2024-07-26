const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cache = require("./cache");
const { tokenizeAndNormalize, buildInvertedIndex } = require("./invertedIndex");

// Function to search for businesses based on a user's query
const searchBusinesses = async (userId, query) => {
  // Generate a cache key based on the user ID and query
  const cacheKey = `search:${userId}:${query}`;

  // Try to get cached results for this query
  let results = cache.get(cacheKey);

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
      cache.set(cacheKey, results);
    }
  }

  // Return the search results
  return results;
};

module.exports = { searchBusinesses };
