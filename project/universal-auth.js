// universal-auth.js - Universal authentication for all pages with persistence

const ADMIN_EMAILS = ['mohancheenu04@gmail.com', 'drasisdata@gmail.com'];

// Check session validity for phone authentication
async function checkPhoneSession() {
    const sessionId = localStorage.getItem('sessionId');
    const authMethod = localStorage.getItem('authMethod');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    console.log('Checking phone session:', { sessionId, authMethod, sessionExpiry });
    
    // If no phone session, return false
    if (!sessionId || authMethod !== 'phone') {
        return false;
    }
    
    // Check if session expired in localStorage
    if (sessionExpiry && new Date(sessionExpiry) < new Date()) {
        console.log('Session expired (localStorage)');
        await clearPhoneSession(sessionId);
        return false;
    }
    
    try {
        // Verify session exists in Firestore
        const sessionDoc = await db.collection('userSessions').doc(sessionId).get();
        
        if (!sessionDoc.exists) {
            console.log('Session not found in Firestore');
            await clearPhoneSession(sessionId);
            return false;
        }
        
        const sessionData = sessionDoc.data();
        const expiresAt = sessionData.expiresAt.toDate ? sessionData.expiresAt.toDate() : new Date(sessionData.expiresAt);
        const now = new Date();
        
        // Check if session expired
        if (expiresAt <= now) {
            console.log('Session expired in Firestore');
            await clearPhoneSession(sessionId);
            return false;
        }
        
        // Check if property access hasn't expired
        const propertyData = sessionData.propertyData;
        const propertyExpiry = new Date(propertyData.expiryDate + ' ' + propertyData.expiryTime);
        
        if (propertyExpiry <= now) {
            console.log('Property access expired');
            await clearPhoneSession(sessionId);
            return false;
        }
        
        // Refresh session expiration (extend by another 24 hours)
        const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.collection('userSessions').doc(sessionId).update({
            expiresAt: newExpiry
        });
        
        // Update localStorage expiry
        localStorage.setItem('sessionExpiry', newExpiry.toISOString());
        
        // Ensure property data is in localStorage
        if (!localStorage.getItem('currentPropertyData')) {
            localStorage.setItem('currentPropertyId', sessionData.propertyId);
            localStorage.setItem('currentPropertyData', JSON.stringify(sessionData.propertyData));
            localStorage.setItem('currentPhoneNumber', sessionData.phoneNumber);
        }
        
        console.log('Phone session valid, expires at:', newExpiry);
        return true;
    } catch (error) {
        console.error('Session validation error:', error);
        await clearPhoneSession(sessionId);
        return false;
    }
}

// Clear phone session
async function clearPhoneSession(sessionId) {
    try {
        if (sessionId) {
            await db.collection('userSessions').doc(sessionId).delete();
        }
    } catch (error) {
        console.error('Error clearing session:', error);
    }
    
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('authMethod');
    localStorage.removeItem('currentPropertyId');
    localStorage.removeItem('currentPropertyData');
    localStorage.removeItem('currentPhoneNumber');
}

// Check if user has valid property access (for both Google and Phone users)
async function checkPropertyAccess(userEmail, propertyId = null) {
    try {
        // If propertyId is provided, check that specific property
        if (propertyId) {
            const doc = await db.collection('properties').doc(propertyId).get();
            
            if (!doc.exists) {
                return { hasAccess: false, reason: 'Property not found' };
            }
            
            const propertyData = doc.data();
            const now = new Date();
            const expiryDateTime = new Date(propertyData.expiryDate + ' ' + propertyData.expiryTime);
            
            // Check if user is authorized
            const authorizedEmails = [
                propertyData.email1,
                propertyData.email2,
                propertyData.email3
            ].filter(email => email && email.trim() !== '');
            
            if (!authorizedEmails.includes(userEmail)) {
                return { hasAccess: false, reason: 'Not authorized' };
            }
            
            // Check expiry
            if (expiryDateTime <= now) {
                return { hasAccess: false, reason: 'Access expired' };
            }
            
            return {
                hasAccess: true,
                propertyId: doc.id,
                propertyData: propertyData
            };
        }
        
        // Otherwise, find any property the user has access to
        const propertiesRef = db.collection('properties');
        const snapshot = await propertiesRef.get();
        const now = new Date();
        
        for (const doc of snapshot.docs) {
            const propertyData = doc.data();
            
            const authorizedEmails = [
                propertyData.email1,
                propertyData.email2,
                propertyData.email3
            ].filter(email => email && email.trim() !== '');
            
            if (authorizedEmails.includes(userEmail)) {
                const expiryDateTime = new Date(propertyData.expiryDate + ' ' + propertyData.expiryTime);
                
                if (expiryDateTime > now) {
                    return {
                        hasAccess: true,
                        propertyId: doc.id,
                        propertyData: propertyData
                    };
                }
            }
        }
        
        return { hasAccess: false, reason: 'No authorized property found' };
    } catch (error) {
        console.error('Error checking property access:', error);
        return { hasAccess: false, reason: 'Error checking access' };
    }
}

