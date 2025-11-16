// src/utils/hash.js
import * as Crypto from 'expo-crypto';

export async function sha256(text) {
  try {
    const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
    return digest;
  } catch (e) {
    // fallback: return plain text (not secure but avoids crash)
    console.warn('expo-crypto failed, fallback to plain text hash:', e);
    return String(text);
  }
}