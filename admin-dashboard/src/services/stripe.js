import { supabase } from './supabase'

class StripeService {
  constructor() {
    this.currentEnvironment = import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test'
  }

  // Get current Stripe environment
  getCurrentEnvironment() {
    return this.currentEnvironment
  }

  // Switch between test/live environments
  async setEnvironment(environment) {
    try {
      const { data, error } = await supabase.rpc('update_app_setting', {
        key_name: 'stripe_environment',
        new_value: environment
      })

      if (error) throw error

      this.currentEnvironment = environment
      return { success: true }
    } catch (error) {
      console.error('Error setting stripe environment:', error)
      return { success: false, error: error.message }
    }
  }

  // Get the appropriate public key for current environment
  getPublishableKey() {
    const testKey = import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY
    const liveKey = import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY

    return this.currentEnvironment === 'live' ? liveKey : testKey
  }

  // Get secret key (server-side only - for edge functions)
  async getSecretKey() {
    try {
      const { data, error } = await supabase.rpc('get_stripe_key', {
        env: this.currentEnvironment,
        key_type: 'secret'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting stripe secret key:', error)
      return null
    }
  }

  // Get webhook secret (server-side only)
  async getWebhookSecret() {
    try {
      const { data, error } = await supabase.rpc('get_stripe_key', {
        env: this.currentEnvironment,
        key_type: 'webhook_secret'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting webhook secret:', error)
      return null
    }
  }

  // Load current environment from database
  async loadEnvironment() {
    try {
      const { data, error } = await supabase.rpc('get_app_setting', {
        key_name: 'stripe_environment'
      })

      if (error) throw error
      
      this.currentEnvironment = data || 'test'
      return this.currentEnvironment
    } catch (error) {
      console.error('Error loading stripe environment:', error)
      return 'test' // fallback to test
    }
  }

  // Initialize Stripe (for client-side usage)
  async initializeStripe() {
    await this.loadEnvironment()
    
    // This would be used with @stripe/stripe-js
    const publishableKey = this.getPublishableKey()
    
    if (!publishableKey) {
      throw new Error(`Missing Stripe publishable key for ${this.currentEnvironment} environment`)
    }

    return publishableKey
  }
}

export const stripeService = new StripeService()