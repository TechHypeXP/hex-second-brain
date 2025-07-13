import React, { useState, useEffect } from 'react';

// Helper component for SVG icons. Using inline SVGs is a great practice 
// to avoid dependencies and ensure they load correctly.
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// Mail Icon
const MailIcon = () => <Icon path="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />;
const MailIcon2 = () => <Icon path="M21.75 6.75v10.5a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V6.75m19.5 0A3 3 0 0 0 19.5 4.5h-15a3 3 0 0 0-2.25 1.05m19.5 0v.243a3.75 3.75 0 0 1-1.07 2.477L12 18.75l-8.182-5.18a3.75 3.75 0 0 1-1.07-2.477V6.75" />;

// Lock Icon
const LockIcon = () => <Icon path="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" />;


// Main App Component
export default function App() {
  // State to toggle between Login and Sign Up forms
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotification(null);

    // Placeholder for your Supabase logic
    console.log(`${isLoginView ? 'Logging in' : 'Signing up'} with:`, { email, password });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Example logic
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
    } else {
        setNotification(`Success! ${isLoginView ? 'Logged you in.' : 'Account created.'}`);
        // Here you would call your Supabase functions
        // e.g., supabase.auth.signInWithPassword({ email, password })
    }

    setIsLoading(false);
  };

  // Effect to clear messages when switching views
  useEffect(() => {
    setError(null);
    setNotification(null);
  }, [isLoginView]);
  
  // Effect to clear notifications after a few seconds
  useEffect(() => {
    if (notification || error) {
      const timer = setTimeout(() => {
        setNotification(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, error]);

  return (
    // Main container with a subtle gradient background for that "Aero" feel
    <main className="bg-gray-50 font-sans w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tighter">Second Brain</h1>
            <p className="text-gray-500 mt-2">Your intelligent knowledge base.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            {isLoginView ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {isLoginView ? 'Sign in to continue to your brain.' : 'Get started by creating a new account.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <MailIcon2 />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockIcon />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            
            {/* Error and Notification Messages */}
            {error && (
              <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            {notification && (
              <div className="mt-4 text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {notification}
              </div>
            )}


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-6 py-3 px-4 text-white font-semibold rounded-md transition duration-300 ease-in-out
                ${isLoading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (isLoginView ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* View Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLoginView ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="ml-1 font-semibold text-blue-500 hover:text-blue-700 hover:underline focus:outline-none"
              >
                {isLoginView ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} Second Brain. All rights reserved.
        </p>
      </div>
    </main>
  );
}

