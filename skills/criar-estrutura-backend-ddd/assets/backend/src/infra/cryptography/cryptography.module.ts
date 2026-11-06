import { Module } from '@nestjs/common';
import { BcryptHasher } from './bcrypt-hasher.ts';

import { JwtEncrypter } from './jwt-encrypter.ts';
import { Encrypter } from '../../domain/auth/application/crypthograpy/encrypter.ts';
import { HashComparer } from '../../domain/auth/application/crypthograpy/hash-comparer.ts';
import { HashGenerator } from '../../domain/auth/application/crypthograpy/hash-generator.ts';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
