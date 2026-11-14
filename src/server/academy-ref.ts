import { randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
/** Short, unguessable-enough reference such as EN-7K2M9Q. */
export function newReference(prefix: string) {
  return prefix + '-' + Array.from(randomBytes(6), (b: number) => ALPHABET[b % ALPHABET.length]).join('');
}
