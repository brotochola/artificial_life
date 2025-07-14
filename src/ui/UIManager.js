import { UI_CONFIG, PARTICLE_CONFIG } from "../core/Config.js";

/**
 * UI Manager for handling all user interface operations
 * Manages panels, controls, and user interactions
 */
export class UIManager {
  constructor() {
    this.panels = new Map();
    this.isInitialized = false;
    this.currentTheme = "default";
    this.eventListeners = new Map();

    // Performance tracking
    this.stats = {
      fps: 0,
      particleCount: 0,
      lastUpdateTime: 0,
    };
  }

  /**
   * Initialize the UI system
   * @param {HTMLElement} container - Main container element
   */
  initialize(container) {
    if (this.isInitialized) {
      console.warn("UIManager already initialized");
      return;
    }

    this.container = container;
    this.createBaseStructure();
    this.initializePanels();
    this.setupEventListeners();
    this.isInitialized = true;

    console.log("🎨 UIManager initialized");
  }

  /**
   * Create the base HTML structure for the UI
   */
  createBaseStructure() {
    // Create stats display
    const statsElement = this.createElement("div", "stats", {
      id: "stats",
      textContent: "Initializing...",
    });

    // Create controls wrapper with all controls inside
    const controlsElement = this.createElement("div", "controls", {
      innerHTML: `
        <div class="panel-toggles">
          <button id="optionsToggle" class="toggle-btn">⚙️ Options</button>
          <button id="rulesToggle" class="toggle-btn">🎯 Rules</button>
        
        </div>

        <button id="pauseBtn" class="control-btn">
          <span id="pauseText">Pause</span>
        </button>
        <button id="resetBtn" class="control-btn">Reset</button>
        <button id="addBtn" class="control-btn">Add Particles</button>
        <button id="clearBtn" class="control-btn">Clear</button>
        <button id="randomizeBtn" class="control-btn">Randomize Rules</button>
        <button id="randomColliInHUD" class="control-btn">Random Collisions</button>

        <div class="preset-selector">
          <label for="presetSelect">Preset:</label>
          <select id="presetSelect" class="preset-select">
            <option value="">-- Select Preset --</option>
          </select>
          <button id="savePresetBtn" class="preset-btn">💾 Save</button>
          <button id="managePresetsBtn" class="preset-btn">📁 Manage</button>
        </div>
      `,
    });

    // Add elements to container
    const mainContainer =
      this.container.querySelector(".main-container") || this.container;
    mainContainer.appendChild(controlsElement);

    // Replace existing stats element if it exists
    const existingStats = this.container.querySelector("#stats");
    if (existingStats) {
      existingStats.replaceWith(statsElement);
    } else {
      mainContainer.appendChild(statsElement);
    }
  }

  /**
   * Initialize all panels
   */
  initializePanels() {
    // Create options panel
    this.createOptionsPanel();

    // Create rules panel
    this.createRulesPanel();
  }

  /**
   * Create options panel
   */
  createOptionsPanel() {
    const panel = this.createElement("div", "panel options-panel", {
      id: "optionsPanel",
      innerHTML: `
        <div class="panel-header">
          <h3>⚙️ Physics Options</h3>
          <button class="panel-close">✕</button>
        </div>
        <div class="panel-content">
          <div id="options-grid" class="options-grid"></div>
          <div class="panel-actions">
            <button id="resetOptionsBtn" class="action-btn">Reset to Defaults</button>
            <button id="exportOptionsBtn" class="action-btn">Export Settings</button>
          </div>
        </div>
      `,
    });

    this.container.appendChild(panel);
    this.panels.set("options", panel);
  }

