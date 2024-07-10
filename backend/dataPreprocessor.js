const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const natural = require("natural");
const { TfIdf } = natural;
const tfidf = new TfIdf();
const tf = require("@tensorflow/tfjs-node");

// Fetch data from Prisma
const fetchData = async () => {
  return await prisma.interaction.findMany({
    include: {
      User: true,
      Business: true,
    },
  });
};

// Handle missing values
const handleMissingValues = (data) => {
  return data.map((item) => {
    item.rated = item.rated !== null ? item.rated : 0;
    item.reviewed = item.reviewed !== null ? item.reviewed : "";
    return item;
  });
};

// Normalize text data
const normalizeTextData = (data) => {
  return data.map((item) => {
    item.reviewed = item.reviewed.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    return item;
  });
};

// One-hot encode categorical data
const oneHotEncodeCategoricalData = (data) => {
  return data.map((item) => {
    item.liked = item.liked ? 1 : 0;
    item.saved = item.saved ? 1 : 0;
    item.viewed = item.viewed ? 1 : 0;
    return item;
  });
};

// TF-IDF encode text data
const tfidfEncodeTextData = (data) => {
  data.forEach((item) => {
    tfidf.addDocument(item.reviewed);
  });

  return data.map((item, index) => {
    const tfidfVector = {};
    tfidf.listTerms(index).forEach((term) => {
      tfidfVector[term.term] = term.tfidf;
    });
    return { ...item, ...tfidfVector };
  });
};

// Preprocess data function
const preprocessData = async () => {
  const data = await fetchData();

  // Handle missing values
  let processedData = handleMissingValues(data);

  // Normalize text data
  processedData = normalizeTextData(processedData);

  // One-hot encode categorical data
  processedData = oneHotEncodeCategoricalData(processedData);

  // TF-IDF encode text data
  processedData = tfidfEncodeTextData(processedData);

  // Save the preprocessed data (optional)
  fs.writeFileSync(
    "preprocessed_interactions.json",
    JSON.stringify(processedData, null, 2)
  );

  return processedData;
};

preprocessData()
  .then(() => {
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("Error during data preprocessing:", error);
    prisma.$disconnect();
  });
