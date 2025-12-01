// Real Stripe Integration - No Mock Data
import { supabase } from './supabase';
import { stripeService } from './stripe';

class ClientService {

  // Get all clients
  async getAllClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // Get client by ID
  async getClientById(id) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  // Create new client
  async createClient(clientData) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update client
  async updateClient(id, updates) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(id) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Add Payment Intent ID to client
  async addPaymentIntentId(clientId, intentId) {
    try {
      // First get current client data
      const client = await this.getClientById(clientId);
      const currentIntents = client.stripe_payment_intent_ids || [];
      
      // Add new intent ID if not already present
      if (!currentIntents.includes(intentId)) {
        const updatedIntents = [...currentIntents, intentId];
        
        const { data, error } = await supabase
          .from('clients')
          .update({ stripe_payment_intent_ids: updatedIntents })
          .eq('id', clientId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      
      return client;
    } catch (error) {
      console.error('Error adding payment intent ID:', error);
      throw error;
    }
  }

  // Add Subscription ID to client
  async addSubscriptionId(clientId, subscriptionId) {
    try {
      // First get current client data
      const client = await this.getClientById(clientId);
      const currentSubscriptions = client.stripe_subscription_ids || [];
      
      // Add new subscription ID if not already present
      if (!currentSubscriptions.includes(subscriptionId)) {
        const updatedSubscriptions = [...currentSubscriptions, subscriptionId];
        
        const { data, error } = await supabase
          .from('clients')
          .update({ stripe_subscription_ids: updatedSubscriptions })
          .eq('id', clientId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      
      return client;
    } catch (error) {
      console.error('Error adding subscription ID:', error);
      throw error;
    }
  }

  // Remove Payment Intent ID from client
  async removePaymentIntentId(clientId, intentId) {
    try {
      const client = await this.getClientById(clientId);
      const currentIntents = client.stripe_payment_intent_ids || [];
      const updatedIntents = currentIntents.filter(id => id !== intentId);
      
      const { data, error } = await supabase
        .from('clients')
        .update({ stripe_payment_intent_ids: updatedIntents })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing payment intent ID:', error);
      throw error;
    }
  }

  // Remove Subscription ID from client
  async removeSubscriptionId(clientId, subscriptionId) {
    try {
      const client = await this.getClientById(clientId);
      const currentSubscriptions = client.stripe_subscription_ids || [];
      const updatedSubscriptions = currentSubscriptions.filter(id => id !== subscriptionId);
      
      const { data, error } = await supabase
        .from('clients')
        .update({ stripe_subscription_ids: updatedSubscriptions })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing subscription ID:', error);
      throw error;
    }
  }

  // Fetch real Stripe Customer data
  async fetchStripeCustomer(customerId, environment) {
    try {
      const customer = await stripeService.getCustomer(customerId, environment);
      return customer;
    } catch (error) {
      console.error('Error fetching Stripe customer:', error);
      throw error;
    }
  }

  // Fetch real Stripe Payment Intents with error tracking
  async fetchStripePaymentIntentsWithErrors(paymentIntentIds, environment) {
    try {
      const paymentIntents = [];
      const errors = [];
      
      for (const intentId of paymentIntentIds) {
        try {
          const paymentIntent = await stripeService.getPaymentIntent(intentId, environment);
          paymentIntents.push(paymentIntent);
        } catch (error) {
          errors.push({
            id: intentId,
            error: error.message,
            type: error.type || 'unknown',
            code: error.code || 'unknown'
          });
        }
      }
      
      return { paymentIntents, errors };
    } catch (error) {
      console.error('Error fetching Stripe payment intents:', error);
      throw error;
    }
  }

  // Fetch real Stripe Subscriptions with error tracking
  async fetchStripeSubscriptionsWithErrors(subscriptionIds, environment) {
    try {
      const subscriptions = [];
      const errors = [];
      
      for (const subId of subscriptionIds) {
        try {
          const subscription = await stripeService.getSubscription(subId, environment);
          subscriptions.push(subscription);
        } catch (error) {
          errors.push({
            id: subId,
            error: error.message,
            type: error.type || 'unknown',
            code: error.code || 'unknown'
          });
        }
      }
      
      return { subscriptions, errors };
    } catch (error) {
      console.error('Error fetching Stripe subscriptions:', error);
      throw error;
    }
  }

  // Sync with Real Stripe Data - No Mock Data
  async syncWithStripe(clientId, stripeIds) {
    try {
      const client = await this.getClientById(clientId);
      const environment = client.stripe_environment || 'test';

      // Fetch real Stripe data and track errors
      const stripeData = {
        customer: null,
        paymentIntents: [],
        subscriptions: [],
        errors: {
          customer: null,
          paymentIntents: [],
          subscriptions: []
        }
      };

      // Fetch customer data if customer ID exists
      if (stripeIds.customerId) {
        try {
          stripeData.customer = await this.fetchStripeCustomer(stripeIds.customerId, environment);
        } catch (error) {
          stripeData.errors.customer = {
            id: stripeIds.customerId,
            error: error.message,
            type: error.type || 'unknown',
            code: error.code || 'unknown'
          };
        }
      }

      // Fetch payment intents if they exist
      if (stripeIds.paymentIntentIds && stripeIds.paymentIntentIds.length > 0) {
        const { paymentIntents, errors } = await this.fetchStripePaymentIntentsWithErrors(stripeIds.paymentIntentIds, environment);
        stripeData.paymentIntents = paymentIntents;
        stripeData.errors.paymentIntents = errors;
      }

      // Fetch subscriptions if they exist
      if (stripeIds.subscriptionIds && stripeIds.subscriptionIds.length > 0) {
        const { subscriptions, errors } = await this.fetchStripeSubscriptionsWithErrors(stripeIds.subscriptionIds, environment);
        stripeData.subscriptions = subscriptions;
        stripeData.errors.subscriptions = errors;
      }

      // Calculate totals from real Stripe data (payments + subscriptions)
      const succeededPayments = stripeData.paymentIntents.filter(intent => intent.status === 'succeeded');
      const paymentTotal = succeededPayments.reduce((sum, intent) => sum + (intent.amount / 100), 0);
      
      // Calculate subscription totals
      let subscriptionTotal = 0;
      let subscriptionMonthlyValue = 0;
      let subscriptionDetails = [];
      
      if (stripeData.subscriptions.length > 0) {
        for (const subscription of stripeData.subscriptions) {
          if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
            const price = subscription.items.data[0].price;
            if (price && price.unit_amount) {
              const amount = price.unit_amount / 100; // Convert cents to dollars
              const interval = price.recurring?.interval || 'month';
              const intervalCount = price.recurring?.interval_count || 1;
              
              // Calculate monthly equivalent for consistent comparison
              let monthlyAmount = amount;
              if (interval === 'year') {
                monthlyAmount = amount / (12 * intervalCount);
              } else if (interval === 'week') {
                monthlyAmount = amount * 4 * intervalCount;
              } else if (interval === 'day') {
                monthlyAmount = amount * 30 * intervalCount;
              }
              
              subscriptionMonthlyValue += monthlyAmount;
              
              // Calculate total paid based on subscription duration
              const startDate = new Date(subscription.created * 1000);
              const now = new Date();
              const monthsActive = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30)));
              
              let totalForThisSubscription = 0;
              if (interval === 'month') {
                totalForThisSubscription = amount * Math.floor(monthsActive / intervalCount);
              } else if (interval === 'year') {
                totalForThisSubscription = amount * Math.floor(monthsActive / (12 * intervalCount));
              } else {
                totalForThisSubscription = monthlyAmount * monthsActive;
              }
              
              subscriptionTotal += totalForThisSubscription;
              
              subscriptionDetails.push({
                id: subscription.id,
                amount: amount,
                interval: interval,
                intervalCount: intervalCount,
                monthlyEquivalent: monthlyAmount,
                totalPaid: totalForThisSubscription,
                status: subscription.status,
                startDate: startDate
              });
            }
          }
        }
      }
      
      // Combined total of payments + estimated subscription total
      const totalPaid = paymentTotal + subscriptionTotal;
      
      // Find the most recent successful payment
      let lastPaymentDate = null;
      if (succeededPayments.length > 0) {
        const mostRecentPayment = succeededPayments.reduce((latest, payment) => 
          payment.created > latest.created ? payment : latest
        );
        lastPaymentDate = new Date(mostRecentPayment.created * 1000).toISOString();
      }

      // Determine payment status based on real payment data and errors
      let paymentStatus = 'overdue'; // default
      
      // Check if there are critical errors that should affect status
      const hasCriticalErrors = stripeData.errors.paymentIntents.length > 0 || 
                              stripeData.errors.customer;
      
      if (hasCriticalErrors) {
        // If we have errors fetching payment data, mark as overdue to flag for attention
        paymentStatus = 'overdue';
      } else if (succeededPayments.length > 0) {
        const thirtyDaysAgo = (Date.now() / 1000) - (30 * 24 * 60 * 60);
        const hasRecentSuccessfulPayment = succeededPayments.some(
          payment => payment.created > thirtyDaysAgo
        );
        paymentStatus = hasRecentSuccessfulPayment ? 'current' : 'past_due';
      }

      // Determine subscription status from real subscription data and errors
      let subscriptionStatus = 'canceled'; // Default to 'canceled'
      
      // Check for subscription fetch errors
      if (stripeData.errors.subscriptions.length > 0) {
        subscriptionStatus = 'unpaid'; // Mark as unpaid to flag for attention
      } else if (stripeData.subscriptions.length > 0) {
        // Use the status of the most recent subscription
        const mostRecentSubscription = stripeData.subscriptions[stripeData.subscriptions.length - 1];
        const stripeStatus = mostRecentSubscription.status;
        
        // Map Stripe subscription statuses to our database constraints
        // Valid values: 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'
        switch (stripeStatus) {
          case 'active':
            subscriptionStatus = 'active';
            break;
          case 'past_due':
            subscriptionStatus = 'past_due';
            break;
          case 'canceled':
          case 'cancelled':
            subscriptionStatus = 'canceled';
            break;
          case 'unpaid':
            subscriptionStatus = 'unpaid';
            break;
          case 'incomplete':
          case 'incomplete_expired':
            subscriptionStatus = 'incomplete';
            break;
          default:
            subscriptionStatus = 'canceled';
        }
        

      } else {

      }



      // Update client with real Stripe data including subscription details
      const updates = {
        total_paid: totalPaid.toFixed(2),
        payment_status: paymentStatus,
        subscription_status: subscriptionStatus,
        stripe_customer_id: stripeIds.customerId || null,
        subscription_monthly_value: subscriptionMonthlyValue.toFixed(2),
        subscription_details: JSON.stringify(subscriptionDetails)
      };

      // Only update last_payment_date if we found a successful payment
      if (lastPaymentDate) {
        updates.last_payment_date = lastPaymentDate;
      }



      const updatedClient = await this.updateClient(clientId, updates);
      

      
      return {
        client: updatedClient,
        stripeData: stripeData,
        syncedAt: new Date().toISOString(),
        syncSummary: {
          totalPaid: `$${totalPaid.toFixed(2)}`,
          succeededPayments: succeededPayments.length,
          totalSubscriptions: stripeData.subscriptions.length,
          paymentStatus: updates.payment_status,
          subscriptionStatus: updates.subscription_status,
          environment: environment,
          errors: {
            customer: stripeData.errors.customer,
            paymentIntents: stripeData.errors.paymentIntents,
            subscriptions: stripeData.errors.subscriptions,
            hasErrors: stripeData.errors.customer || 
                      stripeData.errors.paymentIntents.length > 0 || 
                      stripeData.errors.subscriptions.length > 0
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Error syncing with Stripe:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();