// Get current property data
function getCurrentPropertyData() {
    const propertyData = localStorage.getItem('currentPropertyData');
    return propertyData ? JSON.parse(propertyData) : null;
}

// Get current room number (from property data or default)
function getRoomNumber() {
    const propertyData = getCurrentPropertyData();
    return (propertyData && propertyData.roomNumber) ? propertyData.roomNumber : 'G01';
}

// Universal authentication check for any page
async function checkAuth(redirectOnFail = true, adminOnly = false) {
    console.log('Checking authentication...');
    console.log('Current localStorage:', {
        sessionId: localStorage.getItem('sessionId'),
        authMethod: localStorage.getItem('authMethod'),
        sessionExpiry: localStorage.getItem('sessionExpiry'),
        propertyId: localStorage.getItem('currentPropertyId')
    });
    
    // First, check if this is a phone-authenticated user
    const authMethod = localStorage.getItem('authMethod');
    const isPhoneAuth = authMethod === 'phone';
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isPhoneAuth) {
        // Check phone session
        const sessionValid = await checkPhoneSession();
        
        if (sessionValid) {
            console.log('Phone user authenticated');
            
            // For admin-only pages, phone users should be redirected
            if (adminOnly) {
                if (redirectOnFail) {
                    window.location.href = 'index.html';
                }
                return false;
            }
            
            return true;
        } else {
            // Invalid phone session
            console.log('Invalid phone session, clearing data');
            localStorage.clear();
            if (redirectOnFail) window.location.href = 'index.html';
            return false;
        }
    }
    
    // Not phone auth, check Firebase Auth (Google users)
    return new Promise((resolve) => {
        // Check if user is already authenticated
        const currentUser = firebase.auth().currentUser;
        
        if (currentUser) {
            console.log('Firebase user found:', currentUser.email);
            handleGoogleUser(currentUser, redirectOnFail, adminOnly, resolve);
        } else {
            // Wait for auth state change
            const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                unsubscribe();
                if (!user) {
                    console.log('No user found');
                    if (redirectOnFail) window.location.href = 'index.html';
                    resolve(false);
                    return;
                }
                console.log('User authenticated:', user.email);
                handleGoogleUser(user, redirectOnFail, adminOnly, resolve);
            });
        }
    });
}

async function handleGoogleUser(user, redirectOnFail, adminOnly, resolve) {
    const userEmail = user.email;
    
    // Check if admin
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    
    // For admin-only pages
    if (adminOnly) {
        if (!isAdmin) {
            console.log('Non-admin user on admin page');
            if (redirectOnFail) window.location.href = 'index.html';
            resolve(false);
            return;
        }
        console.log('Admin access granted');
        resolve(true);
        return;
    }
    
    // For user pages, redirect admins to admin panel
    if (isAdmin) {
        console.log('Admin on user page, redirecting to admin.html');
        if (redirectOnFail) window.location.href = 'admin.html';
        resolve(false);
        return;
    }
    
    // Check property access
    const propertyId = localStorage.getItem('currentPropertyId');
    const accessResult = await checkPropertyAccess(userEmail, propertyId);
    
    if (accessResult.hasAccess) {
        // Store property data if not already stored
        if (!localStorage.getItem('currentPropertyId')) {
            localStorage.setItem('currentPropertyId', accessResult.propertyId);
            localStorage.setItem('currentPropertyData', JSON.stringify(accessResult.propertyData));
            localStorage.setItem('authMethod', 'google');
        }
        console.log('User has valid property access');
        resolve(true);
    } else {
        console.log('User does not have valid property access:', accessResult.reason);
        await firebase.auth().signOut();
        localStorage.clear();
        if (redirectOnFail) window.location.href = 'index.html';
        resolve(false);
    }
}

// Universal logout function
async function logout() {
    try {
        const authMethod = localStorage.getItem('authMethod');
        const sessionId = localStorage.getItem('sessionId');
        
        // Clear phone session if exists
        if (authMethod === 'phone' && sessionId) {
            await db.collection('userSessions').doc(sessionId).delete();
        }
        
        // Sign out from Firebase if Google user
        if (authMethod === 'google') {
            await firebase.auth().signOut();
        }
        
        // Clear all local storage
        localStorage.clear();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Export for global use
window.universalAuth = {
    checkAuth,
    logout,
    getCurrentPropertyData,
    getRoomNumber,
    checkPhoneSession,
    checkPropertyAccess
};