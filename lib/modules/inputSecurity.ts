/**
 * Configuration options for input validation
 */
export interface ValidationOptions {
  /** Maximum allowed length for the input string. Defaults to 1000 characters */
  maxLength?: number;
  /** Whether to allow HTML tags in the input. Defaults to false for security */
  allowHtml?: boolean;
  /** Whether to trim leading and trailing whitespace. Defaults to true */
  trimWhitespace?: boolean;
  /** Whether to allow empty strings as valid input. Defaults to true */
  allowEmptyString?: boolean;
}

/**
 * Mapping of HTML special characters to their escaped equivalents
 */
const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
} as const;

/**
 * Regular expression for detecting and removing control characters and null bytes
 */
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Default configuration options for input validation
 */
const DEFAULT_VALIDATION_OPTIONS: Required<ValidationOptions> = {
  maxLength: 100,
  allowHtml: false,
  trimWhitespace: true,
  allowEmptyString: true,
};

/**
 * Normalizes input to string and safely handles null/undefined values
 * @param {any} input - The input value to normalize
 * @returns {string} Empty string for null/undefined, otherwise converts to string
 */
const normalizeInput = (input: any): string => {
  return input == null ? '' : String(input);
};

/**
 * Validates input constraints such as length limits and empty string rules
 * @param {string} input - The input string to validate
 * @param {Required<ValidationOptions>} options - The validation configuration
 * options
 * @throws {Error} Throws an error if validation constraints are violated
 */
const validateConstraints = (
  input: string,
  options: Required<ValidationOptions>
): void => {
  if (!options.allowEmptyString && input === '') {
    throw new Error('Empty input is not allowed');
  }

  if (input.length > options.maxLength) {
    throw new Error(
      `Input exceeds maximum length of ${options.maxLength} characters`
    );
  }
};

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} input - The string to escape
 * @returns {string} The escaped string safe for HTML display
 */
export const escapeHtml = (input: string): string => {
  return input.replace(
    /[&<>"'/]/g,
    (match) => HTML_ESCAPES[match as keyof typeof HTML_ESCAPES]
  );
};

/**
 * Validates and sanitizes user input for safe database storage and HTML display
 * @param {string} input - The user input string to validate and sanitize
 * @param {ValidationOptions} [options={}] - Configuration options for validation
 * behavior
 * @returns {string} The sanitized and validated input string
 * @throws {Error} Throws an error if input violates constraints
 */
export const validateInput = (
  input: string,
  options: ValidationOptions = {}
): string => {
  const config = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  let sanitized = normalizeInput(input);

  if (config.trimWhitespace) {
    sanitized = sanitized.trim();
  }

  validateConstraints(sanitized, config);

  if (!config.allowHtml) {
    sanitized = escapeHtml(sanitized);
  }

  // Remove control characters
  sanitized = sanitized.replace(CONTROL_CHARS, '');

  return sanitized;
};

/**
 * Validates and sanitizes date input for safe database storage
 * @param {any} input - The date input to validate and convert
 * @returns {Date} JavaScript Date object of the validated date
 * @throws {Error} Throws an error if the date is invalid
 */
export const validateDateForStorage = (input: any): Date => {
  if (input == null) {
    throw new Error('Date input cannot be null or undefined');
  }

  if (input === '') {
    throw new Error('Date input cannot be empty');
  }

  try {
    const parsedDate = input instanceof Date ? input : new Date(input);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return parsedDate;
  } catch (error) {
    throw new Error(
      `Date parsing error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
