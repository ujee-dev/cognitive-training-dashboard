import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/*
  - `"jwt"` 전략 사용
  - **토큰 없거나 잘못되면 자동으로 401 반환**
  - 컨트롤러에서 **@UseGuards()**로 사용
*/
