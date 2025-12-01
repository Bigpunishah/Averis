import { supabase } from './supabase';
import { clientService } from './clientService';
import { expenseService } from './expenseService';
import { stripeService } from './stripe';

class TransactionService {

  // Get current Stripe environment
  async getStripeEnvironment() {
    try {
      return await stripeService.loadEnvironment();
    } catch (error) {
      return 'test';
    }
  }

  // Fetch all Stripe invoices
  async fetchAllStripeInvoices(environment) {
    try {
      const stripe = await stripeService.getStripeInstance(environment);
      
      // Fetch all invoices (limited to last 100 for performance)
      const invoices = await stripe.invoices.list({
        limit: 100,
        expand: ['data.customer', 'data.subscription']
      });
      
      return invoices.data;
    } catch (error) {
      console.error('Error fetching Stripe invoices:', error);
      return [];
    }
  }

  // Fetch all Stripe payment intents
  async fetchAllStripePaymentIntents(environment) {
    try {
      const stripe = await stripeService.getStripeInstance(environment);
      
      // Fetch all payment intents (limited to last 100 for performance)
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.customer', 'data.charges']
      });
      
      return paymentIntents.data;
    } catch (error) {
      console.error('Error fetching Stripe payment intents:', error);
      return [];
    }
  }

  // Fetch all Stripe subscriptions
  async fetchAllStripeSubscriptions(environment) {
    try {
      const stripe = await stripeService.getStripeInstance(environment);
      
      // Fetch all subscriptions (limited to last 100 for performance)
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        expand: ['data.customer', 'data.items.data.price']
      });
      
      return subscriptions.data;
    } catch (error) {
      console.error('Error fetching Stripe subscriptions:', error);
      return [];
    }
  }

  // Fetch all Stripe charges
  async fetchAllStripeCharges(environment) {
    try {
      const stripe = await stripeService.getStripeInstance(environment);
      
      // Fetch all charges (limited to last 100 for performance)
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.customer', 'data.invoice']
      });
      
      return charges.data;
    } catch (error) {
      console.error('Error fetching Stripe charges:', error);
      return [];
    }
  }

  // Map client information to transactions (synchronous) - handles multiple matches
  mapClientToTransactionSync(stripeCustomerId, clients) {
    if (!stripeCustomerId) return null;
    
    // Find all clients with matching customer ID
    const matchingClients = clients.filter(c => c.stripe_customer_id === stripeCustomerId);
    
    if (matchingClients.length === 0) return null;
    
    if (matchingClients.length === 1) {
      const client = matchingClients[0];
      return {
        id: client.id,
        business_name: client.business_name,
        contact_name: client.contact_name,
        email: client.email
      };
    }
    
    // Handle multiple clients with same customer ID
    return {
      id: matchingClients.map(c => c.id).join(','), // Comma-separated IDs
      business_name: matchingClients.map(c => c.business_name).join(', '), // Combined names
      contact_name: matchingClients.map(c => c.contact_name).join(', '),
      email: matchingClients.map(c => c.email).join(', '),
      multiple_matches: true,
      client_count: matchingClients.length
    };
  }

  // Get all transactions (Stripe + Expenses)
  async getAllTransactions() {
    try {
      // Get current environment
      const environment = await this.getStripeEnvironment();

      // Fetch all clients for mapping
      const clients = await clientService.getAllClients();
      
      // Fetch all expenses
      const expenses = await expenseService.getAllExpenses();
      
      // Fetch all Stripe data
      const [invoices, paymentIntents, subscriptions, charges] = await Promise.all([
        this.fetchAllStripeInvoices(environment),
        this.fetchAllStripePaymentIntents(environment),
        this.fetchAllStripeSubscriptions(environment),
        this.fetchAllStripeCharges(environment)
      ]);

      const transactions = [];

      // Process Expenses
      expenses.forEach(expense => {
        transactions.push({
          id: `expense_${expense.id}`,
          type: 'expense',
          description: expense.description,
          amount: -(parseFloat(expense.amount) || 0), // Negative for expenses
          currency: 'usd',
          status: expense.is_recurring ? 
            (expense.is_paused ? 'paused' : 'recurring') : 'completed',
          date: new Date(expense.expense_date),
          created_at: new Date(expense.created_at),
          client: expense.clients ? {
            id: expense.clients.id,
            business_name: expense.clients.business_name,
            contact_name: expense.clients.contact_name,
            email: expense.clients.email
          } : null,
          metadata: {
            category: expense.category,
            is_recurring: expense.is_recurring,
            recurring_frequency: expense.recurring_frequency,
            is_paused: expense.is_paused,
            next_due_date: expense.next_due_date
          },
          stripe_id: null
        });
      });

      // Process Stripe Charges first (primary revenue records)
      const processedChargeIds = new Set();
      for (const charge of charges) {
        // Only process successful charges
        if (charge.status === 'succeeded') {
          let client = null;
          
          // First try to match by charge customer
          if (charge.customer) {
            const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer.id;
            client = this.mapClientToTransactionSync(customerId, clients);
          }
          
          // If no client found and we have a payment intent, try to find payment intent in client records
          if (!client && charge.payment_intent) {
            const matchingClient = clients.find(c => 
              c.stripe_payment_intent_ids && 
              c.stripe_payment_intent_ids.includes(charge.payment_intent)
            );
            
            if (matchingClient) {
              client = {
                id: matchingClient.id,
                business_name: matchingClient.business_name,
                contact_name: matchingClient.contact_name,
                email: matchingClient.email
              };
            }
          }

          transactions.push({
            id: `charge_${charge.id}`,
            type: 'charge',
            description: charge.description || `Payment - ${charge.id.slice(-6)}`,
            amount: charge.amount / 100,
            currency: charge.currency,
            status: charge.status,
            date: new Date(charge.created * 1000),
            created_at: new Date(charge.created * 1000),
            client: client,
            metadata: {
              payment_method: charge.payment_method_details?.type,
              receipt_url: charge.receipt_url,
              refunded: charge.refunded,
              amount_refunded: charge.amount_refunded / 100,
              invoice_id: charge.invoice,
              payment_intent_id: charge.payment_intent
            },
            stripe_id: charge.id
          });
          processedChargeIds.add(charge.id);
        }
      }

      // Process Stripe Invoices only if no corresponding successful charge exists
      for (const invoice of invoices) {
        // Skip if this invoice already has a successful charge processed
        const hasSuccessfulCharge = charges.some(charge => 
          charge.invoice === invoice.id && charge.status === 'succeeded'
        );
        
        if (!hasSuccessfulCharge && invoice.status === 'paid') {
          const client = invoice.customer ? this.mapClientToTransactionSync(
            typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id,
            clients
          ) : null;

          transactions.push({
            id: `invoice_${invoice.id}`,
            type: 'invoice',
            description: `Invoice #${invoice.number || invoice.id.slice(-6)}`,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: invoice.status,
            date: new Date(invoice.created * 1000),
            created_at: new Date(invoice.created * 1000),
            client: client,
            metadata: {
              invoice_number: invoice.number,
              subscription_id: invoice.subscription,
              amount_due: invoice.amount_due / 100,
              amount_paid: invoice.amount_paid / 100,
              hosted_invoice_url: invoice.hosted_invoice_url,
              invoice_pdf: invoice.invoice_pdf
            },
            stripe_id: invoice.id
          });
        }
      }

      // Skip payment intents - we process actual charges instead to avoid duplication

      // Process Stripe Subscriptions (show as recurring items, not revenue)
      for (const subscription of subscriptions) {
        const price = subscription.items.data[0]?.price;
        const client = subscription.customer ? this.mapClientToTransactionSync(
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
          clients
        ) : null;

        const amount = price ? (price.unit_amount / 100) : 0;
        const interval = price?.recurring?.interval || 'month';
        const intervalCount = price?.recurring?.interval_count || 1;
        
        // Create descriptive title
        let intervalText = `${intervalCount > 1 ? intervalCount + ' ' : ''}${interval}${intervalCount > 1 ? 's' : ''}`;
        
        transactions.push({
          id: `subscription_${subscription.id}`,
          type: 'subscription',
          description: `${intervalText.charAt(0).toUpperCase() + intervalText.slice(1)}ly Subscription - $${amount}/${intervalText}`,
          amount: 0, // Don't count as revenue - actual charges will be recorded separately
          currency: price?.currency || 'usd',
          status: subscription.status,
          date: new Date(subscription.created * 1000),
          created_at: new Date(subscription.created * 1000),
          client: client,
          metadata: {
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            plan_interval: interval,
            plan_interval_count: intervalCount,
            recurring_amount: amount,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            latest_invoice: subscription.latest_invoice
          },
          stripe_id: subscription.id
        });
      }

      // Charges already processed above to avoid duplication

      // Sort transactions by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));



      return transactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  // Get transaction summary statistics
  async getTransactionSummary() {
    try {
      const transactions = await this.getAllTransactions();
      
      const summary = {
        total_count: transactions.length,
        total_income: 0,
        total_expenses: 0,
        net_amount: 0,
        by_type: {},
        by_status: {},
        by_month: {},
        recent_transactions: transactions.slice(0, 5)
      };

      transactions.forEach(transaction => {
        // Calculate totals
        if (transaction.amount > 0) {
          summary.total_income += transaction.amount;
        } else {
          summary.total_expenses += Math.abs(transaction.amount);
        }
        summary.net_amount += transaction.amount;

        // Count by type
        summary.by_type[transaction.type] = (summary.by_type[transaction.type] || 0) + 1;

        // Count by status
        summary.by_status[transaction.status] = (summary.by_status[transaction.status] || 0) + 1;

        // Count by month
        const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
        if (!summary.by_month[monthKey]) {
          summary.by_month[monthKey] = { count: 0, income: 0, expenses: 0 };
        }
        summary.by_month[monthKey].count++;
        if (transaction.amount > 0) {
          summary.by_month[monthKey].income += transaction.amount;
        } else {
          summary.by_month[monthKey].expenses += Math.abs(transaction.amount);
        }
      });

      return summary;
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      throw error;
    }
  }

  // Assign client to transaction (kept for expense assignment)
  async assignClientToTransaction(transactionId, clientId) {
    try {
      if (transactionId.startsWith('expense_')) {
        // Update expense client assignment
        const expenseId = transactionId.replace('expense_', '');
        await expenseService.updateExpense(expenseId, { client_id: clientId });
        return true;
      }
      // Stripe transactions are automatically assigned based on customer IDs
      return false;
    } catch (error) {
      console.error('Error assigning client to transaction:', error);
      throw error;
    }
  }

  // Filter transactions
  filterTransactions(transactions, filters = {}) {
    let filtered = [...transactions];

    // Default to showing charges and expenses
    if (!filters.type || filters.type === 'default') {
      filtered = filtered.filter(t => t.type === 'charge' || t.type === 'expense');
    } else if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.client_id) {
      filtered = filtered.filter(t => t.client?.id === filters.client_id);
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filtered = filtered.filter(t => t.date >= fromDate);
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      filtered = filtered.filter(t => t.date <= toDate);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm) ||
        t.client?.business_name?.toLowerCase().includes(searchTerm) ||
        t.stripe_id?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }
}

export const transactionService = new TransactionService();