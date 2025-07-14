// Comprehensive preset configurations for the Particle Life simulation
export const presets = {
  noForces: {
    name: "🚫 No Forces",
    description:
      "Particles with no interaction forces - pure physics simulation",
    physics: {
      friction: 0.98,
      maxVelocity: 4.0,
      maxDistance: 0,
      forceMultiplier: 0.0,
      collisionDistanceRatio: 1.0,
    },
    rules: {
      red: {
        green: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      blue: {
        green: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      yellow: {
        green: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.0,
          farForce: 0.0,
          threshold: 0,
          destroyOriginals: false,
          createParticles: [],
        },
      },
    },
  },

  ecosystem: {
    name: "🌿 Ecosystem",
    description:
      "Balanced ecosystem with producers, consumers, and decomposers",
    physics: {
      friction: 0.95,
      maxVelocity: 6.0,
      maxDistance: 90,
      forceMultiplier: 0.08,
      collisionDistanceRatio: 1.5,
    },
    rules: {
      red: {
        green: {
          closeForce: 0.8,
          farForce: -0.2,
          threshold: 40,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 2 }],
        },
        blue: {
          closeForce: -0.4,
          farForce: 0.1,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.2,
          farForce: -0.1,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -0.6,
          farForce: 0.0,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: 0.3,
          farForce: -0.2,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.4,
          farForce: -0.1,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
        yellow: {
          closeForce: -0.2,
          farForce: 0.3,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -0.9,
          farForce: 0.1,
          threshold: 50,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 2 }],
        },
      },
      blue: {
        blue: {
          closeForce: -0.3,
          farForce: 0.4,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.6,
          farForce: -0.1,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -0.2,
          farForce: -0.3,
          threshold: 30,
          destroyOriginals: true,
          createParticles: [{ type: "green", count: 1 }],
        },
        green: {
          closeForce: 0.1,
          farForce: 0.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
      },
      yellow: {
        yellow: {
          closeForce: -0.8,
          farForce: 0.2,
          threshold: 15,
          destroyOriginals: true,
          createParticles: [
            { type: "green", count: 1 },
            { type: "blue", count: 1 },
          ],
        },
        red: {
          closeForce: 0.1,
          farForce: -0.4,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.5,
          farForce: 0.1,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.1,
          farForce: 0.3,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
      },
    },
  },

  predator_prey: {
    name: "🐺 Predator-Prey",
    description: "Classic predator-prey relationships with population dynamics",
    physics: {
      friction: 0.92,
      maxVelocity: 8.0,
      maxDistance: 100,
      forceMultiplier: 0.12,
      collisionDistanceRatio: 2.0,
    },
    rules: {
      red: {
        red: {
          closeForce: -1.2,
          farForce: 0.0,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 1.0,
          farForce: 0.2,
          threshold: 60,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 1 }],
        },
        blue: {
          closeForce: 0.8,
          farForce: 0.1,
          threshold: 50,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 1 }],
        },
        yellow: {
          closeForce: -0.3,
          farForce: -0.1,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: 0.4,
          farForce: -0.1,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [{ type: "green", count: 1 }],
        },
        blue: {
          closeForce: 0.2,
          farForce: 0.0,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.1,
          farForce: 0.2,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -1.5,
          farForce: -0.3,
          threshold: 80,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 1 }],
        },
      },
      blue: {
        blue: {
          closeForce: 0.3,
          farForce: -0.2,
          threshold: 18,
          destroyOriginals: false,
          createParticles: [{ type: "blue", count: 1 }],
        },
        yellow: {
          closeForce: 0.3,
          farForce: 0.1,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -1.3,
          farForce: -0.2,
          threshold: 70,
          destroyOriginals: true,
          createParticles: [{ type: "red", count: 1 }],
        },
        green: {
          closeForce: 0.1,
          farForce: 0.1,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      yellow: {
        yellow: {
          closeForce: -0.4,
          farForce: 0.3,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.2,
          farForce: -0.2,
          threshold: 40,
          destroyOriginals: true,
          createParticles: [{ type: "yellow", count: 2 }],
        },
        green: {
          closeForce: -0.1,
          farForce: 0.1,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.1,
          farForce: 0.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
      },
    },
  },

  orbital: {
    name: "🪐 Orbital",
    description: "Gravitational-like attractions creating orbital patterns",
    physics: {
      friction: 0.99,
      maxVelocity: 12.0,
      maxDistance: 120,
      forceMultiplier: 0.15,
      collisionDistanceRatio: 1.0,
      enableVelocityClamp: true,
    },
    rules: {
      red: {
        red: {
          closeForce: -2.0,
          farForce: -0.5,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: -0.5,
          farForce: 0.8,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.3,
          farForce: 0.6,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: -0.2,
          farForce: 0.4,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: -0.8,
          farForce: 0.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.2,
          farForce: 0.4,
          threshold: 25,
          destroyOriginals: true,
          createParticles: [{ type: "green", count: 1 }],
        },
        yellow: {
          closeForce: -0.1,
          farForce: 0.3,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.9,
          farForce: 0.1,
          threshold: 60,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      blue: {
        blue: {
          closeForce: -0.3,
          farForce: 0.1,
          threshold: 15,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: -0.1,
          farForce: 0.2,
          threshold: 18,
          destroyOriginals: true,
          createParticles: [{ type: "blue", count: 1 }],
        },
        red: {
          closeForce: 0.7,
          farForce: 0.0,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.5,
          farForce: 0.1,
          threshold: 40,
          destroyOriginals: true,
          createParticles: [{ type: "green", count: 1 }],
        },
      },
      yellow: {
        yellow: {
          closeForce: -0.2,
          farForce: 0.1,
          threshold: 12,
          destroyOriginals: true,
          createParticles: [{ type: "blue", count: 1 }],
        },
        red: {
          closeForce: 0.5,
          farForce: 0.0,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.4,
          farForce: 0.0,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.3,
          farForce: 0.0,
          threshold: 25,
          destroyOriginals: true,
          createParticles: [{ type: "blue", count: 1 }],
        },
      },
    },
  },

  swarm: {
    name: "🐝 Swarm",
    description: "Flocking behavior with emergent intelligence patterns",
    physics: {
      friction: 0.96,
      maxVelocity: 10.0,
      maxDistance: 80,
      forceMultiplier: 0.1,
      collisionDistanceRatio: 1.2,
    },
    rules: {
      red: {
        red: {
          closeForce: -0.3,
          farForce: 0.5,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.2,
          farForce: 0.3,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.1,
          farForce: 0.2,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [{ type: "green", count: 1 }],
        },
        yellow: {
          closeForce: 0.3,
          farForce: 0.1,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: 0.6,
          farForce: -0.1,
          threshold: 25,
          destroyOriginals: true,
          createParticles: [
            { type: "blue", count: 1 },
            { type: "yellow", count: 1 },
          ],
        },
        blue: {
          closeForce: 0.4,
          farForce: 0.1,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.2,
          farForce: 0.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
        red: {
          closeForce: 0.8,
          farForce: 0.2,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      blue: {
        blue: {
          closeForce: -0.2,
          farForce: 0.3,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.1,
          farForce: 0.4,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.4,
          farForce: 0.1,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [{ type: "green", count: 1 }],
        },
        green: {
          closeForce: 0.3,
          farForce: 0.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      yellow: {
        yellow: {
          closeForce: 0.5,
          farForce: 0.0,
          threshold: 18,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
        red: {
          closeForce: 0.6,
          farForce: 0.0,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.4,
          farForce: 0.1,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 0.2,
          farForce: 0.3,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [],
        },
      },
    },
  },

  chemical: {
    name: "⚗️ Chemical",
    description: "Chemical-like reactions and catalysis",
    physics: {
      friction: 0.94,
      maxVelocity: 7.0,
      maxDistance: 70,
      forceMultiplier: 0.09,
      collisionDistanceRatio: 2.5,
    },
    rules: {
      red: {
        red: {
          closeForce: 0.2,
          farForce: -0.1,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 0.9,
          farForce: 0.1,
          threshold: 35,
          destroyOriginals: true,
          createParticles: [{ type: "yellow", count: 2 }],
        },
        blue: {
          closeForce: -0.1,
          farForce: 0.3,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [{ type: "green", count: 1 }],
        },
        yellow: {
          closeForce: -0.2,
          farForce: -0.1,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      green: {
        green: {
          closeForce: 0.1,
          farForce: -0.2,
          threshold: 18,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.1,
          farForce: 0.4,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [{ type: "red", count: 1 }],
        },
        yellow: {
          closeForce: -0.3,
          farForce: -0.2,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 0.8,
          farForce: 0.2,
          threshold: 40,
          destroyOriginals: true,
          createParticles: [{ type: "yellow", count: 2 }],
        },
      },
      blue: {
        blue: {
          closeForce: -0.4,
          farForce: 0.2,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: -0.6,
          farForce: -0.1,
          threshold: 35,
          destroyOriginals: true,
          createParticles: [{ type: "yellow", count: 1 }],
        },
        red: {
          closeForce: 0.3,
          farForce: 0.1,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [{ type: "green", count: 1 }],
        },
        green: {
          closeForce: 0.4,
          farForce: 0.1,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [{ type: "red", count: 1 }],
        },
      },
      yellow: {
        yellow: {
          closeForce: -0.1,
          farForce: 0.1,
          threshold: 22,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -0.5,
          farForce: 0.0,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: -0.6,
          farForce: 0.0,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.3,
          farForce: -0.2,
          threshold: 30,
          destroyOriginals: true,
          createParticles: [{ type: "yellow", count: 1 }],
        },
      },
    },
  },

  chaos: {
    name: "🌪️ Chaos",
    description:
      "Chaotic system with sensitive dependence and strange attractors",
    physics: {
      friction: 0.98,
      maxVelocity: 15.0,
      maxDistance: 100,
      forceMultiplier: 0.2,
      collisionDistanceRatio: 0.8,
      enableVelocityClamp: false,
    },
    rules: {
      red: {
        red: {
          closeForce: -1.5,
          farForce: 1.2,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        green: {
          closeForce: 1.8,
          farForce: -0.8,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -0.9,
          farForce: 1.5,
          threshold: 30,
          destroyOriginals: true,
          createParticles: [
            { type: "green", count: 1 },
            { type: "yellow", count: 1 },
          ],
        },
        yellow: {
          closeForce: 0.7,
          farForce: -1.2,
          threshold: 50,
          destroyOriginals: false,
          createParticles: [{ type: "blue", count: 1 }],
        },
      },
      green: {
        green: {
          closeForce: 0.8,
          farForce: -1.1,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: -1.3,
          farForce: 0.9,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
        yellow: {
          closeForce: 1.4,
          farForce: -0.6,
          threshold: 55,
          destroyOriginals: true,
          createParticles: [
            { type: "red", count: 1 },
            { type: "blue", count: 1 },
          ],
        },
        red: {
          closeForce: -0.7,
          farForce: 1.6,
          threshold: 60,
          destroyOriginals: false,
          createParticles: [],
        },
      },
      blue: {
        blue: {
          closeForce: -0.6,
          farForce: 1.0,
          threshold: 20,
          destroyOriginals: false,
          createParticles: [],
        },
        yellow: {
          closeForce: 0.9,
          farForce: -1.4,
          threshold: 35,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: 1.1,
          farForce: -0.9,
          threshold: 50,
          destroyOriginals: true,
          createParticles: [
            { type: "green", count: 1 },
            { type: "yellow", count: 1 },
          ],
        },
        green: {
          closeForce: -1.2,
          farForce: 0.8,
          threshold: 45,
          destroyOriginals: false,
          createParticles: [{ type: "yellow", count: 1 }],
        },
      },
      yellow: {
        yellow: {
          closeForce: 1.0,
          farForce: -0.8,
          threshold: 30,
          destroyOriginals: false,
          createParticles: [],
        },
        red: {
          closeForce: -1.4,
          farForce: 0.6,
          threshold: 55,
          destroyOriginals: false,
          createParticles: [{ type: "blue", count: 1 }],
        },
        green: {
          closeForce: 0.5,
          farForce: -1.3,
          threshold: 40,
          destroyOriginals: false,
          createParticles: [],
        },
        blue: {
          closeForce: 1.2,
          farForce: -0.7,
          threshold: 25,
          destroyOriginals: false,
          createParticles: [],
        },
      },
    },
  },
};

/**
 * Preset Manager for handling preset loading, saving, and management
 */
export class PresetManager {
  constructor() {
    this.customPresets = {};
    this.loadCustomPresets();
  }

  /**
   * Get all available presets (built-in + custom)
   * @returns {Object} - All presets
   */
  getAllPresets() {
    return { ...presets, ...this.customPresets };
  }

  /**
   * Get built-in presets only
   * @returns {Object} - Built-in presets
   */
  getBuiltInPresets() {
    return presets;
  }

  /**
   * Get custom presets only
   * @returns {Object} - Custom presets
   */
  getCustomPresets() {
    return this.customPresets;
  }

  /**
   * Get a specific preset by name
   * @param {string} name - Preset name
   * @returns {Object|null} - Preset object or null if not found
   */
  getPreset(name) {
    return presets[name] || this.customPresets[name] || null;
  }

  /**
   * Save a custom preset
   * @param {string} name - Preset name
   * @param {Object} preset - Preset object
   */
  saveCustomPreset(name, preset) {
    this.customPresets[name] = { ...preset };
    this.saveCustomPresets();
    console.log(`💾 Custom preset "${name}" saved`);
  }

  /**
   * Delete a custom preset
   * @param {string} name - Preset name
   * @returns {boolean} - Whether deletion was successful
   */
  deleteCustomPreset(name) {
    if (this.customPresets[name]) {
      delete this.customPresets[name];
      this.saveCustomPresets();
      console.log(`🗑️ Custom preset "${name}" deleted`);
      return true;
    }
    return false;
  }

  /**
   * Load custom presets from localStorage
   */
  loadCustomPresets() {
    try {
      const stored = localStorage.getItem("particleLife_customPresets");
      if (stored) {
        this.customPresets = JSON.parse(stored);
        console.log(
          `📂 Loaded ${Object.keys(this.customPresets).length} custom presets`
        );
      }
    } catch (error) {
      console.error("Error loading custom presets:", error);
      this.customPresets = {};
    }
  }

  /**
   * Save custom presets to localStorage
   */
  saveCustomPresets() {
    try {
      localStorage.setItem(
        "particleLife_customPresets",
        JSON.stringify(this.customPresets)
      );
    } catch (error) {
      console.error("Error saving custom presets:", error);
    }
  }

  /**
   * Export preset as JSON
   * @param {string} name - Preset name
   * @returns {string|null} - JSON string or null if preset not found
   */
  exportPreset(name) {
    const preset = this.getPreset(name);
    if (preset) {
      return JSON.stringify(
        {
          name,
          preset,
          exportDate: new Date().toISOString(),
          version: "1.0.0",
        },
        null,
        2
      );
    }
    return null;
  }

  /**
   * Import preset from JSON
   * @param {string} jsonString - JSON string
   * @returns {boolean} - Whether import was successful
   */
  importPreset(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.name && data.preset) {
        this.saveCustomPreset(data.name, data.preset);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing preset:", error);
      return false;
    }
  }

  /**
   * Get preset names by category
   * @returns {Object} - Categorized preset names
   */
  getPresetsByCategory() {
    const categories = {
      physics: ["noForces", "orbital"],
      biological: ["ecosystem", "predator_prey", "swarm"],
      chemical: ["chemical"],
      mathematical: ["chaos"],
      custom: Object.keys(this.customPresets),
    };

    return categories;
  }

  /**
   * Validate preset structure
   * @param {Object} preset - Preset to validate
   * @returns {Object} - Validation results
   */
  validatePreset(preset) {
    const issues = [];

    if (!preset.name || typeof preset.name !== "string") {
      issues.push("Missing or invalid name");
    }

    if (!preset.description || typeof preset.description !== "string") {
      issues.push("Missing or invalid description");
    }

    if (preset.physics && typeof preset.physics !== "object") {
      issues.push("Invalid physics configuration");
    }

    if (preset.rules && typeof preset.rules !== "object") {
      issues.push("Invalid rules configuration");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Export singleton instance
export const presetManager = new PresetManager();

// Export the presets object for direct access
export default presets;
