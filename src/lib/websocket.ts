import { supabase } from './supabase';
import { toast } from 'sonner';

export class WebSocketService {
  private static instance: WebSocketService;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor() {
    this.initializeSubscriptions();
  }

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeSubscriptions() {
    // Listen for payment status changes
    const paymentSub = supabase
      .channel('payment_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: 'status=eq.completed'
        },
        (payload) => {
          toast.success('Payment completed successfully');
          this.notifyWebhooks('payment.completed', payload.new);
        }
      )
      .subscribe();

    // Listen for subscription changes
    const subscriptionSub = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          const event = `subscription.${payload.eventType}`;
          toast.info(`Subscription ${payload.eventType}`);
          this.notifyWebhooks(event, payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set('payments', () => paymentSub.unsubscribe());
    this.subscriptions.set('subscriptions', () => subscriptionSub.unsubscribe());
  }

  private async notifyWebhooks(event: string, data: any) {
    try {
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('event', event)
        .eq('active', true);

      if (error) throw error;

      webhooks?.forEach(webhook => {
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.generateSignature(webhook.secret, data)
          },
          body: JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString()
          })
        }).catch(error => {
          console.error('Webhook delivery failed:', error);
        });
      });
    } catch (error) {
      console.error('Failed to process webhooks:', error);
    }
  }

  private generateSignature(secret: string, data: any): string {
    // In a real implementation, use crypto to generate HMAC
    return 'dummy-signature';
  }

  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
  }
}