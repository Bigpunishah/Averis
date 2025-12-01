// FRESH START: Clean Dashboard Component
import React, { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import { expenseService } from '../services/expenseService';
import { transactionService } from '../services/transactionService';
import { stripeService } from '../services/stripe';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';
import AddClientModal from '../components/clients/AddClientModal';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import EditExpenseModal from '../components/expenses/EditExpenseModal';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [transactionFilters, setTransactionFilters] = useState({ type: 'default', status: 'all' });
  const [activeTab, setActiveTab] = useState('clients');
  const [editingExpense, setEditingExpense] = useState(null);
  const [taxRate, setTaxRate] = useState(0.35); // Default 35%
  const [stripeEnvironment, setStripeEnvironment] = useState('test'); // test or live
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadClients();
    loadExpenses();
    loadTransactions();
    processRecurringExpenses();
    loadStripeEnvironment();
  }, []);

  // Auto-sync all clients with Stripe data on dashboard load
  useEffect(() => {
    if (clients.length > 0) {
      autoSyncClientsWithStripe();
    }
  }, [clients.length]);

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getAllExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
    }
  };

  const processRecurringExpenses = async () => {
    try {
      const processed = await expenseService.processRecurringExpenses();
      if (processed > 0) {

        // Reload expenses if any were processed
        loadExpenses();
      }
    } catch (err) {
      console.error('Error processing recurring expenses:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const [allTransactions, summary] = await Promise.all([
        transactionService.getAllTransactions(),
        transactionService.getTransactionSummary()
      ]);
      setTransactions(allTransactions);
      setTransactionSummary(summary);
      

    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    }
  };

  const autoSyncClientsWithStripe = async () => {

    
    try {
      const clientsWithStripeData = clients.filter(client => 
        client.stripe_customer_id || 
        (client.stripe_payment_intent_ids && client.stripe_payment_intent_ids.length > 0) ||
        (client.stripe_subscription_ids && client.stripe_subscription_ids.length > 0)
      );



      if (clientsWithStripeData.length === 0) {

        return;
      }

      // Limit to first 5 clients to avoid overwhelming the API
      const clientsToSync = clientsWithStripeData.slice(0, 5);
      
      for (const client of clientsToSync) {
        try {
          
          const stripeIds = {
            customerId: client.stripe_customer_id || '',
            paymentIntentIds: client.stripe_payment_intent_ids || [],
            subscriptionIds: client.stripe_subscription_ids || []
          };

          const syncResult = await clientService.syncWithStripe(client.id, stripeIds);
          
          // Update the client in state with error information
          const clientWithErrors = {
            ...syncResult.client,
            sync_errors: syncResult.syncSummary.errors.hasErrors ? syncResult.syncSummary.errors : null,
            last_sync_at: new Date().toISOString()
          };
          
          setClients(prev => prev.map(c => 
            c.id === client.id ? clientWithErrors : c
          ));

          if (syncResult.syncSummary.errors.hasErrors) {

          } else {

          }
          
          // Small delay between syncs
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (err) {
          console.error(`❌ Failed to auto-sync client ${client.business_name}:`, err);
        }
      }
      

      
    } catch (err) {
      console.error('❌ Auto-sync failed:', err);
    }
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStripeEnvironment = async () => {
    try {
      const environment = await stripeService.loadEnvironment();
      setStripeEnvironment(environment);

    } catch (err) {
      console.error('❌ Failed to load Stripe environment:', err);
      // Default to test if loading fails
      setStripeEnvironment('test');
    }
  };

  const updateStripeEnvironment = async (newEnvironment) => {
    try {

      const result = await stripeService.setEnvironment(newEnvironment);
      
      if (result.success) {
        setStripeEnvironment(newEnvironment);

        
        // Re-sync clients with new environment if they have Stripe data
        const clientsWithStripeData = clients.filter(client => 
          client.stripe_customer_id || 
          (client.stripe_payment_intent_ids && client.stripe_payment_intent_ids.length > 0) ||
          (client.stripe_subscription_ids && client.stripe_subscription_ids.length > 0)
        );
        
        if (clientsWithStripeData.length > 0) {

          // Trigger a re-sync after environment change
          setTimeout(() => {
            autoSyncClientsWithStripe();
          }, 1000);
        }
      } else {
        console.error('❌ Failed to update Stripe environment:', result.error);
        setError('Failed to update Stripe environment: ' + result.error);
      }
    } catch (err) {
      console.error('❌ Error updating Stripe environment:', err);
      setError('Error updating Stripe environment: ' + err.message);
    }
  };

  const handleClientCreated = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    setShowAddModal(false);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => 
      prev.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const handleClientDeleted = (deletedClientId) => {
    setClients(prev => prev.filter(client => client.id !== deletedClientId));
    setSelectedClient(null);
  };

  const handleExpenseCreated = async (expenseData) => {
    try {
      const newExpense = await expenseService.createExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      setShowAddExpenseModal(false);
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense');
    }
  };

  const handleExpenseDeleted = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  const handleExpensePaused = async (expenseId, isPaused) => {
    try {
      await expenseService.updateExpense(expenseId, { is_paused: isPaused });
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, is_paused: isPaused }
          : expense
      ));
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
    }
  };

  const handleExpenseUpdated = async (expenseId, updatedData) => {
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, updatedData);
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId 
          ? { ...updatedExpense, client_name: updatedExpense.clients?.business_name || null }
          : expense
      ));
      setEditingExpense(null);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
    }
  };

  const handleClientClick = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
    }
  };

  const handleAssignClientToTransaction = async (transactionId, clientId) => {
    try {
      await transactionService.assignClientToTransaction(transactionId, clientId);
      // Reload transactions to reflect the change
      await loadTransactions();
      // Reload expenses if it was an expense transaction
      if (transactionId.startsWith('expense_')) {
        await loadExpenses();
      }
    } catch (error) {
      console.error('Failed to assign client to transaction:', error);
      setError('Failed to assign client to transaction');
    }
  };

  const filteredClients = clients.filter(client => {
    // Filter by stripe environment
    const matchesEnvironment = client.stripe_environment === stripeEnvironment;
    
    // Filter by search term
    const matchesSearch = !searchTerm || 
      client.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesEnvironment && matchesSearch;
  });

  const filteredExpenses = expenses.filter(expense => {
    if (!expenseSearchTerm) return true;
    
    const searchLower = expenseSearchTerm.toLowerCase();
    return (
      expense.description?.toLowerCase().includes(searchLower) ||
      expense.client_name?.toLowerCase().includes(searchLower) ||
      expense.category?.toLowerCase().includes(searchLower)
    );
  });

  const filteredTransactions = transactionService.filterTransactions(transactions, {
    ...transactionFilters,
    search: transactionSearchTerm
  });

  // Calculate summary for filtered transactions only
  const filteredTransactionSummary = React.useMemo(() => {
    if (filteredTransactions.length === 0) {
      return {
        total_count: 0,
        total_income: 0,
        total_expenses: 0,
        net_amount: 0
      };
    }

    const summary = {
      total_count: filteredTransactions.length,
      total_income: 0,
      total_expenses: 0,
      net_amount: 0
    };

    filteredTransactions.forEach(transaction => {
      if (transaction.amount > 0) {
        summary.total_income += transaction.amount;
      } else {
        summary.total_expenses += Math.abs(transaction.amount);
      }
      summary.net_amount += transaction.amount;
    });

    return summary;
  }, [filteredTransactions]);

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-50 text-green-700 border-green-200',
      inactive: 'bg-slate-50 text-slate-600 border-slate-200',
      suspended: 'bg-red-50 text-red-700 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
        {status || 'unknown'}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusColors = {
      current: 'bg-green-50 text-green-700 border-green-200',
      past_due: 'bg-amber-50 text-amber-700 border-amber-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[paymentStatus] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
        {paymentStatus?.replace('_', ' ') || 'unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your clients and transactions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-slate-600 order-2 sm:order-1">
                {user?.email}
              </div>
              <div className="flex items-center space-x-3 order-1 sm:order-2">
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="sm:hidden">Expense</span>
                  <span className="hidden sm:inline">Add Expense</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="sm:hidden">Client</span>
                  <span className="hidden sm:inline">Add Client</span>
                </button>
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Tax Rate Adjuster */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                <label className="text-sm font-medium text-slate-700">Tax Rate</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={taxRate * 100}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100)}
                    className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-900 min-w-[3rem] bg-slate-100 px-2 py-1 rounded-md">{(taxRate * 100).toFixed(1)}%</span>
                </div>
                <button
                  onClick={() => setTaxRate(0.35)}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Reset to 35%
                </button>
              </div>
              
              {/* Stripe Environment Toggle */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-slate-700">Environment</label>
                <div className="inline-flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => updateStripeEnvironment('test')}
                    disabled={loading}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-all disabled:opacity-50 ${
                      stripeEnvironment === 'test'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Test Mode
                  </button>
                  <button
                    onClick={() => updateStripeEnvironment('live')}
                    disabled={loading}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-all disabled:opacity-50 ${
                      stripeEnvironment === 'live'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Live Mode
                  </button>
                </div>
                {stripeEnvironment === 'live' && (
                  <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-md">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    Production
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Financial Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${clients.filter(c => c.stripe_environment === stripeEnvironment).reduce((sum, client) => sum + (parseFloat(client.total_paid) || 0), 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stripeEnvironment} mode</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${expenses
                      .filter(e => e.is_recurring && e.recurring_frequency === 'monthly')
                      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
                      .toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">recurring monthly</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Yearly Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${(expenses
                      .filter(e => e.is_recurring && e.recurring_frequency === 'monthly')
                      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) * 12)
                      .toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">projected annual</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${(clients.filter(c => c.stripe_environment === stripeEnvironment).reduce((sum, client) => sum + (parseFloat(client.total_paid) || 0), 0) * (1 - taxRate)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">after {(taxRate * 100).toFixed(1)}% tax</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl mb-8">
            <div className="px-1 py-1">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'clients'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Clients
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                    {filteredClients.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'expenses'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Expenses
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                    {expenses.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'transactions'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Transactions
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                    {transactions.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Search Bar - Only for Clients */}
          {activeTab === 'clients' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients by name, email, or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}

        {/* Clients Table */}
        {activeTab === 'clients' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Clients
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {filteredClients.length}
                </span>
              </h2>
            </div>
          
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'No clients match your search.' : 'No clients found. Add your first client to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Integrations
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-semibold text-slate-900">
                                {client.business_name}
                              </div>
                              {client.sync_errors && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200" title="Stripe sync errors detected">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  Sync Issues
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">{client.email}</div>
                            {client.sync_errors && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {client.sync_errors.customer && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-red-50 text-red-700 rounded border" title={`Customer ID error: ${client.sync_errors.customer.id}`}>
                                    Customer
                                  </span>
                                )}
                                {client.sync_errors.paymentIntents?.map((error, idx) => (
                                  <span key={idx} className="inline-flex items-center px-1.5 py-0.5 text-xs bg-red-50 text-red-700 rounded border" title={`Payment Intent error: ${error.id}`}>
                                    PI-{error.id.slice(-4)}
                                  </span>
                                ))}
                                {client.sync_errors.subscriptions?.map((error, idx) => (
                                  <span key={idx} className="inline-flex items-center px-1.5 py-0.5 text-xs bg-red-50 text-red-700 rounded border" title={`Subscription error: ${error.id}`}>
                                    Sub-{error.id.slice(-4)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.contact_name}
                          </div>
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(client.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-semibold">
                          ${(parseFloat(client.total_paid) || 0).toFixed(2)}
                        </div>
                        {client.subscription_monthly_value && parseFloat(client.subscription_monthly_value) > 0 && (
                          <div className="text-xs text-purple-600 mt-1">
                            +${parseFloat(client.subscription_monthly_value).toFixed(2)}/mo recurring
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {client.stripe_customer_id && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Customer ID
                            </div>
                          )}
                          {client.stripe_payment_intent_ids?.length > 0 && (
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {client.stripe_payment_intent_ids.length} Payment{client.stripe_payment_intent_ids.length > 1 ? 's' : ''}
                            </div>
                          )}
                          {client.stripe_subscription_ids?.length > 0 && (
                            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {client.stripe_subscription_ids.length} Subscription{client.stripe_subscription_ids.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* Expenses Search Bar */}
        {activeTab === 'expenses' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search expenses by description, client, or category..."
                value={expenseSearchTerm}
                onChange={(e) => setExpenseSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Search and Filters */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search transactions by description or amount..."
                  value={transactionSearchTerm}
                  onChange={(e) => setTransactionSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={transactionFilters.type}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="default">Char/Expe</option>
                  <option value="all">All Types</option>
                  <option value="charge">Charges</option>
                  <option value="expense">Expenses</option>
                  <option value="invoice">Invoices</option>
                  <option value="subscription">Subscriptions</option>
                </select>
                
                <select
                  value={transactionFilters.status}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="recurring">Recurring</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            
            {/* Transaction Analytics */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-lg font-bold text-green-600">
                  ${filteredTransactionSummary.total_income.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="text-sm font-medium text-slate-600 mt-1">Total Income</div>
                <div className="text-xs text-slate-500 mt-1">
                  {transactionFilters.type !== 'all' && transactionFilters.type !== 'default' ? `${transactionFilters.type} only` : 'filtered view'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-lg font-bold text-red-600">
                  ${filteredTransactionSummary.total_expenses.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="text-sm font-medium text-slate-600 mt-1">Total Expenses</div>
                <div className="text-xs text-slate-500 mt-1">
                  {transactionFilters.type !== 'all' && transactionFilters.type !== 'default' ? `${transactionFilters.type} only` : 'filtered view'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className={`text-lg font-bold ${filteredTransactionSummary.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${filteredTransactionSummary.net_amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className="text-sm font-medium text-slate-600 mt-1">Net Amount</div>
                <div className="text-xs text-slate-500 mt-1">
                  income - expenses
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-lg font-bold text-blue-600">
                  {filteredTransactionSummary.total_count}
                </div>
                <div className="text-sm font-medium text-slate-600 mt-1">Transactions</div>
                <div className="text-xs text-slate-500 mt-1">
                  of {transactions.length} total
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        {activeTab === 'expenses' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Expenses
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {filteredExpenses.length} of {expenses.length}
                </span>
              </h2>
            </div>
            
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {expenses.length === 0 ? 'No expenses yet. Add your first expense to get started.' : 'No expenses match your search.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recurring
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${(parseFloat(expense.amount) || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.client_name ? (
                            <button 
                              onClick={() => handleClientClick(expense.client_id)}
                              className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                            >
                              {expense.client_name}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-500">No Client</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{expense.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.is_recurring ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {expense.recurring_frequency}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              One-time
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.is_recurring ? (
                            expense.is_paused ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Paused
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              One-time
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingExpense(expense)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Edit
                            </button>
                            {expense.is_recurring && (
                              <button
                                onClick={() => handleExpensePaused(expense.id, !expense.is_paused)}
                                className={`transition-colors ${
                                  expense.is_paused 
                                    ? 'text-green-600 hover:text-green-900' 
                                    : 'text-yellow-600 hover:text-yellow-900'
                                }`}
                              >
                                {expense.is_paused ? 'Resume' : 'Pause'}
                              </button>
                            )}
                            <button
                              onClick={() => handleExpenseDeleted(expense.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Transactions
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {filteredTransactions.length} of {transactions.length}
                </span>
              </h2>
            </div>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {transactions.length === 0 ? 'No transactions found. Loading...' : 'No transactions match your filters.'}
                </p>
                {transactions.length === 0 && (
                  <button
                    onClick={loadTransactions}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Reload Transactions
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date / Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Client
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Stripe ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {transaction.date.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 max-w-xs truncate">
                            {transaction.description}
                          </div>
                          {/* Show client on mobile */}
                          <div className="sm:hidden mt-1">
                            {transaction.client ? (
                              <div>
                                {transaction.client.multiple_matches ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-purple-600 font-medium">
                                      {transaction.client.client_count} matches
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      {transaction.client.business_name}
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleClientClick(transaction.client.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {transaction.client.business_name}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div>
                                {transaction.type === 'expense' ? (
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleAssignClientToTransaction(transaction.id, e.target.value);
                                      }
                                    }}
                                    className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mt-1"
                                    defaultValue=""
                                  >
                                    <option value="">Assign Client</option>
                                    {clients.map(client => (
                                      <option key={client.id} value={client.id}>
                                        {client.business_name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-xs text-gray-500">Auto-assigned</span>
                                )}
                              </div>
                            )}
                          </div>
                          {transaction.metadata?.category && (
                            <div className="text-xs text-gray-500">
                              Category: {transaction.metadata.category}
                            </div>
                          )}
                          {transaction.type === 'subscription' && (
                            <div className="mt-1 space-y-1">
                              {transaction.metadata?.recurring_amount && (
                                <div className="text-xs text-purple-600">
                                  ${transaction.metadata.recurring_amount}/{transaction.metadata.plan_interval}
                                </div>
                              )}
                              {transaction.metadata?.months_active && (
                                <div className="text-xs text-gray-500">
                                  Active for {transaction.metadata.months_active} month{transaction.metadata.months_active > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          {transaction.client ? (
                            <div>
                              {transaction.client.multiple_matches ? (
                                <div className="space-y-1">
                                  <div className="text-xs text-purple-600 font-medium">
                                    {transaction.client.client_count} matches:
                                  </div>
                                  <div className="text-sm text-blue-600 font-medium">
                                    {transaction.client.business_name}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleClientClick(transaction.client.id)}
                                  className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  {transaction.client.business_name}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {transaction.type === 'expense' ? (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignClientToTransaction(transaction.id, e.target.value);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                  defaultValue=""
                                >
                                  <option value="">Assign Client</option>
                                  {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                      {client.business_name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs text-gray-500">Auto-assigned</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className={`text-xs sm:text-sm font-medium ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {transaction.currency?.toUpperCase()}
                          </div>
                          {transaction.type === 'subscription' && transaction.metadata?.total_paid_to_date && (
                            <div className="text-xs text-gray-500">
                              Total to date
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            transaction.status === 'succeeded' || transaction.status === 'completed' || transaction.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : transaction.status === 'paused'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                          {transaction.stripe_id ? (
                            <div className="text-xs font-mono text-gray-600">
                              {transaction.stripe_id.slice(0, 12)}...
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onClientUpdated={handleClientUpdated}
          onClientDeleted={handleClientDeleted}
        />
      )}

      {showAddModal && (
        <AddClientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onClientCreated={handleClientCreated}
        />
      )}

      {showAddExpenseModal && (
        <AddExpenseModal
          isOpen={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          onExpenseCreated={handleExpenseCreated}
          clients={clients}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onExpenseUpdated={handleExpenseUpdated}
          expense={editingExpense}
          clients={clients}
        />
      )}
    </div>
    </div>
  );
};

export default Dashboard;