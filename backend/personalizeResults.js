const personalizeResults = (results) => {
  return results.sort((a, b) => {
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
};

module.exports = { personalizeResults };
