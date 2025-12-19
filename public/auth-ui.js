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
