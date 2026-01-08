// control.js - Dashboard JavaScript with CCT Support

// Dashboard State
let dashboardControls = [];
let isEditMode = false;
let selectedControlType = '';
let selectedIcon = 'lightbulb';
let selectedColor = '#f26f1e';
let selectedSize = 'small';

// DOM Elements
const editBtn = document.getElementById('editBtn');
const saveDashboardBtn = document.getElementById('saveDashboardBtn');
const typeSelectionModal = document.getElementById('typeSelectionModal');
const toggleConfigModal = document.getElementById('toggleConfigModal');
const cctConfigModal = document.getElementById('cctConfigModal');
const cancelTypeBtn = document.getElementById('cancelTypeBtn');
const cancelConfigBtn = document.getElementById('cancelConfigBtn');
const cancelCCTConfigBtn = document.getElementById('cancelCCTConfigBtn');
const dashboardGrid = document.getElementById('dashboardGrid');
const emptyState = document.getElementById('emptyState');
const dashboardContent = document.getElementById('dashboardContent');

// Toggle Form Elements
const toggleConfigForm = document.getElementById('toggleConfigForm');
const iconGrid = document.getElementById('iconGrid');
const selectedIconDisplay = document.getElementById('selectedIconDisplay');
const iconSearch = document.getElementById('iconSearch');
const accentColor = document.getElementById('accentColor');
const colorValue = document.getElementById('colorValue');
const colorPresets = document.querySelectorAll('.color-preset');
const sizeOptions = document.querySelectorAll('.size-option input[type="radio"]');
const controlTypeCards = document.querySelectorAll('.control-type-card');

// CCT Form Elements
const cctConfigForm = document.getElementById('cctConfigForm');
const cctIconGrid = document.getElementById('cctIconGrid');
const cctSelectedIconDisplay = document.getElementById('cctSelectedIconDisplay');
const cctIconSearch = document.getElementById('cctIconSearch');
const cctAccentColor = document.getElementById('cctAccentColor');
const cctColorValue = document.getElementById('cctColorValue');

