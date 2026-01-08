// main-control.js - Main Dashboard Logic with Firebase Integration

// Global state
let editMode = false;
let dashboardData = [];

// Control type names
const typeNames = {
    toggle: "Toggle Switch",
    dimmer: "Dimmer",
    cct: "CCT Light",
    rgb: "RGB Light",
    curtain: "Curtain",
    sensor: "Sensor",
    lock: "Lock",
    remote: "Remote"
};

// Initialize the dashboard with Firebase data
async function initializeDashboard() {
    console.log("Initializing dashboard...");
    await loadDashboardFromFirebase();
    updateEmptyState();
}

// Load dashboard from Firebase
async function loadDashboardFromFirebase() {
    try {
        console.log("Loading dashboard from Firebase...");
        
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log("User not authenticated, redirecting to login");
            showNotification("User not authenticated", "error");
            window.location.href = 'index.html';
            return;
        }

        const userEmail = user.email;
        console.log("Loading dashboard for user:", userEmail);
        
        // Get property data from localStorage
        const propertyDataStr = localStorage.getItem('currentPropertyData');
        if (!propertyDataStr) {
            console.log("No property data found, redirecting to index");
            window.location.href = 'index.html';
            return;
        }
        
        const propertyData = JSON.parse(propertyDataStr);
        const propertyId = localStorage.getItem('currentPropertyId');
        
        if (!propertyId) {
            console.log("No property ID found");
            showNotification("No property selected", "error");
            window.location.href = 'index.html';
            return;
        }

        console.log("Loading dashboard for property:", propertyId);
        
        // Load dashboard data from Firebase
        const propertyDoc = await db.collection('properties').doc(propertyId).get();
        
        if (!propertyDoc.exists) {
            showNotification("Property not found in database", "error");
            return;
        }
        
        const propertyDataFromDB = propertyDoc.data();
        
        // Check if user has access to this property
        const authorizedEmails = [
            propertyDataFromDB.email1,
            propertyDataFromDB.email2,
            propertyDataFromDB.email3
        ].filter(email => email && email.trim() !== '');
        
        if (!authorizedEmails.includes(userEmail)) {
            showNotification("You are not authorized to access this property", "error");
            window.location.href = 'index.html';
            return;
        }
        
        // Check expiry
        if (propertyDataFromDB.expiryDate && propertyDataFromDB.expiryTime) {
            const expiryDateTime = new Date(propertyDataFromDB.expiryDate + ' ' + propertyDataFromDB.expiryTime);
            const now = new Date();
            
            if (expiryDateTime <= now) {
                showNotification("Your access has expired", "error");
                window.location.href = 'index.html';
                return;
            }
        }

        // Load dashboard data
        if (propertyDataFromDB.dashboardData && propertyDataFromDB.dashboardData.data) {
            dashboardData = propertyDataFromDB.dashboardData.data;
            renderDashboard();
        } else {
            // No dashboard data configured yet
            dashboardData = [];
            renderDashboard();
        }
        
        // Start expiration check
        startExpirationCheck(propertyId);
        
    } catch (error) {
        console.error("Error loading dashboard from Firebase:", error);
        showNotification("Error loading dashboard data: " + error.message, "error");
        
        // Fallback to localStorage if Firebase fails
        try {
            const savedData = localStorage.getItem('dashboardControls');
            if (savedData) {
                dashboardData = JSON.parse(savedData);
                renderDashboard();
                showNotification("Loaded from local storage (fallback)", "info");
            }
        } catch (localError) {
            console.error("Local storage error:", localError);
        }
    }
}

// Save dashboard to Firebase
async function saveDashboard() {
    try {
        console.log("Saving dashboard to Firebase...");
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showNotification("User not authenticated", "error");
            return;
        }
        
        const propertyId = localStorage.getItem('currentPropertyId');
        if (!propertyId) {
            showNotification("No property selected", "error");
            return;
        }
        
        // Prepare dashboard data
        const dashboardConfig = {
            data: dashboardData,
            lastUpdated: new Date().toISOString(),
            updatedBy: user.email
        };
        
        // Save to Firebase
        await db.collection('properties').doc(propertyId).update({
            dashboardData: dashboardConfig
        });
        
        console.log("Dashboard saved to Firebase successfully");
        showNotification("Dashboard saved to Firebase!", "success");
        
    } catch (error) {
        console.error("Error saving dashboard to Firebase:", error);
        showNotification("Error saving dashboard to Firebase: " + error.message, "error");
        
        // Fallback to localStorage
        try {
            localStorage.setItem('dashboardControls', JSON.stringify(dashboardData));
            showNotification("Dashboard saved to local storage", "info");
        } catch (localError) {
            console.error("Local storage error:", localError);
        }
    }
}

