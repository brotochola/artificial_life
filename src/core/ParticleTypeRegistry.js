/**
 * Particle Type Registry - Centralized management for particle types
 * Makes it easy to add, remove, and manage particle types with all their properties
 */
export class ParticleTypeRegistry {
  constructor() {
    this.types = new Map();
    this.keyboardMappings = new Map();
    this.displayOrder = [];
    this.initialized = false;
  }

  /**
   * Register a new particle type
   * @param {Object} typeConfig - Configuration for the particle type
   * @param {string} typeConfig.id - Unique identifier for the type
   * @param {string} typeConfig.name - Display name for the type
   * @param {string} typeConfig.color - Hex color code for the type
   * @param {string} [typeConfig.keyboardKey] - Optional keyboard key for spawning
   * @param {Object} [typeConfig.properties] - Additional properties for the type
   * @param {number} [typeConfig.order] - Display order (lower numbers appear first)
   * @returns {boolean} - Success status
   */
  registerType(typeConfig) {
    // Validate required properties
    if (!typeConfig.id || !typeConfig.name || !typeConfig.color) {
      console.error(
        "ParticleType registration failed: Missing required properties (id, name, color)"
      );
      return false;
    }

    // Check for duplicate ID
    if (this.types.has(typeConfig.id)) {
      console.error(
        `ParticleType registration failed: Type '${typeConfig.id}' already exists`
      );
      return false;
    }

    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(typeConfig.color)) {
      console.error(
        `ParticleType registration failed: Invalid color format '${typeConfig.color}'. Use hex format like #FF0000`
      );
      return false;
    }

    // Create type object with defaults
    const type = {
      id: typeConfig.id,
      name: typeConfig.name,
      color: typeConfig.color,
      keyboardKey: typeConfig.keyboardKey || null,
      properties: typeConfig.properties || {},
      order: typeConfig.order || 0,
      enabled: true,
      registeredAt: Date.now(),
    };

    // Register the type
    this.types.set(typeConfig.id, type);

    // Handle keyboard mapping
    if (typeConfig.keyboardKey) {
      if (this.keyboardMappings.has(typeConfig.keyboardKey)) {
        console.warn(
          `Keyboard key '${
            typeConfig.keyboardKey
          }' already mapped to '${this.keyboardMappings.get(
            typeConfig.keyboardKey
          )}'. Overriding...`
        );
      }
      this.keyboardMappings.set(typeConfig.keyboardKey, typeConfig.id);
    }

    // Update display order
    this.updateDisplayOrder();

