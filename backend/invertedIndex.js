const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tokenizeAndNormalize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);
};

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