// Render the dashboard using card modules
function renderDashboard() {
    console.log("Rendering dashboard...");
    
    const dashboardGrid = document.getElementById('dashboardGrid');
    if (!dashboardGrid) {
        console.error("dashboardGrid element not found!");
        return;
    }
    
    dashboardGrid.innerHTML = '';
    
    if (dashboardData.length === 0) {
        console.log("No dashboard data, showing empty state");
        dashboardGrid.appendChild(createEmptyStateElement());
        return;
    }
    
    console.log(`Rendering ${dashboardData.length} controls`);
    
    dashboardData.forEach((control, index) => {
        console.log(`Rendering control ${index}:`, control);
        const controlElement = createControlFromData(control, index);
        if (controlElement) {
            dashboardGrid.appendChild(controlElement);
        }
    });
    
    // Update edit mode buttons
    updateEditModeButtons();
}

// Create control from data using appropriate card module
function createControlFromData(control, index) {
    console.log(`Creating control element for type: ${control.type}`, control);
    
    let controlElement;
    
    try {
        switch (control.type) {
            case 'toggle':
                if (typeof window.createToggleCard === 'function') {
                    console.log("Creating toggle card...");
                    controlElement = window.createToggleCard({
                        entityId: control.entityId,
                        name: control.name,
                        subtitle: control.subtitle,
                        icon: control.icon,
                        accentColor: control.color || '#f26f1e'
                    });
                } else {
                    console.error("createToggleCard function not found!");
                    controlElement = createFallbackControl(control);
                }
                break;
                
            case 'dimmer':
                if (typeof window.createDimmerCard === 'function') {
                    console.log("Creating dimmer card...");
                    controlElement = window.createDimmerCard({
                        entityId: control.entityId,
                        name: control.name,
                        subtitle: control.subtitle,
                        icon: control.icon,
                        accentColor: control.color || '#f26f1e'
                    });
                } else {
                    console.error("createDimmerCard function not found!");
                    controlElement = createFallbackControl(control);
                }
                break;
                
            case 'cct':
                if (typeof window.createCCTLightCard === 'function') {
                    console.log("Creating CCT card...");
                    controlElement = window.createCCTLightCard({
                        entityId: control.entityId,
                        name: control.name,
                        subtitle: control.subtitle,
                        icon: control.icon,
                        accentColor: control.color || '#f26f1e',
                        showModal: true
                    });
                } else {
                    console.error("createCCTLightCard function not found!");
                    controlElement = createFallbackControl(control);
                }
                break;
                
            case 'lock':
                if (typeof window.createLockCard === 'function') {
                    console.log("Creating lock card...");
                    controlElement = window.createLockCard({
                        entityId: control.entityId,
                        name: control.name,
                        subtitle: control.subtitle,
                        icon: control.icon,
                        accentLocked: control.color || '#4CAF50',
                        accentUnlocked: '#F44336',
                        accentProcessing: '#FFC107'
                    });
                } else {
                    console.error("createLockCard function not found!");
                    controlElement = createFallbackControl(control);
                }
                break;
                
            default:
                console.warn(`Unknown control type: ${control.type}, creating fallback`);
                controlElement = createFallbackControl(control);
        }
        
        // Add remove button for edit mode
        if (controlElement && editMode) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-control-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove control';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeControl(index);
            });
            
            // Create a container for the control and remove button
            const container = document.createElement('div');
            container.className = 'control-card-container';
            container.style.position = 'relative';
            container.appendChild(controlElement);
            container.appendChild(removeBtn);
            
            return container;
        }
        
    } catch (error) {
        console.error(`Error creating control element for type ${control.type}:`, error);
        controlElement = createFallbackControl(control);
    }
    
    return controlElement;
}

