const DANGEROUS_PATTERNS = [
  /<[^>]*>/,                         // any HTML tag
  /javascript\s*:/i,                 // javascript: protocol
  /vbscript\s*:/i,                   // vbscript: protocol
  /data\s*:\s*text\/html/i,          // data URI HTML injection
  /on\w+\s*=/i,                      // inline event handlers (onclick=, onerror=, etc.)
  /expression\s*\(/i,                // CSS expression()
  /eval\s*\(/i,                      // eval()
  /<\s*script/i,                     // <script (with possible spaces)
  /<\s*\/\s*script/i,                // </script>
  /<\s*iframe/i,                     // <iframe
  /<\s*object/i,                     // <object
  /<\s*embed/i,                      // <embed
  /<\s*link/i,                       // <link
  /<\s*meta/i,                       // <meta
  /&#x?[0-9a-f]+;/i,                 // HTML/hex entity encoding
  /%3c/i,                            // URL-encoded <
  /%3e/i,                            // URL-encoded >
];

export function containsDangerousInput(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

export function validateNoInjection(
  fields: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && containsDangerousInput(value)) {
      errors[key] = "Invalid characters detected. HTML and scripts are not allowed.";
    }
  }
  return errors;
}
