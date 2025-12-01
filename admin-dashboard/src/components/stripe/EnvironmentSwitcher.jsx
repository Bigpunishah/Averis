import { useState, useEffect } from 'react'
import { stripeService } from '../../services/stripe'

export const EnvironmentSwitcher = () => {
  const [currentEnv, setCurrentEnv] = useState('test')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCurrentEnvironment()
  }, [])

  const loadCurrentEnvironment = async () => {
    try {
      const env = await stripeService.loadEnvironment()
      setCurrentEnv(env)
    } catch (error) {
      console.error('Error loading environment:', error)
    }
  }

  const handleEnvironmentChange = async (newEnv) => {
    setIsLoading(true)
    try {
      const result = await stripeService.setEnvironment(newEnv)
      if (result.success) {
        setCurrentEnv(newEnv)
        // You might want to refresh the page or reload data here
        window.location.reload() // Simple approach to refresh all data
      } else {
        alert('Failed to switch environment: ' + result.error)
      }
    } catch (error) {
      console.error('Error switching environment:', error)
      alert('Error switching environment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-3">
      <span className="hidden sm:inline text-sm font-medium text-gray-700">Stripe Environment:</span>
      <span className="sm:hidden text-xs font-medium text-gray-700">Stripe:</span>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleEnvironmentChange('test')}
          disabled={isLoading}
          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            currentEnv === 'test'
              ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          {currentEnv === 'test' && '●'} Test
        </button>
        <button
          onClick={() => handleEnvironmentChange('live')}
          disabled={isLoading}
          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            currentEnv === 'live'
              ? 'bg-green-100 text-green-800 border-2 border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          {currentEnv === 'live' && '●'} Live
        </button>
      </div>
      {isLoading && (
        <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      )}
    </div>
  )
}