// Create fallback control when modules aren't available
function createFallbackControl(control) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'control-card';
    fallbackDiv.innerHTML = `
        <div class="control-header">
            <div class="control-icon">
                <i class="material-icons">${control.icon ? control.icon.split(':')[1] || 'lightbulb' : 'lightbulb'}</i>
            </div>
            <div class="control-info">
                <div class="control-name">${control.name || 'Unnamed Control'}</div>
                <div class="control-subtitle">${control.subtitle || ''}</div>
                <div class="control-entity">${control.entityId || 'N/A'}</div>
            </div>
        </div>
        <div class="control-actions">
            <div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.5);">
                <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 10px;"></i>
                <div>${control.type || 'Unknown'} control</div>
                <div style="font-size: 12px; margin-top: 5px;">Module not available</div>
            </div>
        </div>
    `;
    return fallbackDiv;
}

// Add control functions
function addControlFromForm(e) {
    e.preventDefault();
    console.log("Adding control from form...");
    
    const controlName = document.getElementById('controlName').value.trim();
    const controlSubtitle = document.getElementById('controlSubtitle').value.trim();
    const entityId = document.getElementById('entityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification("Please fill in all required fields", "error");
        return;
    }
    
    const controlData = {
        type: window.selectedControlType || 'toggle',
        name: controlName,
        subtitle: controlSubtitle,
        entityId: entityId,
        icon: window.selectedIcon ? `material-icons:${window.selectedIcon}` : 'material-icons:lightbulb',
        color: '#f26f1e',
        timestamp: Date.now()
    };
    
    console.log("Adding control data:", controlData);
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

function addCCTControlFromForm(e) {
    e.preventDefault();
    console.log("Adding CCT control from form...");
    
    const controlName = document.getElementById('cctControlName').value.trim();
    const controlSubtitle = document.getElementById('cctControlSubtitle').value.trim();
    const entityId = document.getElementById('cctEntityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification("Please fill in all required fields", "error");
        return;
    }
    
    const controlData = {
        type: 'cct',
        name: controlName,
        subtitle: controlSubtitle,
        entityId: entityId,
        icon: window.selectedIcon ? `material-icons:${window.selectedIcon}` : 'material-icons:lightbulb',
        color: '#f26f1e',
        timestamp: Date.now()
    };
    
    console.log("Adding CCT control data:", controlData);
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

function addDimmerControlFromForm(e) {
    e.preventDefault();
    console.log("Adding dimmer control from form...");
    
    const controlName = document.getElementById('dimmerControlName').value.trim();
    const controlSubtitle = document.getElementById('dimmerControlSubtitle').value.trim();
    const entityId = document.getElementById('dimmerEntityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification("Please fill in all required fields", "error");
        return;
    }
    
    const controlData = {
        type: 'dimmer',
        name: controlName,
        subtitle: controlSubtitle,
        entityId: entityId,
        icon: window.selectedIcon ? `material-icons:${window.selectedIcon}` : 'material-icons:lightbulb',
        color: '#f26f1e',
        timestamp: Date.now()
    };
    
    console.log("Adding dimmer control data:", controlData);
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

function addLockControlFromForm(e) {
    e.preventDefault();
    console.log("Adding lock control from form...");
    
    const controlName = document.getElementById('lockControlName').value.trim();
    const controlSubtitle = document.getElementById('lockControlSubtitle').value.trim();
    const entityId = document.getElementById('lockEntityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification("Please fill in all required fields", "error");
        return;
    }
    
    const controlData = {
        type: 'lock',
        name: controlName,
        subtitle: controlSubtitle,
        entityId: entityId,
        icon: window.selectedIcon ? `material-icons:${window.selectedIcon}` : 'material-icons:lock',
        color: '#4CAF50',
        timestamp: Date.now()
    };
    
    console.log("Adding lock control data:", controlData);
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

// Remove a control
async function removeControl(index) {
    if (confirm('Are you sure you want to remove this control?')) {
        console.log(`Removing control at index ${index}`);
        dashboardData.splice(index, 1);
        await saveDashboard();
        renderDashboard();
    }
}

// Toggle edit mode
function toggleEditMode() {
    editMode = !editMode;
    console.log(`Edit mode: ${editMode}`);
    
    // Update edit button
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        if (editMode) {
            editBtn.innerHTML = '<i class="fas fa-check"></i><span>Done</span>';
            editBtn.style.background = '#4CAF50';
        } else {
            editBtn.innerHTML = '<i class="fas fa-plus"></i><span>Edit</span>';
            editBtn.style.background = '#f26f1e';
        }
    }
    
    // Re-render dashboard to show/hide remove buttons
    renderDashboard();
}

// Update edit mode buttons visibility
function updateEditModeButtons() {
    const removeButtons = document.querySelectorAll('.remove-control-btn');
    removeButtons.forEach(btn => {
        btn.style.display = editMode ? 'flex' : 'none';
    });
}

// Update empty state visibility
function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = dashboardData.length === 0 ? 'flex' : 'none';
    }
}

// Create empty state element
function createEmptyStateElement() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.id = 'emptyState';
    emptyState.innerHTML = `
        <i class="fas fa-plus-circle"></i>
        <h3>No controls added yet</h3>
        <p>Click "Edit" to add your first control</p>
    `;
    return emptyState;
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`Notification [${type}]: ${message}`);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add animation styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export dashboard data
function exportDashboardData() {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dashboard-controls.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("Dashboard exported successfully!", "success");
}

