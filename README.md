# Averis Admin Dashboard Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd admin-dashboard
npm install
```

### 2. Set Up Supabase Database

First, go to your Supabase project dashboard and run this SQL to create the clients table:

```sql
-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Business Information
  business_name TEXT NOT NULL,
  domain_name TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT NOT NULL,
  
  -- Service Type
  service_type TEXT CHECK (service_type IN ('one_time', 'sale_plus_subscription', 'subscription_only')) NOT NULL,
  project_type TEXT CHECK (project_type IN ('website', 'software', 'optimization')) NOT NULL,
  
  -- Pricing & Revenue
  one_time_amount DECIMAL(10,2) DEFAULT 0,
  subscription_amount DECIMAL(10,2) DEFAULT 100,
  additional_emails_count INTEGER DEFAULT 0,
  additional_email_cost DECIMAL(10,2) DEFAULT 15,
  
  -- Hosting & Domain
  hosting_enabled BOOLEAN DEFAULT false,
  domain_registered_by_us BOOLEAN DEFAULT false,
  domain_monthly_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Email Configuration
  admin_email TEXT,
  owner_email TEXT,
  additional_emails JSONB DEFAULT '[]',
  
  -- Stripe Integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Status Management
  payment_status TEXT CHECK (payment_status IN ('current', 'past_due', 'overdue', 'cancelled')) DEFAULT 'current',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'terminated')) DEFAULT 'active',
  
  -- Grace Period
  grace_period_start DATE,
  grace_period_end DATE,
  
  -- Notes
  notes TEXT
);

-- Create revenue analytics view
CREATE VIEW revenue_analytics AS
SELECT 
  COUNT(*) as total_clients,
  COALESCE(SUM(one_time_amount), 0) as total_one_time_revenue,
  COALESCE(SUM(CASE WHEN subscription_status = 'active' THEN subscription_amount + (additional_emails_count * additional_email_cost) ELSE 0 END), 0) as monthly_recurring_revenue,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_subscriptions,
  COALESCE(SUM(one_time_amount + (subscription_amount * 12)), 0) * 0.35 as estimated_tax_withholding
FROM clients;

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (you need to replace YOUR_USER_ID with your actual Supabase user ID)
CREATE POLICY "admin_access_policy" ON clients
FOR ALL TO authenticated
USING (auth.uid() = 'YOUR_USER_ID_HERE'::uuid);

-- Insert sample data for testing
INSERT INTO clients (
  business_name,
  contact_name,
  contact_email,
  service_type,
  project_type,
  one_time_amount,
  subscription_amount,
  hosting_enabled,
  admin_email,
  owner_email,
  domain_name
) VALUES 
(
  'Sample Business LLC',
  'John Smith',
  'john@samplebusiness.com',
  'sale_plus_subscription',
  'website',
  1000.00,
  100.00,
  true,
  'admin@samplebusiness.com',
  'owner@samplebusiness.com',
  'samplebusiness.com'
),
(
  'Tech Startup Inc',
  'Jane Doe',
  'jane@techstartup.io',
  'subscription_only',
  'software',
  0.00,
  150.00,
  true,
  'admin@techstartup.io',
  'owner@techstartup.io',
  'techstartup.io'
);
```

### 3. Create Your Admin User

In Supabase Dashboard:
1. Go to Authentication → Users
2. Click "Add User"
3. Enter your admin email and password
4. Copy your User ID
5. Update the RLS policy above with your actual User ID

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Dashboard
Open http://localhost:5173 and log in with your Supabase admin credentials.

## 🔧 Configuration

### Environment Variables
The `.env` file is already configured with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Building for Production
```bash
npm run build
```
This creates a `dist/` folder with static files ready for deployment.

## 🚀 Deployment to GitHub Pages

### Option 1: Manual Deployment
```bash
npm run build
# Upload the dist/ folder to your admin.averis.us repository
```

### Option 2: Automated Deployment (Recommended)
```bash
npm run deploy
```

## 🔐 Security Notes

1. **Row Level Security**: Only your authenticated admin user can access client data
2. **Environment Variables**: Never commit the `.env` file to version control
3. **Static Build**: The built application contains no server secrets

## 📱 Features Included

✅ **Authentication**: Secure login with Supabase Auth  
✅ **Client Management**: View, search, and paginate client list  
✅ **Revenue Analytics**: Real-time stats dashboard  
✅ **Client Details**: Detailed modal for each client  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Status Management**: Track payment and subscription status  

## 🔄 Next Steps

1. **Set up subdomain**: Configure DNS for admin.averis.us
2. **Add client management**: Forms to add/edit clients
3. **Stripe integration**: Connect billing and webhooks
4. **Email management**: Track email accounts
5. **Automated notifications**: Grace period alerts

## 🆘 Troubleshooting

### Login Issues
- Verify your Supabase user exists
- Check the RLS policy has your correct User ID
- Ensure environment variables are correct

### Data Not Loading
- Check Supabase connection in browser dev tools
- Verify the clients table was created successfully
- Test the revenue_analytics view

### Build Issues
```bash
rm -rf node_modules
npm install
npm run build
```