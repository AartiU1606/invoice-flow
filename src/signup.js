import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';

import { getSession, signUpWithEmail, signInWithGoogle, onAuthStateChange } from './auth.js';

// Auth UI Elements
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const submitBtn = document.getElementById('auth-submit-btn');
const googleBtn = document.getElementById('auth-google-btn');
const errorDiv = document.getElementById('auth-error');
const successDiv = document.getElementById('auth-success');

function showError(msg) {
  if (!msg) {
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';
    return;
  }
  errorDiv.textContent = msg;
  errorDiv.classList.add('visible');
}

function showSuccess(msg) {
  if (!msg) {
    successDiv.classList.remove('visible');
    successDiv.textContent = '';
    return;
  }
  successDiv.textContent = msg;
  successDiv.classList.add('visible');
}

// Check session on load
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession();
  if (session) {
    window.location.href = '/'; // Redirect to dashboard
  }
});

// Listen for auth changes
onAuthStateChange((event, session) => {
  if (session) {
    window.location.href = '/';
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  showSuccess('');
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Processing...';
  
  try {
    await signUpWithEmail(emailInput.value, passwordInput.value);
    showSuccess('Sign up successful! Please check your email to verify your account.');
  } catch (err) {
    showError(err.message || 'An error occurred during registration.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
});

googleBtn.addEventListener('click', async () => {
  showError('');
  try {
    await signInWithGoogle();
  } catch (err) {
    showError(err.message || 'Failed to initialize Google login.');
  }
});
