import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKEN_TYPE_ENUM } from '@shared/schemas/auth/token-type.schema';
import { JwtConfigHandler } from '@api/modules/config/auth-config.handler';
import { COMMON_DATABASE_ENTITIES } from '@shared/lib/db-entities';
import { S3ClientConfig } from '@aws-sdk/client-s3';
// import { BACKEND_DB_ENTITIES } from '@shared/lib/db-entities';

export type JWTConfig = {
  secret: string;
  expiresIn: string;
};

export type EmailConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  domain: string;
};

const isProduction = process.env.NODE_ENV === 'production';

@Injectable()
export class ApiConfigService {
  constructor(
    private configService: ConfigService,
    private readonly jwtConfigHandler: JwtConfigHandler,
  ) {}

  /**
   * @note We could abstract this to a data layer access config specific class within database module, as well for other configs when the thing gets more complex.
   * we could also abstract the underlying engine type, which is now set in the main app module
   *
   * @note: Maybe it's a good idea to move the datasource config to shared folder, to be used potentially for a e2e test agent
   */
  getDatabaseConfig() {
    return {
      host: this.configService.getOrThrow('DB_HOST'),
      port: this.configService.getOrThrow('DB_PORT'),
      username: this.configService.getOrThrow('DB_USERNAME'),
      password: this.configService.getOrThrow('DB_PASSWORD'),
      database: this.configService.getOrThrow('DB_NAME'),
      entities: COMMON_DATABASE_ENTITIES,
      synchronize: false,
      ssl: this.isProduction()
        ? { require: true, rejectUnauthorized: false }
        : false,
    };
  }

  getS3Config(): S3ClientConfig {
    const config: S3ClientConfig = {
      region: this.configService.getOrThrow('AWS_REGION'),
    };

    if (!isProduction) {
      config.endpoint = this.configService.getOrThrow('S3_ENDPOINT');
      config.credentials = {
        accessKeyId: this.configService.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('S3_SECRET_ACCESS_KEY'),
      };
      config.forcePathStyle = true;
    }

    return config;
  }

  getS3BucketName() {
    return this.configService.getOrThrow('S3_BUCKET_NAME');
  }

  public isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  getJWTConfigByType(type: TOKEN_TYPE_ENUM): JWTConfig {
    return this.jwtConfigHandler.getJwtConfigByType(type);
  }

  getEmailConfig(): EmailConfig {
    return {
      accessKeyId: this.configService.getOrThrow('AWS_SES_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow(
        'AWS_SES_ACCESS_KEY_SECRET',
      ),
      region: this.configService.getOrThrow('AWS_REGION'),
      domain: this.configService.getOrThrow('AWS_SES_DOMAIN'),
    };
  }

  get(envVarName: string): string {
    return this.configService.get(envVarName);
  }
}
