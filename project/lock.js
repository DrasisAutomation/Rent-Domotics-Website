// lock.js - Lock Card Module with Home Assistant integration

// Create a lock card with Home Assistant integration
function createLockCard(config = {}) {
    const defaultConfig = {
        entityId: config.entityId || "lock.front_door",
        name: config.name || "Lock",
        subtitle: config.subtitle || "Connecting to Home Assistant...",
        icon: config.icon || "material-icons:lock",
        cardWidth: config.cardWidth || "100%",
        cardHeight: config.cardHeight || "80px",
        accentLocked: config.accentLocked || "#4CAF50",
        accentUnlocked: config.accentUnlocked || "#F44336",
        accentProcessing: config.accentProcessing || "#FFC107"
    };
    
    // Extract icon name from config
    let iconClass = 'material-icons';
    let iconName = 'lock';
    
    if (defaultConfig.icon.startsWith('material-icons:')) {
        iconName = defaultConfig.icon.split(':')[1];
    } else if (defaultConfig.icon.includes('fa-')) {
        iconClass = defaultConfig.icon;
        iconName = '';
    }
    
    // Generate unique ID for this card
    const cardId = `lock-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'mc-toggle-card lock-card';
    cardContainer.id = cardId;
    cardContainer.style.setProperty('--card-width', defaultConfig.cardWidth);
    cardContainer.style.setProperty('--card-height', defaultConfig.cardHeight);
    cardContainer.style.setProperty('--accent-locked', defaultConfig.accentLocked);
    cardContainer.style.setProperty('--accent-unlocked', defaultConfig.accentUnlocked);
    cardContainer.style.setProperty('--accent-processing', defaultConfig.accentProcessing);
    cardContainer.setAttribute('data-entity-id', defaultConfig.entityId);
    
    // Create card HTML
    cardContainer.innerHTML = `
        <div class="light-card locked" data-entity-id="${defaultConfig.entityId}">
            <div class="card-content">
                <div class="left">
                    <div class="icon-wrap" aria-hidden="true">
                        <i class="${iconClass}">${iconName}</i>
                    </div>
                    <div class="meta">
                        <div class="name" id="cardName">${defaultConfig.name}</div>
                        <div class="sub" id="cardSub">${defaultConfig.subtitle}</div>
                    </div>
                </div>

                <div class="status-container">
                    <div class="status" id="statusText">LOCKED</div>
                    <label class="lock-toggle">
                        <input class="cb" type="checkbox" />
                        <span class="lock-label">
                            <span class="lock-wrapper">
                                <span class="shackle"></span>
                                <svg
                                    class="lock-body"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 28 28"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M0 5C0 2.23858 2.23858 0 5 0H23C25.7614 0 28 2.23858 28 5V23C28 25.7614 25.7614 28 23 28H5C2.23858 28 0 25.7614 0 23V5ZM16 13.2361C16.6137 12.6868 17 11.8885 17 11C17 9.34315 15.6569 8 14 8C12.3431 8 11 9.34315 11 11C11 11.8885 11.3863 12.6868 12 13.2361V18C12 19.1046 12.8954 20 14 20C15.1046 20 16 19.1046 16 18V13.2361Z"
                                        fill="white"
                                    ></path>
                                </svg>
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS styles with dynamic colors
    addLockStyles(
        defaultConfig.accentLocked, 
        defaultConfig.accentUnlocked, 
        defaultConfig.accentProcessing, 
        cardId
    );
    
    // Initialize the lock functionality
    setTimeout(() => {
        initializeLock(cardContainer, defaultConfig);
    }, 100);
    
    return cardContainer;
}

// Add lock CSS styles to document with dynamic colors
function addLockStyles(accentLocked, accentUnlocked, accentProcessing, cardId) {
    const styleId = `lock-styles-${cardId}`;
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getLockCSS(accentLocked, accentUnlocked, accentProcessing, cardId);
    document.head.appendChild(style);
}

