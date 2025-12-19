# Art or Not? Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Art or Not? from a "guess the source" game into a community-driven art tribunal with swipe-based voting, confidence predictions, user accounts, and gamification.

**Architecture:** Keep Express + Supabase backend, vanilla JS frontend. Add Supabase Auth for user accounts. Extend existing tables, add new ones for users/streaks/reports. Frontend gets complete visual overhaul with swipe gestures.

**Tech Stack:** Express, Supabase (database + auth), Vanilla JS, CSS3 animations, Hammer.js (swipe gestures)

---

## Phase 1: Database Schema Evolution

### Task 1.1: Add Users Table Migration

**Files:**
- Create: `supabase/migrations/002_add_users_and_auth.sql`

**Step 1: Write the migration SQL**

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Stats
    total_votes INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    -- Taste profile
    art_votes INTEGER DEFAULT 0,
    trash_votes INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Apply migration to Supabase**

Run: `supabase db push` or apply via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/002_add_users_and_auth.sql
git commit -m "feat(db): add users/profiles table with auth trigger"
```

---

### Task 1.2: Extend Votes Table for Confidence

**Files:**
- Create: `supabase/migrations/003_add_confidence_to_votes.sql`

**Step 1: Write the migration SQL**

```sql
-- Add confidence column to votes
ALTER TABLE votes ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'normal'
    CHECK (confidence IN ('normal', 'confident'));

-- Add user_id column (nullable for anonymous votes)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add index for user votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
```

**Step 2: Apply migration**

Run via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/003_add_confidence_to_votes.sql
git commit -m "feat(db): add confidence and user_id to votes table"
```

---

### Task 1.3: Extend Images Table for Submissions

**Files:**
- Create: `supabase/migrations/004_extend_images_for_submissions.sql`

**Step 1: Write the migration SQL**

```sql
-- Add submission-related columns to images
ALTER TABLE images ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE images ADD COLUMN IF NOT EXISTS submitter_prediction TEXT CHECK (submitter_prediction IN ('art', 'trash'));
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT false;
ALTER TABLE images ADD COLUMN IF NOT EXISTS graduation_date TIMESTAMPTZ;
ALTER TABLE images ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- Update existing images to be graduated (seeded content)
UPDATE images SET is_graduated = true, graduation_date = created_at WHERE is_graduated IS NULL OR is_graduated = false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_submitter ON images(submitter_id);
CREATE INDEX IF NOT EXISTS idx_images_graduated ON images(is_graduated);
CREATE INDEX IF NOT EXISTS idx_images_flagged ON images(is_flagged);
```

**Step 2: Apply migration**

Run via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/004_extend_images_for_submissions.sql
git commit -m "feat(db): extend images table for submission system"
```

---

### Task 1.4: Add Reports Table

**Files:**
- Create: `supabase/migrations/005_add_reports_table.sql`

**Step 1: Write the migration SQL**

```sql
-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'copyright', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can report images" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_reports_image ON reports(image_id);
CREATE INDEX IF NOT EXISTS idx_reports_resolved ON reports(resolved);
```

**Step 2: Apply migration**

Run via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/005_add_reports_table.sql
git commit -m "feat(db): add reports table for content moderation"
```

---

### Task 1.5: Add Weekly Leaderboard Table

**Files:**
- Create: `supabase/migrations/006_add_leaderboard.sql`

**Step 1: Write the migration SQL**

```sql
-- Create leaderboard snapshots table
CREATE TABLE IF NOT EXISTS leaderboard_weeks (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_start)
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    week_id INTEGER REFERENCES leaderboard_weeks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score NUMERIC(10, 4) NOT NULL, -- accuracy * sqrt(volume)
    votes_cast INTEGER NOT NULL,
    correct_predictions INTEGER NOT NULL,
    accuracy NUMERIC(5, 4) NOT NULL,
    UNIQUE(week_id, user_id)
);

-- Enable RLS
ALTER TABLE leaderboard_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Leaderboards are public" ON leaderboard_weeks FOR SELECT USING (true);
CREATE POLICY "Leaderboard entries are public" ON leaderboard_entries FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_week ON leaderboard_entries(week_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(week_id, rank);
```

