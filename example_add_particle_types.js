/**
 * Example: Adding New Particle Types
 *
 * This file demonstrates how to easily add new particle types to the
 * particle life simulation using the new ParticleTypeRegistry system.
 *
 * The new system makes it incredibly easy to:
 * - Add new particle types with just a simple configuration object
 * - Automatically handle UI updates (rules grid, color coding, etc.)
 * - Manage keyboard mappings for spawning particles
 * - Enable/disable particle types dynamically
 * - Export/import particle type configurations
 */

import { PARTICLE_CONFIG } from "./src/core/Config.js";
import { particleTypeRegistry } from "./src/core/ParticleTypeRegistry.js";

/**
 * Example 1: Adding a basic new particle type
 */
function addBasicParticleType() {
  // Adding a new "purple" particle type
  const success = PARTICLE_CONFIG.registerType({
    id: "purple",
    name: "Purple",
    color: "#9932cc",
    keyboardKey: "5",
    order: 5,
  });

  if (success) {
    console.log("✅ Purple particle type added successfully!");
    console.log("Press '5' to spawn purple particles");
  } else {
    console.error("❌ Failed to add purple particle type");
  }
}

/**
 * Example 2: Adding a particle type with custom properties
 */
function addAdvancedParticleType() {
  // Adding a new "orange" particle type with custom properties
  const success = PARTICLE_CONFIG.registerType({
    id: "orange",
    name: "Orange",
    color: "#ff8c00",
    keyboardKey: "6",
    order: 6,
    properties: {
      description: "High-energy particle type",
      baseSize: 3,
      energyLevel: "high",
      tags: ["energy", "bright", "active"],
    },
  });

  if (success) {
    console.log("✅ Orange particle type added successfully!");
    console.log("Press '6' to spawn orange particles");
  } else {
    console.error("❌ Failed to add orange particle type");
  }
}

/**
 * Example 3: Adding multiple particle types at once
 */
function addMultipleParticleTypes() {
  const newTypes = [
    {
      id: "cyan",
      name: "Cyan",
      color: "#00ffff",
      keyboardKey: "7",
      order: 7,
    },
    {
      id: "magenta",
      name: "Magenta",
      color: "#ff00ff",
      keyboardKey: "8",
      order: 8,
    },
    {
      id: "lime",
      name: "Lime",
      color: "#00ff00",
      keyboardKey: "9",
      order: 9,
    },
  ];

  let addedCount = 0;
  newTypes.forEach((type) => {
    if (PARTICLE_CONFIG.registerType(type)) {
      addedCount++;
    }
  });

  console.log(`✅ Added ${addedCount} new particle types!`);
  console.log("Press '7', '8', or '9' to spawn new particles");
}

/**
 * Example 4: Managing particle types dynamically
 */
function manageParticleTypes() {
  // Get all current types
  const allTypes = PARTICLE_CONFIG.allTypes;
  console.log(
    "Current particle types:",
    allTypes.map((t) => t.name)
  );

  // Disable a particle type
  PARTICLE_CONFIG.setTypeEnabled("blue", false);
  console.log("Blue particles disabled");

  // Re-enable it
  PARTICLE_CONFIG.setTypeEnabled("blue", true);
  console.log("Blue particles re-enabled");

  // Update a particle type
  particleTypeRegistry.updateType("red", {
    name: "Crimson",
    color: "#dc143c",
  });
  console.log("Red particles updated to Crimson");

  // Get keyboard mappings
  const keyMappings = PARTICLE_CONFIG.getKeyboardMappings();
  console.log("Keyboard mappings:", Array.from(keyMappings.entries()));
}

/**
 * Example 5: Exporting and importing particle type configurations
 */
function exportImportTypes() {
  // Export current types
  const exported = particleTypeRegistry.exportTypes();
  console.log("Exported particle types configuration");

  // You can save this to a file or send it to a server
  // For demo purposes, we'll just show the structure
  console.log("Export structure:", JSON.parse(exported));

  // Import types from a JSON string
  const importData = {
    types: [
      {
        id: "gold",
        name: "Gold",
        color: "#ffd700",
        keyboardKey: "0",
        order: 10,
        enabled: true,
      },
    ],
  };

  const success = particleTypeRegistry.importTypes(JSON.stringify(importData));
  if (success) {
    console.log("✅ Imported new particle types successfully!");
  }
}