    console.log(`✅ Particle type '${typeConfig.id}' registered successfully`);
    return true;
  }

  /**
   * Unregister a particle type
   * @param {string} typeId - Type ID to unregister
   * @returns {boolean} - Success status
   */
  unregisterType(typeId) {
    if (!this.types.has(typeId)) {
      console.error(`Cannot unregister type '${typeId}': Type not found`);
      return false;
    }

    const type = this.types.get(typeId);

    // Remove keyboard mapping if exists
    if (type.keyboardKey) {
      this.keyboardMappings.delete(type.keyboardKey);
    }

    // Remove from types
    this.types.delete(typeId);

    // Update display order
    this.updateDisplayOrder();

    console.log(`🗑️ Particle type '${typeId}' unregistered successfully`);
    return true;
  }

  /**
   * Get all registered particle types
   * @param {boolean} [enabledOnly=false] - Return only enabled types
   * @returns {Array} - Array of type objects
   */
  getAllTypes(enabledOnly = false) {
    const types = Array.from(this.types.values());
    return enabledOnly ? types.filter((type) => type.enabled) : types;
  }

  /**
   * Get type IDs in display order
   * @param {boolean} [enabledOnly=false] - Return only enabled types
   * @returns {Array} - Array of type IDs
   */
  getTypeIds(enabledOnly = false) {
    return this.getAllTypes(enabledOnly).map((type) => type.id);
  }

  /**
   * Get type colors in display order
   * @param {boolean} [enabledOnly=false] - Return only enabled types
   * @returns {Array} - Array of color strings
   */
  getTypeColors(enabledOnly = false) {
    return this.getAllTypes(enabledOnly).map((type) => type.color);
  }

  /**
   * Get type names in display order
   * @param {boolean} [enabledOnly=false] - Return only enabled types
   * @returns {Array} - Array of type names
   */
  getTypeNames(enabledOnly = false) {
    return this.getAllTypes(enabledOnly).map((type) => type.name);
  }

  /**
   * Get a specific type by ID
   * @param {string} typeId - Type ID
   * @returns {Object|null} - Type object or null if not found
   */
  getType(typeId) {
    return this.types.get(typeId) || null;
  }

  /**
   * Get type by keyboard key
   * @param {string} key - Keyboard key
   * @returns {Object|null} - Type object or null if not found
   */
  getTypeByKey(key) {
    const typeId = this.keyboardMappings.get(key);
    return typeId ? this.getType(typeId) : null;
  }

  /**
   * Enable or disable a particle type
   * @param {string} typeId - Type ID
   * @param {boolean} enabled - Enabled state
   * @returns {boolean} - Success status
   */
  setTypeEnabled(typeId, enabled) {
    if (!this.types.has(typeId)) {
      console.error(`Cannot set enabled state: Type '${typeId}' not found`);
      return false;
    }

    this.types.get(typeId).enabled = enabled;
    this.updateDisplayOrder();

    console.log(
      `${enabled ? "✅" : "❌"} Particle type '${typeId}' ${
        enabled ? "enabled" : "disabled"
      }`
    );
    return true;
  }

  /**
   * Update type properties
   * @param {string} typeId - Type ID
   * @param {Object} updates - Properties to update
   * @returns {boolean} - Success status
   */
  updateType(typeId, updates) {
    if (!this.types.has(typeId)) {
      console.error(`Cannot update type: Type '${typeId}' not found`);
      return false;
    }

    const type = this.types.get(typeId);

    // Handle special properties
    if (updates.keyboardKey !== undefined) {
      // Remove old keyboard mapping
      if (type.keyboardKey) {
        this.keyboardMappings.delete(type.keyboardKey);
      }

      // Add new mapping
      if (updates.keyboardKey) {
        this.keyboardMappings.set(updates.keyboardKey, typeId);
      }
    }

    // Update properties
    Object.assign(type, updates);

    // Update display order if order changed
    if (updates.order !== undefined) {
      this.updateDisplayOrder();
    }

    console.log(`🔄 Particle type '${typeId}' updated`);
    return true;
  }

  /**
   * Get keyboard mappings
   * @returns {Map} - Map of keyboard keys to type IDs
   */
  getKeyboardMappings() {
    return new Map(this.keyboardMappings);
  }

  /**
   * Update display order based on type order property
   */
  updateDisplayOrder() {
    this.displayOrder = Array.from(this.types.values())
      .sort((a, b) => a.order - b.order)
      .map((type) => type.id);
  }

  /**
   * Get statistics about registered types
   * @returns {Object} - Statistics object
   */
  getStats() {
    const allTypes = Array.from(this.types.values());
    const enabledTypes = allTypes.filter((type) => type.enabled);

    return {
      total: allTypes.length,
      enabled: enabledTypes.length,
      disabled: allTypes.length - enabledTypes.length,
      withKeyboardKeys: allTypes.filter((type) => type.keyboardKey).length,
      registeredTypes: allTypes.map((type) => ({
        id: type.id,
        name: type.name,
        enabled: type.enabled,
        keyboardKey: type.keyboardKey,
      })),
    };
  }

  /**
   * Register default particle types
   */
  registerDefaultTypes() {
    const defaultTypes = [
      { id: "red", name: "Red", color: "#FF0000", keyboardKey: "1", order: 1 },
      {
        id: "green",
        name: "Green",
        color: "#00FF00",
        keyboardKey: "2",
        order: 2,
      },
      {
        id: "blue",
        name: "Blue",
        color: "#0000FF",
        keyboardKey: "3",
        order: 3,
      },
      {
        id: "yellow",
        name: "Yellow",
        color: "#FFFF00",
        keyboardKey: "4",
        order: 4,
      },
      {
        id: "purple",
        name: "Purple",
        color: "#800080",
        keyboardKey: "5",
        order: 5,
      },
      {
        id: "orange",
        name: "Orange",
        color: "#FF8000",
        keyboardKey: "6",
        order: 6,
      },
      {
        id: "pink",
        name: "Pink",
        color: "#FF00FF",
        keyboardKey: "7",
        order: 7,
      },
      {
        id: "light-blue",
        name: "Light Blue",
        color: "#00FFFF",
        keyboardKey: "8",
        order: 8,
      },
    ];

    defaultTypes.forEach((type) => {
      this.registerType(type);
    });

    console.log("🎨 Default particle types registered");
  }

  /**
   * Initialize the registry with default types
   */
  initialize() {
    if (this.initialized) {
      console.warn("ParticleTypeRegistry already initialized");
      return;
    }

    this.registerDefaultTypes();
    this.initialized = true;

    console.log("✅ ParticleTypeRegistry initialized");
  }

  /**
   * Export all types to JSON
   * @returns {string} - JSON string of all types
   */
  exportTypes() {
    const exportData = {
      types: Array.from(this.types.values()),
      keyboardMappings: Array.from(this.keyboardMappings.entries()),
      exportedAt: Date.now(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import types from JSON
   * @param {string} jsonString - JSON string containing types
   * @param {boolean} [replace=false] - Whether to replace existing types
   * @returns {boolean} - Success status
   */
  importTypes(jsonString, replace = false) {
    try {
      const importData = JSON.parse(jsonString);

      if (!importData.types || !Array.isArray(importData.types)) {
        console.error("Invalid import data: Missing or invalid types array");
        return false;
      }

      // Clear existing types if replacing
      if (replace) {
        this.types.clear();
        this.keyboardMappings.clear();
      }

      // Import types
      let importedCount = 0;
      importData.types.forEach((type) => {
        if (this.registerType(type)) {
          importedCount++;
        }
      });

      console.log(`📥 Imported ${importedCount} particle types`);
      return true;
    } catch (error) {
      console.error("Error importing types:", error);
      return false;
    }
  }

  /**
   * Validate the registry state
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    // Check for duplicate colors
    const colors = new Set();
    const duplicateColors = [];

    this.types.forEach((type) => {
      if (colors.has(type.color)) {
        duplicateColors.push(type.color);
      } else {
        colors.add(type.color);
      }
    });

    if (duplicateColors.length > 0) {
      issues.push(`Duplicate colors found: ${duplicateColors.join(", ")}`);
    }

    // Check for orphaned keyboard mappings
    const orphanedKeys = [];
    this.keyboardMappings.forEach((typeId, key) => {
      if (!this.types.has(typeId)) {
        orphanedKeys.push(key);
      }
    });

    if (orphanedKeys.length > 0) {
      issues.push(`Orphaned keyboard mappings: ${orphanedKeys.join(", ")}`);
    }

    return {
      valid: issues.length === 0,
      issues,
      stats: this.getStats(),
    };
  }

  /**
   * Reset the registry to default state
   */
  reset() {
    this.types.clear();
    this.keyboardMappings.clear();
    this.displayOrder = [];
    this.initialized = false;

    console.log("🔄 ParticleTypeRegistry reset");
  }
}

// Export singleton instance
export const particleTypeRegistry = new ParticleTypeRegistry();

// Export class for multiple instances if needed
export default ParticleTypeRegistry;
