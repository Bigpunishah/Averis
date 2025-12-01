# 🔐 Stripe Secrets Management for Averis Admin Dashboard

## 🎯 **Security Principle**

**Frontend (.env)**: Only PUBLIC keys (safe to expose)  
**Backend (Supabase)**: SECRET keys (never exposed to client)

## 📍 **Where to Store Each Type**

### Frontend Environment Variables (.env)
```env
# ✅ SAFE - Public keys only
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
```

### Supabase Edge Functions (Server-side)
```env
# ❌ NEVER in frontend - Secret keys only
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🛠️ **Setup Steps**

### 1. Get Your Stripe Keys

**Go to Stripe Dashboard**: https://dashboard.stripe.com/apikeys

**Test Keys** (for development):
- **Publishable Key**: `pk_test_...` → Frontend (.env)
- **Secret Key**: `sk_test_...` → Supabase (server)

**Live Keys** (for production):
- **Publishable Key**: `pk_live_...` → Frontend (.env)  
- **Secret Key**: `sk_live_...` → Supabase (server)

### 2. Update Your .env File

Replace `pk_test_your_publishable_key_here` with your actual Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

### 3. Store Secret Keys in Supabase

**Option A: Supabase Edge Functions (Recommended)**

1. **Create Edge Function**:
   ```bash
   # In Supabase CLI
   supabase functions new stripe-webhook
   ```

2. **Set Environment Variables**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Use in Edge Function**:
   ```javascript
   // In your edge function
   const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
   ```

**Option B: Supabase Database (Alternative)**

```sql
-- Create secrets table (admin access only)
CREATE TABLE IF NOT EXISTS private.app_secrets (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Stripe secret
INSERT INTO private.app_secrets (key_name, key_value)
VALUES ('stripe_secret_key', 'sk_test_your_secret_key_here');

-- Secure access function
CREATE OR REPLACE FUNCTION get_app_secret(secret_name TEXT)
RETURNS TEXT AS $$
BEGIN
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
    
    RETURN (SELECT key_value FROM private.app_secrets WHERE key_name = secret_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 **Usage in Your App**

### Frontend (React Components)
```javascript
// ✅ Safe - using public key
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripe = loadStripe(stripePublicKey);
```

### Backend (Supabase Functions)
```javascript
// ✅ Secure - secret key on server only
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Create customer
const customer = await stripe.customers.create({
    email: clientEmail,
    name: businessName
});
```

## 🚀 **Next Steps for Stripe Integration**

1. **Update .env** with your Stripe publishable key
2. **Set up Supabase Edge Functions** for server-side operations
3. **Install Stripe SDK**: `npm install @stripe/stripe-js`
4. **Create Stripe service** in your React app
5. **Build payment flows** (customer creation, subscriptions, invoicing)

## 📋 **Security Checklist**

- [ ] ✅ Only `pk_*` keys in frontend .env
- [ ] ✅ `sk_*` keys stored server-side only
- [ ] ✅ Never commit secret keys to Git
- [ ] ✅ Use different keys for test/live environments
- [ ] ✅ Rotate keys regularly
- [ ] ✅ Webhook secrets secured server-side
- [ ] ✅ RLS policies protect secret access

This setup ensures your Stripe secrets are properly secured while allowing your admin dashboard to integrate with Stripe for automated billing!