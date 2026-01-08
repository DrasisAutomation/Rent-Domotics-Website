// button-control.js - UI Button and Modal Logic (Updated with Dimmer Support)

// DOM Elements
let editBtn, saveDashboardBtn, typeSelectionModal, toggleConfigModal, cctConfigModal, dimmerConfigModal, lockConfigModal;
let cancelTypeBtn, cancelConfigBtn, cancelCCTConfigBtn, cancelDimmerConfigBtn, cancelLockConfigBtn;
let toggleConfigForm, cctConfigForm, dimmerConfigForm, lockConfigForm;
let iconGrid, cctIconGrid, dimmerIconGrid, lockIconGrid;
let iconSearch, cctIconSearch, dimmerIconSearch, lockIconSearch;

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
    if (iconSearch) {
        iconSearch.addEventListener('input', (e) => {
            updateIconGrid(e.target.value);
        });
    }
}

// Update icon grid with filtered icons
function updateIconGrid(searchTerm) {
    if (!iconGrid) return;
    
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
            window.selectedIcon = iconName;
            
            // Update display
            const selectedIconDisplay = document.getElementById('selectedIconDisplay');
            if (selectedIconDisplay) {
                selectedIconDisplay.innerHTML = `
                    <i class="material-icons">${iconName}</i>
                    <span>${iconName.replace(/_/g, ' ')}</span>
                `;
            }
        });
        
        iconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (!window.selectedIcon && iconGrid.firstChild) {
        iconGrid.firstChild.click();
    }
}

// Initialize CCT icon grid
function initCCTIconGrid() {
    updateCCTIconGrid('');
    
    // Search functionality
    if (cctIconSearch) {
        cctIconSearch.addEventListener('input', (e) => {
            updateCCTIconGrid(e.target.value);
        });
    }
}

// Update CCT icon grid
function updateCCTIconGrid(searchTerm) {
    if (!cctIconGrid) return;
    
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
            window.selectedIcon = iconName;
            
            // Update display
            const cctSelectedIconDisplay = document.getElementById('cctSelectedIconDisplay');
            if (cctSelectedIconDisplay) {
                cctSelectedIconDisplay.innerHTML = `
                    <i class="material-icons">${iconName}</i>
                    <span>${iconName.replace(/_/g, ' ')}</span>
                `;
            }
        });
        
        cctIconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (cctIconGrid.firstChild && !cctIconGrid.querySelector('.selected')) {
        cctIconGrid.firstChild.click();
    }
}

// Initialize dimmer icon grid
function initDimmerIconGrid() {
    updateDimmerIconGrid('');
    
    // Search functionality
    if (dimmerIconSearch) {
        dimmerIconSearch.addEventListener('input', (e) => {
            updateDimmerIconGrid(e.target.value);
        });
    }
}

