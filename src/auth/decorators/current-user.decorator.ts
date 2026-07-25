import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RegisteredUser } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RegisteredUser => {
    const request = context.switchToHttp().getRequest<{
      user: RegisteredUser;
    }>();

    return request.user;
  },
);
