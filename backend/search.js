const { tokenizeAndNormalize, buildInvertedIndex } = require("./invertedIndex");

const searchBusinesses = async (query) => {
  const keywords = tokenizeAndNormalize(query);

  // Create a map to store the results with their match count
  const resultsMap = new Map();

  // Build the inverted index from the business data
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
  const resultsArray = Array.from(resultsMap.values())
    .sort((a, b) => b.matchCount - a.matchCount)
    .map((entry) => entry.business);

  // Return the sorted array of businesses
  return resultsArray;
};

module.exports = { searchBusinesses };