// Reset form
function resetForm() {
    window.selectedIcon = null;
    window.selectedControlType = null;
    
    // Reset form fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Reset selected icon display
    const selectedIconDisplays = document.querySelectorAll('.selected-icon-display');
    selectedIconDisplays.forEach(display => {
        display.innerHTML = '<span>No icon selected</span>';
    });
    
    // Clear icon grid selections
    const iconOptions = document.querySelectorAll('.icon-option.selected');
    iconOptions.forEach(option => {
        option.classList.remove('selected');
    });
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    resetForm();
}

// Start expiration check
function startExpirationCheck(propertyId) {
    console.log("Starting expiration check...");
    
    setInterval(async () => {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;
            
            const userEmail = user.email;
            
            // Fetch property data from Firebase
            const doc = await db.collection('properties').doc(propertyId).get();
            
            if (!doc.exists) {
                showNotification("Property no longer exists. Logging out...", "error");
                setTimeout(() => logout(), 3000);
                return;
            }
            
            const propertyData = doc.data();
            
            // Check if user still has access
            const authorizedEmails = [
                propertyData.email1,
                propertyData.email2,
                propertyData.email3
            ].filter(email => email && email.trim() !== '');
            
            if (!authorizedEmails.includes(userEmail)) {
                showNotification("Your access has been revoked. Logging out...", "error");
                setTimeout(() => logout(), 3000);
                return;
            }
            
            // Check expiry
            if (propertyData.expiryDate && propertyData.expiryTime) {
                const expiryDateTime = new Date(propertyData.expiryDate + ' ' + propertyData.expiryTime);
                const now = new Date();
                
                if (expiryDateTime <= now) {
                    showNotification("Your access has expired. Logging out...", "error");
                    setTimeout(() => logout(), 3000);
                }
            }
        } catch (error) {
            console.error('Expiration check error:', error);
        }
    }, 60000); // Check every minute
}

// Logout function
async function logout() {
    try {
        console.log("Logging out...");
        await firebase.auth().signOut();
        localStorage.clear();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Initialize UI when DOM is ready
function init() {
    console.log("Initializing main control...");
    
    // Add event listeners
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }
    
    const saveBtn = document.getElementById('saveDashboardBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDashboard);
    }
    
    console.log("Main control initialization complete");
}

// Export functions for use in other modules
window.initializeDashboard = initializeDashboard;
window.saveDashboard = saveDashboard;
window.exportDashboardData = exportDashboardData;
window.addControlFromForm = addControlFromForm;
window.addCCTControlFromForm = addCCTControlFromForm;
window.addDimmerControlFromForm = addDimmerControlFromForm;
window.addLockControlFromForm = addLockControlFromForm;
window.closeAllModals = closeAllModals;
window.resetForm = resetForm;
window.showNotification = showNotification;
window.typeNames = typeNames;
window.logout = logout;
window.toggleEditMode = toggleEditMode;

// Initialize when script loads
document.addEventListener('DOMContentLoaded', init);