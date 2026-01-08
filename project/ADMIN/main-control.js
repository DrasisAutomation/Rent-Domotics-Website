// main-control.js - Main Dashboard Logic (Updated with Dimmer Support)

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

// Initialize the dashboard
function initializeDashboard() {
    loadDashboard();
    updateEmptyState();
}

// Load dashboard from localStorage
function loadDashboard() {
    try {
        const savedData = localStorage.getItem('dashboardControls');
        if (savedData) {
            dashboardData = JSON.parse(savedData);
            renderDashboard();
        }
    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}

// Save dashboard to localStorage
function saveDashboard() {
    try {
        localStorage.setItem('dashboardControls', JSON.stringify(dashboardData));
        showNotification("Dashboard saved successfully!", "success");
    } catch (error) {
        console.error("Error saving dashboard:", error);
        showNotification("Error saving dashboard", "error");
    }
}

// Render the dashboard
function renderDashboard() {
    const dashboardGrid = document.getElementById('dashboardGrid');
    if (!dashboardGrid) return;
    
    dashboardGrid.innerHTML = '';
    
    if (dashboardData.length === 0) {
        dashboardGrid.appendChild(createEmptyStateElement());
        return;
    }
    
    dashboardData.forEach((control, index) => {
        const controlContainer = createControlElement(control, index);
        dashboardGrid.appendChild(controlContainer);
    });
}

// Create control element
function createControlElement(control, index) {
    const container = document.createElement('div');
    container.className = 'control-card-container';
    
    // Create remove button for edit mode
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-control-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.title = 'Remove control';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeControl(index);
    });
    
    // Create the actual control based on type
    let controlElement;
    switch (control.type) {
        case 'toggle':
            controlElement = window.createToggleCard({
                entityId: control.entityId,
                name: control.name,
                subtitle: control.subtitle,
                icon: control.icon,
                accentColor: control.color || '#f26f1e'
            });
            break;
            
        case 'dimmer':
            controlElement = window.createDimmerCard({
                entityId: control.entityId,
                name: control.name,
                subtitle: control.subtitle,
                icon: control.icon,
                accentColor: control.color || '#f26f1e'
            });
            break;
            
        case 'cct':
            controlElement = window.createCCTLightCard({
                entityId: control.entityId,
                name: control.name,
                subtitle: control.subtitle,
                icon: control.icon,
                accentColor: control.color || '#f26f1e',
                showModal: true
            });
            break;
            
        case 'lock':
            controlElement = window.createLockCard({
                entityId: control.entityId,
                name: control.name,
                subtitle: control.subtitle,
                icon: control.icon,
                accentLocked: control.color || '#4CAF50',
                accentUnlocked: '#F44336',
                accentProcessing: '#FFC107'
            });
            break;
            
        default:
            // Fallback for unsupported types
            controlElement = document.createElement('div');
            controlElement.className = 'fallback-control';
            controlElement.innerHTML = `
                <div style="background: #2a2a2a; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3>${control.name}</h3>
                    <p>${control.subtitle || 'Control not yet implemented'}</p>
                </div>
            `;
    }
    
    container.appendChild(controlElement);
    container.appendChild(removeBtn);
    
    return container;
}

