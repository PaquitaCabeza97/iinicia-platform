import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { CampusController } from './controllers/campus.controller';
import { PublicController } from './controllers/public.controller';
import { RbacGuard } from './guards/rbac.guard';
import { DataStoreService } from './services/data-store.service';
import { MoodleService } from './services/moodle.service';

@Module({
  imports: [],
  controllers: [
    PublicController,
    AuthController,
    CampusController,
    AdminController,
  ],
  providers: [MoodleService, DataStoreService, RbacGuard],
})
export class AppModule {}
