// cct-light-card.js - CCT Light Card Module with Home Assistant Integration and Modals
// UPDATED VERSION - FIXED FOR SWITCH ENTITIES AND ICON LOADING


// Create a CCT light card with Home Assistant integration and modals
function createCCTLightCard(config = {}) {
    const defaultConfig = {
        entityId: config.entityId || "light.pantry_cct_lighr_exp_room_entrance_light",
        name: config.name || "CCT Light",
        subtitle: config.subtitle || "Drag to adjust brightness • Warmth control below",
        icon: config.icon || "material-icons:lightbulb", // CHANGED: Default to material-icons
        cardWidth: config.cardWidth || "100%",
        cardHeight: config.cardHeight || "128px",
        accentColor: config.accentColor || "#f26f1e",
        showModal: config.showModal || true,
        modalWidth: config.modalWidth || "90%",
        modalMaxWidth: config.modalMaxWidth || "500px"
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
    const modalId = `${cardId}-modal`;

    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'mc-cctlight-card-wrapper';
    cardContainer.id = cardId;
    cardContainer.style.setProperty('--card-width', defaultConfig.cardWidth);
    cardContainer.style.setProperty('--card-height', defaultConfig.cardHeight);
    cardContainer.style.setProperty('--accent-on', defaultConfig.accentColor);

    // Create card HTML with proper icon handling
    cardContainer.innerHTML = `
        <div class="mc-cctlight-card" data-entity-id="${defaultConfig.entityId}" data-show-modal="${defaultConfig.showModal}">
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
        
        <!-- Modal Container -->
        <div id="${modalId}" class="cct-modal-overlay" style="display: none;">
            <div class="cct-modal-content">
                <div class="modal-header">
                    <h3 id="${modalId}-title">${defaultConfig.name} Controls</h3>
                    <button class="modal-close-btn" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-brightness-control">
                        <div class="modal-brightness-header">
                            <span>Brightness</span>
                            <span id="${modalId}-brightnessValue">0%</span>
                        </div>
                        <div class="modal-slider-container">
                            <input type="range" 
                                   id="${modalId}-brightnessSlider" 
                                   class="modal-slider" 
                                   min="0" 
                                   max="100" 
                                   value="0"
                                   aria-label="Brightness control">
                            <div class="slider-ticks">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-warmth-control">
                        <div class="modal-warmth-header">
                            <span>Color Temperature</span>
                            <span id="${modalId}-warmthValue">50%</span>
                        </div>
                        <div class="modal-slider-container">
                            <input type="range" 
                                   id="${modalId}-warmthSlider" 
                                   class="modal-slider" 
                                   min="0" 
                                   max="100" 
                                   value="50"
                                   aria-label="Color temperature control">
                            <div class="slider-labels">
                                <span class="cool-label">Cool</span>
                                <span class="warm-label">Warm</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-presets">
                        <h4>Quick Presets</h4>
                        <div class="preset-buttons">
                            <button class="preset-btn" data-brightness="10" data-warmth="30">Night Light</button>
                            <button class="preset-btn" data-brightness="50" data-warmth="50">Relax</button>
                            <button class="preset-btn" data-brightness="80" data-warmth="70">Reading</button>
                            <button class="preset-btn" data-brightness="100" data-warmth="100">Daylight</button>
                        </div>
                    </div>
                    
                    <div class="modal-power-control">
                        <button id="${modalId}-powerBtn" class="power-btn off">
                            <i class="fas fa-power-off"></i>
                            <span>Turn On</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add CSS styles
    addCCTStyles(defaultConfig.accentColor, cardId, modalId, defaultConfig.modalWidth, defaultConfig.modalMaxWidth);

    // Initialize the card functionality
    setTimeout(() => {
        initializeCCTCard(cardContainer, defaultConfig.entityId, defaultConfig.accentColor, modalId, defaultConfig.showModal);
    }, 100);

    return cardContainer;
}

// Add CCT card CSS styles to document
function addCCTStyles(accentColor, cardId, modalId, modalWidth = "90%", modalMaxWidth = "500px") {
    const styleId = `cct-styles-${cardId}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getCCTCSS(accentColor, cardId, modalId, modalWidth, modalMaxWidth);
    document.head.appendChild(style);
}

// Get CCT CSS as string
function getCCTCSS(accentColor, cardId, modalId, modalWidth, modalMaxWidth) {
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
            height: var(--card-height);
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
            background: var(--bg-off);
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
            margin-top: 10px;
        }

        #${cardId} .sub {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 6px;
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
            height: 15px;
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
            height: 20px;
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

        /* Modal Styles */
        #${modalId}.cct-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #${modalId}.cct-modal-overlay.show {
            opacity: 1;
        }

        #${modalId} .cct-modal-content {
            width: ${modalWidth};
            max-width: ${modalMaxWidth};
            background: rgba(30, 30, 35, 0.95);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
