const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tokenizeAndNormalize = (text) => {
  // Convert text to lowercase and remove non-alphanumeric characters (except spaces and underscores)
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s_]/g, "");

  // Split text into words based on spaces
  let words = normalizedText.split(/\s+/);

  // Split words based on underscores and flatten the resulting arrays
  let allParts = words
    .map((word) => word.split("_"))
    .reduce((acc, val) => acc.concat(val), []);

  // Remove duplicate words
  let result = Array.from(new Set([...allParts]));

  return result;
};

const buildInvertedIndex = async () => {
  // Fetch all businesses along with their interactions from the database
  const businesses = await prisma.business.findMany({
    include: {
      interactions: true,
    },
  });

  const invertedIndex = {};

  businesses.forEach((business) => {
    // Tokenize and normalize the business name, category, overview, and business type
    const keywords = [
      ...tokenizeAndNormalize(business.name),
      ...tokenizeAndNormalize(business.category),
      ...tokenizeAndNormalize(business.overview),
      ...tokenizeAndNormalize(business.businessType),
    ];

    keywords.forEach((keyword) => {
      // Create an entry in the inverted index for each prefix of the keyword
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

const initializeInvertedIndex = async () => {
  invertedIndex = await buildInvertedIndex();
};

// Initialize the inverted index when the module is loaded
initializeInvertedIndex();

module.exports = {
  tokenizeAndNormalize,
  buildInvertedIndex,
  initializeInvertedIndex,
  invertedIndex,
};