// Add a control from form
function addControlFromForm(e) {
    e.preventDefault();
    
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
    
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

// Add a CCT control from form
function addCCTControlFromForm(e) {
    e.preventDefault();
    
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
    
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

// Add a dimmer control from form
function addDimmerControlFromForm(e) {
    e.preventDefault();
    
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
    
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

// Add a lock control from form
function addLockControlFromForm(e) {
    e.preventDefault();
    
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
    
    dashboardData.push(controlData);
    saveDashboard();
    renderDashboard();
    resetForm();
    closeAllModals();
}

// Remove a control
function removeControl(index) {
    if (confirm('Are you sure you want to remove this control?')) {
        dashboardData.splice(index, 1);
        saveDashboard();
        renderDashboard();
    }
}

// Toggle edit mode
function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        if (editMode) {
            editBtn.innerHTML = '<i class="fas fa-check"></i><span>Done</span>';
        } else {
            editBtn.innerHTML = '<i class="fas fa-plus"></i><span>Edit</span>';
        }
    }
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
    
    // Add animation styles
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

// Add dimmer config modal to HTML if it doesn't exist
function ensureDimmerConfigModal() {
    if (!document.getElementById('dimmerConfigModal')) {
        // Create and append the dimmer config modal
        const modalHTML = `
            <div class="modal-overlay" id="dimmerConfigModal">
                <div class="modal" id="dimmerConfig">
                    <div class="modal-header">
                        <div class="modal-title">Configure Dimmer</div>
                        <div class="modal-subtitle">Set up your dimmer settings</div>
                    </div>
                    
                    <div class="modal-content">
                        <!-- Configuration Form -->
                        <form id="dimmerConfigForm" class="config-form">
                            <!-- Control Name -->
                            <div class="form-group">
                                <label for="dimmerControlName">
                                    <i class="material-icons">title</i>
                                    Control Name
                                </label>
                                <input type="text" id="dimmerControlName" placeholder="e.g., Living Room Dimmer" required>
                                <div class="form-hint">This will be displayed as the main title</div>
                            </div>
                            
                            <!-- Subtitle -->
                            <div class="form-group">
                                <label for="dimmerControlSubtitle">
                                    <i class="material-icons">description</i>
                                    Subtitle/Description
                                </label>
                                <input type="text" id="dimmerControlSubtitle" placeholder="e.g., Adjust brightness level">
                                <div class="form-hint">Brief description shown below the name</div>
                            </div>
                            
                            <!-- Entity ID -->
                            <div class="form-group">
                                <label for="dimmerEntityId">
                                    <i class="material-icons">link</i>
                                    Home Assistant Entity ID
                                </label>
                                <input type="text" id="dimmerEntityId" placeholder="e.g., light.living_room" required>
                                <div class="form-hint">Format: domain.entity_id (light, switch, etc.)</div>
                            </div>
                            
                            <!-- Icon Selection -->
                            <div class="form-group">
                                <label>
                                    <i class="material-icons">insert_emoticon</i>
                                    Select Icon
                                </label>
                                <div class="icon-search">
                                    <input type="text" id="dimmerIconSearch" placeholder="Search icons...">
                                </div>
                                <div class="icon-preview-grid" id="dimmerIconGrid">
                                    <!-- Google Material Icons will be dynamically populated -->
                                </div>
                                <div class="selected-icon-display" id="dimmerSelectedIconDisplay">
                                    <span>No icon selected</span>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="modal-btn close-modal-btn" id="cancelDimmerConfigBtn">
                            <i class="material-icons">arrow_back</i>
                            Back
                        </button>
                        <button type="submit" form="dimmerConfigForm" class="modal-btn save-modal-btn">
                            <i class="material-icons">check</i>
                            Add to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal before the closing body tag
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Add lock config modal to HTML if it doesn't exist
function ensureLockConfigModal() {
    if (!document.getElementById('lockConfigModal')) {
        // Create and append the lock config modal
        const modalHTML = `
            <div class="modal-overlay" id="lockConfigModal">
                <div class="modal" id="lockConfig">
                    <div class="modal-header">
                        <div class="modal-title">Configure Lock</div>
                        <div class="modal-subtitle">Set up your smart lock settings</div>
                    </div>
                    
                    <div class="modal-content">
                        <!-- Configuration Form -->
                        <form id="lockConfigForm" class="config-form">
                            <!-- Control Name -->
                            <div class="form-group">
                                <label for="lockControlName">
                                    <i class="material-icons">title</i>
                                    Control Name
                                </label>
                                <input type="text" id="lockControlName" placeholder="e.g., Front Door Lock" required>
                                <div class="form-hint">This will be displayed as the main title</div>
                            </div>
                            
                            <!-- Subtitle -->
                            <div class="form-group">
                                <label for="lockControlSubtitle">
                                    <i class="material-icons">description</i>
                                    Subtitle/Description
                                </label>
                                <input type="text" id="lockControlSubtitle" placeholder="e.g., Smart door lock control">
                                <div class="form-hint">Brief description shown below the name</div>
                            </div>
                            
                            <!-- Entity ID -->
                            <div class="form-group">
                                <label for="lockEntityId">
                                    <i class="material-icons">link</i>
                                    Home Assistant Entity ID
                                </label>
                                <input type="text" id="lockEntityId" placeholder="e.g., lock.front_door" required>
                                <div class="form-hint">Format: lock.entity_name (must be a lock entity)</div>
                            </div>
                            
                            <!-- Icon Selection -->
                            <div class="form-group">
                                <label>
                                    <i class="material-icons">insert_emoticon</i>
                                    Select Icon
                                </label>
                                <div class="icon-search">
                                    <input type="text" id="lockIconSearch" placeholder="Search icons...">
                                </div>
                                <div class="icon-preview-grid" id="lockIconGrid">
                                    <!-- Google Material Icons will be dynamically populated -->
                                </div>
                                <div class="selected-icon-display" id="lockSelectedIconDisplay">
                                    <span>No icon selected</span>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="modal-btn close-modal-btn" id="cancelLockConfigBtn">
                            <i class="material-icons">arrow_back</i>
                            Back
                        </button>
                        <button type="submit" form="lockConfigForm" class="modal-btn save-modal-btn">
                            <i class="material-icons">check</i>
                            Add to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal before the closing body tag
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
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