  /**
   * Create rules panel
   */
  createRulesPanel() {
    const panel = this.createElement("div", "panel rules-panel", {
      id: "rulesPanel",
      innerHTML: `
        <div class="panel-header">
          <h3>🎯 Interaction Rules</h3>
          <button class="panel-close">✕</button>
        </div>
        <div class="panel-content">
          <div class="rules-controls">
            <button id="randomizeForceRulesBtn" class="rules-btn">🎲 Random Forces</button>
            <button id="randomizeCollisionRulesBtn" class="rules-btn">💥 Random Collisions</button>
            <button id="clearRulesBtn" class="rules-btn">🧹 Clear All</button>
            <button id="undoRulesBtn" class="rules-btn">↶ Undo</button>
            <button id="redoRulesBtn" class="rules-btn">↷ Redo</button>
          </div>
          <div id="rules-grid" class="rules-grid"></div>
          <div class="panel-actions">
            <button id="exportRulesBtn" class="action-btn">Export Rules</button>
            <button id="importRulesBtn" class="action-btn">Import Rules</button>
          </div>
        </div>
      `,
    });

    this.container.appendChild(panel);
    this.panels.set("rules", panel);
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Panel toggles
    this.addClickListener("optionsToggle", () => this.togglePanel("options"));
    this.addClickListener("rulesToggle", () => this.togglePanel("rules"));
    // this.addClickListener("presetsToggle", () => this.togglePanel("presets"));

    // Panel close buttons
    this.container.addEventListener("click", (e) => {
      if (e.target.classList.contains("panel-close")) {
        const panel = e.target.closest(".panel");
        if (panel) {
          panel.classList.remove("visible");
        }
      }
    });

    // Control buttons (these will be connected to the main game)
    this.addClickListener("pauseBtn", () => this.fireEvent("pause"));
    this.addClickListener("resetBtn", () => this.fireEvent("reset"));
    this.addClickListener("addBtn", () => this.fireEvent("addParticles"));
    this.addClickListener("clearBtn", () => this.fireEvent("clearParticles"));
    this.addClickListener("randomizeBtn", () =>
      this.fireEvent("randomizeRules")
    );
    this.addClickListener("randomColliInHUD", () =>
      this.fireEvent("randomizeCollisionRules")
    );

    // Preset selector
    this.addChangeListener("presetSelect", (e) => {
      this.fireEvent("loadPreset", e.target.value);
    });

    this.addClickListener("savePresetBtn", () => this.fireEvent("savePreset"));
    this.addClickListener("managePresetsBtn", () =>
      this.togglePanel("presets")
    );

    // Options panel buttons
    this.addClickListener("resetOptionsBtn", () =>
      this.fireEvent("resetOptions")
    );
    this.addClickListener("exportOptionsBtn", () =>
      this.fireEvent("exportOptions")
    );

    // Rules panel buttons
    this.addClickListener("randomizeForceRulesBtn", () =>
      this.fireEvent("randomizeForceRules")
    );
    this.addClickListener("randomizeCollisionRulesBtn", () =>
      this.fireEvent("randomizeCollisionRules")
    );
    this.addClickListener("clearRulesBtn", () => this.fireEvent("clearRules"));
    this.addClickListener("undoRulesBtn", () => this.fireEvent("undoRules"));
    this.addClickListener("redoRulesBtn", () => this.fireEvent("redoRules"));
    this.addClickListener("exportRulesBtn", () =>
      this.fireEvent("exportRules")
    );
    this.addClickListener("importRulesBtn", () =>
      this.fireEvent("importRules")
    );

    // Presets panel buttons
    this.addClickListener("createPresetBtn", () =>
      this.fireEvent("createPreset")
    );
    this.addClickListener("importPresetBtn", () =>
      this.fireEvent("importPreset")
    );
  }

  /**
   * Toggle panel visibility
   * @param {string} panelName - Name of panel to toggle
   */
  togglePanel(panelName) {
    const panel = this.panels.get(panelName);
    if (panel) {
      panel.classList.toggle("visible");

      // Close other panels
      this.panels.forEach((otherPanel, name) => {
        if (name !== panelName && otherPanel.classList.contains("visible")) {
          otherPanel.classList.remove("visible");
        }
      });
    }
  }

  /**
   * Update stats display
   * @param {Object} stats - Statistics to display
   */
  updateStats(stats) {
    const statsElement = document.getElementById("stats");
    if (statsElement && stats) {
      this.stats = { ...this.stats, ...stats };
      statsElement.textContent = this.formatStats(this.stats);
    }
  }

  /**
   * Format stats for display
   * @param {Object} stats - Statistics object
   * @returns {string} - Formatted stats string
   */
  formatStats(stats) {
    const parts = [];

    if (stats.particleCount !== undefined) {
      parts.push(`Particles: ${stats.particleCount}`);
    }

    if (stats.fps !== undefined) {
      parts.push(`FPS: ${stats.fps}`);
    }

    if (stats.poolEfficiency !== undefined) {
      parts.push(`Pool: ${stats.poolEfficiency}`);
    }

    if (stats.quadtreeDepth !== undefined) {
      parts.push(`Quadtree: D${stats.quadtreeDepth}`);
    }

    if (stats.avgSpeed !== undefined) {
      parts.push(`Speed: ${stats.avgSpeed.toFixed(1)}`);
    }

    return parts.join(" | ");
  }

