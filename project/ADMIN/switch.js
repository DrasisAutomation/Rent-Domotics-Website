// switch.js - Toggle Switch Module (Updated with Material Icons support)


// Create a toggle card with Home Assistant integration
function createToggleCard(config = {}) {
    const defaultConfig = {
        entityId: config.entityId || "light.row_5",
        name: config.name || "Light",
        subtitle: config.subtitle || "Toggle switch",
        icon: config.icon || "material-icons:lightbulb",
        cardWidth: config.cardWidth || "100%",
        cardHeight: config.cardHeight || "80px",
        accentColor: config.accentColor || "#f26f1e"
    };
    
    // Extract icon name from config
    let iconClass = 'material-icons';
    let iconName = 'lightbulb';
    
    if (defaultConfig.icon.startsWith('material-icons:')) {
        iconName = defaultConfig.icon.split(':')[1];
    } else if (defaultConfig.icon.includes('fa-')) {
        // Fallback for Font Awesome
        iconClass = defaultConfig.icon;
        iconName = '';
    }
    
    // Generate unique ID for this card
    const cardId = `toggle-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'mc-toggle-card';
    cardContainer.id = cardId;
    cardContainer.style.setProperty('--card-width', defaultConfig.cardWidth);
    cardContainer.style.setProperty('--card-height', defaultConfig.cardHeight);
    cardContainer.style.setProperty('--accent-on', defaultConfig.accentColor);
    
    // Create card HTML
    cardContainer.innerHTML = `
        <div class="light-card off" data-entity-id="${defaultConfig.entityId}">
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
                    <div class="status" id="statusText">OFF</div>
                    <label class="switch">
                        <input class="cb" type="checkbox" />
                        <span class="toggle">
                            <span class="left">off</span>
                            <span class="right">on</span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS styles with dynamic color
    addSwitchStyles(defaultConfig.accentColor, cardId);
    
    // Initialize the toggle functionality
    setTimeout(() => {
        initializeToggle(cardContainer, defaultConfig.entityId, defaultConfig.accentColor);
    }, 100);
    
    return cardContainer;
}

// Add switch CSS styles to document with dynamic color
function addSwitchStyles(accentColor, cardId) {
    const styleId = `switch-styles-${cardId}`;
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getSwitchCSS(accentColor, cardId);
    document.head.appendChild(style);
}

