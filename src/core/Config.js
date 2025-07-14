// Import the particle type registry
import { particleTypeRegistry } from "./ParticleTypeRegistry.js";

// Configuration constants for the Particle Life simulation
export const CONFIG = {
  // Simulation parameters
  PARTICLE_COUNT_PER_TYPE: 200,
  MAX_TOTAL_PARTICLES: 7000,
  MAX_COLLISIONS_PER_FRAME: 50,

  // Canvas configuration
  CANVAS_WIDTH_RATIO: 0.98,
  CANVAS_ASPECT_RATIO: 16 / 7,

  // Performance settings
  FRAME_RATE: 60,
  STATS_UPDATE_INTERVAL: 1000, // milliseconds

  // Physics constants
  GRAVITY: 0,
  AIR_RESISTANCE: 0.01,

  // Visual settings
  TRAIL_FADE_ALPHA: 1, // 1 = no trails, lower values = trails
  CANVAS_BACKGROUND_COLOR: "#000",

  // Quadtree settings
  DEFAULT_QUADTREE_CAPACITY: 8,
  MIN_QUADTREE_SIZE: 10,

  // Particle pool settings
  POOL_BUFFER_MULTIPLIER: 1.5,
  MIN_POOL_SIZE: 5000,

  // Collision system
  COLLISION_COOLDOWN_FRAMES: 60,
  MAX_COLLISION_VELOCITY: 10,

  // Debug settings
  DEBUG_MODE: false,
  SHOW_QUADTREE: false,
  SHOW_PARTICLE_IDS: false,
  SHOW_FORCES: false,

  // Animation settings
  ENABLE_SMOOTH_ANIMATION: true,
  ANIMATION_EASING: 0.1,

  // Performance monitoring
  PERFORMANCE_SAMPLING_WINDOW: 60, // frames
  MEMORY_USAGE_THRESHOLD: 100, // MB
};

// Particle types and visual settings
export const PARTICLE_CONFIG = {
  // Dynamic getters that use the particle type registry
  get types() {
    return particleTypeRegistry.getTypeIds(true); // only enabled types
  },

  get colors() {
    return particleTypeRegistry.getTypeColors(true); // only enabled types
  },

  get typeNames() {
    return particleTypeRegistry.getTypeNames(true); // only enabled types
  },

  get allTypes() {
    return particleTypeRegistry.getAllTypes(true); // only enabled types
  },

  // Helper methods for type management
  getTypeById(id) {
    return particleTypeRegistry.getType(id);
  },

  getTypeByKey(key) {
    return particleTypeRegistry.getTypeByKey(key);
  },

  getKeyboardMappings() {
    return particleTypeRegistry.getKeyboardMappings();
  },

  registerType(typeConfig) {
    return particleTypeRegistry.registerType(typeConfig);
  },

  unregisterType(typeId) {
    return particleTypeRegistry.unregisterType(typeId);
  },

  // Initialize particle types
  initialize() {
    if (!particleTypeRegistry.initialized) {
      particleTypeRegistry.initialize();
    }
  },

  // Default particle options
  defaultOptions: {
    // Visual properties
    size: 2,

    // Rendering options
    renderMode: "particle-container",

    // Physics properties
    friction: 0.9,
    bounceDecay: 0.8,
    maxAcceleration: 0.5,
    maxVelocity: 8.0,

    // Force calculation properties
    maxDistance: 80,
    collisionDistanceRatio: 2.0,
    forceMultiplier: 0.1,

    // Edge repulsion properties
    minDistanceToEdges: 50,
    edgeRepulsionForce: 0.9,

    // Advanced physics
    enableVelocityClamp: true,
    enableAccelerationClamp: true,

    // Quadtree optimization
    useQuadtree: true,
    quadtreeCapacity: 8,
  },

  // Option configurations for UI
  optionConfigs: {
    size: { min: 1, max: 10, step: 0.5, label: "Particle Size" },
    renderMode: {
      type: "select",
      label: "Render Mode",
      options: [
        { value: "particle-container", label: "ParticleContainer (Balanced)" },
        { value: "geometry-batched", label: "Geometry Batched (Flexible)" },
      ],
    },
    friction: { min: 0.7, max: 1.0, step: 0.01, label: "Friction" },
    bounceDecay: { min: 0.1, max: 1.0, step: 0.05, label: "Bounce Decay" },
    maxVelocity: { min: 1, max: 20, step: 0.5, label: "Max Velocity" },
    maxAcceleration: {
      min: 0.1,
      max: 2.0,
      step: 0.1,
      label: "Max Acceleration",
    },
    maxDistance: { min: 20, max: 150, step: 5, label: "Max Distance" },
    collisionDistanceRatio: {
      min: 0.1,
      max: 10.0,
      step: 0.1,
      label: "Collision Distance Ratio",
    },
    forceMultiplier: {
      min: 0.01,
      max: 0.5,
      step: 0.01,
      label: "Force Multiplier",
    },
    minDistanceToEdges: {
      min: 0,
      max: 150,
      step: 5,
      label: "Min Distance To Edges",
    },
    edgeRepulsionForce: {
      min: 0,
      max: 1.0,
      step: 0.05,
      label: "Edge Repulsion Force",
    },
    enableVelocityClamp: { type: "boolean", label: "Velocity Clamp" },
    enableAccelerationClamp: { type: "boolean", label: "Acceleration Clamp" },
  },

  // Default physics limits
  defaultPhysicsLimits: {
    maxVelocity: 8.0,
    maxAcceleration: 0.5,
    friction: 0.9,
    bounceDecay: 0.8,
  },
};

