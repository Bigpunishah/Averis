import React, { useState } from 'react';

const AddExpenseModal = ({ isOpen, onClose, onExpenseCreated, clients = [] }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    is_paused: false,
    recurring_frequency: 'monthly',
    total_occurrences: ''
  });

  const [showClientSelector, setShowClientSelector] = useState(false);

  const categories = [
    'Software',
    'Marketing',
    'Tools',
    'Office Supplies',
    'Professional Services',
    'Equipment',
    'Subscriptions',
    'Utilities',
    'Insurance',
    'Legal & Professional',
    'Training & Education',
    'Internet & Phone',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) return;

    const expenseData = {
      client_id: formData.client_id || null,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date,
      is_recurring: formData.is_recurring,
      is_paused: formData.is_recurring ? formData.is_paused : false,
      recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
      total_occurrences: formData.total_occurrences ? parseInt(formData.total_occurrences) : null
    };

    onExpenseCreated(expenseData);
    setFormData({
      client_id: '',
      category: '',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      is_paused: false,
      recurring_frequency: 'monthly',
      total_occurrences: ''
    });
    setShowClientSelector(false);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const selectedClient = clients.find(c => c.id === parseInt(formData.client_id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Client (Optional)
            </label>
            {!showClientSelector && !formData.client_id ? (
              <button
                type="button"
                onClick={() => setShowClientSelector(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Link to Client</span>
              </button>
            ) : showClientSelector ? (
              <div className="space-y-2">
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.business_name} - {client.contact_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientSelector(false);
                    setFormData(prev => ({ ...prev, client_id: '' }));
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel selection
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="font-medium text-blue-800">
                    {selectedClient?.business_name} - {selectedClient?.contact_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, client_id: '' }));
                    setShowClientSelector(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Monthly software subscription"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                name="is_recurring"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-gray-700">
                This is a recurring expense
              </label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-3 bg-blue-50 p-3 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="recurring_frequency"
                    value={formData.recurring_frequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Occurrences (leave blank for infinite)
                  </label>
                  <input
                    type="number"
                    name="total_occurrences"
                    value={formData.total_occurrences}
                    onChange={handleInputChange}
                    placeholder="e.g., 12 for 1 year of monthly charges"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;