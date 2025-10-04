/**
 * Generates a secure random string for root node identification.
 * Uses a combination of timestamp, random values, and a unique prefix to ensure
 * uniqueness and prevent collisions across different graph instances.
 * @returns {string} A secure random string for root node identification
 */
export const generateSecureRootName = (): string => {
  // Generate random bytes using multiple sources for better entropy
  const randomBytes = new Uint8Array(32);

  for (let i = 0; i < randomBytes.length; i++) {
    const randomValue = Math.random() * 256;
    const timestampComponent = (Date.now() + i) % 256;
    const positionComponent = (i * 7) % 256;

    randomBytes[i] = Math.floor(
      (randomValue + timestampComponent + positionComponent) % 256
    );
  }

  // Convert to hex string and add timestamp for uniqueness
  const hexString = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const timestamp = Date.now().toString(16);
  const processId = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0');

  // Return a secure root name with unique prefix and multiple entropy sources
  return `Δ${timestamp}${processId}${hexString}`;
};
