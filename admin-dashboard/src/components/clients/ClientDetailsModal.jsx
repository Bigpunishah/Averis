// FRESH START: Client Details Modal with Stripe Sync & Editing
import React, { useState } from 'react';
import { clientService } from '../../services/clientService';

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
      const updatedClient = await clientService.updateClient(client.id, updatedEditData);
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
      setSuccess(`Synced successfully! Total paid: $${syncResult.client.total_paid}`);
    } catch (err) {
      setError(err.message || 'Failed to sync with Stripe');
    } finally {
      setLoading(false);
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

              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Stripe Integration */}
            <div className="space-y-6">
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