// Get switch CSS as string with dynamic color
function getSwitchCSS(accentColor, cardId) {
    // Convert hex to RGB for glow effects
    const rgbColor = hexToRgb(accentColor);
    const rgbString = rgbColor ? `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}` : '242, 111, 30';
    
    return `
        /* MC Toggle Card Styles for ${cardId} */
        #${cardId} {
            --accent-on: ${accentColor};
            --accent-rgb: ${rgbString};
        }

        #${cardId} .mc-toggle-card {
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
            height: 75px !important;
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

        #${cardId} .light-card.on {
            background: rgba(255, 255, 255, 0.95);
        }

        #${cardId} .card-content {
            display: flex;
            align-items: center;
            width: 100%;
            position: relative;
            box-sizing: border-box;
        }

        #${cardId} .card-content .left {
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
            transition: all 0.3s ease;
            box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.35);
        }

        #${cardId} .icon-wrap i {
            font-size: 25px;
            color: ${accentColor};
            transition: color 0.3s ease, filter 0.3s ease;
        }

        #${cardId} .light-card.on .icon-wrap {
            background: rgba(${rgbString}, 0.2);
        }

        #${cardId} .light-card.on .icon-wrap i {
            color: ${accentColor} !important;
            filter: drop-shadow(0 0 6px rgba(${rgbString}, 0.6));
        }

        #${cardId} .light-card.off .icon-wrap {
            background: rgba(255, 255, 255, 0.03);
        }

        #${cardId} .light-card.off .icon-wrap i {
            color: #ffffff;
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

        #${cardId} .light-card.on .name {
            color: var(--accent-on);
            mix-blend-mode: normal;
        }

        #${cardId} .light-card.off .name {
            color: rgba(255, 255, 255, 0.75);
            mix-blend-mode: difference;
        }

        #${cardId} .sub {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            mix-blend-mode: difference;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        #${cardId} .light-card.on .sub {
            color: #666;
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

        #${cardId} .light-card.on .status {
            color: var(--accent-on);
        }

        #${cardId} .light-card.off .status {
            color: rgba(255, 255, 255, 0.6);
        }

        /* Compact 3D Toggle Switch */
        #${cardId} .switch {
            font-size: 14px;
            position: relative;
            display: inline-block;
            width: 3.8em;
            height: 1.9em;
            user-select: none;
            flex-shrink: 0;
            cursor: pointer;
        }

        #${cardId} .switch .cb {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
        }

        #${cardId} .toggle {
            position: absolute;
            cursor: pointer;
            width: 100%;
            height: 100%;
            background-color: #373737;
            border-radius: 0.1em;
            transition: 0.3s;
            text-transform: uppercase;
            font-weight: 700;
            overflow: hidden;
            box-shadow: -0.2em 0 0 0 #373737, -0.2em 0.2em 0 0 #373737,
                0.2em 0 0 0 #373737, 0.2em 0.2em 0 0 #373737, 0 0.2em 0 0 #373737;
        }

        #${cardId} .toggle>.left {
            position: absolute;
            display: flex;
            width: 50%;
            height: 88%;
            background-color: #f8f8f8;
            color: #373737;
            left: 0;
            bottom: 0;
            align-items: center;
            justify-content: center;
            transform-origin: right;
            transform: rotateX(10deg);
            transform-style: preserve-3d;
            transition: all 0.15s;
            font-size: 0.65em;
            font-weight: 800;
        }

        #${cardId} .left::before {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            background-color: rgb(220, 220, 220);
            transform-origin: center left;
            transform: rotateY(90deg);
        }

        #${cardId} .left::after {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            background-color: rgb(140, 140, 140);
            transform-origin: center bottom;
            transform: rotateX(90deg);
        }

        #${cardId} .toggle>.right {
            position: absolute;
            display: flex;
            width: 50%;
            height: 88%;
            background-color: #f8f8f8;
            color: rgb(180, 180, 180);
            right: 1px;
            bottom: 0;
            align-items: center;
            justify-content: center;
            transform-origin: left;
            transform: rotateX(10deg) rotateY(-45deg);
            transform-style: preserve-3d;
            transition: all 0.15s;
            font-size: 0.65em;
            font-weight: 800;
        }

        #${cardId} .right::before {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            background-color: rgb(220, 220, 220);
            transform-origin: center right;
            transform: rotateY(-90deg);
        }

        #${cardId} .right::after {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            background-color: rgb(140, 140, 140);
            transform-origin: center bottom;
            transform: rotateX(90deg);
        }

        #${cardId} .switch input:checked+.toggle>.left {
            transform: rotateX(10deg) rotateY(45deg);
            color: rgb(180, 180, 180);
        }

        #${cardId} .switch input:checked+.toggle>.right {
            transform: rotateX(10deg) rotateY(0deg);
            color: ${accentColor};
        }

        #${cardId} .light-card.on .toggle {
            background-color: #e0e0e0;
            box-shadow: -0.2em 0 0 0 #e0e0e0, -0.2em 0.2em 0 0 #e0e0e0,
                0.2em 0 0 0 #e0e0e0, 0.2em 0.2em 0 0 #e0e0e0, 0 0.2em 0 0 #e0e0e0;
        }

        @media (max-width: 600px) {
            #${cardId} .light-card {
                height: 88px;
                padding: 10px 12px;
            }

            #${cardId} .card-content .left {
                gap: 10px;
            }

            #${cardId} .icon-wrap {
                width: 44px;
                height: 44px;
            }

            #${cardId} .icon-wrap i {
                font-size: 22px;
            }

            #${cardId} .light-card.on .icon-wrap i {
                color: ${accentColor} !important;
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

            #${cardId} .switch {
                width: 3.5em;
                height: 1.8em;
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

            #${cardId} .light-card.on .icon-wrap i {
                color: ${accentColor} !important;
            }

            #${cardId} .name {
                font-size: 14px;
            }

            #${cardId} .sub {
                font-size: 10px;
            }

            #${cardId} .status {
                font-size: 11px;
                min-width: 28px;
            }

            #${cardId} .switch {
                width: 3.2em;
                height: 1.6em;
                font-size: 13px;
            }
        }

        @media (max-width: 360px) {
            #${cardId} .light-card {
                height: 84px;
                padding: 6px 8px;
            }

            #${cardId} .card-content .left {
                gap: 8px;
            }

            #${cardId} .icon-wrap {
                width: 36px;
                height: 36px;
            }

            #${cardId} .icon-wrap i {
                font-size: 18px;
            }

            #${cardId} .light-card.on .icon-wrap i {
                color: ${accentColor} !important;
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

// Initialize toggle functionality
function initializeToggle(cardContainer, entityId, accentColor) {
    const lightCard = cardContainer.querySelector('.light-card');
    const toggleCheckbox = cardContainer.querySelector('.cb');
    const switchLabel = cardContainer.querySelector('.switch');
    const statusText = cardContainer.querySelector('.status');
    const cardIcon = cardContainer.querySelector('.icon-wrap i');
    
    // Update icon color
    if (cardIcon) {
        cardIcon.style.color = accentColor;
    }
    
    let isOn = false;
    let isConnected = false;
    let ws = null;
    
    // Connect to Home Assistant WebSocket
    function connectWebSocket() {
        try {
                        ws = new WebSocket(window.HA_CONFIG.WS_URL);

            ws.onopen = () => {
                console.log(`WebSocket connected for ${entityId}`);
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
                                isOn = entity.state === "on";
                                updateUI();
                            }
                        }
                    }
                    else if (data.type === "event" && data.event?.event_type === "state_changed") {
                        if (data.event.data.entity_id === entityId) {
                            isOn = data.event.data.new_state.state === "on";
                            updateUI();
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

                // Try to reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
        } catch (error) {
            console.error("Error connecting to WebSocket:", error);
        }
    }
    
    // Update UI
    function updateUI() {
        if (isOn) {
            lightCard.classList.remove('off');
            lightCard.classList.add('on');
            statusText.textContent = 'ON';
        } else {
            lightCard.classList.remove('on');
            lightCard.classList.add('off');
            statusText.textContent = 'OFF';
        }

        toggleCheckbox.checked = isOn;
    }
    
    // Toggle entity
    function toggleEntity() {
        if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
            console.log("Not connected to Home Assistant");
            // Toggle locally if not connected
            isOn = !isOn;
            updateUI();
            return;
        }

        // Toggle state
        isOn = !isOn;
        updateUI();

        // Get domain from entity_id
        const domain = entityId.split('.')[0];
        
        // Determine service name based on domain
        let service;
        if (domain === 'cover') {
            service = isOn ? "open_cover" : "close_cover";
        } else if (domain === 'lock') {
            service = isOn ? "unlock" : "lock";
        } else if (domain === 'valve') {
            service = isOn ? "open_valve" : "close_valve";
        } else if (domain === 'climate') {
            service = isOn ? "turn_on" : "turn_off";
        } else {
            service = isOn ? "turn_on" : "turn_off";
        }

        // Call Home Assistant service
        ws.send(JSON.stringify({
            id: Date.now(),
            type: "call_service",
            domain: domain,
            service: service,
            service_data: {
                entity_id: entityId
            }
        }));
    }
    
    // Attach event listeners
    function attachEventListeners() {
        // Toggle on switch click
        switchLabel.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            toggleEntity();
        });

        // Prevent card click from toggling
        lightCard.addEventListener('click', (ev) => {
            if (!ev.target.closest('.switch')) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        });

        // Keyboard support for switch
        switchLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleEntity();
            }
        });

        // Make switch focusable
        switchLabel.setAttribute('tabindex', '0');
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
window.createToggleCard = createToggleCard;