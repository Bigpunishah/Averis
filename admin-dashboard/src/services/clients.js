import { supabase } from './supabase'

export const clientsService = {
  // Get all clients with pagination
  async getClients({ 
    page = 1, 
    pageSize = 20, 
    search = '', 
    sortBy = 'created_at', 
    sortOrder = 'desc' 
  } = {}) {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,contact_name.ilike.%${search}%,domain_name.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    return {
      data,
      error,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    }
  },

  // Get single client by ID
  async getClient(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Create new client
  async createClient(clientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    return { data, error }
  },

  // Update client
  async updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Delete client
  async deleteClient(id) {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    return { data, error }
  },

  // Get revenue analytics
  async getRevenueAnalytics() {
    const { data, error } = await supabase
      .from('revenue_analytics')
      .select('*')
      .single()

    return { data, error }
  },

  // Update payment status
  async updatePaymentStatus(id, status, gracePeriod = null) {
    const updates = {
      payment_status: status,
      updated_at: new Date().toISOString()
    }

    if (gracePeriod && status === 'past_due') {
      updates.grace_period_start = new Date().toISOString().split('T')[0]
      updates.grace_period_end = new Date(Date.now() + gracePeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Update subscription status
  async updateSubscriptionStatus(id, status) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }
}