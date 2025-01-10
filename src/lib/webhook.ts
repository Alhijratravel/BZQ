import { supabase } from './supabase';

class WebhookService {
  private static instance: WebhookService;

  private constructor() {}

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  private generateSecret(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async register(webhookData: {
    url: string;
    event: string;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('webhooks')
      .insert([{
        ...webhookData,
        secret: this.generateSecret(),
        active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAll() {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async update(id: string, webhookData: any) {
    const { data, error } = await supabase
      .from('webhooks')
      .update(webhookData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Export a singleton instance
export const webhookAPI = WebhookService.getInstance();