// Google Material Icons - Commonly used free icons
const materialIcons = [
    // Lights & Electricity
    'lightbulb', 'lightbulb_outline', 'light_mode', 'dark_mode', 'flash_on', 
    'flash_off', 'highlight', 'brightness_medium', 'brightness_high',
    'brightness_low', 'brightness_auto', 'wb_incandescent', 'wb_sunny',
    'wb_twilight', 'electric_bolt', 'power', 'power_off', 'outlet',
    
    // Home & Building
    'home', 'apartment', 'house', 'house_siding', 'villa', 'cabin',
    'holiday_village', 'chalet', 'hotel', 'bed', 'king_bed', 'single_bed', 'cabin', 'storefront', 'store', 'local_convenience_store',
    
    // Room Types
    'living', 'bedroom_parent', 'bedroom_child', 'kitchen', 'dining',
    'bathroom', 'shower', 'bathtub', 'wash', 'yard', 'balcony', 'garage',
    
    // Appliances
    'tv', 'desktop_windows', 'desktop_mac', 'computer', 'laptop',
    'headphones', 'speaker', 'speaker_group', 'radio', 'videogame_asset',
    'gamepad', 'toys', 'smart_display', 'smart_screen', 'smart_toy',
    'microwave', 'coffee', 'coffee_maker', 'blender',
    'water_damage', 'air', 'ac_unit', 'airwave', 'heat', 'heat_pump',
    'propane_tank', 'propane', 'fireplace', 'fire_extinguisher',
    
    // Climate Control
    'thermostat', 'thermostat_auto', 'thermostat_carbon', 'device_thermostat',
    'mode_fan', 'mode_fan_off', 'air_freshener', 'air_purifier_gen',
    'dehumidifier', 'humidifier', 'humidifier_low', 'airline_seat_flat',
    'airline_seat_flat_angled', 'airline_seat_individual_suite',
    
    // Security & Safety
    'lock', 'lock_open', 'lock_reset', 'lock_clock', 'lock_person',
    'lock_outline', 'no_encryption', 'key', 'key_off', 'vpn_key',
    'password', 'pin', 'shield', 'shield_moon', 'security', 'security_update',
    'security_update_good', 'security_update_warning', 'camera_indoor',
    'camera_outdoor', 'cameraswitch', 'videocam', 'videocam_off',
    'connected_tv', 'sensor_door', 'sensor_window', 'sensors',
    'sensors_off', 'detector_alarm', 'detector_battery', 'detector_co',
    'detector_smoke', 'detector_status', 'fire_truck', 'local_fire_department',
    
    // Window & Coverings
    'window', 'curtains', 'curtains_closed', 'blinds', 'blinds_closed',
    'roller_shades', 'roller_shades_closed', 'vertical_shades',
    'vertical_shades_closed', 'solar_power', 'energy_savings_leaf',
    
    // General Controls
    'toggle_on', 'toggle_off', 'switch', 'switch_access_shortcut',
    'switch_account', 'switch_camera', 'switch_left', 'switch_right',
    'switch_video', 'settings', 'settings_accessibility', 'settings_applications',
    'settings_backup_restore', 'settings_bluetooth', 'settings_brightness',
    'settings_cell', 'settings_ethernet', 'settings_input_antenna',
    'settings_input_component', 'settings_input_hdmi', 'settings_input_svideo',
    'settings_overscan', 'settings_phone', 'settings_power', 'settings_remote',
    'settings_suggest', 'settings_system_daydream', 'settings_voice',
    
    // Entertainment
    'music_note', 'library_music', 'music_off', 'radio', 'podcasts',
    'audiotrack', 'graphic_eq', 'equalizer', 'hearing', 'hearing_disabled',
    'volume_up', 'volume_down', 'volume_mute', 'volume_off',
    
    // Kitchen & Dining
    'restaurant', 'restaurant_menu', 'local_dining', 'local_cafe',
    'local_bar', 'wine_bar', 'liquor', 'set_meal', 'bakery_dining',
    'breakfast_dining', 'dinner_dining', 'lunch_dining', 'ramen_dining',
    'takeout_dining', 'nightlife', 'night_shelter', 'nightlight',
    'nightlight_round', 'bedtime', 'bedtime_off',
    
    // Furniture
    'chair', 'chair_alt', 'weekend', 'weekend_outlined', 'sofa',
    'single_bed_outlined', 'double_bed_outlined', 'king_bed_outlined',
    'crib', 'crib_outlined', 'cradle', 'cradle_outlined',
    
    // Cleaning
    'cleaning_services', 'cleaning_bucket', 'cleaning_products',
    'cleaning_supplies', 'cleaning_tools', 'cleaning_brush',
    'vacuum', 'vacuum_outlined', 'mop', 'broom', 'laundry',
    
    // Outdoors
    'yard', 'balcony', 'garden', 'garden_cart', 'forest', 'park',
    'nature', 'nature_people', 'outdoor_garden', 'outdoor_grill',
    'grill', 'patio', 'pool', 'spa', 'hot_tub', 'umbrella',
    'beach_access', 'golf_course', 'sports_golf', 'sports_score',
    
    // Miscellaneous
    'timer', 'timer_10', 'timer_3', 'timer_off', 'alarm', 'alarm_add',
    'alarm_off', 'access_time', 'access_time_filled', 'schedule',
    'event', 'event_available', 'event_busy', 'event_note', 'event_upcoming',
    'today', 'upcoming', 'pending', 'pending_actions', 'notifications',
    'notifications_active', 'notifications_none', 'notifications_off',
    'notifications_paused', 'add_alert', 'error', 'warning', 'info',
    'help', 'help_center', 'help_outline', 'question_mark', 'quiz'
];

