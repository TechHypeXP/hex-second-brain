-- =================================================================
-- Function to create a new user profile.
-- This function will be triggered after a new user signs up.
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This gives the function elevated privileges to write to user_profiles
AS $$
BEGIN
  -- Insert a new row into the public.user_profiles table
  -- The id and email are taken from the new user record in auth.users
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Supabase requires the function to return the NEW record
  RETURN new;
END;
$$;

-- =================================================================
-- Trigger to call the handle_new_user function.
-- This trigger fires automatically AFTER a new record is inserted
-- into the auth.users table.
-- =================================================================
-- First, drop the existing trigger if it exists, to allow for recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

