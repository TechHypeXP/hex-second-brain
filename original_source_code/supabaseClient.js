import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl = 'https://npwcmywhkspeigvsputv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wd2NteXdoa3NwZWlndnNwdXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.sb_publishable_ws431IQqiWU1eQlRjACZjA_IYukyCkv';

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const auth = {
  // Sign up a new user
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in an existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out the current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get the current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const db = {
  // User profiles
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateUserProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Resources
  getResources: async (userId) => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createResource: async (resource) => {
    const { data, error } = await supabase
      .from('resources')
      .insert([resource])
      .select()
      .single();
    return { data, error };
  },

  // Spaces
  getSpaces: async (userId) => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createSpace: async (space) => {
    const { data, error } = await supabase
      .from('spaces')
      .insert([space])
      .select()
      .single();
    return { data, error };
  },

  // Search queries
  logSearchQuery: async (query) => {
    const { data, error } = await supabase
      .from('search_queries')
      .insert([query])
      .select()
      .single();
    return { data, error };
  }
};