// Type names for display
const typeNames = {
    'toggle': 'Toggle Switch',
    'dimmer': 'Dimmer',
    'cct': 'CCT Light',
    'rgb': 'RGB Light',
    'curtain': 'Curtain',
    'sensor': 'Sensor',
    'lock': 'Lock',
    'remote': 'Remote'
};

// Filter icons based on search
function filterIcons(searchTerm) {
    return materialIcons.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Initialize the icon grid for toggle config
function initIconGrid() {
    updateIconGrid('');
    
    // Search functionality
    iconSearch.addEventListener('input', (e) => {
        updateIconGrid(e.target.value);
    });
}

// Update icon grid with filtered icons
function updateIconGrid(searchTerm) {
    iconGrid.innerHTML = '';
    
    const filteredIcons = searchTerm ? filterIcons(searchTerm) : materialIcons.slice(0, 200);
    
    filteredIcons.forEach(iconName => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.title = iconName;
        iconOption.innerHTML = `<i class="material-icons">${iconName}</i>`;
        
        iconOption.addEventListener('click', () => {
            // Remove selected class from all icons
            document.querySelectorAll('#iconGrid .icon-option').forEach(icon => {
                icon.classList.remove('selected');
            });
            
            // Add selected class to clicked icon
            iconOption.classList.add('selected');
            
            // Update selected icon
            selectedIcon = iconName;
            
            // Update display
            selectedIconDisplay.innerHTML = `
                <i class="material-icons">${selectedIcon}</i>
                <span>${selectedIcon.replace(/_/g, ' ')}</span>
            `;
        });
        
        iconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (!selectedIcon && iconGrid.firstChild) {
        iconGrid.firstChild.click();
    }
}

// Initialize CCT icon grid
function initCCTIconGrid() {
    updateCCTIconGrid('');
    
    // Search functionality
    cctIconSearch.addEventListener('input', (e) => {
        updateCCTIconGrid(e.target.value);
    });
}

// Update CCT icon grid
function updateCCTIconGrid(searchTerm) {
    cctIconGrid.innerHTML = '';
    
    const filteredIcons = searchTerm ? filterIcons(searchTerm) : materialIcons.slice(0, 200);
    
    filteredIcons.forEach(iconName => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.title = iconName;
        iconOption.innerHTML = `<i class="material-icons">${iconName}</i>`;
        
        iconOption.addEventListener('click', () => {
            // Remove selected class from all icons
            document.querySelectorAll('#cctIconGrid .icon-option').forEach(icon => {
                icon.classList.remove('selected');
            });
            
            // Add selected class to clicked icon
            iconOption.classList.add('selected');
            
            // Update selected icon
            selectedIcon = iconName;
            
            // Update display
            cctSelectedIconDisplay.innerHTML = `
                <i class="material-icons">${selectedIcon}</i>
                <span>${selectedIcon.replace(/_/g, ' ')}</span>
            `;
        });
        
        cctIconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (cctIconGrid.firstChild && !cctIconGrid.querySelector('.selected')) {
        cctIconGrid.firstChild.click();
    }
}

// Initialize color picker
function initColorPicker() {
    accentColor.addEventListener('input', (e) => {
        selectedColor = e.target.value;
        colorValue.textContent = selectedColor;
        
        // Update active preset
        colorPresets.forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === selectedColor);
        });
    });
    
    colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            selectedColor = preset.dataset.color;
            accentColor.value = selectedColor;
            colorValue.textContent = selectedColor;
            
            // Update active preset
            colorPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
        });
    });
    
    // Activate first color preset
    if (colorPresets[0]) {
        colorPresets[0].click();
    }
}

