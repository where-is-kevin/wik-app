export const formatSimilarity = (similarity: number | string) => {
  if (similarity == null) return "0%";

  // Convert string to number if needed
  const numSimilarity = typeof similarity === 'string' ? parseFloat(similarity) : similarity;

  if (isNaN(numSimilarity)) return "0%";
  return Math.round(numSimilarity * 100) + "%";
};