// Input/control configuration
export const INPUT_CONFIG = {
  // Keyboard controls
  keys: {
    PAUSE: " ",
    RANDOMIZE_RULES: "r",
    CLEAR_PARTICLES: "c",
    ADD_PARTICLES: "a",
    RESET_SIMULATION: "n",
    INCREASE_VELOCITY: ["=", "+"],
    DECREASE_VELOCITY: "-",
    INCREASE_ACCELERATION: "]",
    DECREASE_ACCELERATION: "[",
    RESET_PHYSICS: "\\",
    SHOW_STATS: "s",
    SHOW_OPTIONS: "o",
    ADJUST_FRICTION_DOWN: "f",
    ADJUST_FRICTION_UP: "g",
    INCREASE_SIZE: ".",
    DECREASE_SIZE: ",",
    INCREASE_FORCE: "m",
    DECREASE_FORCE: "l",
    INCREASE_DISTANCE: "d",
    DECREASE_DISTANCE: "x",
  },

  // Mouse controls
  mouse: {
    get ADD_PARTICLE_KEYS() {
      return Array.from(particleTypeRegistry.getKeyboardMappings().keys());
    },
    DRAG_FORCE_MULTIPLIER: 0.1,
    CLICK_FORCE_RADIUS: 50,
  },

  // Adjustment multipliers
  adjustmentMultipliers: {
    velocity: 1.2,
    acceleration: 1.2,
    friction: 0.1,
    size: 1,
    force: 1.2,
    distance: 10,
  },
};

// UI configuration
export const UI_CONFIG = {
  // Panel settings
  panels: {
    stats: {
      enabled: true,
      position: "bottom-left",
      updateInterval: 1000,
    },
    options: {
      enabled: true,
      position: "right",
      defaultVisible: false,
    },
    rules: {
      enabled: true,
      position: "left",
      defaultVisible: false,
    },
    presets: {
      enabled: true,
      position: "top",
      defaultVisible: true,
    },
  },

  // Color schemes
  colorSchemes: {
    default: {
      background: "#000",
      text: "#fff",
      primary: "#007bff",
      secondary: "#6c757d",
      success: "#28a745",
      warning: "#ffc107",
      danger: "#dc3545",
    },
  },

  // Animation settings
  animations: {
    panelSlideSpeed: 300,
    buttonHoverScale: 1.05,
    particleTrailLength: 10,
  },
};

// Performance thresholds
export const PERFORMANCE_CONFIG = {
  // FPS thresholds
  targetFPS: 60,
  minAcceptableFPS: 30,
  lowPerformanceFPS: 20,

  // Particle count thresholds
  maxParticlesForFullFeatures: 1000,
  maxParticlesForQuadtree: 2000,
  maxParticlesTotal: 2500,

  // Memory thresholds (MB)
  maxMemoryUsage: 200,
  warningMemoryUsage: 150,

  // Performance optimization settings
  autoOptimize: true,
  adaptiveQuality: true,
  emergencyMode: {
    enabled: true,
    triggerFPS: 15,
    maxParticles: 500,
  },
};

// Storage keys for persistence
export const STORAGE_CONFIG = {
  keys: {
    CUSTOM_PRESETS: "particleLife_customPresets",
    USER_PREFERENCES: "particleLife_userPrefs",
    PERFORMANCE_SETTINGS: "particleLife_performance",
    RULE_HISTORY: "particleLife_ruleHistory",
  },

  // Version for migration
  storageVersion: "1.0.0",

  // Cleanup settings
  maxStorageSize: 5 * 1024 * 1024, // 5MB
  cleanupThreshold: 0.8, // 80% of max size
};

// Export all configs as a single object for convenience
export const ALL_CONFIG = {
  CONFIG,
  PARTICLE_CONFIG,
  INPUT_CONFIG,
  UI_CONFIG,
  PERFORMANCE_CONFIG,
  STORAGE_CONFIG,
};

// Helper function to get config value with fallback
export function getConfig(path, fallback = null) {
  const keys = path.split(".");
  let current = ALL_CONFIG;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }

  return current;
}

// Helper function to validate config values
export function validateConfig() {
  const errors = [];

  // Validate particle counts
  if (CONFIG.PARTICLE_COUNT_PER_TYPE <= 0) {
    errors.push("PARTICLE_COUNT_PER_TYPE must be positive");
  }

  if (
    CONFIG.MAX_TOTAL_PARTICLES <
    CONFIG.PARTICLE_COUNT_PER_TYPE * PARTICLE_CONFIG.types.length
  ) {
    errors.push(
      "MAX_TOTAL_PARTICLES must be at least PARTICLE_COUNT_PER_TYPE * number of types"
    );
  }

  // Validate physics settings
  const opts = PARTICLE_CONFIG.defaultOptions;
  if (opts.maxVelocity <= 0) {
    errors.push("maxVelocity must be positive");
  }

  if (opts.maxAcceleration <= 0) {
    errors.push("maxAcceleration must be positive");
  }

  if (opts.friction < 0 || opts.friction > 1) {
    errors.push("friction must be between 0 and 1");
  }

  return errors;
}

// Initialize and validate configuration
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.warn("Configuration validation errors:", configErrors);
}
