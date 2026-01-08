// cct-light-card.js - CCT Light Card Module with Home Assistant Integration
// FIXED VERSION - Gradient shows immediately while dragging, no modal

// Create a CCT light card with Home Assistant integration
function createCCTLightCard(config = {}) {
    const defaultConfig = {
        entityId: config.entityId || "light.pantry_cct_lighr_exp_room_entrance_light",
        name: config.name || "CCT Light",
        subtitle: config.subtitle || "Drag to adjust",
        icon: config.icon || "material-icons:lightbulb",
        cardWidth: config.cardWidth || "100%",
        cardHeight: config.cardHeight || "148px",
        accentColor: config.accentColor || "#f26f1e"
    };

    // Parse icon configuration
    let iconClass = 'material-icons';
    let iconName = 'lightbulb';

    if (defaultConfig.icon.startsWith('material-icons:')) {
        iconName = defaultConfig.icon.split(':')[1];
    } else if (defaultConfig.icon.startsWith('fas ')) {
        // Font Awesome icons
        iconClass = defaultConfig.icon;
        iconName = '';
    } else if (defaultConfig.icon.includes('fa-')) {
        iconClass = `fas ${defaultConfig.icon}`;
        iconName = '';
    }

    // Generate unique ID for this card
    const cardId = `cct-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'mc-cctlight-card-wrapper';
    cardContainer.id = cardId;
    cardContainer.style.setProperty('--card-width', defaultConfig.cardWidth);
    cardContainer.style.setProperty('--card-height', defaultConfig.cardHeight);
    cardContainer.style.setProperty('--accent-on', defaultConfig.accentColor);

    // Create card HTML with proper icon handling (NO MODAL)
    cardContainer.innerHTML = `
        <div class="mc-cctlight-card" data-entity-id="${defaultConfig.entityId}">
            <div class="light-card off" id="${cardId}-lightCard" role="button" aria-pressed="false" aria-label="Light control card" tabindex="0">
                <div class="card-content">
                    <div class="left">
                        <div class="icon-wrap" aria-hidden="true">
                            ${iconName ? `<i class="${iconClass}">${iconName}</i>` : `<i class="${iconClass}"></i>`}
                        </div>
                        <div class="meta">
                            <div class="name" id="${cardId}-cardName">${defaultConfig.name}</div>
                            <div class="sub" id="${cardId}-cardSub">${defaultConfig.subtitle}</div>
                        </div>
                    </div>

                    <div class="status-container">
                        <div class="status" id="${cardId}-statusText">OFF</div>
                        <div class="bright-percent" id="${cardId}-percentText">0%</div>
                    </div>
                </div>

                <div class="warmth-control">
                    <div class="warmth-slider" id="${cardId}-warmthSlider">
                        <div class="warmth-handle" id="${cardId}-warmthHandle"></div>
                    </div>
                    <div class="warmth-labels">
                        <span class="cool">Cool</span>
                        <span class="warm">Warm</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add CSS styles (NO MODAL CSS)
    addCCTStyles(defaultConfig.accentColor, cardId);

    // Initialize the card functionality
    setTimeout(() => {
        initializeCCTCard(cardContainer, defaultConfig.entityId, defaultConfig.accentColor);
    }, 100);

    return cardContainer;
}

