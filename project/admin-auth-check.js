// admin-auth-check.js - For ALL admin pages
const ADMIN_EMAILS = ['mohancheenu04@gmail.com', 'drasisdata@gmail.com'];

// Check if user is admin (generic function)
function checkAdminStatus(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email);
}

// Initialize admin auth check on page load
function initializeAdminAuth() {
  // Check if Firebase is initialized
  if (typeof firebase === 'undefined' || !firebase.apps.length) {
    console.error('Firebase not loaded');
    window.location.href = 'login.html';
    return;
  }
  
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      // Not logged in, redirect to login
      console.log('No user, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    console.log('Checking admin status for:', user.email);
    
    // Check if user is admin
    if (!checkAdminStatus(user)) {
      // Not admin, redirect to index.html for regular users
      console.log('Not admin, redirecting to index');
      window.location.href = 'index.html';
      return;
    }

    console.log('Admin access granted');
    
    // Add admin UI elements based on current page
    addAdminUI(user);
  });
}

// Admin logout function
function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    firebase.auth().signOut().then(() => {
      console.log('Admin logged out');
      window.location.href = 'login.html';
    }).catch((error) => {
      console.error('Admin logout error:', error);
      alert('Logout failed: ' + error.message);
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeAdminAuth();
});