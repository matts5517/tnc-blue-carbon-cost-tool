import {
  ClassSerializerInterceptor,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigModule } from '@api/modules/config/app-config.module';
import { AuthModule } from '@api/modules/auth/auth.module';
import { NotificationsModule } from '@api/modules/notifications/notifications.module';
import { AdminModule } from '@api/modules/admin/admin.module';
import { ImportModule } from '@api/modules/import/import.module';
import { ApiEventsModule } from '@api/modules/api-events/api-events.module';
import { UsersModule } from '@api/modules/users/users.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from '@api/filters/all-exceptions.exception.filter';
import { TsRestModule } from '@ts-rest/nest';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CountriesModule } from '@api/modules/countries/countries.module';
import { ProjectsModule } from '@api/modules/projects/projects.module';
import { CustomProjectsModule } from '@api/modules/custom-projects/custom-projects.module';
import { TerminusModule } from '@nestjs/terminus';
import { MethodologyModule } from '@api/modules/methodology/methodology.module';
import { ExportModule } from '@api/modules/export/export.module';

const NODE_ENV = process.env.NODE_ENV;

@Module({
  imports: [
    TerminusModule.forRoot({ logger: NODE_ENV !== 'test' }),
    TsRestModule.register({
      validateRequestQuery: true,
      validateRequestBody: true,
      isGlobal: true,
      validateRequestHeaders: false,
    }),
    ApiConfigModule,
    AuthModule,
    NotificationsModule,
    ApiEventsModule,
    AdminModule,
    ImportModule,
    CountriesModule,
    UsersModule,
    ProjectsModule,
    CustomProjectsModule,
    MethodologyModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule implements OnModuleInit {
  logger = new Logger('ModuleInit');
  constructor(private datasource: DataSource) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const queryRunner = this.datasource.createQueryRunner();
    try {
      await queryRunner.connect();
      const countries = await queryRunner.query(
        'SELECT count(*) FROM countries',
      );
      if (countries[0].count > 0) {
        await this.computeAreaInHa();
        return;
      }

      const sql = fs.readFileSync(
        path.join(__dirname, '../../../src/insert_countries.sql'),
        'utf8',
      );

      await queryRunner.query(sql);
      await this.computeAreaInHa();
      this.logger.log('Countries imported');
    } catch (e) {
      this.logger.error('Error importing countries', e);
    } finally {
      await queryRunner.release();
    }
  }

  // TODO: We agreed to have a parquet file/something better to ingest the countries with proper geom types and precomputed area
  //      This is a temporary solution since science is at capacity but we should remove this logic, clean the overall countries importing logic
  //      once we have the new solution in place
  async computeAreaInHa() {
    const missingArea = await this.datasource.query(
      'SELECT count(*) FROM countries WHERE area_ha IS NULL',
    );
    if (parseInt(missingArea[0].count) != 0) {
      this.logger.log('Countries found with missing area, computing...');
      await this.datasource.query(
        'UPDATE countries SET area_ha = ST_Area(geography(geometry)) / 10000;',
      );
      this.logger.log('Countries area computed');
    }
  }
}
