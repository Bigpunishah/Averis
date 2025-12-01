import { supabase } from './supabase';

class ExpenseService {
  async getAllExpenses() {
    try {
      const { data, error } = await supabase
        .from('client_expenses')
        .select(`
          *,
          clients!client_id (
            id,
            business_name,
            contact_name,
            email
          )
        `)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      // Map the data to flatten client information
      return (data || []).map(expense => ({
        ...expense,
        client_name: expense.clients?.business_name || null
      }));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      throw new Error('Failed to load expenses');
    }
  }

  async getExpensesByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from('client_expenses')
        .select('*')
        .eq('client_id', clientId)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching client expenses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch client expenses:', error);
      throw new Error('Failed to load client expenses');
    }
  }

  async createExpense(expenseData) {
    try {
      // Calculate next_due_date if recurring
      let nextDueDate = null;
      if (expenseData.is_recurring && expenseData.recurring_frequency) {
        const expenseDate = new Date(expenseData.expense_date);
        switch (expenseData.recurring_frequency) {
          case 'monthly':
            nextDueDate = new Date(expenseDate.setMonth(expenseDate.getMonth() + 1));
            break;
          case 'quarterly':
            nextDueDate = new Date(expenseDate.setMonth(expenseDate.getMonth() + 3));
            break;
          case 'yearly':
            nextDueDate = new Date(expenseDate.setFullYear(expenseDate.getFullYear() + 1));
            break;
        }
      }

      const { data, error } = await supabase
        .from('client_expenses')
        .insert([{
          ...expenseData,
          next_due_date: nextDueDate?.toISOString().split('T')[0] || null
        }])
        .select(`
          *,
          clients!client_id (
            id,
            business_name,
            contact_name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw new Error('Failed to create expense');
    }
  }

  async updateExpense(id, expenseData) {
    try {
      // Calculate next_due_date if recurring and not just pausing
      let nextDueDate = expenseData.next_due_date;
      if (expenseData.is_recurring && expenseData.recurring_frequency && !expenseData.hasOwnProperty('is_paused')) {
        const expenseDate = new Date(expenseData.expense_date);
        switch (expenseData.recurring_frequency) {
          case 'monthly':
            nextDueDate = new Date(expenseDate.setMonth(expenseDate.getMonth() + 1));
            break;
          case 'quarterly':
            nextDueDate = new Date(expenseDate.setMonth(expenseDate.getMonth() + 3));
            break;
          case 'yearly':
            nextDueDate = new Date(expenseDate.setFullYear(expenseDate.getFullYear() + 1));
            break;
        }
      }

      const { data, error } = await supabase
        .from('client_expenses')
        .update({
          ...expenseData,
          next_due_date: nextDueDate?.toISOString().split('T')[0] || null
        })
        .eq('id', id)
        .select(`
          *,
          clients!client_id (
            id,
            business_name,
            contact_name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw new Error('Failed to update expense');
    }
  }

  async deleteExpense(id) {
    try {
      const { error } = await supabase
        .from('client_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw new Error('Failed to delete expense');
    }
  }

  async processRecurringExpenses() {
    try {
      // Call the database function to process recurring expenses
      const { data, error } = await supabase.rpc('process_recurring_expenses');

      if (error) {
        console.error('Error processing recurring expenses:', error);
        throw error;
      }

      return data; // Returns number of expenses processed
    } catch (error) {
      console.error('Failed to process recurring expenses:', error);
      return 0;
    }
  }

  async getTotalExpensesByClient() {
    try {
      const expenses = await this.getAllExpenses();
      const clientTotals = {};
      
      expenses.forEach(expense => {
        const clientId = expense.client_id;
        if (!clientTotals[clientId]) {
          clientTotals[clientId] = {
            client: expense.clients,
            total: 0,
            count: 0
          };
        }
        clientTotals[clientId].total += parseFloat(expense.amount) || 0;
        clientTotals[clientId].count += 1;
      });

      return clientTotals;
    } catch (error) {
      console.error('Failed to get expense totals by client:', error);
      return {};
    }
  }
}

export const expenseService = new ExpenseService();