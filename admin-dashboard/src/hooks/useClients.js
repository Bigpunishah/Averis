import { useState, useEffect } from 'react'
import { clientsService } from '../services/clients'

export const useClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchClients = async (options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: options.page || pagination.page,
        pageSize: options.pageSize || pagination.pageSize,
        search: options.search !== undefined ? options.search : search,
        sortBy: options.sortBy || sortBy,
        sortOrder: options.sortOrder || sortOrder
      }

      const { data, error: fetchError, pagination: newPagination } = await clientsService.getClients(params)
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setClients(data || [])
        setPagination(newPagination)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData) => {
    setLoading(true)
    try {
      const { data, error: createError } = await clientsService.createClient(clientData)
      if (createError) {
        setError(createError.message)
        return { success: false, error: createError }
      }
      
      // Refresh the list
      await fetchClients()
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateClient = async (id, updates) => {
    setLoading(true)
    try {
      const { data, error: updateError } = await clientsService.updateClient(id, updates)
      if (updateError) {
        setError(updateError.message)
        return { success: false, error: updateError }
      }
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ))
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (id) => {
    setLoading(true)
    try {
      const { error: deleteError } = await clientsService.deleteClient(id)
      if (deleteError) {
        setError(deleteError.message)
        return { success: false, error: deleteError }
      }
      
      // Remove from local state
      setClients(prev => prev.filter(client => client.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (id, status, gracePeriod = 7) => {
    const result = await clientsService.updatePaymentStatus(id, status, gracePeriod)
    if (result.data) {
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...result.data } : client
      ))
    }
    return result
  }

  const updateSubscriptionStatus = async (id, status) => {
    const result = await clientsService.updateSubscriptionStatus(id, status)
    if (result.data) {
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...result.data } : client
      ))
    }
    return result
  }

  // Load initial data
  useEffect(() => {
    fetchClients()
  }, [])

  // Handle search changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients({ search, page: 1 })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  return {
    clients,
    loading,
    error,
    pagination,
    search,
    sortBy,
    sortOrder,
    setSearch,
    setSortBy,
    setSortOrder,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    updatePaymentStatus,
    updateSubscriptionStatus,
    goToPage: (page) => fetchClients({ page }),
    changePageSize: (pageSize) => fetchClients({ pageSize, page: 1 })
  }
}