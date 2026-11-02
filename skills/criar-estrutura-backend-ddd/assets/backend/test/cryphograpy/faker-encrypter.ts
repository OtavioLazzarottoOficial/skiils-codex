import { HashComparer } from '../../src/domain/auth/application/crypthograpy/hash-comparer.js';
import { HashGenerator } from '../../src/domain/auth/application/crypthograpy/hash-generator.js';

export class FakerEncrypter implements HashGenerator, HashComparer {
  async hash(value: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return `hashed-${value}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return hashedValue === `hashed-${value}`;
  }
}
