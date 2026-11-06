import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '../env/env.service.ts';
import z from 'zod';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(EnvService) config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: UserPayload) {
    const result = tokenPayloadSchema.safeParse(payload);
    if (!result.success) throw new UnauthorizedException('Token inválido.');
    const parsed = result.data;

    return {
      sub: parsed.sub,
    };
  }
}
