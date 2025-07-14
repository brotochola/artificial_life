import { PARTICLE_CONFIG } from "../core/Config.js";

/**
 * Rules Panel for managing particle interaction rules
 * Handles the creation and updating of the rules grid UI
 */
export class RulesPanel {
  constructor() {
    this.rules = {};
    this.isInitialized = false;
    this.onRuleChange = null;
    this.currentInputs = new Map();
  }

  /**
   * Get current particle types
   * @returns {Array} - Array of particle type IDs
   */
  get types() {
    return PARTICLE_CONFIG.types;
  }

  /**
   * Initialize the rules panel
   * @param {HTMLElement} container - Container element for the rules grid
   * @param {Function} onRuleChange - Callback for when rules change
   */
  initialize(container, onRuleChange) {
    this.container = container;
    this.onRuleChange = onRuleChange;
    this.initializeDefaultRules();
    this.render();
    this.isInitialized = true;
    console.log("🎯 RulesPanel initialized");
  }

  /**
   * Initialize default empty rules structure
   */
  initializeDefaultRules() {
    this.rules = {};
    this.types.forEach((type1) => {
      this.rules[type1] = {};
      this.types.forEach((type2) => {
        this.rules[type1][type2] = {
          closeForce: 0,
          farForce: 0,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        };
      });
    });
  }

  /**
   * Update current rules and refresh display
   * @param {Object} newRules - New rules to apply
   */
  updateRules(newRules) {
    this.rules = JSON.parse(JSON.stringify(newRules)); // Deep copy
    this.refresh();
  }

  /**
   * Render the complete rules panel
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = "";

    // Create header row
    const headerRow = this.createRulesHeader();
    this.container.appendChild(headerRow);

    // Create grid cells
    this.types.forEach((fromType) => {
      // Row header
      const rowHeader = this.createRowHeader(fromType);
      this.container.appendChild(rowHeader);

      // Rule cells for this row
      this.types.forEach((toType) => {
        const ruleCell = this.createRuleCell(fromType, toType);
        this.container.appendChild(ruleCell);
      });
    });

    // Set up grid layout
    this.setupGridLayout();
  }

  /**
   * Create the rules grid header
   * @returns {DocumentFragment} - Header elements
   */
  createRulesHeader() {
    const fragment = document.createDocumentFragment();

    // Empty corner cell
    const cornerCell = document.createElement("div");
    cornerCell.className = "rules-cell rules-header corner-cell";
    cornerCell.textContent = "From → To";
    fragment.appendChild(cornerCell);

    // Column headers
    this.types.forEach((typeId) => {
      const type = PARTICLE_CONFIG.getTypeById(typeId);
      const headerCell = document.createElement("div");
      headerCell.className = "rules-cell rules-header";
      headerCell.innerHTML = `<span class="type-label ${typeId}" style="color: ${type.color}">${type.name}</span>`;
      fragment.appendChild(headerCell);
    });

    return fragment;
  }

  /**
   * Create a row header
   * @param {string} typeId - Particle type ID
   * @returns {HTMLElement} - Row header element
   */
  createRowHeader(typeId) {
    const type = PARTICLE_CONFIG.getTypeById(typeId);
    const headerCell = document.createElement("div");
    headerCell.className = "rules-cell rules-type";
    headerCell.innerHTML = `<span class="type-label ${typeId}" style="color: ${type.color}">${type.name}</span>`;
    return headerCell;
  }

