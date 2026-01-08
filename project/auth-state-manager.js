// auth-state-manager.js - Global auth state management
const ADMIN_EMAILS = ['mohancheenu04@gmail.com', 'drasisdata@gmail.com'];

// Listen to auth state changes globally
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // User is signed out
    console.log('User signed out');
    return;
  }
  
  console.log('Auth state changed. User:', user.email);
  
  // Determine current page
  const currentPage = window.location.pathname.split('/').pop();
  
  // Check if admin
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  
  // Redirect logic based on role and page
  if (isAdmin && currentPage !== 'admin.html' && currentPage !== 'login.html') {
    // Admin on non-admin page, redirect to admin.html
    console.log('Admin detected on non-admin page, redirecting to admin.html');
    window.location.href = 'admin.html';
  } else if (!isAdmin && currentPage === 'admin.html') {
    // Non-admin on admin page, redirect to index.html
    console.log('Non-admin detected on admin page, redirecting to index.html');
    window.location.href = 'index.html';
  }
});