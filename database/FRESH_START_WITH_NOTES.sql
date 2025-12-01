-- FRESH START DATABASE SCHEMA WITH NOTES
-- Complete database schema for Averis Admin Dashboard including notes functionality

-- Drop existing table if needed (use with caution in production)
-- DROP TABLE IF EXISTS public.clients CASCADE;

-- Create updated clients table with notes column
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  business_name character varying(255) NOT NULL,
  contact_name character varying(255) NOT NULL,
  phone character varying(20) NOT NULL,
  email character varying(255) NOT NULL,
  address text NOT NULL,
  admin_email character varying(255) NOT NULL,
  owner_email character varying(255) NOT NULL,
  additional_emails jsonb NULL DEFAULT '[]'::jsonb,
  additional_emails_count integer NULL DEFAULT 0,
  stripe_customer_id character varying(255) NULL,
  stripe_subscription_ids jsonb NULL DEFAULT '[]'::jsonb,
  stripe_payment_intent_ids jsonb NULL DEFAULT '[]'::jsonb,
  stripe_environment character varying(10) NULL DEFAULT 'test'::character varying,
  status character varying(20) NULL DEFAULT 'active'::character varying,
  payment_status character varying(20) NULL DEFAULT 'current'::character varying,
  subscription_status character varying(20) NULL DEFAULT 'active'::character varying,
  service_type character varying(50) NULL,
  last_payment_date timestamp with time zone NULL,
  total_paid numeric(10, 2) NULL DEFAULT 0,
  notes text NULL,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_payment_status_check CHECK (
    (payment_status)::text = ANY (ARRAY[
      ('current'::character varying)::text,
      ('past_due'::character varying)::text,
      ('overdue'::character varying)::text,
      ('cancelled'::character varying)::text
    ])
  ),
  CONSTRAINT clients_service_type_check CHECK (
    (service_type)::text = ANY (ARRAY[
      ('one_time'::character varying)::text,
      ('subscription'::character varying)::text,
      ('both'::character varying)::text
    ])
  ),
  CONSTRAINT clients_status_check CHECK (
    (status)::text = ANY (ARRAY[
      ('active'::character varying)::text,
      ('inactive'::character varying)::text,
      ('suspended'::character varying)::text
    ])
  ),
  CONSTRAINT clients_stripe_environment_check CHECK (
    (stripe_environment)::text = ANY (ARRAY[
      ('test'::character varying)::text,
      ('live'::character varying)::text
    ])
  ),
  CONSTRAINT clients_subscription_status_check CHECK (
    (subscription_status)::text = ANY (ARRAY[
      ('active'::character varying)::text,
      ('past_due'::character varying)::text,
      ('canceled'::character varying)::text,
      ('unpaid'::character varying)::text,
      ('incomplete'::character varying)::text
    ])
  )
) TABLESPACE pg_default;

-- Add comments
COMMENT ON COLUMN public.clients.notes IS 'Client notes and special instructions with automatic timestamping';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON public.clients USING btree (stripe_customer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON public.clients USING btree (business_name) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_stripe_subscription_ids ON public.clients USING gin (stripe_subscription_ids) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_stripe_payment_intent_ids ON public.clients USING gin (stripe_payment_intent_ids) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clients_stripe_environment ON public.clients USING btree (stripe_environment) TABLESPACE pg_default;

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove in production)
INSERT INTO public.clients (
  business_name,
  contact_name,
  phone,
  email,
  address,
  admin_email,
  owner_email,
  service_type,
  stripe_environment,
  notes
) VALUES (
  'Sample Business LLC',
  'John Doe',
  '(555) 123-4567',
  'john@samplebusiness.com',
  '123 Main St, Anytown, ST 12345',
  'hello@averis.us',
  'owner@samplebusiness.com',
  'both',
  'test',
  'This is a sample client created during system setup. Payment intent ID: pi_3SZKbXFQVVHhUcWR0CclaqhK for $1000 payment.'
) ON CONFLICT DO NOTHING;

-- Verification queries
SELECT 'Database schema created successfully' AS status;
SELECT COUNT(*) as total_clients FROM public.clients;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;