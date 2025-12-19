// Auth module - handles Supabase authentication
const SUPABASE_URL = 'https://yahsswggpgreawugloxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHNzd2dncGdyZWF3dWdsb3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDQwOTIsImV4cCI6MjA2ODIyMDA5Mn0.pUSJTRDBk3MlZ2BmHvrM-0AvL0CunUkW8GDsRnG-Ubs';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state
let currentUser = null;

// Initialize auth - call on page load
async function initAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
    });
}

// Sign up with email
async function signUp(email, password, displayName) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName }
        }
    });
    if (error) throw error;
    return data;
}

// Sign in with email
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Sign out
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

// Get current user
function getUser() {
    return currentUser;
}

// Check if logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Update UI based on auth state (dispatches event for UI to handle)
function updateAuthUI() {
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { user: currentUser }
    }));
}
