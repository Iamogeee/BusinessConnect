const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tokenizeAndNormalize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);
};

const searchBusinesses = async (query) => {
  const keywords = tokenizeAndNormalize(query);

  const results = await prisma.business.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { businessType: { contains: query, mode: "insensitive" } },
        { overview: { contains: query, mode: "insensitive" } },
      ],
    },
  });

  return results;
};

module.exports = { searchBusinesses };
