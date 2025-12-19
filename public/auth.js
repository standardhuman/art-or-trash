// Auth module - handles Supabase authentication
// TODO: Load these from a config endpoint in production
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
