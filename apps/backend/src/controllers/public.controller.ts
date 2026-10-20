import { Controller, Get, Param } from '@nestjs/common';
import { DataStoreService } from '../services/data-store.service';
import { MoodleService } from '../services/moodle.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly moodleService: MoodleService,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'IINICIA Backend API (NestJS)',
      architecture: 'Next.js -> NestJS -> Supabase (Auth+PostgreSQL+RLS) + Moodle LMS (REST WS)',
      wordpressRemoved: true,
      supabaseMode: this.dataStore.isSupabaseLive() ? 'live_supabase' : 'local_schema_replica',
      moodleIntegration: this.moodleService.getIntegrationStatus(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('programs')
  getPrograms() {
    return {
      programs: this.dataStore.getPublicPrograms(),
    };
  }

  @Get('programs/:slug')
  getProgramDetail(@Param('slug') slug: string) {
    return {
      program: this.dataStore.getProgramBySlug(slug),
    };
  }
}
