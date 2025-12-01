import { supabase } from './supabase'
import Stripe from 'stripe'

class StripeService {
  constructor() {
    this.currentEnvironment = import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test'
    this.stripeInstances = new Map()
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
      
      // Clear cached Stripe instances when environment changes
      this.stripeInstances.clear()
      
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

  // Get secret key from Supabase
  async getSecretKey(environment = null) {
    try {
      const env = environment || this.currentEnvironment
      const { data, error } = await supabase.rpc('get_stripe_key', {
        env: env,
        key_type_param: 'secret'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting stripe secret key:', error)
      throw error
    }
  }

  // Get webhook secret from Supabase
  async getWebhookSecret(environment = null) {
    try {
      const env = environment || this.currentEnvironment
      const { data, error } = await supabase.rpc('get_stripe_key', {
        env: env,
        key_type_param: 'webhook_secret'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting webhook secret:', error)
      throw error
    }
  }

  // Get Stripe instance for server-side operations
  async getStripeInstance(environment = null) {
    const env = environment || this.currentEnvironment
    const cacheKey = env
    
    if (this.stripeInstances.has(cacheKey)) {
      return this.stripeInstances.get(cacheKey)
    }

    try {
      const secretKey = await this.getSecretKey(env)
      
      if (!secretKey) {
        throw new Error(`No Stripe secret key found for ${env} environment`)
      }

      const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16'
      })

      this.stripeInstances.set(cacheKey, stripe)
      
      return stripe
    } catch (error) {
      console.error(`Error creating Stripe instance for ${env}:`, error)
      throw error
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

  // Real Stripe API Methods - No Mock Data

  // Create a customer
  async createCustomer(customerData, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const customer = await stripe.customers.create(customerData)
      
      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  }

  // Retrieve a customer
  async getCustomer(customerId, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const customer = await stripe.customers.retrieve(customerId)
      
      return customer
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error)
      throw error
    }
  }

  // Create a payment intent
  async createPaymentIntent(paymentData, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const paymentIntent = await stripe.paymentIntents.create(paymentData)
      
      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  // Retrieve a payment intent
  async getPaymentIntent(paymentIntentId, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges']
      })
      
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw error
    }
  }

  // Create a subscription
  async createSubscription(subscriptionData, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const subscription = await stripe.subscriptions.create(subscriptionData)
      
      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  // Retrieve a subscription
  async getSubscription(subscriptionId, environment = null) {
    try {
      const stripe = await this.getStripeInstance(environment)
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
      })
      
      return subscription
    } catch (error) {
      console.error('Error retrieving subscription:', error)
      throw error
    }
  }
}

export const stripeService = new StripeService()