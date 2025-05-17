import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class SensitiveDataInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.removeSensitiveData(data)));
  }

  private removeSensitiveData(data: unknown): unknown {
    if (data == null || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.removeSensitiveData(item));
    }

    for (const [key, value] of Object.entries(data)) {
      if (key === 'password' || key === 'email') {
        delete (data as Record<string, unknown>)[key];
      } else if (value && typeof value === 'object') {
        (data as Record<string, unknown>)[key] =
          this.removeSensitiveData(value);
      }
    }
    return data;
  }
}