**Step 2: Apply migration**

Run via Supabase Dashboard SQL Editor

**Step 3: Commit**

```bash
git add supabase/migrations/006_add_leaderboard.sql
git commit -m "feat(db): add weekly leaderboard tables"
```

---

## Phase 2: Authentication

### Task 2.1: Install Supabase Auth Dependencies

**Files:**
- Modify: `public/index.html`

**Step 1: Add Supabase JS client to HTML**

Add to `<head>` of `public/index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

**Step 2: Verify script loads**

Open browser dev tools, confirm `supabase` global is available

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat(auth): add Supabase JS client"
```

---

### Task 2.2: Create Auth Module

**Files:**
- Create: `public/auth.js`

**Step 1: Write auth module**

```javascript
// Auth module - handles Supabase authentication
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Will be replaced with env
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Will be replaced with env

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

// Update UI based on auth state (placeholder - will be implemented in UI tasks)
function updateAuthUI() {
    // Will dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { user: currentUser }
    }));
}
```

**Step 2: Verify module syntax**

Open in browser, check for JS errors

**Step 3: Commit**

```bash
git add public/auth.js
git commit -m "feat(auth): create auth module with Supabase integration"
```

---

### Task 2.3: Create Auth UI Modal

**Files:**
- Create: `public/auth-modal.html` (template to be included)
- Modify: `public/style.css`

**Step 1: Write modal HTML template**

Create `public/components/auth-modal.html`:

```html
<div id="auth-modal" class="modal hidden">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
        <button class="modal-close">&times;</button>

        <div id="auth-signin" class="auth-form">
            <h2>Sign In</h2>
            <form id="signin-form">
                <div class="form-group">
                    <label for="signin-email">Email</label>
                    <input type="email" id="signin-email" required>
                </div>
                <div class="form-group">
                    <label for="signin-password">Password</label>
                    <input type="password" id="signin-password" required>
                </div>
                <button type="submit" class="btn-primary">Sign In</button>
            </form>
            <p class="auth-switch">Don't have an account? <a href="#" id="show-signup">Sign up</a></p>
        </div>

        <div id="auth-signup" class="auth-form hidden">
            <h2>Create Account</h2>
            <form id="signup-form">
                <div class="form-group">
                    <label for="signup-name">Display Name</label>
                    <input type="text" id="signup-name" required>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email</label>
                    <input type="email" id="signup-email" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" required minlength="6">
                </div>
                <button type="submit" class="btn-primary">Create Account</button>
            </form>
            <p class="auth-switch">Already have an account? <a href="#" id="show-signin">Sign in</a></p>
        </div>

        <div id="auth-error" class="auth-error hidden"></div>
    </div>
</div>
```

**Step 2: Add modal styles to style.css**

Append to `public/style.css`:

```css
/* Auth Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal.hidden {
    display: none;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background: white;
    padding: 40px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
}

.modal-close:hover {
    color: #333;
}

.auth-form h2 {
    margin-bottom: 24px;
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 400;
}

.auth-form .form-group {
    margin-bottom: 16px;
}

.auth-form label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    color: #666;
}

.auth-form input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

.auth-form input:focus {
    outline: none;
    border-color: #333;
}

.btn-primary {
    width: 100%;
    padding: 14px;
    background: #333;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 8px;
}

.btn-primary:hover {
    background: #555;
}

.auth-switch {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}

.auth-switch a {
    color: #333;
    font-weight: 500;
}

.auth-error {
    background: #fee;
    color: #c00;
    padding: 12px;
    border-radius: 6px;
    margin-top: 16px;
    font-size: 14px;
}

.auth-error.hidden {
    display: none;
}
```

**Step 3: Commit**

```bash
git add public/components/auth-modal.html public/style.css
git commit -m "feat(auth): add auth modal UI and styles"
```

---

### Task 2.4: Wire Up Auth Modal

**Files:**
- Create: `public/auth-ui.js`

