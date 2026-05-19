// Crockford base32: removes ambiguous characters (0/O, 1/I/L, U) for invite-code readability.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