// Update dimmer icon grid
function updateDimmerIconGrid(searchTerm) {
    if (!dimmerIconGrid) return;
    
    dimmerIconGrid.innerHTML = '';
    
    const filteredIcons = searchTerm ? filterIcons(searchTerm) : materialIcons.slice(0, 200);
    
    filteredIcons.forEach(iconName => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.title = iconName;
        iconOption.innerHTML = `<i class="material-icons">${iconName}</i>`;
        
        iconOption.addEventListener('click', () => {
            // Remove selected class from all icons
            document.querySelectorAll('#dimmerIconGrid .icon-option').forEach(icon => {
                icon.classList.remove('selected');
            });
            
            // Add selected class to clicked icon
            iconOption.classList.add('selected');
            
            // Update selected icon
            window.selectedIcon = iconName;
            
            // Update display
            const dimmerSelectedIconDisplay = document.getElementById('dimmerSelectedIconDisplay');
            if (dimmerSelectedIconDisplay) {
                dimmerSelectedIconDisplay.innerHTML = `
                    <i class="material-icons">${iconName}</i>
                    <span>${iconName.replace(/_/g, ' ')}</span>
                `;
            }
        });
        
        dimmerIconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (dimmerIconGrid.firstChild && !dimmerIconGrid.querySelector('.selected')) {
        dimmerIconGrid.firstChild.click();
    }
}

// Initialize lock icon grid
function initLockIconGrid() {
    updateLockIconGrid('');
    
    // Search functionality
    if (lockIconSearch) {
        lockIconSearch.addEventListener('input', (e) => {
            updateLockIconGrid(e.target.value);
        });
    }
}

// Update lock icon grid
function updateLockIconGrid(searchTerm) {
    if (!lockIconGrid) return;
    
    lockIconGrid.innerHTML = '';
    
    const filteredIcons = searchTerm ? filterIcons(searchTerm) : materialIcons.slice(0, 200);
    
    filteredIcons.forEach(iconName => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.title = iconName;
        iconOption.innerHTML = `<i class="material-icons">${iconName}</i>`;
        
        iconOption.addEventListener('click', () => {
            // Remove selected class from all icons
            document.querySelectorAll('#lockIconGrid .icon-option').forEach(icon => {
                icon.classList.remove('selected');
            });
            
            // Add selected class to clicked icon
            iconOption.classList.add('selected');
            
            // Update selected icon
            window.selectedIcon = iconName;
            
            // Update display
            const lockSelectedIconDisplay = document.getElementById('lockSelectedIconDisplay');
            if (lockSelectedIconDisplay) {
                lockSelectedIconDisplay.innerHTML = `
                    <i class="material-icons">${iconName}</i>
                    <span>${iconName.replace(/_/g, ' ')}</span>
                `;
            }
        });
        
        lockIconGrid.appendChild(iconOption);
    });
    
    // Select first icon by default if none selected
    if (lockIconGrid.firstChild && !lockIconGrid.querySelector('.selected')) {
        lockIconGrid.firstChild.click();
    }
}

// Modal functions
function openTypeSelection() {
    if (typeSelectionModal) {
        typeSelectionModal.classList.add('active');
    }
}

function openToggleConfig() {
    if (toggleConfigModal) {
        toggleConfigModal.classList.add('active');
        initIconGrid();
        const controlName = document.getElementById('controlName');
        if (controlName) controlName.focus();
    }
}

function openCCTConfig() {
    if (cctConfigModal) {
        cctConfigModal.classList.add('active');
        initCCTIconGrid();
        const controlName = document.getElementById('cctControlName');
        if (controlName) controlName.focus();
    }
}

function openDimmerConfig() {
    // Ensure dimmer modal exists
    if (!dimmerConfigModal) {
        console.error("Dimmer config modal not found!");
        return;
    }
    
    if (dimmerConfigModal) {
        dimmerConfigModal.classList.add('active');
        initDimmerIconGrid();
        const controlName = document.getElementById('dimmerControlName');
        if (controlName) controlName.focus();
    }
}

function openLockConfig() {
    if (lockConfigModal) {
        lockConfigModal.classList.add('active');
        initLockIconGrid();
        const controlName = document.getElementById('lockControlName');
        if (controlName) controlName.focus();
    }
}