// Initialize CCT color picker
function initCCTColorPicker() {
    cctAccentColor.addEventListener('input', (e) => {
        selectedColor = e.target.value;
        cctColorValue.textContent = selectedColor;
        
        // Update active preset
        colorPresets.forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === selectedColor);
        });
    });
    
    // Also listen for clicks on color presets (they work for both forms)
    colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            selectedColor = preset.dataset.color;
            accentColor.value = selectedColor;
            colorValue.textContent = selectedColor;
            cctAccentColor.value = selectedColor;
            cctColorValue.textContent = selectedColor;
            
            // Update active preset
            colorPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
        });
    });
}

// Initialize size options
function initSizeOptions() {
    const toggleSizeOptions = document.querySelectorAll('#toggleConfig input[name="cardSize"]');
    const cctSizeOptions = document.querySelectorAll('#cctConfig input[name="cctCardSize"]');
    
    toggleSizeOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            selectedSize = e.target.value;
        });
    });
    
    cctSizeOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            selectedSize = e.target.value;
        });
    });
}

// Load saved controls from localStorage
function loadDashboard() {
    const savedControls = localStorage.getItem('dashboardControls');
    if (savedControls) {
        try {
            dashboardControls = JSON.parse(savedControls);
            renderDashboard();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            dashboardControls = [];
        }
    }
    updateEmptyState();
}

// Save controls to localStorage
function saveDashboard() {
    localStorage.setItem('dashboardControls', JSON.stringify(dashboardControls));
    showNotification('Dashboard saved locally!');
}

