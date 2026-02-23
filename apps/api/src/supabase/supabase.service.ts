import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { get } from 'http';

@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;
  constructor() {
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
