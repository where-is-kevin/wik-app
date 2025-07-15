export const formatSimilarity = (similarity: number) => {
  if (similarity == null || isNaN(similarity)) return "0%";
  return Math.round(similarity * 100) + "%";
};
