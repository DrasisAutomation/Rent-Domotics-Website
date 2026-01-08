// auth-check.js - For user pages (index.html, etc.)

// Check if user is logged in and has property access
async function checkUserAuth() {
  const currentUser = firebase.auth().currentUser;
  
  if (!currentUser) {
    // Not logged in, redirect to login
    window.location.href = 'index.html';
    return false;
  }

  // Check if admin (redirect to admin panel if admin tries to access user page)
  const ADMIN_EMAILS = ['mohancheenu04@gmail.com', 'drasisdata@gmail.com'];
  if (ADMIN_EMAILS.includes(currentUser.email)) {
    window.location.href = 'admin.html';
    return false;
  }

  // Check if user has property access
  try {
    const userEmail = currentUser.email;
    const propertiesRef = db.collection('properties');
    const snapshot = await propertiesRef.get();
    
    const now = new Date();
    let hasValidAccess = false;
    let propertyId = null;
    let propertyData = null;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const emails = [data.email1, data.email2, data.email3]
        .filter(email => email && email.trim() !== '');

      if (emails.includes(userEmail)) {
        const expiryDateTime = new Date(data.expiryDate + ' ' + data.expiryTime);
        if (expiryDateTime > now) {
          hasValidAccess = true;
          propertyId = doc.id;
          propertyData = data;
          break;
        }
      }
    }

    if (!hasValidAccess) {
      // No valid access, sign out and redirect
      await firebase.auth().signOut();
      localStorage.removeItem('currentPropertyId');
      localStorage.removeItem('currentPropertyData');
      window.location.href = 'index.html';
      return false;
    }

    // Store in localStorage if not already stored
    if (!localStorage.getItem('currentPropertyId')) {
      localStorage.setItem('currentPropertyId', propertyId);
      localStorage.setItem('currentPropertyData', JSON.stringify(propertyData));
    }

    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'index.html';
    return false;
  }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for Firebase to be ready
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
      console.error('Firebase not loaded');
      window.location.href = 'index.html';
      return;
    }

    // Check authentication
    const isAuthenticated = await checkUserAuth();
    
    if (isAuthenticated) {
      // User is authenticated, you can optionally load user-specific content
      console.log('User authenticated successfully');
      
      // Optional: Set user info in UI
      const user = firebase.auth().currentUser;
      if (user && document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = user.email;
      }
    }
  } catch (error) {
    console.error('Authentication initialization error:', error);
    window.location.href = 'index.html';
  }
});

// Logout function for user pages
function userLogout() {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem('currentPropertyId');
    localStorage.removeItem('currentPropertyData');
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Logout error:', error);
  });
}