  /**
   * Create a single rule cell with editable inputs
   * @param {string} fromType - Source particle type
   * @param {string} toType - Target particle type
   * @returns {HTMLElement} - Rule cell element
   */
  createRuleCell(fromType, toType) {
    const cell = document.createElement("div");
    cell.className = "rules-cell editable";
    cell.dataset.from = fromType;
    cell.dataset.to = toType;

    if (this.rules[fromType] && this.rules[fromType][toType]) {
      const rule = this.rules[fromType][toType];

      // Determine visual indicator class
      let indicatorClass = this.getIndicatorClass(rule);

      cell.innerHTML = `
        <div class="rule-inputs">
          <div class="force-section">
            <div class="input-group">
              <label>Close:</label>
              <input type="number" 
                     class="rule-input close-force" 
                     value="${rule.closeForce.toFixed(3)}" 
                     step="0.01" 
                     min="-2" 
                     max="2"
                     data-property="closeForce">
            </div>
            <div class="input-group">
              <label>Far:</label>
              <input type="number" 
                     class="rule-input far-force" 
                     value="${rule.farForce.toFixed(3)}" 
                     step="0.01" 
                     min="-2" 
                     max="2"
                     data-property="farForce">
            </div>
            <div class="input-group">
              <label>Threshold:</label>
              <input type="number" 
                     class="rule-input threshold" 
                     value="${Math.round(rule.threshold)}" 
                     step="5" 
                     min="10" 
                     max="100"
                     data-property="threshold">
            </div>
          </div>
          
          <div class="collision-section">
            <div class="input-group collision-group">
              <label class="checkbox-label">
                <input type="checkbox" 
                       class="rule-checkbox" 
                       ${rule.destroyOriginals ? "checked" : ""}
                       data-property="destroyOriginals"> 
                <span>Destroy</span>
              </label>
            </div>
            
            <div class="create-particles">
              ${this.types
                .map(
                  (type) => `
                <div class="create-group">
                  <label class="create-label">
                    <span class="type-label ${type}">${type}</span>:
                    <input type="number" 
                           class="create-input" 
                           value="${this.getCreateCount(
                             rule.createParticles,
                             type
                           )}" 
                           min="0" 
                           max="5"
                           data-create-type="${type}">
                  </label>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          <div class="rule-indicator ${indicatorClass}"></div>
        </div>
      `;

      // Add event listeners for real-time updates
      this.addCellEventListeners(cell, fromType, toType);
    } else {
      cell.textContent = "N/A";
      cell.classList.add("inactive");
    }

    return cell;
  }

  /**
   * Setup CSS Grid layout for the rules grid
   */
  setupGridLayout() {
    const columnCount = this.types.length + 1; // +1 for row headers
    this.container.style.display = "grid";
    this.container.style.gridTemplateColumns = `120px repeat(${this.types.length}, 1fr)`;
    this.container.style.gap = "2px";
    this.container.classList.add("rules-grid-container");
  }

  /**
   * Add event listeners to a rule cell
   * @param {HTMLElement} cell - Rule cell element
   * @param {string} fromType - Source particle type
   * @param {string} toType - Target particle type
   */
  addCellEventListeners(cell, fromType, toType) {
    const inputs = cell.querySelectorAll(
      ".rule-input, .rule-checkbox, .create-input"
    );

    inputs.forEach((input) => {
      const updateHandler = () => this.updateRuleValue(input, fromType, toType);

      if (input.type === "checkbox") {
        input.addEventListener("change", updateHandler);
      } else {
        input.addEventListener("input", updateHandler);

        // Debounce rapid changes
        let timeout;
        input.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(updateHandler, 100);
        });
      }

      // Store reference for cleanup
      this.currentInputs.set(
        `${fromType}-${toType}-${
          input.dataset.property || input.dataset.createType
        }`,
        input
      );
    });
  }

  /**
   * Update a single rule value in real-time
   * @param {HTMLInputElement} input - Input element that changed
   * @param {string} fromType - Source particle type
   * @param {string} toType - Target particle type
   */
  updateRuleValue(input, fromType, toType) {
    const property = input.dataset.property;
    const createType = input.dataset.createType;

    if (!this.rules[fromType] || !this.rules[fromType][toType]) return;

    const rule = this.rules[fromType][toType];

    if (createType) {
      // Handle create particles count
      this.updateCreateParticles(rule, createType, parseInt(input.value) || 0);
      console.log(
        `🔬 Updated collision rule: ${fromType} → ${toType}, create ${input.value} ${createType}`
      );
    } else if (property === "destroyOriginals") {
      // Handle checkbox
      rule[property] = input.checked;
      console.log(
        `🔬 Updated collision rule: ${fromType} → ${toType}, ${property} = ${input.checked}`
      );
    } else if (property) {
      // Handle numeric properties
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        rule[property] = value;
        console.log(
          `🎯 Updated force rule: ${fromType} → ${toType}, ${property} = ${value}`
        );
      }
    }

    // Update visual indicator
    this.updateCellIndicator(input.closest(".rules-cell"), rule);

    // Fire change event
    if (this.onRuleChange) {
      this.onRuleChange(fromType, toType, rule, this.rules);
    }
  }

  /**
   * Update create particles array for a rule
   * @param {Object} rule - Rule object
   * @param {string} type - Particle type to create
   * @param {number} count - Number of particles to create
   */
  updateCreateParticles(rule, type, count) {
    if (!rule.createParticles) {
      rule.createParticles = [];
    }

    // Find existing entry
    let existingIndex = rule.createParticles.findIndex((p) => p.type === type);

    if (count > 0) {
      if (existingIndex >= 0) {
        rule.createParticles[existingIndex].count = count;
      } else {
        rule.createParticles.push({ type, count });
      }
    } else {
      // Remove entry if count is 0
      if (existingIndex >= 0) {
        rule.createParticles.splice(existingIndex, 1);
      }
    }
  }

  /**
   * Get create count for a specific type
   * @param {Array} createParticles - Array of create particle rules
   * @param {string} type - Particle type
   * @returns {number} - Count of particles to create
   */
  getCreateCount(createParticles, type) {
    const found = createParticles.find((p) => p.type === type);
    return found ? found.count : 0;
  }

  /**
   * Get indicator class for a rule
   * @param {Object} rule - Rule object
   * @returns {string} - CSS class for indicator
   */
  getIndicatorClass(rule) {
    const netForce = rule.closeForce + rule.farForce;
    let classes = [];

    // Force indicator
    if (netForce > 0.1) {
      classes.push("force-attract");
    } else if (netForce < -0.1) {
      classes.push("force-repel");
    } else {
      classes.push("force-neutral");
    }

    // Collision indicator
    if (
      rule.destroyOriginals ||
      (rule.createParticles && rule.createParticles.length > 0)
    ) {
      classes.push("has-collision");
    }

    return classes.join(" ");
  }

  /**
   * Update the visual indicator for a rule cell
   * @param {HTMLElement} cell - Rule cell element
   * @param {Object} rule - Rule object
   */
  updateCellIndicator(cell, rule) {
    const indicator = cell.querySelector(".rule-indicator");
    if (!indicator) return;

    // Remove existing classes
    indicator.className = "rule-indicator";

    // Add new classes
    const indicatorClass = this.getIndicatorClass(rule);
    indicator.className += " " + indicatorClass;
  }

  /**
   * Refresh the entire panel display
   */
  refresh() {
    if (!this.isInitialized) return;

    this.types.forEach((fromType) => {
      this.types.forEach((toType) => {
        const cell = this.container.querySelector(
          `[data-from="${fromType}"][data-to="${toType}"]`
        );
        if (cell && this.rules[fromType] && this.rules[fromType][toType]) {
          const rule = this.rules[fromType][toType];

          // Update input values
          const inputs = cell.querySelectorAll(
            ".rule-input, .rule-checkbox, .create-input"
          );
          inputs.forEach((input) => {
            const property = input.dataset.property;
            const createType = input.dataset.createType;

            if (createType) {
              input.value = this.getCreateCount(
                rule.createParticles,
                createType
              );
            } else if (property === "destroyOriginals") {
              input.checked = rule[property];
            } else if (property && rule[property] !== undefined) {
              if (property === "closeForce" || property === "farForce") {
                input.value = rule[property].toFixed(3);
              } else {
                input.value = rule[property];
              }
            }
          });

          // Update indicator
          this.updateCellIndicator(cell, rule);
        }
      });
    });
  }

  /**
   * Clear all rules
   */
  clearAllRules() {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];
        rule.closeForce = 0;
        rule.farForce = 0;
        rule.threshold = 30;
        rule.destroyOriginals = false;
        rule.createParticles = [];
      });
    });

    this.refresh();
    if (this.onRuleChange) {
      this.onRuleChange("all", "all", null, this.rules);
    }

    console.log("🧹 All rules cleared");
  }

  /**
   * Randomize force rules
   */
  randomizeForceRules() {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];
        rule.closeForce = (Math.random() - 0.5) * 2;
        rule.farForce = (Math.random() - 0.5) * 2;
        rule.threshold = 20 + Math.random() * 40;
      });
    });

    this.refresh();
    if (this.onRuleChange) {
      this.onRuleChange("all", "all", null, this.rules);
    }

    console.log("🎲 Force rules randomized");
  }

  /**
   * Randomize collision rules
   */
  randomizeCollisionRules() {
    // Clear existing collision rules first
    this.clearCollisionRules();

    let rulesCreated = 0;
    const maxRules = Math.floor(this.types.length * this.types.length * 0.3);

    // Create possible pairs (excluding self-collisions)
    const possiblePairs = [];
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        if (type1 !== type2) {
          possiblePairs.push([type1, type2]);
        }
      });
    });

    // Shuffle and select subset
    const shuffledPairs = possiblePairs.sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPairs.slice(0, maxRules);

    selectedPairs.forEach(([type1, type2]) => {
      if (Math.random() < 0.7) {
        // 70% chance of creating rule
        const rule = this.rules[type1][type2];
        rule.destroyOriginals = Math.random() < 0.6; // 60% chance to destroy

        if (rule.destroyOriginals) {
          // Conservative creation when destroying
          const creationChance = Math.random();
          if (creationChance < 0.4) {
            // Create 2 particles of same type
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            rule.createParticles = [{ type: newType, count: 2 }];
          } else if (creationChance < 0.7) {
            // Create 1 particle of each of 2 different types
            const type1 =
              this.types[Math.floor(Math.random() * this.types.length)];
            let type2 =
              this.types[Math.floor(Math.random() * this.types.length)];
            while (type2 === type1) {
              type2 = this.types[Math.floor(Math.random() * this.types.length)];
            }
            rule.createParticles = [
              { type: type1, count: 1 },
              { type: type2, count: 1 },
            ];
          } else if (creationChance < 0.85) {
            // Create 1 particle
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            rule.createParticles = [{ type: newType, count: 1 }];
          }
        } else {
          // Very conservative when keeping originals
          if (Math.random() < 0.3) {
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            rule.createParticles = [{ type: newType, count: 1 }];
          }
        }

        rulesCreated++;
      }
    });

    this.refresh();
    if (this.onRuleChange) {
      this.onRuleChange("all", "all", null, this.rules);
    }

    console.log(
      `✅ Created ${rulesCreated} collision rules with growth constraints`
    );
  }

  /**
   * Clear collision rules only
   */
  clearCollisionRules() {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];
        rule.destroyOriginals = false;
        rule.createParticles = [];
      });
    });

    this.refresh();
    console.log("🧹 Collision rules cleared");
  }

  /**
   * Get current rules
   * @returns {Object} - Current rules object
   */
  getRules() {
    return JSON.parse(JSON.stringify(this.rules)); // Deep copy
  }

  /**
   * Set rules from external source
   * @param {Object} newRules - New rules to apply
   */
  setRules(newRules) {
    this.updateRules(newRules);
    if (this.onRuleChange) {
      this.onRuleChange("all", "all", null, this.rules);
    }
  }

  /**
   * Export current rules as JSON
   * @returns {string} - JSON string of rules
   */
  exportRules() {
    return JSON.stringify(
      {
        rules: this.rules,
        types: this.types,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      },
      null,
      2
    );
  }

  /**
   * Import rules from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {boolean} - Whether import was successful
   */
  importRules(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (data.rules && data.types) {
        this.types = data.types;
        this.updateRules(data.rules);
        console.log("✅ Rules imported successfully");
        return true;
      } else {
        console.error("Invalid rules format");
        return false;
      }
    } catch (error) {
      console.error("Error importing rules:", error);
      return false;
    }
  }

  /**
   * Get rules summary
   * @returns {Object} - Rules summary statistics
   */
  getRulesSummary() {
    const summary = {
      forceRules: 0,
      collisionRules: 0,
      totalRules: 0,
      particleBalance: { created: 0, destroyed: 0 },
    };

    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];

        // Count force rules
        if (rule.closeForce !== 0 || rule.farForce !== 0) {
          summary.forceRules++;
        }

        // Count collision rules
        if (rule.destroyOriginals || rule.createParticles.length > 0) {
          summary.collisionRules++;

          // Calculate particle balance
          if (rule.destroyOriginals) {
            summary.particleBalance.destroyed += 2;
          }

          rule.createParticles.forEach((creation) => {
            summary.particleBalance.created += creation.count;
          });
        }

        summary.totalRules++;
      });
    });

    return summary;
  }

  /**
   * Validate current rules
   * @returns {Object} - Validation results
   */
  validateRules() {
    const issues = [];
    const warnings = [];

    this.types.forEach((type1) => {
      if (!this.rules[type1]) {
        issues.push(`Missing rules for type: ${type1}`);
        return;
      }

      this.types.forEach((type2) => {
        if (!this.rules[type1][type2]) {
          issues.push(`Missing rule: ${type1} -> ${type2}`);
          return;
        }

        const rule = this.rules[type1][type2];

        // Validate force values
        if (typeof rule.closeForce !== "number" || isNaN(rule.closeForce)) {
          issues.push(`Invalid closeForce for ${type1} -> ${type2}`);
        }

        if (typeof rule.farForce !== "number" || isNaN(rule.farForce)) {
          issues.push(`Invalid farForce for ${type1} -> ${type2}`);
        }

        if (typeof rule.threshold !== "number" || rule.threshold <= 0) {
          issues.push(`Invalid threshold for ${type1} -> ${type2}`);
        }

        // Check for extreme force values
        if (Math.abs(rule.closeForce) > 3 || Math.abs(rule.farForce) > 3) {
          warnings.push(`Extreme force values in ${type1} -> ${type2}`);
        }
      });
    });

    // Check particle balance
    const summary = this.getRulesSummary();
    if (
      summary.particleBalance.created >
      summary.particleBalance.destroyed * 1.5
    ) {
      warnings.push("Collision rules may cause particle explosion");
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      summary,
    };
  }

  /**
   * Cleanup panel resources
   */
  cleanup() {
    this.currentInputs.clear();
    this.isInitialized = false;
    console.log("🧹 RulesPanel cleaned up");
  }
}

// Export singleton instance
export const rulesPanel = new RulesPanel();

// Export class for multiple instances if needed
export default RulesPanel;