  /**
   * Update preset selector options
   * @param {Object} presets - Available presets
   */
  updatePresetSelector(presets) {
    const select = document.getElementById("presetSelect");
    if (!select) return;

    // Clear existing options except the first one
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = "";
    if (firstOption) {
      select.appendChild(firstOption);
    }

    // Add built-in presets
    Object.keys(presets.builtin || {}).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = presets.builtin[name].name || name;
      select.appendChild(option);
    });

    // Add separator if there are custom presets
    if (presets.custom && Object.keys(presets.custom).length > 0) {
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.textContent = "--- Custom Presets ---";
      select.appendChild(separator);

      // Add custom presets
      Object.keys(presets.custom).forEach((name) => {
        const option = document.createElement("option");
        option.value = `custom_${name}`;
        option.textContent = `🎨 ${name}`;
        select.appendChild(option);
      });
    }
  }

  /**
   * Update pause button state
   * @param {boolean} isPaused - Whether the simulation is paused
   */
  updatePauseButton(isPaused) {
    const pauseText = document.getElementById("pauseText");
    if (pauseText) {
      pauseText.textContent = isPaused ? "Resume" : "Pause";
    }
  }

  /**
   * Show notification message
   * @param {string} message - Message to show
   * @param {string} type - Message type (info, success, warning, error)
   * @param {number} duration - Duration in milliseconds
   */
  showNotification(message, type = "info", duration = 3000) {
    const notification = this.createElement(
      "div",
      `notification notification-${type}`,
      {
        textContent: message,
      }
    );

    this.container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add("show"), 10);

    // Remove after duration
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  /**
   * Helper method to create DOM elements
   * @param {string} tag - HTML tag name
   * @param {string} className - CSS class names
   * @param {Object} attributes - Element attributes
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, className = "", attributes = {}) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    Object.keys(attributes).forEach((key) => {
      if (key === "textContent" || key === "innerHTML") {
        element[key] = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    return element;
  }

  /**
   * Add click event listener
   * @param {string} elementId - Element ID
   * @param {Function} handler - Event handler
   */
  addClickListener(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener("click", handler);
      this.eventListeners.set(elementId, { type: "click", handler });
    }
  }

  /**
   * Add change event listener
   * @param {string} elementId - Element ID
   * @param {Function} handler - Event handler
   */
  addChangeListener(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener("change", handler);
      this.eventListeners.set(elementId, { type: "change", handler });
    }
  }

  /**
   * Fire custom event
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  fireEvent(eventName, data = null) {
    const event = new CustomEvent(`ui-${eventName}`, { detail: data });
    this.container.dispatchEvent(event);
  }

  /**
   * Add event listener for UI events
   * @param {string} eventName - Event name (without 'ui-' prefix)
   * @param {Function} handler - Event handler
   */
  addEventListener(eventName, handler) {
    this.container.addEventListener(`ui-${eventName}`, handler);
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name (without 'ui-' prefix)
   * @param {Function} handler - Event handler
   */
  removeEventListener(eventName, handler) {
    this.container.removeEventListener(`ui-${eventName}`, handler);
  }

  /**
   * Apply theme to UI
   * @param {string} themeName - Theme name
   */
  applyTheme(themeName) {
    if (UI_CONFIG.colorSchemes[themeName]) {
      this.currentTheme = themeName;
      const theme = UI_CONFIG.colorSchemes[themeName];

      // Apply CSS custom properties
      Object.keys(theme).forEach((property) => {
        document.documentElement.style.setProperty(
          `--${property}`,
          theme[property]
        );
      });

      console.log(`🎨 Applied theme: ${themeName}`);
    }
  }

  /**
   * Get panel element
   * @param {string} panelName - Panel name
   * @returns {HTMLElement|null} - Panel element or null
   */
  getPanel(panelName) {
    return this.panels.get(panelName) || null;
  }

  /**
   * Show/hide panel
   * @param {string} panelName - Panel name
   * @param {boolean} visible - Whether to show panel
   */
  setPanelVisibility(panelName, visible) {
    const panel = this.panels.get(panelName);
    if (panel) {
      if (visible) {
        panel.classList.add("visible");
      } else {
        panel.classList.remove("visible");
      }
    }
  }

  /**
   * Cleanup UI resources
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach((listener, elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.removeEventListener(listener.type, listener.handler);
      }
    });

    this.eventListeners.clear();
    this.panels.clear();
    this.isInitialized = false;

    console.log("🧹 UIManager cleaned up");
  }

  /**
   * Validate UI state
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    if (!this.isInitialized) {
      issues.push("UIManager not initialized");
    }

    if (!this.container) {
      issues.push("No container element set");
    }

    // Check required elements
    const requiredElements = ["stats", "pauseBtn", "presetSelect"];
    requiredElements.forEach((id) => {
      if (!document.getElementById(id)) {
        issues.push(`Missing required element: ${id}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      panels: Array.from(this.panels.keys()),
      eventListeners: this.eventListeners.size,
    };
  }
}

// Export singleton instance
export const uiManager = new UIManager();

// Export class for multiple instances if needed
export default UIManager;