// Initialize UI components
function initializeUI() {
    // Cache DOM elements
    editBtn = document.getElementById('editBtn');
    saveDashboardBtn = document.getElementById('saveDashboardBtn');
    typeSelectionModal = document.getElementById('typeSelectionModal');
    toggleConfigModal = document.getElementById('toggleConfigModal');
    cctConfigModal = document.getElementById('cctConfigModal');
    dimmerConfigModal = document.getElementById('dimmerConfigModal');
    lockConfigModal = document.getElementById('lockConfigModal');
    cancelTypeBtn = document.getElementById('cancelTypeBtn');
    cancelConfigBtn = document.getElementById('cancelConfigBtn');
    cancelCCTConfigBtn = document.getElementById('cancelCCTConfigBtn');
    cancelDimmerConfigBtn = document.getElementById('cancelDimmerConfigBtn');
    cancelLockConfigBtn = document.getElementById('cancelLockConfigBtn');
    toggleConfigForm = document.getElementById('toggleConfigForm');
    cctConfigForm = document.getElementById('cctConfigForm');
    dimmerConfigForm = document.getElementById('dimmerConfigForm');
    lockConfigForm = document.getElementById('lockConfigForm');
    iconGrid = document.getElementById('iconGrid');
    cctIconGrid = document.getElementById('cctIconGrid');
    dimmerIconGrid = document.getElementById('dimmerIconGrid');
    lockIconGrid = document.getElementById('lockIconGrid');
    iconSearch = document.getElementById('iconSearch');
    cctIconSearch = document.getElementById('cctIconSearch');
    dimmerIconSearch = document.getElementById('dimmerIconSearch');
    lockIconSearch = document.getElementById('lockIconSearch');
    
    // Remove color picker and size options from HTML if they exist
    const colorPickers = document.querySelectorAll('.color-picker, .color-presets, .size-options');
    colorPickers.forEach(element => {
        if (element && element.parentElement) {
            element.parentElement.removeChild(element);
        }
    });
    
    // Remove color input fields
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        if (input && input.parentElement) {
            input.parentElement.removeChild(input);
        }
    });
    
    // Event Listeners for buttons
    if (editBtn) {
        editBtn.addEventListener('click', openTypeSelection);
    }
    
    // Modal close buttons
    if (cancelTypeBtn) {
        cancelTypeBtn.addEventListener('click', window.closeAllModals);
    }
    
    if (cancelConfigBtn) {
        cancelConfigBtn.addEventListener('click', () => {
            if (toggleConfigModal) toggleConfigModal.classList.remove('active');
            if (typeSelectionModal) typeSelectionModal.classList.add('active');
        });
    }
    
    if (cancelCCTConfigBtn) {
        cancelCCTConfigBtn.addEventListener('click', () => {
            if (cctConfigModal) cctConfigModal.classList.remove('active');
            if (typeSelectionModal) typeSelectionModal.classList.add('active');
        });
    }
    
    if (cancelDimmerConfigBtn) {
        cancelDimmerConfigBtn.addEventListener('click', () => {
            if (dimmerConfigModal) dimmerConfigModal.classList.remove('active');
            if (typeSelectionModal) typeSelectionModal.classList.add('active');
        });
    }
    
    if (cancelLockConfigBtn) {
        cancelLockConfigBtn.addEventListener('click', () => {
            if (lockConfigModal) lockConfigModal.classList.remove('active');
            if (typeSelectionModal) typeSelectionModal.classList.add('active');
        });
    }
    
    // Save/Export button
    if (saveDashboardBtn) {
        saveDashboardBtn.addEventListener('click', window.exportDashboardData);
    }
    
    // Form submissions
    if (toggleConfigForm) {
        toggleConfigForm.addEventListener('submit', window.addControlFromForm);
    }
    
    if (cctConfigForm) {
        cctConfigForm.addEventListener('submit', window.addCCTControlFromForm);
    }
    
    if (dimmerConfigForm) {
        dimmerConfigForm.addEventListener('submit', window.addDimmerControlFromForm);
    }
    
    if (lockConfigForm) {
        lockConfigForm.addEventListener('submit', window.addLockControlFromForm);
    }
    
    // Control type selection
    const controlTypeCards = document.querySelectorAll('.control-type-card');
    controlTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            window.selectedControlType = card.dataset.type;
            
            // Check which type was selected
            if (window.selectedControlType === 'toggle') {
                if (typeSelectionModal) typeSelectionModal.classList.remove('active');
                openToggleConfig();
            } else if (window.selectedControlType === 'cct') {
                if (typeSelectionModal) typeSelectionModal.classList.remove('active');
                openCCTConfig();
            } else if (window.selectedControlType === 'dimmer') {
                if (typeSelectionModal) typeSelectionModal.classList.remove('active');
                openDimmerConfig();
            } else if (window.selectedControlType === 'lock') {
                if (typeSelectionModal) typeSelectionModal.classList.remove('active');
                openLockConfig();
            } else {
                window.showNotification(`${window.typeNames[window.selectedControlType]} support coming soon!`, 'info');
            }
        });
    });
    
    // Close modal when clicking outside
    if (typeSelectionModal) {
        typeSelectionModal.addEventListener('click', (e) => {
            if (e.target === typeSelectionModal) {
                window.closeAllModals();
                window.resetForm();
            }
        });
    }
    
    if (toggleConfigModal) {
        toggleConfigModal.addEventListener('click', (e) => {
            if (e.target === toggleConfigModal) {
                window.closeAllModals();
                window.resetForm();
            }
        });
    }
    
    if (cctConfigModal) {
        cctConfigModal.addEventListener('click', (e) => {
            if (e.target === cctConfigModal) {
                window.closeAllModals();
                window.resetForm();
            }
        });
    }
    
    if (dimmerConfigModal) {
        dimmerConfigModal.addEventListener('click', (e) => {
            if (e.target === dimmerConfigModal) {
                window.closeAllModals();
                window.resetForm();
            }
        });
    }
    
    if (lockConfigModal) {
        lockConfigModal.addEventListener('click', (e) => {
            if (e.target === lockConfigModal) {
                window.closeAllModals();
                window.resetForm();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeAllModals();
            window.resetForm();
        }
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            window.saveDashboard();
        }
        if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openTypeSelection();
        }
    });
    
    // Update entity ID placeholders with examples
    const entityIdInput = document.getElementById('entityId');
    const cctEntityIdInput = document.getElementById('cctEntityId');
    const dimmerEntityIdInput = document.getElementById('dimmerEntityId');
    const lockEntityIdInput = document.getElementById('lockEntityId');
    
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
    
    const dimmerExamples = [
        'light.living_room',
        'light.kitchen',
        'light.bedroom',
        'light.dining_room',
        'light.porch'
    ];
    
    const lockExamples = [
        'lock.front_door',
        'lock.back_door',
        'lock.garage',
        'lock.gate',
        'lock.main_entrance'
    ];
    
    let exampleIndex = 0;
    let cctExampleIndex = 0;
    let dimmerExampleIndex = 0;
    let lockExampleIndex = 0;
    
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
    
    if (dimmerEntityIdInput) {
        setInterval(() => {
            dimmerEntityIdInput.placeholder = `e.g., ${dimmerExamples[dimmerExampleIndex]}`;
            dimmerExampleIndex = (dimmerExampleIndex + 1) % dimmerExamples.length;
        }, 3000);
    }
    
    if (lockEntityIdInput) {
        setInterval(() => {
            lockEntityIdInput.placeholder = `e.g., ${lockExamples[lockExampleIndex]}`;
            lockExampleIndex = (lockExampleIndex + 1) % lockExamples.length;
        }, 3000);
    }
    
    // Log initialization
    console.log('Button control UI initialized successfully');
    console.log('Available control types:', Object.keys(window.typeNames || {}));
}