#${modalId} .mc-cctlight-card-wrapper {
margin: 0px !important;}
        #${modalId}.show .cct-modal-content {
            transform: translateY(0);
        }

        #${modalId} .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        #${modalId} .modal-header h3 {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }

        #${modalId} .modal-close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            font-size: 24px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        #${modalId} .modal-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        #${modalId} .modal-body {
            display: flex;
            flex-direction: column;
            gap: 28px;
        }

        #${modalId} .modal-brightness-control,
        #${modalId} .modal-warmth-control {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
        }

        #${modalId} .modal-brightness-header,
        #${modalId} .modal-warmth-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            color: white;
            font-weight: 500;
        }

        #${modalId} .modal-brightness-header span:first-child,
        #${modalId} .modal-warmth-header span:first-child {
            font-size: 15px;
        }

        #${modalId} .modal-brightness-header span:last-child,
        #${modalId} .modal-warmth-header span:last-child {
            font-size: 16px;
            font-weight: 600;
            color: ${accentColor};
        }

        #${modalId} .modal-slider-container {
            position: relative;
        }

        #${modalId} .modal-slider {
            width: 100%;
            height: 44px;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
            outline: none;
        }

        #${modalId} .modal-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 4px;
        }

        #${modalId} .modal-slider::-moz-range-track {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 4px;
        }

        #${modalId} .modal-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: ${accentColor};
            border-radius: 50%;
            cursor: pointer;
            margin-top: -8px;
            box-shadow: 0 4px 12px rgba(${rgbString}, 0.4);
            border: 3px solid white;
        }

        #${modalId} .modal-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: ${accentColor};
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(${rgbString}, 0.4);
        }

        #${modalId} .slider-ticks {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
        }

        #${modalId} .slider-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
        }

        #${modalId} .cool-label {
            color: #888888;
            font-size: 13px;
        }

        #${modalId} .warm-label {
            color: ${accentColor};
            font-size: 13px;
        }

        #${modalId} .modal-presets h4 {
            color: white;
            font-size: 15px;
            margin-bottom: 12px;
            font-weight: 500;
        }

        #${modalId} .preset-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        #${modalId} .preset-btn {
            padding: 12px;
            background: rgba(255, 255, 255, 0.08);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #${modalId} .preset-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        #${modalId} .preset-btn:active {
            transform: scale(0.98);
        }

        #${modalId} .modal-power-control {
            display: flex;
            justify-content: center;
            margin-top: 10px;
        }

        #${modalId} .power-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 16px 32px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        #${modalId} .power-btn.on {
            background: ${accentColor};
            color: white;
        }

        #${modalId} .power-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(${rgbString}, 0.3);
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
            
            #${modalId} .cct-modal-content {
                padding: 20px;
            }
            
            #${modalId} .modal-brightness-control,
            #${modalId} .modal-warmth-control {
                padding: 16px;
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
                height: 14px;
            }
            
            #${cardId} .warmth-handle {
                height: 18px;
            }
            
            #${cardId} .warmth-labels {
                font-size: 10px;
            }
            
            #${modalId} .preset-buttons {
                grid-template-columns: 1fr;
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
            
            #${modalId} .cct-modal-content {
                padding: 16px;
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

