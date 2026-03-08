// Load Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/animations.css';

// Load Icons
import { createIcons, icons } from 'lucide';

// Import App Logic
import { renderApp } from './app.js';
import { getSession, onAuthStateChange, signOut } from './auth.js';

let isAppRendered = false;

// Initialize Icons for static HTML
createIcons({ icons });

const mainContent = document.getElementById('main-content');
const sidebar = document.querySelector('.sidebar');
const emailDisplay = document.getElementById('user-email-display');

// Handle Sign Out
document.getElementById('nav-sign-out').addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await signOut();
  } catch(err) {
    console.error('Sign out error:', err);
  }
});

// Manage Global App State based on Auth Status
function handleAuthState(session) {
  if (session) {
    // User is logged in
    sidebar.style.display = 'flex';
    mainContent.style.display = 'flex';
    
    // Display user email
    if (session.user && session.user.email) {
      emailDisplay.textContent = session.user.email;
    }

    // Only render the app once to avoid destroying state on token refreshes
    if (!isAppRendered) {
      renderApp();
      isAppRendered = true;
    }
  } else {
    // User is logged out, redirect to login
    window.location.href = '/login';
  }
}

// Initalization
document.addEventListener('DOMContentLoaded', async () => {
  // Hide app parts until we confirm session to prevent flicker
  sidebar.style.display = 'none';
  mainContent.style.display = 'none';
  
  // Get initial session
  try {
    const session = await getSession();
    handleAuthState(session);
  } catch (err) {
    console.error('Session error:', err);
    handleAuthState(null);
  }

  // Listen for login/logout events
  onAuthStateChange((event, session) => {
    console.log('Auth Event:', event);
    if (event === 'SIGNED_OUT') {
      handleAuthState(null);
    } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      handleAuthState(session);
    }
  });
});
