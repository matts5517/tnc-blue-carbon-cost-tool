import { Controller, Get, Res, Logger, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from '@api/modules/export/export.service';
import { JwtCookieAuthGuard } from '@api/modules/auth/guards/jwt-cookie-auth.guard';
import { RolesGuard } from '@api/modules/auth/guards/roles.guard';
import { RequiredRoles } from '@api/modules/auth/decorators/roles.decorator';
import { ROLES } from '@shared/entities/users/roles.enum';

@Controller('admin')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@RequiredRoles(ROLES.ADMIN)
export class ExportController {
  logger: Logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Get('export/xlsx')
  async exportExcel(@Res() res: Response) {
    try {
      this.logger.log('Export endpoint called');

      const buffer = await this.exportService.exportToExcel();

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `blue-carbon-dataset-${timestamp}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      this.logger.error('Error exporting Excel', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  }
}
