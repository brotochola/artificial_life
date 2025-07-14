import { PARTICLE_CONFIG } from "../core/Config.js";

/**
 * Options Panel for managing physics and simulation parameters
 * Handles the creation and updating of the options UI
 */
export class OptionsPanel {
  constructor() {
    this.options = { ...PARTICLE_CONFIG.defaultOptions };
    this.optionConfigs = PARTICLE_CONFIG.optionConfigs;
    this.isInitialized = false;
    this.changeHandlers = new Map();
  }

  /**
   * Initialize the options panel
   * @param {HTMLElement} container - Container element for the options grid
   * @param {Function} onOptionChange - Callback for when options change
   */
  initialize(container, onOptionChange) {
    this.container = container;
    this.onOptionChange = onOptionChange;
    this.render();
    this.isInitialized = true;

    console.log("⚙️ OptionsPanel initialized");
  }

  /**
   * Update current options and refresh display
   * @param {Object} newOptions - New options to apply
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.refresh();
  }

  /**
   * Render the complete options panel
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = "";

    // Create option items for each property
    Object.keys(this.optionConfigs).forEach((key) => {
      const config = this.optionConfigs[key];
      const optionItem = this.createOptionItem(key, config);
      this.container.appendChild(optionItem);
    });
  }

  /**
   * Create an individual option item
   * @param {string} key - Option key
   * @param {Object} config - Option configuration
   * @returns {HTMLElement} - Option item element
   */
  createOptionItem(key, config) {
    const div = document.createElement("div");
    div.className = "option-item";

    const currentValue = this.options[key];

    div.innerHTML = `
      <div class="option-label">${config.label}</div>
      <div class="option-value" id="value-${key}">
        ${this.formatValue(currentValue, config.type)}
      </div>
      <div class="option-controls">
        ${this.createOptionControls(key, config)}
      </div>
    `;

    // Add event listeners for controls
    this.addOptionEventListeners(div, key, config);

    return div;
  }

  /**
   * Create controls for each option type
   * @param {string} key - Option key
   * @param {Object} config - Option configuration
   * @returns {string} - HTML for controls
   */
  createOptionControls(key, config) {
    if (config.type === "boolean") {
      return `<button class="option-btn toggle-btn" data-key="${key}">Toggle</button>`;
    } else if (config.type === "select") {
      const optionsHTML = config.options
        .map(
          (option) =>
            `<option value="${option.value}" ${
              this.options[key] === option.value ? "selected" : ""
            }>${option.label}</option>`
        )
        .join("");

      return `
        <select class="option-select" data-key="${key}">
          ${optionsHTML}
        </select>
        <button class="option-btn reset-btn" data-key="${key}">↺</button>
      `;
    } else {
      const step = config.step || 0.1;
      const decrease = Math.max(0.1, step);
      const increase = step;

      return `
        <button class="option-btn decrease-btn" data-key="${key}" data-delta="-${decrease}">−</button>
        <input type="number" 
               class="option-input" 
               data-key="${key}"
               value="${this.options[key]}" 
               step="${step}"
               min="${config.min || ""}"
               max="${config.max || ""}">
        <button class="option-btn increase-btn" data-key="${key}" data-delta="${increase}">+</button>
        <button class="option-btn reset-btn" data-key="${key}">↺</button>
      `;
    }
  }