// Ensure dimmer config modal exists in DOM (if not already in HTML)
function ensureDimmerConfigModal() {
    if (!document.getElementById('dimmerConfigModal')) {
        console.warn('Dimmer config modal not found in HTML, creating dynamically...');
        
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
        
        // Re-initialize to cache new elements
        initializeUI();
    }
}

// Ensure lock config modal exists in DOM (if not already in HTML)
function ensureLockConfigModal() {
    if (!document.getElementById('lockConfigModal')) {
        console.warn('Lock config modal not found in HTML, creating dynamically...');
        
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
        
        // Re-initialize to cache new elements
        initializeUI();
    }
}

// Export UI functions
window.openTypeSelection = openTypeSelection;
window.openToggleConfig = openToggleConfig;
window.openCCTConfig = openCCTConfig;
window.openDimmerConfig = openDimmerConfig;
window.openLockConfig = openLockConfig;
window.initializeUI = initializeUI;
window.ensureDimmerConfigModal = ensureDimmerConfigModal;
window.ensureLockConfigModal = ensureLockConfigModal;
window.initDimmerIconGrid = initDimmerIconGrid;
window.updateDimmerIconGrid = updateDimmerIconGrid;
window.initLockIconGrid = initLockIconGrid;
window.updateLockIconGrid = updateLockIconGrid;