import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // यदि URL र KEY छ भने मात्र क्लाइन्ट बनाउने, नत्र नबनाउने
    if (url && key) {
      this.supabaseClient = createClient(url, key);
    } else {
      console.warn('⚠️ Supabase URL/Key missing. SupabaseService initialized without client.');
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error('Supabase client is not initialized. Check your .env file.');
    }
    return this.supabaseClient;
  }
}