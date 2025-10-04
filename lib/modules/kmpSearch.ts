/**
 * Get the maximum length of the longest suffix which is also a prefix.
 * Case-insensitive.
 * @param pattern Search pattern
 * @param text Text to search in
 * @returns Maximum length of the longest suffix which is also a prefix
 */
export const getMaxLsp = (pattern: string, text: string): number => {
  // Early returns for edge cases
  if (pattern.length === 0 || text.length === 0) return 0;
  if (pattern.length > text.length) return 0;

  // Convert to lowercase for case-insensitive comparison
  const lowerPattern = pattern.toLowerCase();
  const lowerText = text.toLowerCase();
  
  const lsp = buildLspArray(lowerPattern);
  const patternLen = lowerPattern.length;
  const textLen = lowerText.length;
  
  let maxLsp = 0;
  let textIndex = 0;
  let patternIndex = 0;

  // KMP search to find maximum prefix match (case-insensitive)
  while (textIndex < textLen) {
    if (lowerText[textIndex] === lowerPattern[patternIndex]) {
      textIndex++;
      patternIndex++;
      
      // Update maximum LSP value
      maxLsp = Math.max(maxLsp, patternIndex);
      
      // If we've matched the entire pattern, we can return early
      if (patternIndex === patternLen) {
        return patternLen;
      }
    } else {
      if (patternIndex !== 0) {
        patternIndex = lsp[patternIndex - 1] ?? 0;
      } else {
        textIndex++;
      }
    }
  }

  return maxLsp;
};

/**
 * Builds the LSP (Longest Suffix which is also Prefix) array for KMP algorithm.
 * Works with case-insensitive patterns.
 * @param pattern The pattern string (should be lowercase for case-insensitive
 * matching)
 * @returns LSP array
 */
const buildLspArray = (pattern: string): number[] => {
  const patternLen = pattern.length;
  const lsp = new Array<number>(patternLen);
  lsp[0] = 0;
  
  let len = 0;
  for (let i = 1; i < patternLen; i++) {
    while (len > 0 && pattern[i] !== pattern[len]) {
      len = lsp[len - 1] ?? 0;
    }
    if (pattern[i] === pattern[len]) {
      len++;
    }
    lsp[i] = len;
  }
  
  return lsp;
};
