// functions/src/utils/encryption.ts
import * as crypto from 'crypto';

/**
 * AES-256-GCM helper (staticki API).
 * Očekuje key dužine tačno 32 bajta (UTF-8).
 * Format izlaza: base64( IV(12b) | TAG(16b) | CIPHERTEXT )
 */
export class Encryption {
  private static ensureKey(key: string): Buffer {
    if (!key || Buffer.byteLength(key, 'utf8') !== 32) {
      throw new Error('Encryption key must be 32 bytes (UTF-8).');
    }
    return Buffer.from(key, 'utf8');
  }

  static encrypt(plainText: string, key: string): string {
    const k = this.ensureKey(key);
    const iv = crypto.randomBytes(12); // preporučeni IV za GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', k, iv);
    const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, tag, enc]); // [12 + 16 + N]
    return payload.toString('base64');
  }

  static decrypt(tokenB64: string, key: string): string {
    const k = this.ensureKey(key);
    const payload = Buffer.from(tokenB64, 'base64');
    if (payload.length < 12 + 16) {
      throw new Error('Invalid encrypted payload.');
    }
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', k, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return dec.toString('utf8');
  }
}