/**
 * Example 6: Creating a custom particle type factory
 */
function createCustomTypeFactory() {
  const customTypeFactory = {
    createMetalType: (name, color, key, order) => ({
      id: name.toLowerCase(),
      name,
      color,
      keyboardKey: key,
      order,
      properties: {
        category: "metal",
        conductivity: "high",
        hardness: "medium",
      },
    }),

    createGasType: (name, color, key, order) => ({
      id: name.toLowerCase(),
      name,
      color,
      keyboardKey: key,
      order,
      properties: {
        category: "gas",
        density: "low",
        volatility: "high",
      },
    }),
  };

  // Create metal types
  const copper = customTypeFactory.createMetalType(
    "Copper",
    "#b87333",
    "c",
    11
  );
  const silver = customTypeFactory.createMetalType(
    "Silver",
    "#c0c0c0",
    "s",
    12
  );

  // Create gas types
  const hydrogen = customTypeFactory.createGasType(
    "Hydrogen",
    "#e6e6fa",
    "h",
    13
  );

  // Register them
  [copper, silver, hydrogen].forEach((type) => {
    PARTICLE_CONFIG.registerType(type);
  });

  console.log("✅ Created and registered custom particle types!");
}

/**
 * Example 7: Validation and error handling
 */
function demonstrateValidation() {
  console.log("Testing validation...");

  // This will fail - missing required properties
  const invalid1 = PARTICLE_CONFIG.registerType({
    id: "invalid",
    // missing name and color
  });
  console.log("Invalid type 1 result:", invalid1);

  // This will fail - invalid color format
  const invalid2 = PARTICLE_CONFIG.registerType({
    id: "invalid2",
    name: "Invalid",
    color: "not-a-hex-color",
  });
  console.log("Invalid type 2 result:", invalid2);

  // This will fail - duplicate ID
  const invalid3 = PARTICLE_CONFIG.registerType({
    id: "red", // Already exists
    name: "Another Red",
    color: "#ff0000",
  });
  console.log("Invalid type 3 result:", invalid3);

  // Validate the registry
  const validation = particleTypeRegistry.validate();
  console.log("Registry validation:", validation);
}

/**
 * Example 8: Statistics and monitoring
 */
function showStatistics() {
  const stats = particleTypeRegistry.getStats();
  console.log("Particle Type Registry Statistics:");
  console.log(`- Total types: ${stats.total}`);
  console.log(`- Enabled types: ${stats.enabled}`);
  console.log(`- Disabled types: ${stats.disabled}`);
  console.log(`- Types with keyboard keys: ${stats.withKeyboardKeys}`);

  console.log("\nRegistered types:");
  stats.registeredTypes.forEach((type) => {
    console.log(
      `  - ${type.name} (${type.id}): ${
        type.enabled ? "enabled" : "disabled"
      } ${type.keyboardKey ? `[${type.keyboardKey}]` : ""}`
    );
  });
}

/**
 * Main demonstration function
 */
function demonstrateParticleTypeSystem() {
  console.log("🎨 Particle Type System Demonstration");
  console.log("=====================================");

  // Initialize the system (this happens automatically in the game)
  PARTICLE_CONFIG.initialize();

  // Run all examples
  console.log("\n1. Adding basic particle type:");
  addBasicParticleType();

  console.log("\n2. Adding advanced particle type:");
  addAdvancedParticleType();

  console.log("\n3. Adding multiple particle types:");
  addMultipleParticleTypes();

  console.log("\n4. Managing particle types:");
  manageParticleTypes();

  console.log("\n5. Export/import functionality:");
  exportImportTypes();

  console.log("\n6. Custom type factory:");
  createCustomTypeFactory();

  console.log("\n7. Validation and error handling:");
  demonstrateValidation();

  console.log("\n8. Statistics:");
  showStatistics();

  console.log("\n✅ Demonstration complete!");
  console.log("\nYou can now use any of these techniques in your own code.");
}

// Run the demonstration
// demonstrateParticleTypeSystem();

export {
  addBasicParticleType,
  addAdvancedParticleType,
  addMultipleParticleTypes,
  manageParticleTypes,
  exportImportTypes,
  createCustomTypeFactory,
  demonstrateValidation,
  showStatistics,
  demonstrateParticleTypeSystem,
};
