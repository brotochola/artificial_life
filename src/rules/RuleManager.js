import { PARTICLE_CONFIG } from "../core/Config.js";

/**
 * Rule Manager for handling particle interaction rules
 * Manages force rules, collision rules, and rule generation
 */
export class RuleManager {
  constructor() {
    this.rules = {};
    this.initialized = false;

    // Rule history for undo/redo functionality
    this.ruleHistory = [];
    this.currentHistoryIndex = -1;
    this.maxHistorySize = 50;
  }

  /**
   * Get current particle types
   * @returns {Array} - Array of particle type IDs
   */
  get types() {
    return PARTICLE_CONFIG.types;
  }

  /**
   * Initialize rules with default empty structure
   */
  initialize() {
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

    this.initialized = true;
    this.saveToHistory("Initial rules");
    console.log("🎯 RuleManager initialized");
  }

  /**
   * Get current rules
   * @returns {Object} - Current rules object
   */
  getRules() {
    return this.rules;
  }

  /**
   * Set complete rules object
   * @param {Object} newRules - New rules object
   * @param {string} historyLabel - Label for history entry
   */
  setRules(newRules, historyLabel = "Rules updated") {
    this.rules = JSON.parse(JSON.stringify(newRules)); // Deep copy
    this.saveToHistory(historyLabel);
    console.log(`🎯 Rules set: ${historyLabel}`);
  }

  /**
   * Set a force rule between two particle types
   * @param {string} type1 - First particle type
   * @param {string} type2 - Second particle type
   * @param {number} closeForce - Force when particles are close
   * @param {number} farForce - Force when particles are far
   * @param {number} threshold - Distance threshold
   */
  setForceRule(type1, type2, closeForce, farForce, threshold) {
    if (!this.rules[type1] || !this.rules[type1][type2]) {
      console.error(`Rule ${type1} -> ${type2} not found`);
      return;
    }

    this.rules[type1][type2].closeForce = closeForce;
    this.rules[type1][type2].farForce = farForce;
    this.rules[type1][type2].threshold = threshold;

    console.log(
      `🎯 Force rule set: ${type1} -> ${type2} (close: ${closeForce}, far: ${farForce}, threshold: ${threshold})`
    );
  }

  /**
   * Set a collision rule between two particle types
   * @param {string} type1 - First particle type
   * @param {string} type2 - Second particle type
   * @param {boolean} destroyOriginals - Whether to destroy original particles
   * @param {Array} createParticles - Array of particles to create
   */
  setCollisionRule(type1, type2, destroyOriginals, createParticles) {
    if (!this.rules[type1] || !this.rules[type1][type2]) {
      console.error(`Rule ${type1} -> ${type2} not found`);
      return;
    }

    this.rules[type1][type2].destroyOriginals = destroyOriginals;
    this.rules[type1][type2].createParticles = createParticles || [];

    console.log(
      `🔬 Collision rule set: ${type1} + ${type2} -> ${
        destroyOriginals ? "destroy originals" : "keep originals"
      }, create:`,
      createParticles
    );
  }