// Export dashboard data as JSON file
function exportDashboardData() {
    const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        dashboard: {
            name: 'Hotel Dashboard',
            description: 'Smart control dashboard',
            controls: dashboardControls,
            settings: {
                theme: 'dark',
                layout: 'grid',
                totalControls: dashboardControls.length
            }
        },
        statistics: {
            toggleSwitches: dashboardControls.filter(c => c.type === 'toggle').length,
            dimmers: dashboardControls.filter(c => c.type === 'dimmer').length,
            cctLights: dashboardControls.filter(c => c.type === 'cct').length,
            rgbLights: dashboardControls.filter(c => c.type === 'rgb').length,
            curtains: dashboardControls.filter(c => c.type === 'curtain').length,
            sensors: dashboardControls.filter(c => c.type === 'sensor').length,
            locks: dashboardControls.filter(c => c.type === 'lock').length,
            remotes: dashboardControls.filter(c => c.type === 'remote').length
        },
        metadata: {
            lastModified: new Date().toISOString(),
            createdBy: 'Hotel Dashboard Builder'
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadLink.download = `hotel-dashboard-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showNotification('Dashboard data exported successfully!');
}

// Render all controls on dashboard
function renderDashboard() {
    dashboardGrid.innerHTML = '';
    
    dashboardControls.forEach((control, index) => {
        const controlContainer = createControlContainer(control, index);
        dashboardGrid.appendChild(controlContainer);
    });
    
    updateEmptyState();
}

// Create control container with remove button
function createControlContainer(control, index) {
    const container = document.createElement('div');
    container.className = 'control-card-container';
    container.dataset.index = index;
    
    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-control-btn';
    removeBtn.innerHTML = '<i class="material-icons">close</i>';
    removeBtn.title = 'Remove control';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeControl(index);
    });
    
    // Create control element based on type
    let controlElement;
    switch(control.type) {
        case 'toggle':
            controlElement = createToggleSwitch(control);
            break;
        case 'cct':
            controlElement = createCCTLight(control);
            break;
        case 'dimmer':
        case 'rgb':
        case 'curtain':
        case 'sensor':
        case 'lock':
        case 'remote':
            controlElement = createPlaceholderControl(control);
            break;
        default:
            controlElement = createToggleSwitch(control);
    }
    
    container.appendChild(controlElement);
    container.appendChild(removeBtn);
    
    return container;
}

// Create toggle switch using the switch.js module
function createToggleSwitch(control) {
    // Calculate card height based on size
    let cardHeight;
    switch(control.size) {
        case 'small': cardHeight = '80px'; break;
        case 'medium': cardHeight = '100px'; break;
        case 'large': cardHeight = '128px'; break;
        default: cardHeight = '80px';
    }
    
    // Create toggle card using the switch.js module
    const toggleCard = window.createToggleCard({
        entityId: control.entityId,
        name: control.name,
        subtitle: control.subtitle,
        icon: `material-icons:${control.icon}`,
        accentColor: control.accentColor || '#f26f1e',
        cardHeight: cardHeight
    });
    
    return toggleCard;
}

// In control.js - Update the createCCTLight function
function createCCTLight(control) {
    // Calculate card height based on size
    let cardHeight;
    switch(control.size) {
        case 'small': cardHeight = '128px'; break;
        case 'medium': cardHeight = '140px'; break;
        case 'large': cardHeight = '160px'; break;
        default: cardHeight = '128px';
    }
    
    // Parse icon properly
    let iconConfig;
    if (control.icon.startsWith('material-icons:')) {
        // Material icon format
        iconConfig = control.icon;
    } else if (control.icon.includes('fa-')) {
        // Font Awesome format
        if (control.icon.startsWith('fas ') || control.icon.startsWith('far ') || control.icon.startsWith('fab ')) {
            iconConfig = control.icon;
        } else {
            iconConfig = `fas ${control.icon}`;
        }
    } else {
        // Default to material icon
        iconConfig = `material-icons:${control.icon}`;
    }
    
    console.log('Creating CCT card with config:', {
        entityId: control.entityId,
        name: control.name,
        subtitle: control.subtitle,
        icon: iconConfig,
        accentColor: control.accentColor,
        cardHeight: cardHeight
    });
    
    // Create CCT card using the cct-light-card.js module
    const cctCard = window.createCCTLightCard({
        entityId: control.entityId,
        name: control.name,
        subtitle: control.subtitle,
        icon: iconConfig, // Fixed: Pass the icon config properly
        accentColor: control.accentColor || '#f26f1e',
        cardHeight: cardHeight,
        showModal: true
    });
    
    return cctCard;
}

// Create placeholder for other control types
function createPlaceholderControl(control) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-control';
    
    // Map control types to material icons
    const typeIcons = {
        'dimmer': 'brightness_medium',
        'cct': 'wb_incandescent',
        'rgb': 'palette',
        'curtain': 'blinds',
        'sensor': 'sensors',
        'lock': 'lock',
        'remote': 'settings_remote'
    };
    
    const iconName = typeIcons[control.type] || 'construction';
    const typeNames = {
        'dimmer': 'Dimmer',
        'cct': 'CCT Light',
        'rgb': 'RGB Light',
        'curtain': 'Curtain',
        'sensor': 'Sensor',
        'lock': 'Lock',
        'remote': 'Remote'
    };
    
    placeholder.innerHTML = `
        <div style="
            background: rgba(0, 0, 0, 0.6);
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-family: 'Inter', sans-serif;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 10px;
        ">
            <i class="material-icons" style="font-size: 32px; color: #f26f1e;">${iconName}</i>
            <h3 style="margin: 0; font-weight: 600;">${typeNames[control.type] || 'Control'}</h3>
            <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                ${control.name || 'Control'} - Coming Soon
            </p>
        </div>
    `;
    return placeholder;
}

// Add new control from toggle form
function addControlFromForm(e) {
    e.preventDefault();
    
    const controlName = document.getElementById('controlName').value.trim();
    const controlSubtitle = document.getElementById('controlSubtitle').value.trim();
    const entityId = document.getElementById('entityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    // Validate entity ID format
    if (!entityId.includes('.')) {
        showNotification('Entity ID must be in format: domain.entity_name', 'error');
        return;
    }
    
    const newControl = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type: selectedControlType,
        name: controlName,
        subtitle: controlSubtitle,
        icon: selectedIcon,
        entityId: entityId,
        accentColor: selectedColor,
        size: selectedSize,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    dashboardControls.push(newControl);
    renderDashboard();
    closeAllModals();
    resetForm();
    saveDashboard();
    
    showNotification(`${typeNames[selectedControlType] || 'Control'} "${controlName}" added to dashboard!`);
}

// In control.js - Update addCCTControlFromForm function
function addCCTControlFromForm(e) {
    e.preventDefault();
    
    const controlName = document.getElementById('cctControlName').value.trim();
    const controlSubtitle = document.getElementById('cctControlSubtitle').value.trim();
    const entityId = document.getElementById('cctEntityId').value.trim();
    
    if (!controlName || !entityId) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    // Validate entity ID format
    if (!entityId.includes('.')) {
        showNotification('Entity ID must be in format: domain.entity_name', 'error');
        return;
    }
    
    // Get selected size
    const sizeOption = document.querySelector('input[name="cctCardSize"]:checked');
    selectedSize = sizeOption ? sizeOption.value : 'small';
    
    // Get selected color
    selectedColor = cctAccentColor.value;
    
    // Get selected icon
    const selectedIconElement = document.querySelector('#cctIconGrid .icon-option.selected');
    if (selectedIconElement) {
        selectedIcon = selectedIconElement.querySelector('.material-icons').textContent;
    } else {
        // Default icon if none selected
        selectedIcon = 'lightbulb';
    }
    
    console.log('Saving CCT control with icon:', selectedIcon);
    
    const newControl = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type: selectedControlType,
        name: controlName,
        subtitle: controlSubtitle,
        icon: `material-icons:${selectedIcon}`, // Ensure proper format
        entityId: entityId,
        accentColor: selectedColor,
        size: selectedSize,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    dashboardControls.push(newControl);
    renderDashboard();
    closeAllModals();
    resetForm();
    saveDashboard();
    
    showNotification(`${typeNames[selectedControlType] || 'Control'} "${controlName}" added to dashboard!`);
}

// Remove control from dashboard
function removeControl(index) {
    const controlName = dashboardControls[index].name;
    dashboardControls.splice(index, 1);
    renderDashboard();
    saveDashboard();
    showNotification(`"${controlName}" removed from dashboard`);
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    dashboardContent.classList.toggle('edit-mode', isEditMode);
    editBtn.innerHTML = isEditMode ? 
        '<i class="material-icons">check</i><span>Done Editing</span>' : 
        '<i class="material-icons">add</i><span>Add Control</span>';
    editBtn.style.backgroundColor = isEditMode ? '#2196F3' : '#FF9800';
    
    if (!isEditMode) {
        saveDashboard();
    }
}

// Update empty state visibility
function updateEmptyState() {
    if (dashboardControls.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style based on type
    const bgColor = type === 'error' ? '#ff4444' : 
                   type === 'info' ? '#2196F3' : '#4CAF50';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Modal functions
function openTypeSelection() {
    typeSelectionModal.classList.add('active');
}

function openToggleConfig() {
    toggleConfigModal.classList.add('active');
    initIconGrid();
    document.getElementById('controlName').focus();
}

function openCCTConfig() {
    cctConfigModal.classList.add('active');
    initCCTIconGrid();
    initCCTColorPicker();
    document.getElementById('cctControlName').focus();
}

function closeAllModals() {
    typeSelectionModal.classList.remove('active');
    toggleConfigModal.classList.remove('active');
    cctConfigModal.classList.remove('active');
}

function resetForm() {
    // Reset toggle form
    if (toggleConfigForm) toggleConfigForm.reset();
    
    // Reset CCT form
    if (cctConfigForm) cctConfigForm.reset();
    
    selectedIcon = 'lightbulb';
    selectedColor = '#f26f1e';
    selectedSize = 'small';
    selectedControlType = '';
    
    // Reset icon selection
    if (iconGrid) updateIconGrid('');
    if (cctIconGrid) updateCCTIconGrid('');
    
    // Reset color selection
    if (colorPresets[0]) {
        colorPresets.forEach(p => p.classList.remove('active'));
        colorPresets[0].click();
    }
    
    // Reset size selection
    const toggleSmall = document.querySelector('#toggleConfig input[name="cardSize"][value="small"]');
    const cctSmall = document.querySelector('#cctConfig input[name="cctCardSize"][value="small"]');
    
    if (toggleSmall) toggleSmall.checked = true;
    if (cctSmall) cctSmall.checked = true;
}

// Initialize dashboard
function initializeDashboard() {
    // Load existing dashboard
    loadDashboard();
    
    // Initialize form components
    initColorPicker();
    initCCTColorPicker();
    initSizeOptions();
    
    // Event Listeners for buttons
    editBtn.addEventListener('click', openTypeSelection);
    
    // Modal close buttons
    cancelTypeBtn.addEventListener('click', closeAllModals);
    cancelConfigBtn.addEventListener('click', () => {
        toggleConfigModal.classList.remove('active');
        typeSelectionModal.classList.add('active');
    });
    cancelCCTConfigBtn.addEventListener('click', () => {
        cctConfigModal.classList.remove('active');
        typeSelectionModal.classList.add('active');
    });
    
    // Save/Export button
    saveDashboardBtn.addEventListener('click', exportDashboardData);
    
    // Form submissions
    if (toggleConfigForm) {
        toggleConfigForm.addEventListener('submit', addControlFromForm);
    }
    if (cctConfigForm) {
        cctConfigForm.addEventListener('submit', addCCTControlFromForm);
    }
    
    // Control type selection
    controlTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            selectedControlType = card.dataset.type;
            
            // Check which type was selected
            if (selectedControlType === 'toggle') {
                typeSelectionModal.classList.remove('active');
                openToggleConfig();
            } else if (selectedControlType === 'cct') {
                typeSelectionModal.classList.remove('active');
                openCCTConfig();
            } else {
                showNotification(`${typeNames[selectedControlType]} support coming soon!`, 'info');
            }
        });
    });
    
    // Close modal when clicking outside
    typeSelectionModal.addEventListener('click', (e) => {
        if (e.target === typeSelectionModal) {
            closeAllModals();
            resetForm();
        }
    });
    
    toggleConfigModal.addEventListener('click', (e) => {
        if (e.target === toggleConfigModal) {
            closeAllModals();
            resetForm();
        }
    });
    
    cctConfigModal.addEventListener('click', (e) => {
        if (e.target === cctConfigModal) {
            closeAllModals();
            resetForm();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
            resetForm();
        }
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            saveDashboard();
        }
        if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openTypeSelection();
        }
    });
    
    // Update entity ID placeholders with examples
    const entityIdInput = document.getElementById('entityId');
    const cctEntityIdInput = document.getElementById('cctEntityId');
    
    const examples = [
        'light.living_room',
        'switch.tv',
        'input_boolean.guest_mode',
        'fan.bedroom',
        'cover.blinds'
    ];
    
    const cctExamples = [
        'light.living_room_cct',
        'light.kitchen_cct',
        'light.bedroom_cct',
        'light.dining_cct',
        'light.pantry_cct'
    ];
    
    let exampleIndex = 0;
    let cctExampleIndex = 0;
    
    if (entityIdInput) {
        setInterval(() => {
            entityIdInput.placeholder = `e.g., ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }, 3000);
    }
    
    if (cctEntityIdInput) {
        setInterval(() => {
            cctEntityIdInput.placeholder = `e.g., ${cctExamples[cctExampleIndex]}`;
            cctExampleIndex = (cctExampleIndex + 1) % cctExamples.length;
        }, 3000);
    }
    
    // Show welcome notification
    setTimeout(() => {
        if (dashboardControls.length === 0) {
            showNotification('Welcome! Click "Add Control" to create your first smart control.', 'info');
        }
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);