// Add CCT card CSS styles to document
function addCCTStyles(accentColor, cardId) {
    const styleId = `cct-styles-${cardId}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getCCTCSS(accentColor, cardId);
    document.head.appendChild(style);
}

// Get CCT CSS as string (NO MODAL CSS)
function getCCTCSS(accentColor, cardId) {
    // Convert hex to RGB
    const rgbColor = hexToRgb(accentColor);
    const rgbString = rgbColor ? `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}` : '242, 111, 30';

    return `
        /* MC CCT Light Card Styles for ${cardId} */
        #${cardId} {
            --accent-on: ${accentColor};
            --accent-rgb: ${rgbString};
        }

        #${cardId} .mc-cctlight-card {
            --card-width: 100%;
            --card-height: 128px;
            --bg-off: rgba(0, 0, 0, 0.6);
            --muted: rgba(255, 255, 255, 0.85);
            --corner: 14px;
            --brightness: 0%;
            --warmth: 0%;
            --gradient-color-1: rgba(255, 255, 255, 0.95);
            --gradient-color-2: rgba(0, 0, 0, 0.85);
            --top-padding: 0px;
            display: block;
            width: 100%;
            box-sizing: border-box;
            max-width: 520px;
            margin: 0;
        }

        #${cardId} .light-card {
            width: 100%;
            max-width: 520px;
            height: 132px !important;
            border-radius: var(--corner);
            position: relative;
            overflow: hidden;
            user-select: none;
            -webkit-user-select: none;
            touch-action: pan-y;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), 
                        inset 0 1px 0 rgba(255, 255, 255, 0.02);
            transition: box-shadow 0.22s ease, transform 0.12s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 12px 16px;
            background: 
                linear-gradient(90deg, 
                    var(--gradient-color-1) 0%, 
                    var(--gradient-color-1) var(--brightness), 
                    var(--gradient-color-2) var(--brightness), 
                    var(--gradient-color-2) 100%);
            font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            box-sizing: border-box;
            margin: var(--top-padding) auto 0 auto;
            will-change: background;
            transform: translateZ(0);
        }

        #${cardId} .light-card.off {
            background: var(--bg-off) !important;
            background-image: none !important;
        }

        #${cardId} .light-card:active {
            transform: translateY(1px);
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
            background: rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
            transition: background 0.18s ease;
            box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.35);
        }

        #${cardId} .icon-wrap i {
            display: block;
            font-size: 25px;
            color: ${accentColor};
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

        #${cardId} .sub {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            mix-blend-mode: difference;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
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
            min-width: 32px;
            text-align: right;
        }

        #${cardId} .bright-percent {
            font-size: 13px;
            font-weight: 700;
            color: white;
            pointer-events: none;
            min-width: 32px;
            text-align: right;
            mix-blend-mode: difference;
        }

        #${cardId} .light-card.on .icon-wrap {
            background: rgba(${rgbString}, 0.2);
        }

        #${cardId} .light-card.on .icon-wrap i {
            color: ${accentColor} !important;
            filter: drop-shadow(0 0 6px rgba(${rgbString}, 0.9));
        }

        #${cardId} .light-card.on .name {
            color: var(--accent-on);
            mix-blend-mode: normal;
        }

        #${cardId} .light-card.on .status {
            color: var(--accent-on);
        }

        #${cardId} .light-card.off .icon-wrap {
            background: rgba(255, 255, 255, 0.03);
        }

        #${cardId} .light-card.off .icon-wrap i {
            color: #ffffff;
            filter: none;
        }

        #${cardId} .light-card.off .name {
            color: rgba(255, 255, 255, 0.75);
            mix-blend-mode: difference;
        }

        #${cardId} .light-card.off .status {
            color: rgba(255, 255, 255, 0.6);
        }

        #${cardId} .light-card.off .bright-percent {
            opacity: 0.3;
        }

        #${cardId} .icon-wrap,
        #${cardId} .icon-wrap i {
            mix-blend-mode: normal !important;
        }

        #${cardId} .warmth-control {
            margin-top: 16px;
            padding: 0 4px;
            position: relative;
            width: 100%;
            box-sizing: border-box;
        }

        #${cardId} .warmth-slider {
            height: 24px;
            width: 100%;
            background: linear-gradient(90deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                ${accentColor} 100%);
            border-radius: 8px;
            position: relative;
            cursor: pointer;
            overflow: visible;
            box-sizing: border-box;
        }

        #${cardId} .warmth-handle {
            position: absolute;
            top: 50%;
            left: var(--warmth);
            transform: translate(-50%, -50%);
            width: 4px;
            height: 27px;
            background: #fff;
            border-radius: 2px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            transition: left 0.05s ease;
            cursor: grab;
            z-index: 2;
        }

        #${cardId} .light-card.on .warmth-handle {
            background: #000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        #${cardId} .warmth-handle:active {
            cursor: grabbing;
        }

        #${cardId} .warmth-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 11px;
            width: 100%;
            box-sizing: border-box;
        }

        #${cardId} .warmth-labels .warm {
            color: ${accentColor};
            font-weight: 500;
        }

        #${cardId} .warmth-labels .cool {
            color: #888888;
            font-weight: 500;
        }

        #${cardId} .light-card.off .warmth-control {
            opacity: 0.4;
        }

        #${cardId} .light-card.off .warmth-slider {
            opacity: 0.6;
        }

        /* IMPORTANT: Ensure gradient is visible when on */
        #${cardId} .light-card.on {
            background: 
                linear-gradient(90deg,
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.95) var(--brightness),
                    rgba(0, 0, 0, 0.85) var(--brightness),
                    rgba(0, 0, 0, 0.85) 100%) !important;
        }

        /* Responsive Styles */
        @media (max-width: 600px) {
            #${cardId} .light-card {
                height: 116px;
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
            
            #${cardId} .status, #${cardId} .bright-percent {
                font-size: 12px;
            }
        }

        @media (max-width: 420px) {
            #${cardId} .light-card {
                height: 116px;
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
            
            #${cardId} .status, #${cardId} .bright-percent {
                font-size: 11px;
                min-width: 28px;
            }
            
            #${cardId} .warmth-slider {
                height: 24px;
            }
            
            #${cardId} .warmth-handle {
                height: 20px;
            }
            
            #${cardId} .warmth-labels {
                font-size: 10px;
            }
        }

        @media (max-width: 360px) {
            #${cardId} .light-card {
                height: 110px;
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

// Initialize CCT card functionality - FIXED: Gradient shows immediately, but turns off properly
function initializeCCTCard(cardContainer, entityId, accentColor) {
    const lightCard = cardContainer.querySelector('.light-card');
    const statusText = cardContainer.querySelector('.status');
    const percentText = cardContainer.querySelector('.bright-percent');
    const warmthSlider = cardContainer.querySelector('.warmth-slider');
    const warmthHandle = cardContainer.querySelector('.warmth-handle');
    const cardName = cardContainer.querySelector('.name');
    const cardSub = cardContainer.querySelector('.sub');

    // State
    let ws = null;
    let isOn = false;
    let isConnected = false;
    let brightness = 0;
    let warmth = 0;
    let pointerDown = false;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let pointerId = null;
    let startTime = 0;
    let warmthPointerDown = false;
    let warmthStartX = 0;
    let warmthStartY = 0;
    let warmthMoved = false;
    const dragThreshold = 8;
    const warmthDragThreshold = 10;
    let isDragging = false;
    let lastBrightness = 50;
    let lastServiceCall = 0;
    let ignoreNextUpdate = false;
    let hasInlineStyle = false; // Track if we have inline style applied

    // Get domain from entity ID
    const domain = entityId.split('.')[0];

    // Connect to Home Assistant WebSocket
    function connectWebSocket() {
        console.log(`Connecting to Home Assistant WebSocket for ${entityId}...`);

        ws = new WebSocket(window.HA_CONFIG.WS_URL);

        ws.onopen = () => {
            console.log("WebSocket connected to Home Assistant");
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

                    // Get initial state
                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            id: Date.now(),
                            type: "get_states"
                        }));

                        // Subscribe to changes
                        setTimeout(() => {
                            ws.send(JSON.stringify({
                                id: Date.now() + 1,
                                type: "subscribe_events",
                                event_type: "state_changed"
                            }));
                        }, 100);
                    }, 100);
                }
                else if (data.type === "result" && data.success) {
                    if (data.result) {
                        const entity = data.result.find(e => e.entity_id === entityId);
                        if (entity) {
                            updateFromEntityState(entity);
                            updateUI(true);
                            console.log(`Initial state loaded: ${isOn ? 'ON' : 'OFF'}, Brightness: ${brightness}%, Warmth: ${warmth}%`);
                        }
                    }
                }
                else if (data.type === "event" && data.event?.event_type === "state_changed") {
                    if (data.event.data.entity_id === entityId) {
                        updateFromEntityState(data.event.data.new_state);
                        updateUI(true);
                        console.log(`State updated: ${isOn ? 'ON' : 'OFF'}, Brightness: ${brightness}%, Warmth: ${warmth}%`);
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            isConnected = false;
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            isConnected = false;

            // Try to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };
    }

    // Update state from Home Assistant entity
    function updateFromEntityState(entity) {
        if (!entity) return;

        // Handle different entity types
        isOn = entity.state === "on" || entity.state === "unlocked" || entity.state === "open";

        // Get brightness - only for light entities
        if (domain === 'light' && entity.attributes && entity.attributes.brightness) {
            brightness = Math.round((entity.attributes.brightness / 255) * 100);
        } else {
            brightness = isOn ? 100 : 0;
        }

        // Get color temperature if available - only for light entities with CCT support
        if (domain === 'light' && entity.attributes && entity.attributes.color_temp) {
            const minMireds = 153;
            const maxMireds = 500;
            const temp = entity.attributes.color_temp;
            warmth = Math.round(((temp - minMireds) / (maxMireds - minMireds)) * 100);
            warmth = Math.max(0, Math.min(100, warmth));
        } else {
            warmth = isOn ? 50 : 0;
        }

        // Update subtitle based on entity type
        if (domain === 'light') {
            cardSub.textContent = isOn ?
                `Brightness: ${brightness}% • Warmth: ${warmth}%` :
                'Drag to adjust';
        } else {
            cardSub.textContent = isOn ?
                `${entityId} is ON` :
                `${entityId} is OFF`;
        }
    }

    // Update UI
    function updateUI(skipServiceCall = false) {
        // Don't update UI while dragging brightness
        if (isDragging) {
            skipServiceCall = true;
        }

        // Clamp values
        brightness = Math.max(0, Math.min(100, Math.round(brightness)));
        warmth = Math.max(0, Math.min(100, Math.round(warmth)));

        // Only set brightness gradient for light entities
        if (domain === 'light') {
            lightCard.style.setProperty('--brightness', brightness + '%');
            lightCard.style.setProperty('--warmth', warmth + '%');

            // Update text
            percentText.textContent = brightness + '%';
            warmthHandle.style.left = warmth + '%';
        } else {
            // For non-light entities, hide warmth control
            cardContainer.querySelector('.warmth-control').style.display = 'none';
            percentText.textContent = isOn ? 'ON' : 'OFF';
        }

        // Update sub text based on state
        if (domain === 'light') {
            if (isOn) {
                cardSub.textContent = `Brightness: ${brightness}% • Warmth: ${warmth}%`;
            } else {
                cardSub.textContent = 'Drag to adjust';
            }
        }

        // Toggle classes - FIXED: Remove inline style when turning off
        if (isOn) {
            lightCard.classList.remove('off');
            lightCard.classList.add('on');
            lightCard.setAttribute('aria-pressed', 'true');
            statusText.textContent = 'ON';
            percentText.style.opacity = '1';
            
            // Force gradient to show when on
            lightCard.style.background = 
                `linear-gradient(90deg,
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.95) ${brightness}%,
                    rgba(0, 0, 0, 0.85) ${brightness}%,
                    rgba(0, 0, 0, 0.85) 100%)`;
            hasInlineStyle = true;
        } else {
            lightCard.classList.remove('on');
            lightCard.classList.add('off');
            lightCard.setAttribute('aria-pressed', 'false');
            statusText.textContent = 'OFF';
            percentText.style.opacity = '0.3';
            
            // Remove inline style so CSS can take over with .off class
            lightCard.style.background = '';
            hasInlineStyle = false;
        }

        // Call service if connected and not skipping
        if (isConnected && ws && ws.readyState === WebSocket.OPEN && !skipServiceCall && !ignoreNextUpdate) {
            callService();
        }
    }

    // Set brightness from X coordinate - FIXED: Show gradient immediately
    function setBrightnessFromX(clientX) {
        if (!lightCard) return;

        const rect = lightCard.getBoundingClientRect();
        const x = clientX - rect.left;
        let pct = (x / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        const newBrightness = Math.round(pct);

        if (newBrightness !== brightness) {
            brightness = newBrightness;

            // Turn on if sliding
            if (brightness > 0) {
                isOn = true;
                lastBrightness = brightness;
            }

            // FIX: Apply gradient immediately for visual feedback while dragging
            // This overrides the .off class background temporarily
            lightCard.style.background = 
                `linear-gradient(90deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(255, 255, 255, 0.95) ${brightness}%, 
                    rgba(0, 0, 0, 0.85) ${brightness}%, 
                    rgba(0, 0, 0, 0.85) 100%)`;
            hasInlineStyle = true;
            
            // Also update CSS variable
            lightCard.style.setProperty('--brightness', brightness + '%');
            
            // Only update text for light entities
            if (domain === 'light') {
                percentText.textContent = brightness + '%';
            } else {
                percentText.textContent = isOn ? 'ON' : 'OFF';
            }

            percentText.style.opacity = isOn ? "1" : "0.3";
            
            // Update UI classes immediately for visual feedback
            if (isOn && !lightCard.classList.contains('on')) {
                lightCard.classList.remove('off');
                lightCard.classList.add('on');
                lightCard.setAttribute('aria-pressed', 'true');
                statusText.textContent = 'ON';
                percentText.style.opacity = '1';
            }
        }
    }

    // Set warmth from X coordinate - only for light entities
    function setWarmthFromX(clientX) {
        if (!warmthSlider || domain !== 'light') return;

        const rect = warmthSlider.getBoundingClientRect();
        const x = clientX - rect.left;
        let pct = (x / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        const newWarmth = Math.round(pct);

        if (newWarmth !== warmth) {
            warmth = newWarmth;
            warmthHandle.style.left = warmth + '%';

            // Auto-turn on when adjusting warmth
            if (warmth > 0) {
                isOn = true;
                if (brightness === 0) {
                    brightness = lastBrightness || 50;
                    // Also apply gradient for warmth adjustment
                    lightCard.style.background = 
                        `linear-gradient(90deg, 
                            rgba(255, 255, 255, 0.95) 0%, 
                            rgba(255, 255, 255, 0.95) ${brightness}%, 
                            rgba(0, 0, 0, 0.85) ${brightness}%, 
                            rgba(0, 0, 0, 0.85) 100%)`;
                    hasInlineStyle = true;
                    lightCard.style.setProperty('--brightness', brightness + '%');
                    percentText.textContent = brightness + '%';
                }
                
                // Update UI immediately
                if (!lightCard.classList.contains('on')) {
                    lightCard.classList.remove('off');
                    lightCard.classList.add('on');
                    lightCard.setAttribute('aria-pressed', 'true');
                    statusText.textContent = 'ON';
                    percentText.style.opacity = '1';
                }
            }
        }
    }

    // Call Home Assistant service
    function callService() {
        if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) return;

        // Throttle service calls
        const now = Date.now();
        if (now - lastServiceCall < 50) {
            return;
        }
        lastServiceCall = now;

        try {
            ignoreNextUpdate = true;
            setTimeout(() => { ignoreNextUpdate = false; }, 300);

            if (isOn) {
                // Different service calls based on domain
                if (domain === 'light') {
                    const serviceData = {
                        entity_id: entityId,
                        brightness_pct: brightness,
                    };

                    // Add color temperature if warmth is set
                    if (warmth > 0) {
                        const minMireds = 153;
                        const maxMireds = 500;
                        const colorTemp = Math.round(minMireds + (maxMireds - minMireds) * (warmth / 100));
                        serviceData.color_temp = colorTemp;
                    }

                    ws.send(JSON.stringify({
                        id: Date.now(),
                        type: "call_service",
                        domain: "light",
                        service: "turn_on",
                        service_data: serviceData
                    }));
                    console.log(`Service call: turn_on, Brightness: ${brightness}%, Warmth: ${warmth}%`);
                } else if (domain === 'switch') {
                    ws.send(JSON.stringify({
                        id: Date.now(),
                        type: "call_service",
                        domain: "switch",
                        service: "turn_on",
                        service_data: {
                            entity_id: entityId
                        }
                    }));
                    console.log(`Service call: switch.turn_on`);
                } else if (domain === 'cover') {
                    ws.send(JSON.stringify({
                        id: Date.now(),
                        type: "call_service",
                        domain: "cover",
                        service: "open_cover",
                        service_data: {
                            entity_id: entityId
                        }
                    }));
                    console.log(`Service call: cover.open_cover`);
                } else if (domain === 'lock') {
                    ws.send(JSON.stringify({
                        id: Date.now(),
                        type: "call_service",
                        domain: "lock",
                        service: "unlock",
                        service_data: {
                            entity_id: entityId
                        }
                    }));
                    console.log(`Service call: lock.unlock`);
                } else {
                    // Default turn_on for other domains
                    ws.send(JSON.stringify({
                        id: Date.now(),
                        type: "call_service",
                        domain: domain,
                        service: "turn_on",
                        service_data: {
                            entity_id: entityId
                        }
                    }));
                    console.log(`Service call: ${domain}.turn_on`);
                }
            } else {
                // Turn off based on domain
                let service;
                if (domain === 'cover') {
                    service = "close_cover";
                } else if (domain === 'lock') {
                    service = "lock";
                } else if (domain === 'valve') {
                    service = "close_valve";
                } else {
                    service = "turn_off";
                }

                ws.send(JSON.stringify({
                    id: Date.now(),
                    type: "call_service",
                    domain: domain,
                    service: service,
                    service_data: {
                        entity_id: entityId
                    }
                }));
                console.log(`Service call: ${domain}.${service}`);
            }
        } catch (error) {
            console.error('Error calling service:', error);
            ignoreNextUpdate = false;
        }
    }

    // Event Handlers
    function handlePointerDown(ev) {
        // Don't handle warmth for non-light entities
        if (domain === 'light' && (ev.target.closest('.warmth-slider') || ev.target.closest('.warmth-handle'))) return;
        if (domain !== 'light' && ev.target.closest('.warmth-slider')) return;

        ev.preventDefault();
        pointerDown = true;
        pointerId = ev.pointerId;
        startX = ev.clientX;
        startY = ev.clientY;
        moved = false;
        startTime = Date.now();
        isDragging = true;

        lightCard.setPointerCapture(pointerId);
    }

    function handlePointerMove(ev) {
        if (!pointerDown || ev.pointerId !== pointerId) return;
        ev.preventDefault();

        const dx = Math.abs(ev.clientX - startX);
        const dy = Math.abs(ev.clientY - startY);

        // Allow scrolling
        if (dy > dx) return;

        if (!moved && dx < dragThreshold) {
            return;
        }

        moved = true;
        setBrightnessFromX(ev.clientX);
    }

    function handlePointerUp(ev) {
        if (ev.pointerId !== pointerId) return;

        const isTap = !moved;

        pointerDown = false;
        isDragging = false;

        try { lightCard.releasePointerCapture(pointerId); } catch (e) { }
        pointerId = null;

        if (isTap) {
            // TAP → Only toggle ON/OFF
            if (isOn) {
                lastBrightness = brightness;
                isOn = false;
            } else {
                isOn = true;
                brightness = lastBrightness || (domain === 'light' ? 50 : 100);
            }
            updateUI();
            return;
        }

        // DRAG → send final brightness
        updateUI();
    }

    function handleWarmthDown(ev) {
        // Only for light entities
        if (domain !== 'light') return;

        ev.preventDefault();
        ev.stopPropagation();

        warmthPointerDown = true;
        warmthMoved = false;
        warmthStartX = ev.clientX;
        warmthStartY = ev.clientY;

        warmthSlider.setPointerCapture(ev.pointerId);
    }

    function handleGlobalPointerMove(ev) {
        if (!warmthPointerDown) return;

        const dx = Math.abs(ev.clientX - warmthStartX);
        const dy = Math.abs(ev.clientY - warmthStartY);

        if (dy > dx) return;

        if (!warmthMoved && dx < warmthDragThreshold) return;

        warmthMoved = true;
        setWarmthFromX(ev.clientX);
    }

    function handleGlobalPointerUp() {
        if (warmthPointerDown) {
            if (warmthMoved) {
                updateUI();
            }
        }

        warmthPointerDown = false;
        warmthMoved = false;
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            isOn = true;
            brightness = Math.min(100, brightness + 5);
            updateUI();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            brightness = Math.max(0, brightness - 5);
            if (brightness === 0) {
                isOn = false;
            }
            updateUI();
        } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isOn && domain === 'light') {
            e.preventDefault();
            warmth = e.key === 'ArrowUp' ?
                Math.min(100, warmth + 10) :
                Math.max(0, warmth - 10);
            updateUI();
        }
    }

    // Attach Event Listeners
    function attachEventListeners() {
        // Card interactions
        lightCard.addEventListener('pointerdown', handlePointerDown);
        lightCard.addEventListener('pointermove', handlePointerMove);
        lightCard.addEventListener('pointerup', handlePointerUp);
        lightCard.addEventListener('pointercancel', () => {
            pointerDown = false;
            isDragging = false;
            if (lightCard) {
                try {
                    lightCard.releasePointerCapture(pointerId);
                } catch (e) { }
            }
            pointerId = null;
        });

        // Warmth interactions - only for light entities
        if (domain === 'light') {
            warmthSlider.addEventListener('pointerdown', handleWarmthDown);
            warmthHandle.addEventListener('pointerdown', handleWarmthDown);
        }

        // Global events for warmth - only for light entities
        if (domain === 'light') {
            document.addEventListener('pointermove', handleGlobalPointerMove);
            document.addEventListener('pointerup', handleGlobalPointerUp);
        }

        // Keyboard support
        lightCard.addEventListener('keydown', handleKeyDown);
        lightCard.addEventListener('contextmenu', (ev) => ev.preventDefault());

        // Make card focusable
        lightCard.setAttribute('tabindex', '0');
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
window.createCCTLightCard = createCCTLightCard;