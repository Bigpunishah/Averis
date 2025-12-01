// FRESH START: Client Details Modal with Stripe Sync & Editing
import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/clientService';
import { transactionService } from '../../services/transactionService';
import { expenseService } from '../../services/expenseService';

const ClientDetailsModal = ({ client, isOpen, onClose, onClientUpdated, onClientDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(client);
  const [stripeIds, setStripeIds] = useState({
    customerId: client?.stripe_customer_id || '',
    paymentIntentIds: client?.stripe_payment_intent_ids || [],
    subscriptionIds: client?.stripe_subscription_ids || []
  });
  const [newPaymentIntentId, setNewPaymentIntentId] = useState('');
  const [newSubscriptionId, setNewSubscriptionId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [autoSyncCompleted, setAutoSyncCompleted] = useState(false);
  const [clientTransactions, setClientTransactions] = useState([]);
  const [clientExpenses, setClientExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  // Auto-sync when modal opens
  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
      
      if (!autoSyncCompleted) {
        const hasStripeData = client.stripe_customer_id || 
                            (client.stripe_payment_intent_ids && client.stripe_payment_intent_ids.length > 0) ||
                            (client.stripe_subscription_ids && client.stripe_subscription_ids.length > 0);
        
        if (hasStripeData) {
          console.log('🚀 Auto-syncing client with Stripe on modal open...');
          autoSyncWithStripe();
        }
      }
    }
  }, [isOpen, client]);

  // Reset auto-sync flag when modal closes or client changes
  useEffect(() => {
    if (!isOpen) {
      setAutoSyncCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (client) {
      setEditData(client);
      setStripeIds({
        customerId: client.stripe_customer_id || '',
        paymentIntentIds: client.stripe_payment_intent_ids || [],
        subscriptionIds: client.stripe_subscription_ids || []
      });
      setAutoSyncCompleted(false);
    }
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter editData to only include valid database columns
      const validClientFields = {
        business_name: editData.business_name,
        contact_name: editData.contact_name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        admin_email: editData.admin_email,
        owner_email: editData.owner_email,
        additional_emails: editData.additional_emails,
        additional_emails_count: editData.additional_emails_count,
        status: editData.status,
        payment_status: editData.payment_status,
        service_type: editData.service_type,
        stripe_customer_id: editData.stripe_customer_id,
        stripe_environment: editData.stripe_environment,
        notes: editData.notes ? (client.notes ? `${client.notes}\n\n[${new Date().toLocaleString()}]\n${editData.notes}` : `[${new Date().toLocaleString()}]\n${editData.notes}`) : client.notes
      };
      
      const updatedClient = await clientService.updateClient(client.id, validClientFields);
      onClientUpdated(updatedClient);
      // Reset notes field for next edit
      setEditData({ ...updatedClient, notes: '' });
      setIsEditing(false);
      setSuccess('Client updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setLoading(true);
      try {
        await clientService.deleteClient(client.id);
        onClientDeleted(client.id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete client');
        setLoading(false);
      }
    }
  };

  const addPaymentIntentId = async () => {
    if (newPaymentIntentId.trim()) {
      try {
        setLoading(true);
        const updatedClient = await clientService.addPaymentIntentId(client.id, newPaymentIntentId.trim());
        setStripeIds(prev => ({
          ...prev,
          paymentIntentIds: updatedClient.stripe_payment_intent_ids || []
        }));
        setNewPaymentIntentId('');
        onClientUpdated(updatedClient);
        setSuccess('Payment Intent ID added successfully');
      } catch (err) {
        setError(err.message || 'Failed to add Payment Intent ID');
      } finally {
        setLoading(false);
      }
    }
  };

  const removePaymentIntentId = async (intentId) => {
    try {
      setLoading(true);
      const updatedClient = await clientService.removePaymentIntentId(client.id, intentId);
      setStripeIds(prev => ({
        ...prev,
        paymentIntentIds: updatedClient.stripe_payment_intent_ids || []
      }));
      onClientUpdated(updatedClient);
      setSuccess('Payment Intent ID removed successfully');
    } catch (err) {
      setError(err.message || 'Failed to remove Payment Intent ID');
    } finally {
      setLoading(false);
    }
  };

  const addSubscriptionId = async () => {
    if (newSubscriptionId.trim()) {
      try {
        setLoading(true);
        const updatedClient = await clientService.addSubscriptionId(client.id, newSubscriptionId.trim());
        setStripeIds(prev => ({
          ...prev,
          subscriptionIds: updatedClient.stripe_subscription_ids || []
        }));
        setNewSubscriptionId('');
        onClientUpdated(updatedClient);
        setSuccess('Subscription ID added successfully');
      } catch (err) {
        setError(err.message || 'Failed to add Subscription ID');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeSubscriptionId = async (subscriptionId) => {
    try {
      setLoading(true);
      const updatedClient = await clientService.removeSubscriptionId(client.id, subscriptionId);
      setStripeIds(prev => ({
        ...prev,
        subscriptionIds: updatedClient.stripe_subscription_ids || []
      }));
      onClientUpdated(updatedClient);
      setSuccess('Subscription ID removed successfully');
    } catch (err) {
      setError(err.message || 'Failed to remove Subscription ID');
    } finally {
      setLoading(false);
    }
  };

  const syncWithStripe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const syncResult = await clientService.syncWithStripe(client.id, stripeIds);
      onClientUpdated(syncResult.client);
      
      // Check for errors and show detailed results
      if (syncResult.syncSummary.errors.hasErrors) {
        let errorMessage = `Sync completed with errors:\n`;
        
        if (syncResult.syncSummary.errors.customer) {
          errorMessage += `• Customer ID not found: ${syncResult.syncSummary.errors.customer.id}\n`;
        }
        
        if (syncResult.syncSummary.errors.paymentIntents.length > 0) {
          errorMessage += `• Payment Intent(s) not found: ${syncResult.syncSummary.errors.paymentIntents.map(e => e.id).join(', ')}\n`;
        }
        
        if (syncResult.syncSummary.errors.subscriptions.length > 0) {
          errorMessage += `• Subscription(s) not found: ${syncResult.syncSummary.errors.subscriptions.map(e => e.id).join(', ')}\n`;
        }
        
        errorMessage += `\nTotal paid from valid data: $${syncResult.client.total_paid}`;
        setError(errorMessage);
      } else {
        setSuccess(`Synced successfully! Total paid: $${syncResult.client.total_paid}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to sync with Stripe');
    } finally {
      setLoading(false);
    }
  };

  const autoSyncWithStripe = async () => {
    if (autoSyncCompleted) return;
    
    setAutoSyncCompleted(true);
    
    try {
      const syncResult = await clientService.syncWithStripe(client.id, stripeIds);
      onClientUpdated(syncResult.client);
      console.log('✅ Auto-sync completed:', syncResult.syncSummary);
      
      // Check for errors and show specific message
      if (syncResult.syncSummary.errors.hasErrors) {
        let errorDetails = [];
        if (syncResult.syncSummary.errors.customer) {
          errorDetails.push(`Customer ID: ${syncResult.syncSummary.errors.customer.id}`);
        }
        if (syncResult.syncSummary.errors.paymentIntents.length > 0) {
          errorDetails.push(`${syncResult.syncSummary.errors.paymentIntents.length} Payment Intent(s)`);
        }
        if (syncResult.syncSummary.errors.subscriptions.length > 0) {
          errorDetails.push(`${syncResult.syncSummary.errors.subscriptions.length} Subscription(s)`);
        }
        setError(`Auto-sync found errors: ${errorDetails.join(', ')} - Check details above`);
      } else {
        setSuccess(`Auto-synced: ${syncResult.syncSummary.totalPaid} from ${syncResult.syncSummary.succeededPayments} payments`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('❌ Auto-sync failed:', err.message);
      setError(err.message || 'Auto-sync failed');
    }
  };

  const addEmail = () => {
    if (newEmail && !editData.additional_emails.includes(newEmail)) {
      setEditData(prev => ({
        ...prev,
        additional_emails: [...prev.additional_emails, newEmail],
        additional_emails_count: prev.additional_emails.length + 1
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setEditData(prev => ({
      ...prev,
      additional_emails: prev.additional_emails.filter(email => email !== emailToRemove),
      additional_emails_count: prev.additional_emails.length - 1
    }));
  };

  const loadClientData = async () => {
    if (!client?.id) return;
    
    try {
      // Load transactions
      const allTransactions = await transactionService.getAllTransactions();
      const clientTransactions = allTransactions.filter(t => t.client?.id === client.id);
      setClientTransactions(clientTransactions);
      
      // Load expenses
      const clientExpenses = await expenseService.getExpensesByClient(client.id);
      setClientExpenses(clientExpenses);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-4 pb-4">
      <div className="relative mx-auto p-0 w-11/12 md:w-4/5 lg:w-4/5 xl:w-3/4 max-w-6xl bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {client.business_name}
                </h3>
                <p className="text-blue-100 text-sm">
                  {client.contact_name} • {client.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile: Show icons only, Desktop: Show text */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline text-sm">{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
              <button
                onClick={handleDeleteClient}
                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline text-sm">Delete</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Client Details
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions ({clientTransactions.length})
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Expenses ({clientExpenses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Client Information */}
            <div className="space-y-6">
              {/* Business Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input
                          type="text"
                          name="business_name"
                          value={editData.business_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                        <input
                          type="text"
                          name="contact_name"
                          value={editData.contact_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          name="address"
                          value={editData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-600">Contact:</span> {client.contact_name}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Email:</span> {client.email}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Phone:</span> {client.phone}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Address:</span> {client.address}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Email Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Email Management</h4>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                        <input
                          type="email"
                          name="admin_email"
                          value={editData.admin_email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                        <input
                          type="email"
                          name="owner_email"
                          value={editData.owner_email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Emails</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter additional email"
                          />
                          <button
                            type="button"
                            onClick={addEmail}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {editData.additional_emails?.length > 0 && (
                          <div className="space-y-1">
                            {editData.additional_emails.map((email, index) => (
                              <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                <span className="text-sm">{email}</span>
                                <button
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-600">Admin:</span> {client.admin_email}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Owner:</span> {client.owner_email}
                      </div>
                      {client.additional_emails?.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-600">Additional:</span>
                          <ul className="ml-4 mt-1">
                            {client.additional_emails.map((email, index) => (
                              <li key={index}>• {email}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Status & Service</h4>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={editData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          name="payment_status"
                          value={editData.payment_status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="current">Current</option>
                          <option value="past_due">Past Due</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <select
                          name="service_type"
                          value={editData.service_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="one_time">One-time</option>
                          <option value="subscription">Subscription</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-600">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {client.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${client.payment_status === 'current' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {client.payment_status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Service Type:</span> {client.service_type || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Total Paid:</span> ${(parseFloat(client.total_paid) || 0).toFixed(2)}
                      </div>
                    </>
                  )}
                </div>
              </div>


            </div>

            {/* Right Column - Stripe Integration */}
            <div className="space-y-6">
              
              {/* Stripe Sync Errors Section */}
              {client.sync_errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-red-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Stripe Sync Errors
                  </h4>
                  <div className="space-y-3">
                    {client.sync_errors.customer && (
                      <div className="bg-white rounded border border-red-300 p-3">
                        <div className="font-medium text-red-800 text-sm">Customer ID Error</div>
                        <div className="text-sm text-red-700 mt-1">ID: {client.sync_errors.customer.id}</div>
                        <div className="text-xs text-red-600 mt-1">{client.sync_errors.customer.error}</div>
                      </div>
                    )}
                    
                    {client.sync_errors.paymentIntents?.map((error, idx) => (
                      <div key={idx} className="bg-white rounded border border-red-300 p-3">
                        <div className="font-medium text-red-800 text-sm">Payment Intent Error</div>
                        <div className="text-sm text-red-700 mt-1 font-mono">{error.id}</div>
                        <div className="text-xs text-red-600 mt-1">{error.error}</div>
                      </div>
                    ))}
                    
                    {client.sync_errors.subscriptions?.map((error, idx) => (
                      <div key={idx} className="bg-white rounded border border-red-300 p-3">
                        <div className="font-medium text-red-800 text-sm">Subscription Error</div>
                        <div className="text-sm text-red-700 mt-1 font-mono">{error.id}</div>
                        <div className="text-xs text-red-600 mt-1">{error.error}</div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={syncWithStripe}
                    disabled={loading}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Retry Sync
                  </button>
                </div>
              )}
              {/* Stripe Customer ID */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Stripe Customer</h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                      <input
                        type="text"
                        name="stripe_customer_id"
                        value={editData.stripe_customer_id || ''}
                        onChange={handleInputChange}
                        placeholder="cus_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                      <select
                        name="stripe_environment"
                        value={editData.stripe_environment || 'test'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="test">Test</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Customer ID:</span> 
                      <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded border">
                        {client.stripe_customer_id || 'Not set'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Environment:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${client.stripe_environment === 'live' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {client.stripe_environment || 'test'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Intent IDs */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Payment Intent IDs</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPaymentIntentId}
                      onChange={(e) => setNewPaymentIntentId(e.target.value)}
                      placeholder="pi_..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                      onClick={addPaymentIntentId}
                      disabled={loading || !newPaymentIntentId.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {stripeIds.paymentIntentIds?.length > 0 ? (
                    <div className="space-y-2">
                      {stripeIds.paymentIntentIds.map((intentId, index) => (
                        <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border text-sm">
                          <span className="font-mono">{intentId}</span>
                          <button
                            onClick={() => removePaymentIntentId(intentId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No payment intent IDs added</p>
                  )}
                </div>
              </div>

              {/* Subscription IDs */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Subscription IDs</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubscriptionId}
                      onChange={(e) => setNewSubscriptionId(e.target.value)}
                      placeholder="sub_..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                      onClick={addSubscriptionId}
                      disabled={loading || !newSubscriptionId.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {stripeIds.subscriptionIds?.length > 0 ? (
                    <div className="space-y-2">
                      {stripeIds.subscriptionIds.map((subscriptionId, index) => (
                        <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border text-sm">
                          <span className="font-mono">{subscriptionId}</span>
                          <button
                            onClick={() => removeSubscriptionId(subscriptionId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subscription IDs added</p>
                  )}
                </div>
              </div>

              {/* Sync Button */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Stripe Sync</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sync with Stripe to update payment status and fetch latest transaction data. This will calculate totals from your payment intents and subscriptions.
                </p>
                <button
                  onClick={syncWithStripe}
                  disabled={loading || (!stripeIds.paymentIntentIds?.length && !stripeIds.subscriptionIds?.length && !stripeIds.customerId)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sync with Stripe</span>
                    </>
                  )}
                </button>
                {(!stripeIds.paymentIntentIds?.length && !stripeIds.subscriptionIds?.length && !stripeIds.customerId) && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Add Payment Intent IDs, Subscription IDs, or Customer ID to enable sync
                  </p>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Notes</h4>
                <span className="text-xs text-gray-500">
                  Last updated: {client.updated_at ? new Date(client.updated_at).toLocaleString() : 'Never'}
                </span>
              </div>
              {isEditing ? (
                <div>
                  {/* Show existing notes */}
                  {client.notes && client.notes.trim() && (
                    <div className="bg-gray-100 rounded border p-3 mb-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">Existing Notes:</div>
                      <div className="whitespace-pre-wrap text-sm text-gray-700">
                        {client.notes}
                      </div>
                    </div>
                  )}
                  
                  {/* Add new note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add New Note
                    </label>
                    <textarea
                      name="notes"
                      value={editData.notes || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new note (will be timestamped automatically)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      New note will be timestamped and added to existing notes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded border p-3">
                  {client.notes && client.notes.trim() ? (
                    <div className="whitespace-pre-wrap text-sm text-gray-700 space-y-2">
                      {client.notes}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No notes added yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {clientTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found for this client
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {transaction.date.toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {transaction.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'succeeded' || transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {clientExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expenses found for this client
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {expense.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {expense.category}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-red-600">
                            ${parseFloat(expense.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              expense.is_recurring
                                ? expense.is_paused 
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {expense.is_recurring 
                                ? expense.is_paused ? 'Paused' : 'Recurring'
                                : 'One-time'
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(client); // Reset to original data
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