  /**
   * Generate random force rules
   * @param {string} historyLabel - Label for history entry
   */
  randomizeForceRules(historyLabel = "Random force rules") {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        this.rules[type1][type2].closeForce = (Math.random() - 0.5) * 2;
        this.rules[type1][type2].farForce = (Math.random() - 0.5) * 2;
        this.rules[type1][type2].threshold = 20 + Math.random() * 40;
      });
    });

    this.saveToHistory(historyLabel);
    console.log("🎲 Force rules randomized");
  }

  /**
   * Generate random collision rules with smart constraints
   * @param {string} historyLabel - Label for history entry
   */
  randomizeCollisionRules(historyLabel = "Random collision rules") {
    console.log("🎲 Randomizing collision rules with growth constraints...");

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
        const destroyOriginals = Math.random() < 0.6; // 60% chance to destroy
        let createParticles = [];

        if (destroyOriginals) {
          // Conservative creation when destroying
          const creationChance = Math.random();
          if (creationChance < 0.4) {
            // Create 2 particles of same type
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            createParticles = [{ type: newType, count: 2 }];
          } else if (creationChance < 0.7) {
            // Create 1 particle of each of 2 different types
            const type1 =
              this.types[Math.floor(Math.random() * this.types.length)];
            let type2 =
              this.types[Math.floor(Math.random() * this.types.length)];
            while (type2 === type1) {
              type2 = this.types[Math.floor(Math.random() * this.types.length)];
            }
            createParticles = [
              { type: type1, count: 1 },
              { type: type2, count: 1 },
            ];
          } else if (creationChance < 0.85) {
            // Create 1 particle
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            createParticles = [{ type: newType, count: 1 }];
          }
        } else {
          // Very conservative when keeping originals
          if (Math.random() < 0.3) {
            const newType =
              this.types[Math.floor(Math.random() * this.types.length)];
            createParticles = [{ type: newType, count: 1 }];
          }
        }

        this.setCollisionRule(type1, type2, destroyOriginals, createParticles);
        rulesCreated++;
      }
    });

    this.saveToHistory(historyLabel);
    console.log(
      `✅ Created ${rulesCreated} collision rules with growth constraints`
    );
  }

  /**
   * Clear all collision rules
   */
  clearCollisionRules() {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        this.rules[type1][type2].destroyOriginals = false;
        this.rules[type1][type2].createParticles = [];
      });
    });

    console.log("🧹 All collision rules cleared");
  }

  /**
   * Clear all force rules
   */
  clearForceRules() {
    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        this.rules[type1][type2].closeForce = 0;
        this.rules[type1][type2].farForce = 0;
        this.rules[type1][type2].threshold = 30;
      });
    });

    console.log("🧹 All force rules cleared");
  }

  /**
   * Clear all rules
   */
  clearAllRules() {
    this.clearForceRules();
    this.clearCollisionRules();
    this.saveToHistory("All rules cleared");
  }

  /**
   * Get a summary of current rules
   * @returns {Object} - Rules summary
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
   * Display rules summary to console
   */
  displayRulesSummary() {
    console.log("\n📋 RULES SUMMARY:");
    this.types.forEach((type1) => {
      console.log(`\n${type1.toUpperCase()} particles:`);
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];
        const behavior =
          rule.closeForce > 0.1
            ? "attract"
            : rule.closeForce < -0.1
            ? "repel"
            : "neutral";
        const farBehavior =
          rule.farForce > 0.1
            ? "attract"
            : rule.farForce < -0.1
            ? "repel"
            : "neutral";

        console.log(
          `  → ${type2}: ${behavior} when close (<${rule.threshold.toFixed(
            0
          )}), ${farBehavior} when far`
        );
      });
    });
    console.log("\n");
  }

  /**
   * Display collision rules summary
   */
  displayCollisionRulesSummary() {
    console.log("\n🔬 COLLISION RULES SUMMARY:");
    let hasRules = false;

    this.types.forEach((type1) => {
      this.types.forEach((type2) => {
        const rule = this.rules[type1][type2];
        if (rule.destroyOriginals || rule.createParticles.length > 0) {
          hasRules = true;
          let description = `${type1} + ${type2} -> `;

          if (rule.destroyOriginals) {
            description += "destroy originals, ";
          }

          if (rule.createParticles.length > 0) {
            const creates = rule.createParticles
              .map((p) => `${p.count} ${p.type}`)
              .join(" + ");
            description += `create: ${creates}`;
          }

          console.log(description);
        }
      });
    });

    if (!hasRules) {
      console.log("No collision rules defined (all collisions do nothing)");
    }
    console.log("\n");
  }

  /**
   * Validate rules for consistency
   * @returns {Object} - Validation results
   */
  validateRules() {
    const issues = [];
    const warnings = [];

    if (!this.initialized) {
      issues.push("RuleManager not initialized");
      return { valid: false, issues, warnings };
    }

    // Check rule structure
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

        // Validate collision rules
        if (typeof rule.destroyOriginals !== "boolean") {
          issues.push(`Invalid destroyOriginals for ${type1} -> ${type2}`);
        }

        if (!Array.isArray(rule.createParticles)) {
          issues.push(`Invalid createParticles for ${type1} -> ${type2}`);
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
   * Save current rules to history
   * @param {string} label - Label for this history entry
   */
  saveToHistory(label) {
    // Remove any future history if we're not at the end
    if (this.currentHistoryIndex < this.ruleHistory.length - 1) {
      this.ruleHistory = this.ruleHistory.slice(
        0,
        this.currentHistoryIndex + 1
      );
    }

    // Add new history entry
    this.ruleHistory.push({
      label,
      rules: JSON.parse(JSON.stringify(this.rules)),
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.ruleHistory.length > this.maxHistorySize) {
      this.ruleHistory.shift();
    } else {
      this.currentHistoryIndex++;
    }
  }

  /**
   * Undo last rule change
   * @returns {boolean} - Whether undo was successful
   */
  undo() {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      const historyEntry = this.ruleHistory[this.currentHistoryIndex];
      this.rules = JSON.parse(JSON.stringify(historyEntry.rules));
      console.log(`↶ Undid: ${historyEntry.label}`);
      return true;
    }

    console.log("Nothing to undo");
    return false;
  }

  /**
   * Redo last undone rule change
   * @returns {boolean} - Whether redo was successful
   */
  redo() {
    if (this.currentHistoryIndex < this.ruleHistory.length - 1) {
      this.currentHistoryIndex++;
      const historyEntry = this.ruleHistory[this.currentHistoryIndex];
      this.rules = JSON.parse(JSON.stringify(historyEntry.rules));
      console.log(`↷ Redid: ${historyEntry.label}`);
      return true;
    }

    console.log("Nothing to redo");
    return false;
  }

  /**
   * Get history information
   * @returns {Object} - History info
   */
  getHistoryInfo() {
    return {
      currentIndex: this.currentHistoryIndex,
      totalEntries: this.ruleHistory.length,
      canUndo: this.currentHistoryIndex > 0,
      canRedo: this.currentHistoryIndex < this.ruleHistory.length - 1,
      history: this.ruleHistory.map((entry, index) => ({
        label: entry.label,
        timestamp: entry.timestamp,
        isCurrent: index === this.currentHistoryIndex,
      })),
    };
  }

  /**
   * Export rules to JSON
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
        this.rules = data.rules;
        this.saveToHistory("Rules imported");
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
}

// Export singleton instance
export const ruleManager = new RuleManager();

// Export class for multiple instances if needed
export default RuleManager;