// Get lock CSS as string with dynamic colors
function getLockCSS(accentLocked, accentUnlocked, accentProcessing, cardId) {
    // Convert hex to RGB for glow effects
    const rgbLocked = hexToRgb(accentLocked);
    const rgbUnlocked = hexToRgb(accentUnlocked);
    const rgbProcessing = hexToRgb(accentProcessing);
    
    const rgbLockedString = rgbLocked ? `${rgbLocked.r}, ${rgbLocked.g}, ${rgbLocked.b}` : '76, 175, 80';
    const rgbUnlockedString = rgbUnlocked ? `${rgbUnlocked.r}, ${rgbUnlocked.g}, ${rgbUnlocked.b}` : '244, 67, 54';
    const rgbProcessingString = rgbProcessing ? `${rgbProcessing.r}, ${rgbProcessing.g}, ${rgbProcessing.b}` : '255, 193, 7';
    
    return `
        /* MC Lock Card Styles for ${cardId} */
        #${cardId} {
            --accent-locked: ${accentLocked};
            --accent-unlocked: ${accentUnlocked};
            --accent-processing: ${accentProcessing};
            --accent-locked-rgb: ${rgbLockedString};
            --accent-unlocked-rgb: ${rgbUnlockedString};
            --accent-processing-rgb: ${rgbProcessingString};
        }

        #${cardId}.mc-toggle-card {
            --bg-off: rgba(0, 0, 0, 0.6);
            --muted: rgba(255, 255, 255, 0.85);
            --corner: 14px;
            --top-padding: 0px;
            display: block;
            width: 100%;
            box-sizing: border-box;
            max-width: 520px;
            margin: 0 auto;
        }

        #${cardId} .light-card {
            width: 100%;
            max-width: 520px;
            height: 80px !important;
            border-radius: var(--corner);
            position: relative;
            overflow: hidden;
            user-select: none;
            -webkit-user-select: none;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.02);
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 12px 16px;
            background: var(--bg-off);
            font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            box-sizing: border-box;
            margin: var(--top-padding) auto 0 auto;
            cursor: pointer;
            border-radius:14px;
        }

        /* LOCKED = WHITE BG + GREEN THEME */
        #${cardId} .light-card.locked {
            background: rgba(255, 255, 255, 0.95) !important;
        }

        /* UNLOCKED = BLACK BG + RED THEME */
        #${cardId} .light-card.unlocked {
            background: rgba(0, 0, 0, 0.6) !important;
        }

        /* PROCESSING = DARK BG + YELLOW THEME */
        #${cardId} .light-card.processing {
            background: rgba(30, 30, 30, 0.95) !important;
        }

        #${cardId} .card-content {
            display: flex;
            align-items: center;
            width: 100%;
            position: relative;
            box-sizing: border-box;
        }

        #${cardId} .left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        #${cardId} .icon-wrap {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            transition: all 0.3s ease;
            box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.35);
        }

        #${cardId} .icon-wrap i {
            font-size: 25px;
            transition: all 0.3s ease;
        }

        /* LOCKED = GREEN ICON */
        #${cardId} .light-card.locked .icon-wrap {
            background: rgba(var(--accent-locked-rgb), 0.2) !important;
        }

        #${cardId} .light-card.locked .icon-wrap i {
            color: var(--accent-locked) !important;
            filter: drop-shadow(0 0 6px rgba(var(--accent-locked-rgb), 0.6));
        }

        /* UNLOCKED = RED ICON */
        #${cardId} .light-card.unlocked .icon-wrap {
            background: rgba(var(--accent-unlocked-rgb), 0.1) !important;
        }

        #${cardId} .light-card.unlocked .icon-wrap i {
            color: var(--accent-unlocked) !important;
            filter: none;
        }

        /* PROCESSING = YELLOW ICON */
        #${cardId} .light-card.processing .icon-wrap {
            background: rgba(var(--accent-processing-rgb), 0.1) !important;
        }

        #${cardId} .light-card.processing .icon-wrap i {
            color: var(--accent-processing) !important;
            filter: none;
        }

        #${cardId} .meta {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1;
            overflow: hidden;
        }

        #${cardId} .name {
            font-weight: 600;
            font-size: 14px;
            line-height: 1;
            color: white;
            transition: color 0.18s ease;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            mix-blend-mode: difference;
            min-height: 16px;
        }

        /* LOCKED = GREEN TEXT */
        #${cardId} .light-card.locked .name {
            color: var(--accent-locked) !important;
            mix-blend-mode: normal;
        }

        /* UNLOCKED = RED TEXT */
        #${cardId} .light-card.unlocked .name {
            color: var(--accent-unlocked) !important;
            mix-blend-mode: normal;
        }

        /* PROCESSING = YELLOW TEXT */
        #${cardId} .light-card.processing .name {
            color: var(--accent-processing) !important;
            mix-blend-mode: normal;
        }

        #${cardId} .sub {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            mix-blend-mode: difference;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        #${cardId} .light-card.locked .sub {
            color: #666 !important;
        }

        #${cardId} .light-card.unlocked .sub {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        #${cardId} .light-card.processing .sub {
            color: var(--accent-processing) !important;
        }

        #${cardId} .status-container {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        #${cardId} .status {
            font-weight: 700;
            font-size: 13px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            min-width: 60px;
            text-align: right;
        }

        /* LOCKED = GREEN STATUS */
        #${cardId} .light-card.locked .status {
            color: var(--accent-locked) !important;
        }

        /* UNLOCKED = RED STATUS */
        #${cardId} .light-card.unlocked .status {
            color: var(--accent-unlocked) !important;
        }

        /* PROCESSING = YELLOW STATUS */
        #${cardId} .light-card.processing .status {
            color: var(--accent-processing) !important;
        }

        /* Lock Toggle Switch */
        #${cardId} .lock-toggle {
            font-size: 14px;
            position: relative;
            display: inline-block;
            user-select: none;
            flex-shrink: 0;
            cursor: pointer;
        }

        #${cardId} .lock-toggle .cb {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
        }

        #${cardId} .lock-label {
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s;
        }

          #${cardId} .lock-wrapper {
            width: fit-content;
            height: fit-content;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transform: rotate(-10deg);
            position: relative; /* Add this */
        }

        #${cardId} .shackle {
            background-color: transparent;
            height: 9px;
            width: 14px;
            border-top-right-radius: 10px;
            border-top-left-radius: 10px;
            border-top: 3px solid white;
            border-left: 3px solid white;
            border-right: 3px solid white;
            transition: all 0.3s;
            transform-origin: right;
            transform: rotateY(0deg) translateX(0px);
            position: relative; /* Add this */
            top: 7px; /* Change this value to move shackle down relative to body */
        }

        /* UNLOCKED STATE - Shackle stays open */
        #${cardId} .light-card.unlocked .lock-wrapper .shackle {
            transform: rotateY(150deg) translateX(3px) !important;
        }

        #${cardId} .lock-body {
            width: 15px;
        }

        /* LOCKED = GREEN LOCK TOGGLE */
        #${cardId} .light-card.locked .lock-label {
            background-color: var(--accent-locked) !important;
        }

        /* UNLOCKED = RED LOCK TOGGLE */
        #${cardId} .light-card.unlocked .lock-label {
            background-color: var(--accent-unlocked) !important;
        }

        /* PROCESSING = YELLOW LOCK TOGGLE */
        #${cardId} .light-card.processing .lock-label {
            background-color: var(--accent-processing) !important;
        }

        /* Simple click animation */
        #${cardId} .lock-label:active {
            transform: scale(0.9);
        }

        /* Loading state - simple */
        #${cardId} .light-card.processing .lock-label {
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }

        @media (max-width: 600px) {
            #${cardId} .light-card {
                height: 88px;
                padding: 10px 12px;
            }

            #${cardId} .left {
                gap: 10px;
            }

            #${cardId} .icon-wrap {
                width: 44px;
                height: 44px;
            }

            #${cardId} .icon-wrap i {
                font-size: 22px;
            }

            #${cardId} .name {
                font-size: 15px;
            }

            #${cardId} .sub {
                font-size: 11px;
            }

            #${cardId} .status {
                font-size: 12px;
            }

            #${cardId} .lock-label {
                width: 42px;
                height: 42px;
            }
        }

        @media (max-width: 420px) {
            #${cardId} .light-card {
                height: 88px;
                padding: 8px 10px;
            }

            #${cardId} .icon-wrap {
                width: 40px;
                height: 40px;
            }

            #${cardId} .icon-wrap i {
                font-size: 20px;
            }

            #${cardId} .name {
                font-size: 14px;
            }

            #${cardId} .sub {
                font-size: 10px;
            }

            #${cardId} .status {
                font-size: 11px;
                min-width: 55px;
            }

            #${cardId} .lock-label {
                width: 40px;
                height: 40px;
                border-radius: 12px;
            }
        }

        @media (max-width: 360px) {
            #${cardId} .light-card {
                height: 84px;
                padding: 6px 8px;
            }

            #${cardId} .left {
                gap: 8px;
            }

            #${cardId} .icon-wrap {
                width: 36px;
                height: 36px;
            }

            #${cardId} .icon-wrap i {
                font-size: 18px;
            }

            #${cardId} .name {
                font-size: 13px;
            }

            #${cardId} .sub {
                font-size: 9px;
            }

            #${cardId} .lock-label {
                width: 38px;
                height: 38px;
                border-radius: 10px;
            }
        }
    `;
}

// Convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Initialize lock functionality
function initializeLock(cardContainer, config) {
    const lightCard = cardContainer.querySelector('.light-card');
    const toggleCheckbox = cardContainer.querySelector('.cb');
    const lockToggle = cardContainer.querySelector('.lock-toggle');
    const statusText = cardContainer.querySelector('.status');
    const cardName = cardContainer.querySelector('.name');
    const cardSub = cardContainer.querySelector('.sub');
    const cardIcon = cardContainer.querySelector('.icon-wrap i');
    const entityId = config.entityId;
    
    // State
    let ws = null;
    let isConnected = false;
    let entityData = null;
    let isToggling = false;
    
    // Connect to Home Assistant WebSocket
    function connectWebSocket() {
        if (!window.HA_CONFIG || !window.HA_CONFIG.WS_URL || !window.HA_CONFIG.TOKEN) {
            console.error("Home Assistant configuration not found. Please set window.HA_CONFIG");
            cardSub.textContent = "Configuration error";
            return;
        }
        
        console.log(`Connecting to Home Assistant WebSocket for ${entityId}...`);

        try {
            ws = new WebSocket(window.HA_CONFIG.WS_URL);

            ws.onopen = () => {
                console.log("WebSocket connected to Home Assistant");
                cardSub.textContent = "Authenticating...";
                ws.send(JSON.stringify({
                    type: "auth",
                    access_token: window.HA_CONFIG.TOKEN
                }));
            };

            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);

                    if (data.type === "auth_ok") {
                        console.log("Authentication successful");
                        isConnected = true;
                        cardSub.textContent = "Connected, fetching state...";

                        // Get initial state
                        setTimeout(() => {
                            ws.send(JSON.stringify({
                                id: 1,
                                type: "get_states"
                            }));

                            // Subscribe to changes
                            setTimeout(() => {
                                ws.send(JSON.stringify({
                                    id: 2,
                                    type: "subscribe_events",
                                    event_type: "state_changed"
                                }));
                            }, 100);
                        }, 100);
                    }
                    else if (data.type === "result" && data.id === 1) {
                        if (data.success && data.result) {
                            const entity = data.result.find(e => e.entity_id === entityId);
                            if (entity) {
                                entityData = entity;
                                updateEntityUI();
                                updateUI();
                                console.log(`Initial state: ${entity.state}`);
                            } else {
                                cardSub.textContent = "Entity not found";
                                console.error(`Entity ${entityId} not found`);
                            }
                        }
                    }
                    else if (data.type === "event" && data.event?.event_type === "state_changed") {
                        if (data.event.data.entity_id === entityId) {
                            entityData = data.event.data.new_state;
                            updateEntityUI();
                            updateUI();
                            console.log(`State changed to: ${entityData.state}`);
                            
                            // Reset toggling flag when state update is received
                            isToggling = false;
                            lightCard.classList.remove('processing');
                        }
                    }
                    else if (data.type === "result" && data.id && data.id > 10) {
                        // This is likely a service call result
                        if (data.success) {
                            console.log("Service call successful");
                        } else {
                            console.error("Service call failed:", data.error);
                            // Reset toggling flag on failure
                            isToggling = false;
                            lightCard.classList.remove('processing');
                            cardSub.textContent = "Error, please try again";
                            // Revert to actual state
                            if (entityData) {
                                updateUI();
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error processing WebSocket message:", error);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                isConnected = false;
                cardSub.textContent = "Connection error";
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                isConnected = false;
                cardSub.textContent = "Disconnected, reconnecting...";

                // Try to reconnect after 3 seconds
                setTimeout(connectWebSocket, 3000);
            };
        } catch (error) {
            console.error("Error connecting to WebSocket:", error);
            cardSub.textContent = "Connection failed";
        }
    }
    
    // Update entity UI with name and info
function updateEntityUI() {
    if (entityData) {
        // Use friendly_name if available, otherwise use entity_id
        const friendlyName = entityData.attributes?.friendly_name || entityId.replace('lock.', '');
        
        // Use the subtitle from config if available, otherwise fallback
        const subtitleText = config.subtitle || `Connected to Home Assistant`;
        
        cardName.textContent = friendlyName;
        cardSub.textContent = subtitleText;
    }
}
    
    // Update UI based on actual state from Home Assistant
 function updateUI() {
    if (!entityData) return;
    
    const state = entityData.state;
    
    // Update everything based on actual state
    if (state === "locked") {
        lightCard.className = 'light-card locked';
        statusText.textContent = 'LOCKED';
        cardIcon.textContent = 'lock';
    } else if (state === "unlocked") {
        lightCard.className = 'light-card unlocked';
        statusText.textContent = 'UNLOCKED';
        cardIcon.textContent = 'lock_open';
    } else {
        // Other states like jammed, locking, unlocking
        lightCard.className = 'light-card processing';
        statusText.textContent = 'PROCESSING';
        cardIcon.textContent = 'lock';
    }

    // Update toggle checkbox state
    toggleCheckbox.checked = state === "unlocked";
    
    // Update subtitle - use the config subtitle
    if (state === "locked" || state === "unlocked") {
        const subtitleText = config.subtitle || `Connected to Home Assistant`;
        cardSub.textContent = subtitleText;
    }
}
    
    // Show processing state
    function showProcessingState() {
        // Show processing state with lock icon
        lightCard.className = 'light-card processing';
        statusText.textContent = 'PROCESSING';
        cardIcon.textContent = 'lock';
        cardSub.textContent = 'Processing command...';
        
        // Update toggle checkbox based on current target state
        const currentState = entityData ? entityData.state : 'locked';
        toggleCheckbox.checked = currentState === "locked"; // Will toggle to opposite
    }
    
    // Toggle lock function
    function toggleLock() {
        if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
            console.log("Not connected to Home Assistant");
            cardSub.textContent = "Not connected";
            return;
        }

        if (!entityData) {
            console.log("Entity data not available");
            cardSub.textContent = "Entity data unavailable";
            return;
        }

        // Prevent rapid toggling
        if (isToggling) {
            console.log("Toggle in progress, please wait...");
            return;
        }
        
        isToggling = true;
        
        // Show processing state with lock icon
        showProcessingState();
        
        // Determine what service to call based on CURRENT state
        const currentState = entityData.state;
        const service = currentState === "locked" ? "unlock" : "lock";
        
        // Call Home Assistant service to lock/unlock
        ws.send(JSON.stringify({
            id: Date.now(),
            type: "call_service",
            domain: "lock",
            service: service,
            service_data: {
                entity_id: entityId
            }
        }));

        console.log(`Sending ${service} command for ${entityId}`);
        
        // Set a timeout to reset the toggling flag if no response
        setTimeout(() => {
            if (isToggling) {
                console.log("Toggle timeout, resetting flag");
                isToggling = false;
                lightCard.classList.remove('processing');
                if (entityData) {
                    updateUI();
                    cardSub.textContent = `Connected to Home Assistant`;
                }
            }
        }, 3000);
    }
    
    // Attach event listeners
    function attachEventListeners() {
        // Toggle ONLY on lock toggle click
        lockToggle.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            toggleLock();
        });

        // Prevent card click from toggling
        lightCard.addEventListener('click', (ev) => {
            if (!ev.target.closest('.lock-toggle')) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        });

        // Keyboard support only for lock toggle
        lockToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleLock();
            }
        });

        // Make lock toggle focusable
        lockToggle.setAttribute('tabindex', '0');
    }
    
    // Initialize
    function initialize() {
        attachEventListeners();
        connectWebSocket();
    }
    
    // Start initialization
    initialize();
}

// Export functions for use in other modules
window.createLockCard = createLockCard;

// Auto-initialize cards if data attributes are present
document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with data-lock-card attribute
    const lockCardElements = document.querySelectorAll('[data-lock-card]');
    
    lockCardElements.forEach(element => {
        try {
            const config = {
                entityId: element.getAttribute('data-entity-id') || "lock.front_door",
                name: element.getAttribute('data-name') || "Lock",
                subtitle: element.getAttribute('data-subtitle') || "Connecting to Home Assistant...",
                icon: element.getAttribute('data-icon') || "material-icons:lock",
                cardWidth: element.getAttribute('data-card-width') || "100%",
                cardHeight: element.getAttribute('data-card-height') || "80px",
                accentLocked: element.getAttribute('data-accent-locked') || "#4CAF50",
                accentUnlocked: element.getAttribute('data-accent-unlocked') || "#F44336",
                accentProcessing: element.getAttribute('data-accent-processing') || "#FFC107"
            };
            
            const lockCard = createLockCard(config);
            element.appendChild(lockCard);
        } catch (error) {
            console.error("Error creating lock card:", error);
        }
    });
});