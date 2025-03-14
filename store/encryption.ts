import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const ENCRYPTION_KEY = 'app-encryption-key';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Helper to get the crypto object safely
const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  throw new Error('Crypto API not available');
};

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async initialize(): Promise<void> {
    let storedKey: string | null = null;

    if (Platform.OS === 'web') {
      storedKey = localStorage.getItem(ENCRYPTION_KEY);
    } else {
      storedKey = await SecureStore.getItemAsync(ENCRYPTION_KEY);
    }

    if (!storedKey) {
      // Generate a new encryption key
      const key = await this.generateEncryptionKey();
      const exportedKey = await this.exportKey(key);
      
      // Store the key securely
      if (Platform.OS === 'web') {
        localStorage.setItem(ENCRYPTION_KEY, exportedKey);
      } else {
        await SecureStore.setItemAsync(ENCRYPTION_KEY, exportedKey);
      }
      
      this.encryptionKey = key;
    } else {
      // Import the existing key
      this.encryptionKey = await this.importKey(storedKey);
    }
  }

  private async generateEncryptionKey(): Promise<CryptoKey> {
    const crypto = getCrypto();
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    return key;
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const crypto = getCrypto();
    const exported = await crypto.subtle.exportKey('raw', key);
    return Buffer.from(exported).toString('base64');
  }

  private async importKey(keyData: string): Promise<CryptoKey> {
    const crypto = getCrypto();
    const keyBuffer = Buffer.from(keyData, 'base64');
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const crypto = getCrypto();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.encryptionKey!,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return Buffer.from(combined).toString('base64');
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const crypto = getCrypto();
    const data = Buffer.from(encryptedData, 'base64');
    const iv = data.slice(0, IV_LENGTH);
    const ciphertext = data.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.encryptionKey!,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  async hashPassword(password: string): Promise<string> {
    const crypto = getCrypto();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...passwordData])
    );
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${Buffer.from(salt).toString('base64')}:${hashHex}`;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const crypto = getCrypto();
    const [saltString, hash] = hashedPassword.split(':');
    const salt = Buffer.from(saltString, 'base64');
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...passwordData])
    );
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hash === hashHex;
  }
}

export const encryptionService = EncryptionService.getInstance();