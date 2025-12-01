import React, { useState, useEffect } from 'react';

const EditExpenseModal = ({ isOpen, onClose, onExpenseUpdated, expense, clients = [] }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    category: '',
    description: '',
    amount: '',
    expense_date: '',
    is_recurring: false,
    is_paused: false,
    recurring_frequency: 'monthly',
    total_occurrences: ''
  });

  const [showClientSelector, setShowClientSelector] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        client_id: expense.client_id || '',
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount || '',
        expense_date: expense.expense_date || '',
        is_recurring: expense.is_recurring || false,
        is_paused: expense.is_paused || false,
        recurring_frequency: expense.recurring_frequency || 'monthly',
        total_occurrences: expense.total_occurrences || ''
      });
    }
  }, [expense]);

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

    onExpenseUpdated(expense.id, expenseData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit Expense</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowClientSelector(!showClientSelector)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {selectedClient ? selectedClient.business_name : 'Select Client (Optional)'}
                  <svg className="absolute right-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showClientSelector && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, client_id: '' }));
                        setShowClientSelector(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
                    >
                      No Client
                    </button>
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, client_id: client.id }));
                          setShowClientSelector(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100"
                      >
                        {client.business_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter expense description..."
              />
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Recurring Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  name="is_recurring"
                  id="is_recurring_edit"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_recurring_edit" className="ml-2 block text-sm font-medium text-gray-700">
                  This is a recurring expense
                </label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      name="recurring_frequency"
                      value={formData.recurring_frequency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* Paused Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_paused"
                      id="is_paused_edit"
                      checked={formData.is_paused}
                      onChange={handleChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_paused_edit" className="ml-2 block text-sm font-medium text-gray-700">
                      Start as paused
                    </label>
                  </div>

                  {/* Total Occurrences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Occurrences (Optional)
                    </label>
                    <input
                      type="number"
                      name="total_occurrences"
                      value={formData.total_occurrences}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for unlimited occurrences
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Update Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;