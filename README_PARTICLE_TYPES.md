# Adding New Particle Types - Easy Guide

This guide shows you how to easily add new particle types to your particle life simulation using the new **ParticleTypeRegistry** system.

## 🎯 Quick Start

Adding a new particle type is now as simple as:

```javascript
import { PARTICLE_CONFIG } from "./src/core/Config.js";

// Add a new purple particle type
PARTICLE_CONFIG.registerType({
  id: "purple",
  name: "Purple",
  color: "#9932cc",
  keyboardKey: "5",
  order: 5,
});
```

That's it! The system automatically:

- ✅ Updates the rules grid UI
- ✅ Adds proper color coding
- ✅ Sets up keyboard controls
- ✅ Handles all internal references

## 🔧 System Overview

The new system consists of:

### `ParticleTypeRegistry` Class

- **Central registry** for all particle types
- **Automatic validation** of new types
- **Dynamic UI updates** when types change
- **Export/import capabilities**

### `PARTICLE_CONFIG` Enhanced Interface

- **Backward compatible** with existing code
- **Dynamic getters** that reflect current registry state
- **Helper methods** for easy type management

## 📋 Particle Type Configuration

### Required Properties

```javascript
{
  id: "unique-id",        // Unique identifier (string)
  name: "Display Name",   // Human-readable name (string)
  color: "#hexcolor"      // Hex color code (string)
}
```

### Optional Properties

```javascript
{
  keyboardKey: "5",       // Keyboard key for spawning (string)
  order: 5,               // Display order (number, default: 0)
  properties: {           // Custom properties (object)
    description: "...",
    category: "...",
    // ... any custom data
  }
}
```

## 🎨 Common Use Cases

### 1. Basic Particle Type

```javascript
PARTICLE_CONFIG.registerType({
  id: "cyan",
  name: "Cyan",
  color: "#00ffff",
  keyboardKey: "7",
});
```

### 2. Particle Type with Custom Properties

```javascript
PARTICLE_CONFIG.registerType({
  id: "energy",
  name: "Energy",
  color: "#ffff00",
  keyboardKey: "e",
  order: 10,
  properties: {
    category: "energy",
    volatility: "high",
    description: "High-energy particle type",
  },
});
```

### 3. Multiple Types at Once

```javascript
const metalTypes = [
  { id: "iron", name: "Iron", color: "#888888", keyboardKey: "i" },
  { id: "copper", name: "Copper", color: "#b87333", keyboardKey: "c" },
  { id: "gold", name: "Gold", color: "#ffd700", keyboardKey: "g" },
];

metalTypes.forEach((type) => PARTICLE_CONFIG.registerType(type));
```

## 🎮 User Instructions

### For Players:

1. **Spawn particles**: Press the assigned keyboard key while moving your mouse
2. **See all types**: Check the rules grid - it updates automatically
3. **Visual feedback**: Each type has its own color in the UI

### For Developers:

1. **Add types**: Use `PARTICLE_CONFIG.registerType()`
2. **Remove types**: Use `PARTICLE_CONFIG.unregisterType(typeId)`
3. **Update types**: Use `particleTypeRegistry.updateType(typeId, updates)`
4. **Validate**: Use `particleTypeRegistry.validate()`

## 📊 Management & Monitoring

### Check Current Types

```javascript
// Get all enabled types
const types = PARTICLE_CONFIG.allTypes;
console.log(
  "Current types:",
  types.map((t) => t.name)
);

// Get keyboard mappings
const keys = PARTICLE_CONFIG.getKeyboardMappings();
console.log("Key mappings:", Array.from(keys.entries()));
```

### Enable/Disable Types

```javascript
// Disable a type (removes from UI but keeps in registry)
PARTICLE_CONFIG.setTypeEnabled("blue", false);

// Re-enable it
PARTICLE_CONFIG.setTypeEnabled("blue", true);
```

### Statistics

```javascript
const stats = particleTypeRegistry.getStats();
console.log(`Total: ${stats.total}, Enabled: ${stats.enabled}`);
```

## 🔄 Export/Import System

### Export Types

```javascript
// Export all types to JSON
const exported = particleTypeRegistry.exportTypes();

// Save to file or send to server
// localStorage.setItem('particleTypes', exported);
```

### Import Types

```javascript
// Import from JSON string
const importData = {
  types: [
    {
      id: "imported",
      name: "Imported Type",
      color: "#123456",
      keyboardKey: "x",
    },
  ],
};

const success = particleTypeRegistry.importTypes(JSON.stringify(importData));
```

## ⚠️ Validation & Error Handling

The system automatically validates:

- ✅ Required properties (id, name, color)
- ✅ Unique IDs (no duplicates)
- ✅ Valid hex colors (#RRGGBB format)
- ✅ No orphaned keyboard mappings

### Error Examples

```javascript
// ❌ This will fail - missing required properties
PARTICLE_CONFIG.registerType({
  id: "invalid",
  // missing name and color
});

// ❌ This will fail - invalid color format
PARTICLE_CONFIG.registerType({
  id: "bad-color",
  name: "Bad Color",
  color: "not-a-hex-color",
});

// ❌ This will fail - duplicate ID
PARTICLE_CONFIG.registerType({
  id: "red", // Already exists
  name: "Another Red",
  color: "#ff0000",
});
```

## 🏗️ Advanced Usage

### Custom Type Factory

```javascript
function createElementType(symbol, name, color, atomicNumber) {
  return {
    id: symbol.toLowerCase(),
    name: name,
    color: color,
    keyboardKey: symbol.toLowerCase(),
    order: atomicNumber,
    properties: {
      category: "element",
      symbol: symbol,
      atomicNumber: atomicNumber,
    },
  };
}

// Create periodic table elements
const hydrogen = createElementType("H", "Hydrogen", "#e6e6fa", 1);
const helium = createElementType("He", "Helium", "#d9ffff", 2);
const lithium = createElementType("Li", "Lithium", "#cc80ff", 3);

[hydrogen, helium, lithium].forEach((type) => {
  PARTICLE_CONFIG.registerType(type);
});
```

### Dynamic Type Updates

```javascript
// Update existing type properties
particleTypeRegistry.updateType("red", {
  name: "Crimson",
  color: "#dc143c",
  properties: {
    intensity: "high",
    temperature: "hot",
  },
});
```

## 🎪 Complete Example

Here's a complete example that adds a set of themed particle types:

```javascript
// Fantasy-themed particle types
const fantasyTypes = [
  {
    id: "fire",
    name: "Fire",
    color: "#ff4500",
    keyboardKey: "f",
    order: 10,
    properties: {
      element: "fire",
      temperature: "hot",
      volatility: "high",
    },
  },
  {
    id: "water",
    name: "Water",
    color: "#00bfff",
    keyboardKey: "w",
    order: 11,
    properties: {
      element: "water",
      temperature: "cool",
      fluidity: "high",
    },
  },
  {
    id: "earth",
    name: "Earth",
    color: "#8b4513",
    keyboardKey: "e",
    order: 12,
    properties: {
      element: "earth",
      density: "high",
      stability: "high",
    },
  },
  {
    id: "air",
    name: "Air",
    color: "#e6e6fa",
    keyboardKey: "a",
    order: 13,
    properties: {
      element: "air",
      density: "low",
      mobility: "high",
    },
  },
];

// Register all fantasy types
fantasyTypes.forEach((type) => {
  const success = PARTICLE_CONFIG.registerType(type);
  if (success) {
    console.log(`✅ Added ${type.name} element`);
  }
});

console.log("🧙‍♂️ Fantasy elements added! Press F/W/E/A to spawn them.");
```

## 🐛 Troubleshooting

### Common Issues

**Q: New particle types don't appear in the rules grid**  
A: Make sure you're calling `PARTICLE_CONFIG.registerType()` before the UI is initialized.

**Q: Keyboard keys don't work**  
A: Check that the keyboard key isn't already mapped to another type. Use `PARTICLE_CONFIG.getKeyboardMappings()` to see current mappings.

**Q: Colors look wrong**  
A: Ensure you're using valid hex color format: `#RRGGBB` (6 characters after #).

**Q: Types disappear after reload**  
A: The registry resets on page reload. Use the export/import system to persist custom types.

### Debugging

```javascript
// Check registry state
const validation = particleTypeRegistry.validate();
if (!validation.valid) {
  console.error("Registry issues:", validation.issues);
}

// View all registered types
const stats = particleTypeRegistry.getStats();
console.log("Registry stats:", stats);
```

## 📈 Performance Considerations

- ✅ **Efficient**: Dynamic getters only compute when accessed
- ✅ **Scalable**: Handles hundreds of particle types
- ✅ **Memory-friendly**: Uses Maps for O(1) lookups
- ✅ **UI-optimized**: Only updates UI when types change

## 🔮 Future Enhancements

The system is designed to be easily extensible:

- **Custom renderers** for different particle types
- **Type hierarchies** (parent/child relationships)
- **Runtime type modification** (change physics per type)
- **Type-specific behaviors** (custom update logic)
- **Visual effects** (trails, glow, etc.)

## 🎉 Examples to Try

Run the example file to see the system in action:

```javascript
import { demonstrateParticleTypeSystem } from "./example_add_particle_types.js";

// Run the complete demonstration
demonstrateParticleTypeSystem();
```

---

**That's it!** You now have a powerful, flexible system for adding new particle types. The system handles all the complexity behind the scenes while giving you simple APIs to work with.

Happy coding! 🎮✨
