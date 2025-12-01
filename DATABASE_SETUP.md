# Supabase Database Setup for Averis Admin Dashboard

## 🔐 Authentication Setup

**Supabase handles user authentication automatically** - you don't need to create a separate users table for login. The `auth.users` table is managed by Supabase Auth service.

### Add Admin User

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/projects
2. **Select your project**: `mioqdvfsiututqastfkt`
3. **Navigate to Authentication > Users**
4. **Click "Add User"**
   - Email: `your-admin-email@domain.com`
   - Password: `your-secure-password`
   - Email Confirm: ✅ (check this)

## 📊 Database Tables Setup

Execute these SQL commands in **Supabase Dashboard > SQL Editor**:

### 1. Create Clients Table

```sql
-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    
    -- Service Configuration
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('junk_removal', 'dumpster_rental', 'both')),
    service_frequency VARCHAR(50) CHECK (service_frequency IN ('one_time', 'weekly', 'bi_weekly', 'monthly', 'quarterly')),
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_per_item DECIMAL(10,2) DEFAULT 0,
    price_per_yard DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Email Management
    admin_email VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    additional_emails JSONB DEFAULT '[]'::jsonb,
    additional_emails_count INTEGER DEFAULT 0,
    
    -- Stripe Integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    payment_status VARCHAR(20) DEFAULT 'current' CHECK (payment_status IN ('current', 'past_due', 'overdue', 'cancelled'))
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON public.clients(business_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### 2. Create Revenue Analytics View

```sql
-- Create a view for dashboard analytics
CREATE OR REPLACE VIEW public.revenue_analytics AS
SELECT 
    COUNT(*) as total_clients,
    COUNT(*) FILTER (WHERE status = 'active') as active_clients,
    COUNT(*) FILTER (WHERE payment_status = 'current') as current_payments,
    COUNT(*) FILTER (WHERE payment_status = 'past_due') as past_due_payments,
    COUNT(*) FILTER (WHERE payment_status = 'overdue') as overdue_payments,
    COALESCE(SUM(base_price) FILTER (WHERE status = 'active'), 0) as total_monthly_revenue,
    COALESCE(AVG(base_price) FILTER (WHERE status = 'active'), 0) as average_client_value,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_this_month,
    COUNT(*) FILTER (WHERE service_type = 'junk_removal') as junk_removal_clients,
    COUNT(*) FILTER (WHERE service_type = 'dumpster_rental') as dumpster_rental_clients,
    COUNT(*) FILTER (WHERE service_type = 'both') as combined_service_clients
FROM public.clients;
```

### 3. Row Level Security (RLS)

```sql
-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert clients
CREATE POLICY "Authenticated users can insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update clients
CREATE POLICY "Authenticated users can update clients" ON public.clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete clients
CREATE POLICY "Authenticated users can delete clients" ON public.clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant access to the revenue analytics view
GRANT SELECT ON public.revenue_analytics TO authenticated;
```

### 4. Sample Data (Optional)

```sql
-- Insert sample client data for testing
INSERT INTO public.clients (
    business_name, contact_name, phone, email, address,
    service_type, service_frequency, base_price, price_per_item,
    admin_email, owner_email, additional_emails, status, payment_status
) VALUES 
(
    'ABC Construction', 'John Smith', '555-0123', 'john@abcconstruction.com',
    '123 Main St, Anytown, ST 12345',
    'junk_removal', 'weekly', 250.00, 15.00,
    'admin@averis.us', 'john@abcconstruction.com', '["manager@abcconstruction.com"]'::jsonb,
    'active', 'current'
),
(
    'XYZ Restaurant Group', 'Maria Garcia', '555-0456', 'maria@xyzrestaurants.com',
    '456 Oak Ave, Business City, ST 67890', 
    'dumpster_rental', 'monthly', 180.00, 0,
    'admin@averis.us', 'maria@xyzrestaurants.com', '[]'::jsonb,
    'active', 'current'
);
```

## 🔧 Verification Steps

1. **Check Tables Created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'clients';
   ```

2. **Verify Data**:
   ```sql
   SELECT * FROM public.clients;
   SELECT * FROM public.revenue_analytics;
   ```

3. **Test RLS**:
   - Try accessing data while logged in vs logged out
   - Should only work when authenticated

## 📋 Next Steps

After running these SQL commands:

1. ✅ **Add your admin user** via Supabase Dashboard > Authentication > Users
2. ✅ **Execute SQL setup** via Supabase Dashboard > SQL Editor  
3. ✅ **Test login** in your admin dashboard
4. ✅ **Verify data access** - dashboard should load with sample data
5. ✅ **Test Add Client** functionality

Your authentication will use:
- **Login**: `auth.users` table (managed by Supabase)
- **Data Access**: `public.clients` table (your business data)
- **Security**: Row Level Security policies ensure only authenticated users can access data