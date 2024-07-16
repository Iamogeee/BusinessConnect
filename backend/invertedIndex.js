const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Tokenizes and normalizes text.
 * @param {String} text - The text to tokenize and normalize.
 * @returns {Array} - An array of tokens.
 */
const tokenizeAndNormalize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);
};

/**
 * Builds an inverted index from the business data.
 * @returns {Object} - The inverted index.
 */
const buildInvertedIndex = async () => {
  const businesses = await prisma.business.findMany({
    include: {
      interactions: true,
    },
  });

  const invertedIndex = {};

  businesses.forEach((business) => {
    const keywords = [
      ...tokenizeAndNormalize(business.name),
      ...tokenizeAndNormalize(business.category),
      ...tokenizeAndNormalize(business.overview),
    ];

    keywords.forEach((keyword) => {
      if (!invertedIndex[keyword]) {
        invertedIndex[keyword] = [];
      }
      invertedIndex[keyword].push(business);
    });
  });

  return invertedIndex;
};

module.exports = { buildInvertedIndex };