// Initialize CCT card functionality - UPDATED FOR SWITCH ENTITIES
function initializeCCTCard(cardContainer, entityId, accentColor, modalId, showModal) {
    const lightCard = cardContainer.querySelector('.light-card');
    const statusText = cardContainer.querySelector('.status');
    const percentText = cardContainer.querySelector('.bright-percent');
    const warmthSlider = cardContainer.querySelector('.warmth-slider');
    const warmthHandle = cardContainer.querySelector('.warmth-handle');
    const cardName = cardContainer.querySelector('.name');
    const cardSub = cardContainer.querySelector('.sub');
    const modalOverlay = cardContainer.querySelector(`#${modalId}`);

    // Modal elements
    const modalCloseBtn = modalOverlay.querySelector('.modal-close-btn');
    const modalBrightnessSlider = modalOverlay.querySelector(`#${modalId}-brightnessSlider`);
    const modalWarmthSlider = modalOverlay.querySelector(`#${modalId}-warmthSlider`);
    const modalBrightnessValue = modalOverlay.querySelector(`#${modalId}-brightnessValue`);
    const modalWarmthValue = modalOverlay.querySelector(`#${modalId}-warmthValue`);
    const modalPowerBtn = modalOverlay.querySelector(`#${modalId}-powerBtn`);
    const presetButtons = modalOverlay.querySelectorAll('.preset-btn');

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
    let modalOpen = false;

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
                            updateModalUI();
                            console.log(`Initial state loaded: ${isOn ? 'ON' : 'OFF'}, Brightness: ${brightness}%, Warmth: ${warmth}%`);
                        }
                    }
                }
                else if (data.type === "event" && data.event?.event_type === "state_changed") {
                    if (data.event.data.entity_id === entityId) {
                        updateFromEntityState(data.event.data.new_state);
                        updateUI(true);
                        updateModalUI();
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

    // Update state from Home Assistant entity - UPDATED FOR SWITCH ENTITIES
    // In cct-light-card.js - Update updateFromEntityState function
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

        // COMMENT OUT OR REMOVE this section to keep custom name:
        // DO NOT override the name with entity's friendly_name
        // if (entity.attributes && entity.attributes.friendly_name) {
        //     cardName.textContent = entity.attributes.friendly_name;
        // }

        // Update subtitle based on entity type
        if (domain === 'light') {
            cardSub.textContent = isOn ?
                `Brightness: ${brightness}% • Warmth: ${warmth}%` :
                'Drag to adjust brightness • Warmth control below';
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
                cardSub.textContent = 'Drag to adjust brightness • Warmth control below';
            }
        }

        // Toggle classes
        if (isOn) {
            lightCard.classList.remove('off');
            lightCard.classList.add('on');
            lightCard.setAttribute('aria-pressed', 'true');
            statusText.textContent = 'ON';
            percentText.style.opacity = '1';
        } else {
            lightCard.classList.remove('on');
            lightCard.classList.add('off');
            lightCard.setAttribute('aria-pressed', 'false');
            statusText.textContent = 'OFF';
            percentText.style.opacity = '0.3';
        }

        // Call service if connected and not skipping
        if (isConnected && ws && ws.readyState === WebSocket.OPEN && !skipServiceCall && !ignoreNextUpdate) {
            callService();
        }
    }

    // Update modal UI
    function updateModalUI() {
        if (!modalOverlay) return;

        modalBrightnessSlider.value = brightness;
        modalWarmthSlider.value = warmth;
        modalBrightnessValue.textContent = brightness + '%';
        modalWarmthValue.textContent = warmth + '%';

        // Hide warmth controls for non-light entities
        if (domain !== 'light') {
            modalOverlay.querySelector('.modal-warmth-control').style.display = 'none';
            modalOverlay.querySelector('.modal-presets').style.display = 'none';
            modalBrightnessSlider.max = 100; // Still allow brightness for visual feedback
            modalBrightnessSlider.disabled = false;
        }

        // Update power button
        if (isOn) {
            modalPowerBtn.classList.remove('off');
            modalPowerBtn.classList.add('on');
            modalPowerBtn.querySelector('span').textContent = 'Turn Off';
        } else {
            modalPowerBtn.classList.remove('on');
            modalPowerBtn.classList.add('off');
            modalPowerBtn.querySelector('span').textContent = 'Turn On';
        }
    }

    // Set brightness from X coordinate
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

            // Only update gradient for light entities
            if (domain === 'light') {
                lightCard.style.setProperty('--brightness', brightness + '%');
                percentText.textContent = brightness + '%';
            } else {
                percentText.textContent = isOn ? 'ON' : 'OFF';
            }

            percentText.style.opacity = isOn ? "1" : "0.3";

            // Update modal if open
            if (modalOpen) {
                modalBrightnessSlider.value = brightness;
                modalBrightnessValue.textContent = brightness + '%';
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
                if (brightness === 0) brightness = lastBrightness || 50;
            }

            // Update modal if open
            if (modalOpen) {
                modalWarmthSlider.value = warmth;
                modalWarmthValue.textContent = warmth + '%';
            }
        }
    }

    // Open modal
    function openModal() {
        if (!showModal || modalOpen) return;

        updateModalUI();
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
        modalOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            modalOpen = false;
            document.body.style.overflow = '';
        }, 300);
    }

    // Call Home Assistant service - UPDATED FOR DIFFERENT ENTITY TYPES
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

    // Event Handlers - UPDATED FOR SWITCH ENTITIES
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
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    }

    // Modal event handlers
    function handleModalBrightnessChange() {
        brightness = parseInt(modalBrightnessSlider.value);
        if (brightness > 0) isOn = true;
        updateUI();
    }

    function handleModalWarmthChange() {
        // Only for light entities
        if (domain !== 'light') return;

        warmth = parseInt(modalWarmthSlider.value);
        if (warmth > 0) {
            isOn = true;
            if (brightness === 0) brightness = lastBrightness || 50;
        }
        updateUI();
    }

    function handleModalPowerClick() {
        if (isOn) {
            lastBrightness = brightness;
            isOn = false;
        } else {
            isOn = true;
            brightness = lastBrightness || (domain === 'light' ? 50 : 100);
        }
        updateUI();
        updateModalUI();
    }

    function handlePresetClick(e) {
        // Only for light entities
        if (domain !== 'light') return;

        const btn = e.target.closest('.preset-btn');
        if (!btn) return;

        const brightnessPreset = parseInt(btn.dataset.brightness);
        const warmthPreset = parseInt(btn.dataset.warmth);

        isOn = true;
        brightness = brightnessPreset;
        warmth = warmthPreset;
        lastBrightness = brightness;

        updateUI();
        updateModalUI();
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

        // Modal event listeners
        if (showModal) {
            // Open modal on card click
            lightCard.addEventListener('click', (ev) => {
                if (!moved && Date.now() - startTime < 300) {
                    openModal();
                }
            });

            // Modal controls
            modalCloseBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (ev) => {
                if (ev.target === modalOverlay) {
                    closeModal();
                }
            });

            modalBrightnessSlider.addEventListener('input', handleModalBrightnessChange);

            // Only add warmth listener for light entities
            if (domain === 'light') {
                modalWarmthSlider.addEventListener('input', handleModalWarmthChange);

                presetButtons.forEach(btn => {
                    btn.addEventListener('click', handlePresetClick);
                });
            }

            modalPowerBtn.addEventListener('click', handleModalPowerClick);

            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modalOpen) {
                    closeModal();
                }
            });
        }
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