const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Tokenize and normalize text by converting to lowercase, removing punctuation,
// splitting into words, splitting words based on underscores, removing duplicates,
// and sorting the tokens.
const tokenizeAndNormalize = (text) => {
  const normalizedText = text.toLowerCase();
  const cleanedText = normalizedText.replace(/[^\p{L}\p{N}\s_]/gu, "");
  let words = cleanedText.split(/\s+/);
  let allParts = words.flatMap((word) => word.split("_"));
  let result = Array.from(new Set(allParts));
  result.sort((a, b) => a.localeCompare(b));
  return result;
};

// Perform frequency analysis on business overviews and identify stop words
const identifyStopWords = async () => {
  // Fetch all businesses from the database, including their interactions
  const businesses = await prisma.business.findMany({
    include: { interactions: true },
  });

  // Initialize objects to track term frequency and document frequency
  const termFrequency = {}; // Tracks how many times each term appears across all business overviews
  const documentFrequency = {}; // Tracks how many business overviews each term appears in

  // Iterate through each business to populate termFrequency and documentFrequency
  businesses.forEach((business) => {
    const termsSet = new Set();
    const overviewTerms = tokenizeAndNormalize(business.overview);

    overviewTerms.forEach((term) => {
      termFrequency[term] = (termFrequency[term] || 0) + 1;
      termsSet.add(term);
    });

    termsSet.forEach((term) => {
      documentFrequency[term] = (documentFrequency[term] || 0) + 1;
    });
  });

  // Determine stop words based on frequency
  const totalDocuments = businesses.length; // Total number of business overviews
  const stopWords = new Set();

  // If a term appears in more than 10% of the business overviews, it's a stop word
  for (const [term, freq] of Object.entries(documentFrequency)) {
    if (freq / totalDocuments > 0.1) {
      stopWords.add(term);
    }
  }

  // Return the set of stop words
  return Array.from(stopWords);
};

// Filter out stop words from a list of terms
const filterStopWords = (terms, stopWords) => {
  return terms.filter((term) => !stopWords.includes(term));
};

// Build the inverted index
const buildInvertedIndex = async () => {
  // Identify stop words dynamically based on business overviews
  const stopWords = await identifyStopWords();

  // Fetch all businesses from the database
  const businesses = await prisma.business.findMany({
    include: { interactions: true },
  });

  const invertedIndex = {};

  // Iterate through each business to build the inverted index
  businesses.forEach((business) => {
    // Tokenize and normalize the business name, category, overview, and business type
    const keywords = [
      ...tokenizeAndNormalize(business.name),
      ...tokenizeAndNormalize(business.category),
      ...tokenizeAndNormalize(business.overview),
      ...tokenizeAndNormalize(business.businessType),
    ];

    // Filter out stop words
    const filteredKeywords = filterStopWords(keywords, stopWords);

    // Create an entry in the inverted index for each prefix of the keyword
    filteredKeywords.forEach((keyword) => {
      for (let i = 1; i <= keyword.length; i++) {
        const prefix = keyword.slice(0, i);
        if (!invertedIndex[prefix]) {
          invertedIndex[prefix] = [];
        }
        invertedIndex[prefix].push(business);
      }
    });
  });

  return invertedIndex;
};

// Global variable to store the inverted index
let invertedIndex;

// Initialize the inverted index
const initializeInvertedIndex = async () => {
  invertedIndex = await buildInvertedIndex();
};

// Function to get the inverted index
const getInvertedIndex = () => {
  return invertedIndex;
};

module.exports = {
  tokenizeAndNormalize,
  buildInvertedIndex,
  initializeInvertedIndex,
  getInvertedIndex,
};