**Step 1: Write auth UI controller**

```javascript
// Auth UI Controller
function initAuthUI() {
    // Insert modal HTML into page
    const modalHTML = `
        <div id="auth-modal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>

                <div id="auth-signin" class="auth-form">
                    <h2>Sign In</h2>
                    <form id="signin-form">
                        <div class="form-group">
                            <label for="signin-email">Email</label>
                            <input type="email" id="signin-email" required>
                        </div>
                        <div class="form-group">
                            <label for="signin-password">Password</label>
                            <input type="password" id="signin-password" required>
                        </div>
                        <button type="submit" class="btn-primary">Sign In</button>
                    </form>
                    <p class="auth-switch">Don't have an account? <a href="#" id="show-signup">Sign up</a></p>
                </div>

                <div id="auth-signup" class="auth-form hidden">
                    <h2>Create Account</h2>
                    <form id="signup-form">
                        <div class="form-group">
                            <label for="signup-name">Display Name</label>
                            <input type="text" id="signup-name" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password</label>
                            <input type="password" id="signup-password" required minlength="6">
                        </div>
                        <button type="submit" class="btn-primary">Create Account</button>
                    </form>
                    <p class="auth-switch">Already have an account? <a href="#" id="show-signin">Sign in</a></p>
                </div>

                <div id="auth-error" class="auth-error hidden"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get elements
    const modal = document.getElementById('auth-modal');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinView = document.getElementById('auth-signin');
    const signupView = document.getElementById('auth-signup');
    const errorDiv = document.getElementById('auth-error');

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Switch between signin/signup
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        signinView.classList.add('hidden');
        signupView.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    });

    document.getElementById('show-signin').addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        signinView.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    });

    // Sign in form
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');

        try {
            await signIn(
                document.getElementById('signin-email').value,
                document.getElementById('signin-password').value
            );
            modal.classList.add('hidden');
            signinForm.reset();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });

    // Sign up form
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');

        try {
            await signUp(
                document.getElementById('signup-email').value,
                document.getElementById('signup-password').value,
                document.getElementById('signup-name').value
            );
            modal.classList.add('hidden');
            signupForm.reset();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Show auth modal
function showAuthModal(mode = 'signin') {
    const modal = document.getElementById('auth-modal');
    const signinView = document.getElementById('auth-signin');
    const signupView = document.getElementById('auth-signup');

    if (mode === 'signup') {
        signinView.classList.add('hidden');
        signupView.classList.remove('hidden');
    } else {
        signupView.classList.add('hidden');
        signinView.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
}
```

**Step 2: Verify modal opens/closes**

Test by calling `showAuthModal()` in browser console

**Step 3: Commit**

```bash
git add public/auth-ui.js
git commit -m "feat(auth): wire up auth modal with form handling"
```

---

## Phase 3: Core Voting Redesign

### Task 3.1: Add Hammer.js for Swipe Gestures

**Files:**
- Modify: `public/index.html`

**Step 1: Add Hammer.js CDN**

Add to `<head>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
```

**Step 2: Verify library loads**

Check `Hammer` is defined in browser console

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat(ui): add Hammer.js for swipe gestures"
```

---

### Task 3.2: Create Verdict Copy Module

**Files:**
- Create: `public/verdicts.js`

**Step 1: Write verdict copy generator**

```javascript
// Verdict copy system - tone escalates with conviction
const VERDICTS = {
    // Deadlocked (45-55%)
    deadlocked: {
        art: [
            "The tribunal remains divided on this one.",
            "Humanity cannot reach consensus.",
            "A hung jury. Art status: unresolved.",
            "The people are split. Art? Maybe. Maybe not.",
            "Democracy has spoken: it's complicated."
        ],
        trash: [
            "The tribunal remains divided on this one.",
            "Humanity cannot reach consensus.",
            "A hung jury. Trash status: debatable.",
            "The people are split. Garbage? The jury's out.",
            "Democracy shrugs."
        ]
    },
    // Leaning (56-70%)
    leaning: {
        art: [
            "A modest majority has ruled: art.",
            "More art than not, according to the people.",
            "The crowd tilts toward art, but doubters remain.",
            "Tentatively artistic, says the tribunal.",
            "Art-ish. The people have sort of spoken."
        ],
        trash: [
            "A modest majority has ruled: not art.",
            "More trash than treasure, says the crowd.",
            "The people lean toward garbage, but some see beauty.",
            "Tentatively trashy, says the tribunal.",
            "Garbage-adjacent. The people are lukewarm."
        ]
    },
    // Clear (71-85%)
    clear: {
        art: [
            "The verdict is in: definitively art.",
            "A confident majority recognizes artistic merit.",
            "Three quarters of humanity embraces this as art.",
            "The tribunal has ruled with conviction: art.",
            "Clear artistic merit, according to the crowd."
        ],
        trash: [
            "The verdict is in: definitively not art.",
            "A confident majority rejects this as art.",
            "Three quarters of humanity votes: garbage.",
            "The tribunal has ruled with conviction: trash.",
            "Clearly not art, says the crowd."
        ]
    },
    // Landslide (86-95%)
    landslide: {
        art: [
            "The people have spoken with conviction: art.",
            "Near-universal acclaim. This is art.",
            "An overwhelming consensus embraces this as art.",
            "The tribunal speaks with one voice: definitely art.",
            "Humanity has little doubt: this is the real deal."
        ],
        trash: [
            "The people have spoken with conviction: garbage.",
            "Near-universal rejection. Not art.",
            "An overwhelming consensus: this is trash.",
            "The tribunal speaks with one voice: definitely not art.",
            "Humanity has little doubt: this belongs in a bin."
        ]
    },
    // Unanimous (96%+)
    unanimous: {
        art: [
            "Humanity has spoken with devastating clarity: this is art.",
            "A rare moment of unity. Art, beyond dispute.",
            "In a world divided on everything, we agree: masterpiece.",
            "The tribunal is unanimous. Frame it.",
            "Consensus achieved. Humanity recognizes art when it sees it."
        ],
        trash: [
            "Humanity has spoken with devastating clarity: this is garbage.",
            "A rare moment of unity. Trash, beyond dispute.",
            "In a world divided on everything, we agree: rubbish.",
            "The tribunal is unanimous. Dispose of it responsibly.",
            "Consensus achieved. Humanity knows trash when it sees it."
        ]
    }
};

// Get verdict tier based on percentage
function getVerdictTier(percentage) {
    if (percentage >= 96) return 'unanimous';
    if (percentage >= 86) return 'landslide';
    if (percentage >= 71) return 'clear';
    if (percentage >= 56) return 'leaning';
    return 'deadlocked';
}

// Generate verdict copy
function generateVerdict(artPercent, trashPercent) {
    const total = artPercent + trashPercent;
    if (total === 0) return { text: "No votes yet. You're the first.", tier: 'none' };

    const winningPercent = Math.max(artPercent, trashPercent);
    const winner = artPercent > trashPercent ? 'art' : 'trash';
    const tier = getVerdictTier(winningPercent);

    const options = VERDICTS[tier][winner];
    const text = options[Math.floor(Math.random() * options.length)];

    return { text, tier, winner, percentage: winningPercent };
}
```

**Step 2: Test verdict generation**

```javascript
// In browser console:
console.log(generateVerdict(73, 27)); // Should return 'clear' tier
console.log(generateVerdict(51, 49)); // Should return 'deadlocked' tier
console.log(generateVerdict(97, 3));  // Should return 'unanimous' tier
```

**Step 3: Commit**

```bash
git add public/verdicts.js
git commit -m "feat(verdicts): create tone-matched verdict copy system"
```

---

### Task 3.3: Create Swipe Handler Module

**Files:**
- Create: `public/swipe.js`

**Step 1: Write swipe handler**

```javascript
// Swipe handler using Hammer.js
let swipeHandler = null;
let onVoteCallback = null;

function initSwipe(element, onVote) {
    onVoteCallback = onVote;

    // Create Hammer instance
    swipeHandler = new Hammer(element);

    // Enable all directions
    swipeHandler.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    // Handle swipes
    swipeHandler.on('swipeleft swiperight swipeup swipedown', (e) => {
        const vote = getVoteFromSwipe(e.type);
        if (vote && onVoteCallback) {
            animateSwipe(element, e.type);
            onVoteCallback(vote.type, vote.confidence);
        }
    });

    // Visual feedback during pan
    swipeHandler.on('pan', (e) => {
        const x = e.deltaX;
        const y = e.deltaY;
        const rotation = x * 0.05;

        element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        element.style.transition = 'none';

        // Show directional hint
        updateSwipeHint(x, y);
    });

    swipeHandler.on('panend', (e) => {
        // If not a full swipe, reset position
        if (Math.abs(e.deltaX) < 80 && Math.abs(e.deltaY) < 80) {
            element.style.transform = '';
            element.style.transition = 'transform 0.3s ease';
            hideSwipeHint();
        }
    });
}

function getVoteFromSwipe(swipeType) {
    switch (swipeType) {
        case 'swiperight': return { type: 'art', confidence: 'normal' };
        case 'swipeleft': return { type: 'trash', confidence: 'normal' };
        case 'swipeup': return { type: 'art', confidence: 'confident' };
        case 'swipedown': return { type: 'trash', confidence: 'confident' };
        default: return null;
    }
}

function animateSwipe(element, swipeType) {
    const animations = {
        swiperight: { x: 500, rotate: 20, opacity: 0 },
        swipeleft: { x: -500, rotate: -20, opacity: 0 },
        swipeup: { y: -500, scale: 1.1, opacity: 0 },
        swipedown: { y: 500, scale: 0.9, opacity: 0 }
    };

    const anim = animations[swipeType];
    element.style.transition = 'all 0.4s ease-out';
    element.style.transform = `translate(${anim.x || 0}px, ${anim.y || 0}px) rotate(${anim.rotate || 0}deg) scale(${anim.scale || 1})`;
    element.style.opacity = '0';
}

function resetSwipeElement(element) {
    element.style.transition = 'none';
    element.style.transform = '';
    element.style.opacity = '1';
}

function updateSwipeHint(x, y) {
    // Will update UI hint based on direction
    const hint = document.getElementById('swipe-hint');
    if (!hint) return;

    if (Math.abs(x) > Math.abs(y)) {
        hint.textContent = x > 0 ? 'Art →' : '← Trash';
        hint.className = 'swipe-hint ' + (x > 0 ? 'art' : 'trash');
    } else {
        hint.textContent = y < 0 ? '↑ Confident Art' : '↓ Confident Trash';
        hint.className = 'swipe-hint ' + (y < 0 ? 'confident-art' : 'confident-trash');
    }
    hint.classList.remove('hidden');
}

function hideSwipeHint() {
    const hint = document.getElementById('swipe-hint');
    if (hint) hint.classList.add('hidden');
}

function destroySwipe() {
    if (swipeHandler) {
        swipeHandler.destroy();
        swipeHandler = null;
    }
}
```

**Step 2: Test swipe detection**

Manually test on image container in browser

**Step 3: Commit**

```bash
git add public/swipe.js
git commit -m "feat(ui): create swipe gesture handler with directional voting"
```

---

### Task 3.4: Update Vote API for Confidence

**Files:**
- Modify: `server-hybrid.js`

**Step 1: Update /api/vote endpoint**

Find the existing `/api/vote` endpoint and replace with:

```javascript
app.post('/api/vote', async (req, res) => {
  try {
    const { imageId, vote, confidence = 'normal', userId = null } = req.body;

    const image = await db.getImage(imageId);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Insert vote with confidence
    await db.insertVote(imageId, vote, confidence, userId);

    // Update image vote counts
    await db.incrementImageVotes(imageId, vote);

    // Get voting statistics for this image
    const voteStats = await db.getImageVoteStats(imageId);

    // Calculate prediction accuracy if user made confident vote
    let predictionResult = null;
    if (confidence === 'confident') {
        const artPercent = voteStats.total > 0 ? (voteStats.art / voteStats.total) * 100 : 50;
        const isLandslide = Math.max(artPercent, 100 - artPercent) >= 71;
        predictionResult = isLandslide ? 'correct' : 'incorrect';
    }

    res.json({
      success: true,
      voteStats: voteStats,
      predictionResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Step 2: Update db adapter insertVote**

Update the SQLite and Supabase `insertVote` functions to accept confidence and userId parameters.

**Step 3: Commit**

```bash
git add server-hybrid.js
git commit -m "feat(api): update vote endpoint for confidence tracking"
```

---

## Phase 4: Visual Redesign

### Task 4.1: Add Google Fonts

**Files:**
- Modify: `public/index.html`

**Step 1: Add font imports**

Add to `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
```

**Step 2: Verify fonts load**

Check Network tab in dev tools

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat(ui): add Playfair Display and Inter fonts"
```

---

### Task 4.2: Create New Base Styles

**Files:**
- Modify: `public/style.css`

**Step 1: Replace base styles**

Replace the beginning of `style.css` with:

```css
/* Art or Not? - Elevated Playful Design System */

:root {
    /* Colors */
    --bg-primary: #fafafa;
    --bg-white: #ffffff;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-muted: #999999;
    --border-light: #e5e5e5;
    --accent-art: #d4af37;
    --accent-trash: #8b8b8b;
    --accent-success: #2d5a27;
    --accent-error: #8b2635;

    /* Typography */
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;
    --space-2xl: 64px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-body);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-lg);
}

h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: -0.02em;
}

h1 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: var(--space-xl);
    color: var(--text-primary);
}
```

**Step 2: Verify styles apply**

Refresh page, check typography changed

**Step 3: Commit**

```bash
git add public/style.css
git commit -m "feat(ui): implement elevated playful design system"
```

---

### Task 4.3: Redesign Image Container

**Files:**
- Modify: `public/style.css`
- Modify: `public/index.html`

**Step 1: Update image container styles**

Add to `style.css`:

```css
/* Image Display */
.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    max-height: 60vh;
    margin-bottom: var(--space-xl);
    position: relative;
}

#current-image {
    max-width: 100%;
    max-height: 60vh;
    width: auto;
    height: auto;
    object-fit: contain;
    background: var(--bg-white);
    border-radius: 4px;
    box-shadow: var(--shadow-lg);
    cursor: grab;
    user-select: none;
    touch-action: none;
}

#current-image:active {
    cursor: grabbing;
}

/* Swipe hint overlay */
.swipe-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-display);
    font-size: 1.5rem;
    padding: var(--space-md) var(--space-lg);
    border-radius: 8px;
    pointer-events: none;
    opacity: 0.9;
    z-index: 10;
}

.swipe-hint.hidden {
    display: none;
}

.swipe-hint.art {
    background: var(--accent-art);
    color: white;
}

.swipe-hint.trash {
    background: var(--accent-trash);
    color: white;
}

.swipe-hint.confident-art {
    background: var(--accent-art);
    color: white;
    border: 3px solid white;
}

.swipe-hint.confident-trash {
    background: var(--accent-trash);
    color: white;
    border: 3px solid white;
}
```

**Step 2: Add swipe hint to HTML**

In `index.html`, add inside `.image-container`:

```html
<div id="swipe-hint" class="swipe-hint hidden"></div>
```

**Step 3: Commit**

```bash
git add public/style.css public/index.html
git commit -m "feat(ui): redesign image container with swipe hints"
```

---

### Task 4.4: Redesign Vote Buttons

**Files:**
- Modify: `public/style.css`

**Step 1: Update button styles**

Add to `style.css`:

```css
/* Vote Buttons - Understated outline style */
.button-container {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.vote-btn {
    padding: var(--space-md) var(--space-xl);
    border: 2px solid var(--border-light);
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: var(--bg-white);
    color: var(--text-secondary);
}

.vote-btn:hover:not(:disabled) {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

.vote-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.vote-btn.art-btn:hover:not(:disabled) {
    border-color: var(--accent-art);
    color: var(--accent-art);
}

.vote-btn.trash-btn:hover:not(:disabled) {
    border-color: var(--accent-trash);
    color: var(--text-primary);
}

.vote-btn .icon {
    font-size: 1.2rem;
}

/* Vote instruction text */
.vote-instruction {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
}
```

**Step 2: Verify buttons render correctly**

Refresh page

**Step 3: Commit**

```bash
git add public/style.css
git commit -m "feat(ui): redesign vote buttons with understated outline style"
```

---

### Task 4.5: Create Verdict Display Component

**Files:**
- Modify: `public/style.css`

**Step 1: Add verdict display styles**

Add to `style.css`:

```css
/* Verdict Display */
.verdict-container {
    text-align: center;
    padding: var(--space-xl);
    margin: var(--space-lg) auto;
    max-width: 500px;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.verdict-percentages {
    display: flex;
    justify-content: center;
    gap: var(--space-2xl);
    margin-bottom: var(--space-lg);
}

.verdict-stat {
    text-align: center;
}

.verdict-stat .percentage {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 400;
}

.verdict-stat .label {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.verdict-stat.art .percentage {
    color: var(--accent-art);
}

.verdict-stat.trash .percentage {
    color: var(--accent-trash);
}

.verdict-copy {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-style: italic;
    color: var(--text-secondary);
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-light);
}

/* Tier-specific styling */
.verdict-container.tier-unanimous .verdict-copy {
    font-size: 1.5rem;
    color: var(--text-primary);
}

.verdict-container.tier-landslide .verdict-copy {
    font-size: 1.375rem;
}

.verdict-container.tier-deadlocked .verdict-copy {
    font-size: 1.125rem;
    color: var(--text-muted);
}
```

**Step 2: Verify styles compile**

No errors in console

**Step 3: Commit**

```bash
git add public/style.css
git commit -m "feat(ui): add verdict display component styles"
```

---

## Phase 5: Navigation & Pages

### Task 5.1: Create Bottom Navigation

**Files:**
- Modify: `public/index.html`
- Modify: `public/style.css`

**Step 1: Add navigation HTML**

Replace footer section in `index.html` with:

```html
<nav class="bottom-nav">
    <a href="/" class="nav-item active" data-page="vote">
        <span class="nav-icon">○</span>
        <span class="nav-label">Vote</span>
    </a>
    <a href="/leaderboard" class="nav-item" data-page="leaderboard">
        <span class="nav-icon">☆</span>
        <span class="nav-label">Ranks</span>
    </a>
    <a href="/profile" class="nav-item" data-page="profile">
        <span class="nav-icon">◇</span>
        <span class="nav-label">Profile</span>
    </a>
    <a href="/submit" class="nav-item" data-page="submit">
        <span class="nav-icon">+</span>
        <span class="nav-label">Submit</span>
    </a>
</nav>
```

**Step 2: Add navigation styles**

Add to `style.css`:

```css
/* Bottom Navigation */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-white);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: space-around;
    padding: var(--space-sm) 0;
    z-index: 100;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: var(--text-muted);
    padding: var(--space-sm) var(--space-md);
    transition: color 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
    color: var(--text-primary);
}

.nav-icon {
    font-size: 1.5rem;
    margin-bottom: 2px;
}

.nav-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Add padding to main content for nav */
.container {
    padding-bottom: 80px;
}

/* Desktop: top nav instead */
@media (min-width: 768px) {
    .bottom-nav {
        position: static;
        border-top: none;
        border-bottom: 1px solid var(--border-light);
        margin-bottom: var(--space-xl);
    }

    .container {
        padding-bottom: var(--space-lg);
    }
}
```

**Step 3: Commit**

```bash
git add public/index.html public/style.css
git commit -m "feat(ui): add responsive bottom/top navigation"
```

---

## Phase 6: Gamification

### Task 6.1: Create Streak Display Component

**Files:**
- Modify: `public/index.html`
- Modify: `public/style.css`
- Create: `public/streak.js`

**Step 1: Add streak HTML**

Add after `<h1>` in `index.html`:

```html
<div id="streak-display" class="streak-display hidden">
    <span class="streak-count">0</span>
    <span class="streak-label">streak</span>
</div>
```

**Step 2: Add streak styles**

Add to `style.css`:

```css
/* Streak Display */
.streak-display {
    text-align: center;
    margin-bottom: var(--space-lg);
}

.streak-display.hidden {
    display: none;
}

.streak-count {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--accent-art);
}

.streak-label {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-left: var(--space-xs);
}

.streak-display.hot .streak-count {
    color: #e63946;
}

.streak-display.hot::after {
    content: ' 🔥';
}
```

**Step 3: Create streak module**

Create `public/streak.js`:

```javascript
// Streak tracking module
const STREAK_STORAGE_KEY = 'artornot_streak';

function getLocalStreak() {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { current: 0, best: 0 };
}

function saveLocalStreak(streak) {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
}

function updateStreak(predictionCorrect) {
    const streak = getLocalStreak();

    if (predictionCorrect) {
        streak.current++;
        if (streak.current > streak.best) {
            streak.best = streak.current;
        }
    } else {
        streak.current = 0;
    }

    saveLocalStreak(streak);
    updateStreakDisplay(streak.current);

    return streak;
}

function updateStreakDisplay(count) {
    const display = document.getElementById('streak-display');
    const countEl = display.querySelector('.streak-count');

    if (count > 0) {
        display.classList.remove('hidden');
        countEl.textContent = count;

        // Add "hot" class for streaks of 5+
        if (count >= 5) {
            display.classList.add('hot');
        } else {
            display.classList.remove('hot');
        }
    } else {
        display.classList.add('hidden');
    }
}

function initStreak() {
    const streak = getLocalStreak();
    updateStreakDisplay(streak.current);
}
```

**Step 4: Commit**

```bash
git add public/index.html public/style.css public/streak.js
git commit -m "feat(gamification): add streak tracking and display"
```

---

## Remaining Tasks (Summary)

The following tasks follow the same pattern and should be implemented in sequence:

### Phase 6 (continued):
- **Task 6.2**: Create Profile Page with Stats Dashboard
- **Task 6.3**: Create Leaderboard Page
- **Task 6.4**: Wire up streak to server-side for logged-in users

### Phase 7: Submission System:
- **Task 7.1**: Update Submit Page with Auth Check
- **Task 7.2**: Add Submitter Prediction Field
- **Task 7.3**: Implement Graduation Logic in API
- **Task 7.4**: Add Report Button to Vote Screen
- **Task 7.5**: Create Report API Endpoint

### Phase 8: Integration & Polish:
- **Task 8.1**: Wire All Scripts Together in index.html
- **Task 8.2**: Add First-Time User Coach Marks
- **Task 8.3**: Implement Share Functionality
- **Task 8.4**: Mobile Responsive Polish
- **Task 8.5**: Performance Optimization (lazy loading, etc.)

### Phase 9: Backend Completion:
- **Task 9.1**: Create Weekly Leaderboard Calculation Job
- **Task 9.2**: Implement Suspicious Pattern Detection
- **Task 9.3**: Add NSFW Detection Integration (placeholder)
- **Task 9.4**: Update Supabase RLS Policies for New Tables

### Phase 10: Testing & Deployment:
- **Task 10.1**: Manual Testing Checklist
- **Task 10.2**: Deploy to Vercel Preview
- **Task 10.3**: Production Deploy

---

## Notes for Implementation

1. **Environment Variables**: The auth module references Supabase URL/key. These should be injected at build time or loaded from a config endpoint.

2. **Backward Compatibility**: The current vote API still works; confidence defaults to 'normal'.

3. **Incremental Deployment**: Each phase can be deployed independently. Phase 1-2 are backend-only. Phase 3-4 can be feature-flagged.

4. **Testing**: Test swipe gestures on actual mobile devices, not just browser simulation.
