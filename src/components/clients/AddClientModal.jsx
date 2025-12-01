// FRESH START: Clean Add Client Modal
import React, { useState } from 'react';
import { clientService } from '../../services/clientService';

const AddClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    admin_email: '',
    owner_email: '',
    additional_emails: [],
    service_type: 'both',
    stripe_customer_id: '',
    stripe_payment_intent_ids: [],
    stripe_subscription_ids: [],
    stripe_environment: 'live',
    notes: ''
  });

  const [newEmail, setNewEmail] = useState('');
  const [newPaymentIntentId, setNewPaymentIntentId] = useState('');
  const [newSubscriptionId, setNewSubscriptionId] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addEmail = () => {
    if (newEmail && !formData.additional_emails.includes(newEmail)) {
      setFormData(prev => ({
        ...prev,
        additional_emails: [...prev.additional_emails, newEmail],
        additional_emails_count: prev.additional_emails.length + 1
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      additional_emails: prev.additional_emails.filter(email => email !== emailToRemove),
      additional_emails_count: prev.additional_emails.length - 1
    }));
  };

  const addPaymentIntentId = () => {
    if (newPaymentIntentId && !formData.stripe_payment_intent_ids.includes(newPaymentIntentId)) {
      setFormData(prev => ({
        ...prev,
        stripe_payment_intent_ids: [...prev.stripe_payment_intent_ids, newPaymentIntentId]
      }));
      setNewPaymentIntentId('');
    }
  };

  const removePaymentIntentId = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      stripe_payment_intent_ids: prev.stripe_payment_intent_ids.filter(id => id !== idToRemove)
    }));
  };

  const addSubscriptionId = () => {
    if (newSubscriptionId && !formData.stripe_subscription_ids.includes(newSubscriptionId)) {
      setFormData(prev => ({
        ...prev,
        stripe_subscription_ids: [...prev.stripe_subscription_ids, newSubscriptionId]
      }));
      setNewSubscriptionId('');
    }
  };

  const removeSubscriptionId = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      stripe_subscription_ids: prev.stripe_subscription_ids.filter(id => id !== idToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare form data
      const clientData = {
        ...formData,
        additional_emails_count: formData.additional_emails.length,
        stripe_payment_intent_ids: formData.stripe_payment_intent_ids || [],
        stripe_subscription_ids: formData.stripe_subscription_ids || []
      };

      const newClient = await clientService.createClient(clientData);
      onClientCreated(newClient);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create client');
      console.error('Error creating client:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Add New Client</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full address"
              />
            </div>

            {/* Email Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email (Optional)
                </label>
                <input
                  type="email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Email (Optional)
                </label>
                <input
                  type="email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="owner@company.com"
                />
              </div>
            </div>

            {/* Additional Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Emails
              </label>
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
              {formData.additional_emails.length > 0 && (
                <div className="space-y-1">
                  {formData.additional_emails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
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

            {/* Service Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="one_time">One-time</option>
                  <option value="subscription">Subscription</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stripe Environment
                </label>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stripe_environment: 'test' }))}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 ${
                      formData.stripe_environment === 'test'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stripe_environment: 'live' }))}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 ${
                      formData.stripe_environment === 'live'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Live
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes or special instructions for this client..."
              />
            </div>

            {/* Stripe Configuration */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900">Stripe Configuration</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Customer ID (Optional)
                </label>
                <input
                  type="text"
                  name="stripe_customer_id"
                  value={formData.stripe_customer_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="cus_..."
                />
              </div>

              {/* Payment Intent IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Intent IDs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPaymentIntentId}
                    onChange={(e) => setNewPaymentIntentId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pi_..."
                  />
                  <button
                    type="button"
                    onClick={addPaymentIntentId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.stripe_payment_intent_ids.length > 0 && (
                  <div className="space-y-1">
                    {formData.stripe_payment_intent_ids.map((id, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                        <span className="text-sm font-mono">{id}</span>
                        <button
                          type="button"
                          onClick={() => removePaymentIntentId(id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscription IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription IDs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubscriptionId}
                    onChange={(e) => setNewSubscriptionId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sub_..."
                  />
                  <button
                    type="button"
                    onClick={addSubscriptionId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.stripe_subscription_ids.length > 0 && (
                  <div className="space-y-1">
                    {formData.stripe_subscription_ids.map((id, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                        <span className="text-sm font-mono">{id}</span>
                        <button
                          type="button"
                          onClick={() => removeSubscriptionId(id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;