  /**
   * Add event listeners to option controls
   * @param {HTMLElement} container - Option item container
   * @param {string} key - Option key
   * @param {Object} config - Option configuration
   */
  addOptionEventListeners(container, key, config) {
    // Button event listeners
    const buttons = container.querySelectorAll(".option-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        if (button.classList.contains("toggle-btn")) {
          this.toggleOption(key);
        } else if (
          button.classList.contains("decrease-btn") ||
          button.classList.contains("increase-btn")
        ) {
          const delta = parseFloat(button.dataset.delta);
          this.adjustOption(key, delta, config);
        } else if (button.classList.contains("reset-btn")) {
          this.resetOption(key);
        }
      });
    });

    // Input event listener
    const input = container.querySelector(".option-input");
    if (input) {
      input.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
          this.setOption(key, value, config);
        }
      });

      // Prevent form submission on enter
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          input.blur();
        }
      });
    }

    // Select event listener
    const select = container.querySelector(".option-select");
    if (select) {
      select.addEventListener("change", (e) => {
        this.setOption(key, e.target.value, config);
      });
    }
  }

  /**
   * Toggle a boolean option
   * @param {string} key - Option key
   */
  toggleOption(key) {
    this.options[key] = !this.options[key];
    this.updateOptionDisplay(key);
    this.fireOptionChange(key, this.options[key]);
    console.log(`🎛️ ${key} toggled to ${this.options[key]}`);
  }

  /**
   * Adjust a numeric option
   * @param {string} key - Option key
   * @param {number} delta - Amount to adjust
   * @param {Object} config - Option configuration
   */
  adjustOption(key, delta, config) {
    let newValue = this.options[key] + delta;

    if (config.min !== undefined) newValue = Math.max(config.min, newValue);
    if (config.max !== undefined) newValue = Math.min(config.max, newValue);

    // Round to avoid floating point precision issues
    if (config.step) {
      newValue = Math.round(newValue / config.step) * config.step;
    }

    this.setOption(key, newValue, config);
  }

  /**
   * Set an option to a specific value
   * @param {string} key - Option key
   * @param {*} value - New value
   * @param {Object} config - Option configuration
   */
  setOption(key, value, config) {
    // Validate value
    if (config.min !== undefined && value < config.min) {
      value = config.min;
    }
    if (config.max !== undefined && value > config.max) {
      value = config.max;
    }

    this.options[key] = value;
    this.updateOptionDisplay(key);
    this.updateOptionInput(key, value);
    this.fireOptionChange(key, value);

    console.log(`🎛️ ${key} set to ${value}`);
  }

  /**
   * Reset an option to its default value
   * @param {string} key - Option key
   */
  resetOption(key) {
    const defaultValue = PARTICLE_CONFIG.defaultOptions[key];
    if (defaultValue !== undefined) {
      this.setOption(key, defaultValue, this.optionConfigs[key]);
      console.log(`🔄 ${key} reset to default: ${defaultValue}`);
    }
  }

  /**
   * Update the display for a specific option
   * @param {string} key - Option key
   */
  updateOptionDisplay(key) {
    const valueElement = document.getElementById(`value-${key}`);
    if (valueElement) {
      const config = this.optionConfigs[key];
      valueElement.textContent = this.formatValue(
        this.options[key],
        config.type
      );
    }
  }

  /**
   * Update the input field for a specific option
   * @param {string} key - Option key
   * @param {*} value - New value
   */
  updateOptionInput(key, value) {
    const input = this.container.querySelector(`input[data-key="${key}"]`);
    if (input && input.value !== value.toString()) {
      input.value = value;
    }

    const select = this.container.querySelector(`select[data-key="${key}"]`);
    if (select && select.value !== value.toString()) {
      select.value = value;
    }
  }

  /**
   * Format values for display
   * @param {*} value - Value to format
   * @param {string} type - Value type
   * @returns {string} - Formatted value
   */
  formatValue(value, type) {
    if (type === "boolean") {
      return value ? "✅ Enabled" : "❌ Disabled";
    } else if (type === "select") {
      // Find the option config for this value
      const optionKey = Object.keys(this.optionConfigs).find(
        (key) =>
          this.optionConfigs[key].type === "select" &&
          this.options[key] === value
      );
      if (optionKey) {
        const config = this.optionConfigs[optionKey];
        const option = config.options.find((opt) => opt.value === value);
        return option ? option.label : value.toString();
      }
      return value.toString();
    } else if (typeof value === "number") {
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    }
    return value.toString();
  }

  /**
   * Fire option change event
   * @param {string} key - Option key that changed
   * @param {*} value - New value
   */
  fireOptionChange(key, value) {
    if (this.onOptionChange) {
      this.onOptionChange(key, value, this.options);
    }
  }

  /**
   * Reset all options to defaults
   */
  resetAllOptions() {
    Object.keys(this.options).forEach((key) => {
      const defaultValue = PARTICLE_CONFIG.defaultOptions[key];
      if (defaultValue !== undefined) {
        this.options[key] = defaultValue;
      }
    });

    this.refresh();
    this.fireOptionChange("all", this.options);
    console.log("🔄 All options reset to defaults");
  }

  /**
   * Get current options
   * @returns {Object} - Current options
   */
  getOptions() {
    return { ...this.options };
  }

  /**
   * Set multiple options at once
   * @param {Object} newOptions - Options to set
   */
  setOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this.refresh();
    this.fireOptionChange("multiple", this.options);
  }

  /**
   * Refresh the entire panel display
   */
  refresh() {
    Object.keys(this.options).forEach((key) => {
      this.updateOptionDisplay(key);
      this.updateOptionInput(key, this.options[key]);
    });
  }

  /**
   * Export current options as JSON
   * @returns {string} - JSON string of options
   */
  exportOptions() {
    return JSON.stringify(
      {
        options: this.options,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      },
      null,
      2
    );
  }

  /**
   * Import options from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {boolean} - Whether import was successful
   */
  importOptions(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (data.options) {
        // Validate imported options
        const validOptions = {};
        Object.keys(data.options).forEach((key) => {
          if (this.optionConfigs[key]) {
            validOptions[key] = data.options[key];
          }
        });

        this.setOptions(validOptions);
        console.log("✅ Options imported successfully");
        return true;
      } else {
        console.error("Invalid options format");
        return false;
      }
    } catch (error) {
      console.error("Error importing options:", error);
      return false;
    }
  }

  /**
   * Create a preset from current options
   * @param {string} name - Preset name
   * @returns {Object} - Preset object
   */
  createPreset(name) {
    return {
      name: name,
      description: `Custom preset - ${name}`,
      physics: { ...this.options },
      createdDate: new Date().toISOString(),
    };
  }

  /**
   * Apply preset to options
   * @param {Object} preset - Preset to apply
   */
  applyPreset(preset) {
    if (preset.physics) {
      this.setOptions(preset.physics);
      console.log(`🎮 Applied preset: ${preset.name || "Unknown"}`);
    }
  }

  /**
   * Validate current options
   * @returns {Object} - Validation results
   */
  validateOptions() {
    const issues = [];
    const warnings = [];

    Object.keys(this.options).forEach((key) => {
      const config = this.optionConfigs[key];
      const value = this.options[key];

      if (!config) {
        issues.push(`Unknown option: ${key}`);
        return;
      }

      // Type validation
      if (config.type === "boolean" && typeof value !== "boolean") {
        issues.push(`${key} should be boolean, got ${typeof value}`);
      } else if (config.type !== "boolean" && typeof value !== "number") {
        issues.push(`${key} should be number, got ${typeof value}`);
      }

      // Range validation
      if (typeof value === "number") {
        if (config.min !== undefined && value < config.min) {
          issues.push(`${key} is below minimum (${config.min}): ${value}`);
        }
        if (config.max !== undefined && value > config.max) {
          issues.push(`${key} is above maximum (${config.max}): ${value}`);
        }

        // Warning for extreme values
        if (config.min !== undefined && config.max !== undefined) {
          const range = config.max - config.min;
          const normalizedValue = (value - config.min) / range;
          if (normalizedValue < 0.05 || normalizedValue > 0.95) {
            warnings.push(`${key} is at extreme value: ${value}`);
          }
        }
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      optionCount: Object.keys(this.options).length,
    };
  }

  /**
   * Get option statistics
   * @returns {Object} - Option statistics
   */
  getStatistics() {
    const stats = {
      totalOptions: Object.keys(this.options).length,
      booleanOptions: 0,
      numericOptions: 0,
      defaultValues: 0,
      modifiedValues: 0,
    };

    Object.keys(this.options).forEach((key) => {
      const config = this.optionConfigs[key];
      const value = this.options[key];
      const defaultValue = PARTICLE_CONFIG.defaultOptions[key];

      if (config.type === "boolean") {
        stats.booleanOptions++;
      } else {
        stats.numericOptions++;
      }

      if (value === defaultValue) {
        stats.defaultValues++;
      } else {
        stats.modifiedValues++;
      }
    });

    return stats;
  }

  /**
   * Cleanup panel resources
   */
  cleanup() {
    this.changeHandlers.clear();
    this.isInitialized = false;
    console.log("🧹 OptionsPanel cleaned up");
  }
}

// Export singleton instance
export const optionsPanel = new OptionsPanel();

// Export class for multiple instances if needed
export default OptionsPanel;
