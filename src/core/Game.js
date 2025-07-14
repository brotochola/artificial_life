import { CONFIG, PARTICLE_CONFIG, INPUT_CONFIG } from "./Config.js";
import { Particle } from "../entities/Particle.js";
import { PhysicsEngine } from "../physics/PhysicsEngine.js";
import { ParticlePool } from "../physics/ParticlePool.js";
import { RuleManager } from "../rules/RuleManager.js";
import { presetManager } from "../rules/Presets.js";
import { UIManager } from "../ui/UIManager.js";
import { OptionsPanel } from "../ui/OptionsPanel.js";
import { RulesPanel } from "../ui/RulesPanel.js";
import { PatternGenerator } from "../patterns/PatternGenerator.js";
import { PixiRenderer } from "../rendering/PixiRenderer.js";

/**
 * Main Game class that orchestrates the entire particle life simulation
 * Manages all components and handles the game loop
 */
export class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.isInitialized = false;
    this.isPaused = false;
    this.animationId = null;

    // Component instances
    this.physicsEngine = new PhysicsEngine();
    this.particlePool = new ParticlePool(Particle);
    this.ruleManager = new RuleManager();
    this.uiManager = new UIManager();
    this.optionsPanel = new OptionsPanel();
    this.rulesPanel = new RulesPanel();
    this.patternGenerator = new PatternGenerator();
    this.pixiRenderer = new PixiRenderer();

    // Performance tracking
    this.performance = {
      lastTime: 0,
      lastStatsTime: 0, // Separate timestamp for FPS calculation
      frameCount: 0,
      fps: 0,
      averageFrameTime: 0,
      frameTimeHistory: [],
    };

    // Input handling
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false };

    // Settings
    this.particleOptions = { ...PARTICLE_CONFIG.defaultOptions };
    this.showQuadtree = false;
  }

  /**
   * Initialize the entire game system
   * @param {HTMLElement} container - Main container element
   */
  async initialize(container) {
    if (this.isInitialized) {
      console.warn("Game already initialized");
      return;
    }

    console.log("🎮 Initializing Particle Life Game...");

    try {
      // Initialize particle type registry first
      PARTICLE_CONFIG.initialize();

      // Create and setup PixiJS renderer
      await this.setupCanvas(container);

      // Initialize all components
      await this.initializeComponents(container);

      // Setup event handlers
      this.setupEventHandlers();

      // Initialize particles and rules
      this.resetSimulation();

      // Start the game loop
      this.startGameLoop();

      this.isInitialized = true;
      console.log("✅ Game initialization complete!");
    } catch (error) {
      console.error("❌ Game initialization failed:", error);
      throw error;
    }
  }

  /**
   * Setup PixiJS renderer
   * @param {HTMLElement} container - Container element
   */
  async setupCanvas(container) {
    // Calculate canvas size
    const width = window.innerWidth * CONFIG.CANVAS_WIDTH_RATIO;
    const height = width / CONFIG.CANVAS_ASPECT_RATIO;

    // Find canvas container
    const canvasContainer =
      container.querySelector("#canvas-container") || container;

    // Initialize PixiJS renderer
    await this.pixiRenderer.initialize(canvasContainer, width, height);

    // Get canvas reference for compatibility
    this.canvas = this.pixiRenderer.getCanvas();
    this.ctx = null; // Not needed with PixiJS

    // Setup resize handler
    window.addEventListener("resize", () => this.resizeCanvas());

    console.log(`🎨 PixiJS renderer created: ${width}x${height}`);
  }

  /**
   * Resize PixiJS renderer to match container
   */
  resizeCanvas() {
    if (this.pixiRenderer && this.pixiRenderer.getApp()) {
      const width = window.innerWidth * CONFIG.CANVAS_WIDTH_RATIO;
      const height = width / CONFIG.CANVAS_ASPECT_RATIO;

      this.pixiRenderer.resize(width, height);
      this.canvas = this.pixiRenderer.getCanvas(); // Update canvas reference
    }
  }

  /**
   * Initialize all components
   * @param {HTMLElement} container - Container element
   */
  async initializeComponents(container) {
    // Initialize particle pool
    this.particlePool.initialize();

    // Initialize physics engine
    this.physicsEngine.setParticles(this.particles);
    this.physicsEngine.updateOptions(this.particleOptions);

    // Initialize rule manager
    this.ruleManager.initialize();
    this.physicsEngine.setRules(this.ruleManager.getRules());

    // Set initial render mode
    if (this.pixiRenderer && this.particleOptions.renderMode) {
      this.pixiRenderer.setRenderMode(this.particleOptions.renderMode);
    }

    // Initialize UI components
    this.uiManager.initialize(container);

    // Initialize options panel
    const optionsGrid = document.getElementById("options-grid");
    if (optionsGrid) {
      this.optionsPanel.initialize(optionsGrid, (key, value, options) => {
        this.handleOptionChange(key, value, options);
      });
      // Ensure options panel displays default values
      this.optionsPanel.updateOptions(this.particleOptions);
    }

    // Initialize rules panel
    const rulesGrid = document.getElementById("rules-grid");
    if (rulesGrid) {
      this.rulesPanel.initialize(rulesGrid, (fromType, toType, rule, rules) => {
        this.handleRuleChange(fromType, toType, rule, rules);
      });
    }

    // Update preset selector
    this.updatePresetSelector();

    console.log("🔧 All components initialized");
  }

  /**
   * Setup event handlers for UI and input
   */
  setupEventHandlers() {
    // UI event handlers
    this.uiManager.addEventListener("pause", () => this.togglePause());
    this.uiManager.addEventListener("reset", () => this.resetSimulation());
    this.uiManager.addEventListener("addParticles", () => this.addParticles());
    this.uiManager.addEventListener("clearParticles", () =>
      this.clearParticles()
    );
    this.uiManager.addEventListener("randomizeRules", () =>
      this.randomizeRules()
    );
    this.uiManager.addEventListener("loadPreset", (e) =>
      this.loadPreset(e.detail)
    );
    this.uiManager.addEventListener("savePreset", () =>
      this.saveCurrentPreset()
    );

    // Options panel events
    this.uiManager.addEventListener("resetOptions", () => this.resetOptions());
    this.uiManager.addEventListener("exportOptions", () =>
      this.exportOptions()
    );

    // Rules panel events
    this.uiManager.addEventListener("randomizeForceRules", () =>
      this.randomizeForceRules()
    );
    this.uiManager.addEventListener("randomizeCollisionRules", () =>
      this.randomizeCollisionRules()
    );
    this.uiManager.addEventListener("clearRules", () => this.clearAllRules());
    this.uiManager.addEventListener("undoRules", () => this.undoRules());
    this.uiManager.addEventListener("redoRules", () => this.redoRules());
    this.uiManager.addEventListener("exportRules", () => this.exportRules());
    this.uiManager.addEventListener("importRules", () => this.importRules());

    // Keyboard input
    this.setupKeyboardHandlers();

    // Mouse input
    this.setupMouseHandlers();

    console.log("🎮 Event handlers setup complete");
  }

  /**
   * Setup keyboard event handlers
   */
  setupKeyboardHandlers() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Handle specific key combinations
      switch (e.key.toLowerCase()) {
        case INPUT_CONFIG.keys.PAUSE:
          this.togglePause();
          e.preventDefault();
          break;
        case INPUT_CONFIG.keys.RANDOMIZE_RULES:
          this.randomizeRules();
          break;
        case INPUT_CONFIG.keys.CLEAR_PARTICLES:
          this.clearParticles();
          break;
        case INPUT_CONFIG.keys.ADD_PARTICLES:
          this.addParticles();
          break;
        case INPUT_CONFIG.keys.RESET_SIMULATION:
          this.resetSimulation();
          break;
        case INPUT_CONFIG.keys.SHOW_STATS:
          this.logStats();
          break;
        case INPUT_CONFIG.keys.SHOW_OPTIONS:
          this.uiManager.togglePanel("options");
          break;
        case "q":
          this.showQuadtree = !this.showQuadtree;
          console.log(
            `🌳 Quadtree visualization: ${this.showQuadtree ? "ON" : "OFF"}`
          );
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      delete this.keys[e.key.toLowerCase()];
    });
  }

  /**
   * Setup mouse event handlers
   */
  setupMouseHandlers() {
    if (!this.canvas) return;

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Add particles at mouse position if holding mapped keys
      const keyboardMappings = PARTICLE_CONFIG.getKeyboardMappings();
      for (const [key, typeId] of keyboardMappings) {
        if (this.keys[key]) {
          const type = PARTICLE_CONFIG.getTypeById(typeId);
          if (type && this.particles.length < CONFIG.MAX_TOTAL_PARTICLES) {
            const particle = this.particlePool.getParticle(
              this.mouse.x,
              this.mouse.y,
              typeId,
              PARTICLE_CONFIG.colors,
              PARTICLE_CONFIG.types,
              this.particleOptions
            );
            this.particles.push(particle);
          }
          break; // Only handle one key at a time
        }
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.mouse.isDown = true;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.mouse.isDown = false;
    });
  }

  /**
   * Handle option changes from UI
   * @param {string} key - Option key
   * @param {*} value - New value
   * @param {Object} options - All options
   */
  handleOptionChange(key, value, options) {
    // Update local options
    Object.assign(this.particleOptions, options);

    // Handle render mode change
    if (key === "renderMode" && this.pixiRenderer) {
      this.pixiRenderer.setRenderMode(value);
      console.log(`🎨 Render mode changed to: ${value}`);
    }

    // Update physics engine
    this.physicsEngine.updateOptions(this.particleOptions);

    // Apply to existing particles
    this.applyOptionsToParticles();

    console.log(`⚙️ Option changed: ${key} = ${value}`);
  }

  /**
   * Handle rule changes from UI
   * @param {string} fromType - Source particle type
   * @param {string} toType - Target particle type
   * @param {Object} rule - Rule object
   * @param {Object} rules - All rules
   */
  handleRuleChange(fromType, toType, rule, rules) {
    // Update rule manager
    this.ruleManager.setRules(rules, `Rule change: ${fromType} → ${toType}`);

    // Update physics engine
    this.physicsEngine.setRules(rules);

    console.log(`🎯 Rule changed: ${fromType} → ${toType}`);
  }

  /**
   * Apply current options to all existing particles
   */
  applyOptionsToParticles() {
    this.particles.forEach((particle) => {
      particle.setMaxVelocity(this.particleOptions.maxVelocity);
      particle.setMaxAcceleration(this.particleOptions.maxAcceleration);
      particle.friction = this.particleOptions.friction;
      particle.bounceDecay = this.particleOptions.bounceDecay;
      particle.size = this.particleOptions.size;
    });
  }

  /**
   * Create particles using pattern generator
   * @param {string} pattern - Pattern name to use
   */
  createParticles(pattern = "random") {
    // Return existing particles to pool
    this.particlePool.returnParticles(this.particles);
    this.particles = [];

    // Create particle factory function
    const particleFactory = (x, y, type) => {
      return this.particlePool.getParticle(
        x,
        y,
        type,
        PARTICLE_CONFIG.colors,
        PARTICLE_CONFIG.types,
        this.particleOptions
      );
    };

    // Generate particles using pattern
    this.particles = this.patternGenerator.generatePattern(
      pattern,
      this.canvas.width,
      this.canvas.height,
      particleFactory
    );

    // Update physics engine with new particles array
    this.physicsEngine.setParticles(this.particles);

    console.log(
      `🎯 Created ${this.particles.length} particles using ${pattern} pattern`
    );
  }

  /**
   * Start the main game loop
   */
  startGameLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.gameLoop();
    console.log("🔄 Game loop started");
  }

  /**
   * Main game loop
   * @param {number} currentTime - Current timestamp
   */
  gameLoop(currentTime = 0) {
    // Calculate frame timing
    const deltaTime = currentTime - this.performance.lastTime;
    this.performance.lastTime = currentTime;
    this.performance.frameCount++;

    // Update physics (if not paused)
    if (!this.isPaused) {
      this.updatePhysics();
    }

    // Always render
    this.render();

    // Update performance stats
    this.updatePerformanceStats(currentTime, deltaTime);

    // Update UI stats display
    this.updateUIStats();

    // Continue loop
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * Update physics simulation
   */
  updatePhysics() {
    if (!this.canvas || this.particles.length === 0) return;

    // Update physics engine
    const collisionResults = this.physicsEngine.update(
      this.canvas.width,
      this.canvas.height
    );

    // Process collision results
    this.processCollisionResults(collisionResults);
  }

  /**
   * Process collision results from physics engine
   * @param {Object} results - Collision results
   */
  processCollisionResults(results) {
    const { particlesToAdd, particlesToRemove } = results;

    // Remove particles
    if (particlesToRemove.length > 0) {
      particlesToRemove.forEach((particle) => {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
          this.particles.splice(index, 1);
          this.particlePool.returnParticle(particle);
        }
      });
    }

    // Add new particles
    if (particlesToAdd.length > 0) {
      particlesToAdd.forEach((particleData) => {
        if (this.particles.length < CONFIG.MAX_TOTAL_PARTICLES) {
          const newParticle = this.particlePool.getParticle(
            particleData.x,
            particleData.y,
            particleData.type,
            particleData.colors,
            particleData.types,
            particleData.options
          );

          // Apply initial velocity if provided
          if (particleData.initialVx !== undefined) {
            newParticle.vx = particleData.initialVx;
          }
          if (particleData.initialVy !== undefined) {
            newParticle.vy = particleData.initialVy;
          }

          this.particles.push(newParticle);
        }
      });
    }
  }

  /**
   * Render the simulation using PixiJS
   */
  render() {
    if (!this.pixiRenderer || !this.canvas) return;

    // Prepare render options
    const renderOptions = {
      showQuadtree: this.showQuadtree,
      quadtreeData: this.showQuadtree
        ? this.physicsEngine.getQuadtreeData()
        : null,
    };

    // Render using PixiJS
    this.pixiRenderer.render(this.particles, renderOptions);
  }

  /**
   * Reset performance tracking state
   */
  resetPerformanceTracking() {
    this.performance.frameTimeHistory = [];
    this.performance.averageFrameTime = 0;
    this.performance.lastTime = performance.now();
    this.performance.lastStatsTime = performance.now();
    this.performance.frameCount = 0;
    this.performance.fps = 0;
  }

  /**
   * Update performance statistics
   * @param {number} currentTime - Current timestamp
   * @param {number} deltaTime - Frame delta time
   */
  updatePerformanceStats(currentTime, deltaTime) {
    // Calculate FPS
    if (
      currentTime - this.performance.lastStatsTime >=
      CONFIG.STATS_UPDATE_INTERVAL
    ) {
      this.performance.fps = Math.round(
        (this.performance.frameCount * 1000) / CONFIG.STATS_UPDATE_INTERVAL
      );
      this.performance.frameCount = 0;
      this.performance.lastStatsTime = currentTime;

      // Update UI stats
      this.updateUIStats();
    }

    // Track frame time
    this.performance.frameTimeHistory.push(deltaTime);
    if (this.performance.frameTimeHistory.length > 60) {
      this.performance.frameTimeHistory.shift();
    }

    // Calculate average frame time
    this.performance.averageFrameTime =
      this.performance.frameTimeHistory.reduce((a, b) => a + b, 0) /
      this.performance.frameTimeHistory.length;

    // If we detect a dramatic improvement in frame time (e.g., particles were cleared),
    // reset the history to be more responsive
    if (this.performance.frameTimeHistory.length > 10) {
      const recentAverage =
        this.performance.frameTimeHistory
          .slice(-10)
          .reduce((a, b) => a + b, 0) / 10;
      const historicalAverage = this.performance.averageFrameTime;

      // If recent performance is significantly better than historical average,
      // it likely means particles were cleared or count reduced dramatically
      if (historicalAverage > 30 && recentAverage < historicalAverage * 0.3) {
        console.log("🚀 Performance dramatically improved, resetting tracking");
        this.performance.frameTimeHistory =
          this.performance.frameTimeHistory.slice(-10);
        this.performance.averageFrameTime = recentAverage;
      }
    }
  }

  /**
   * Update UI statistics display
   */
  updateUIStats() {
    // Only update UI stats every 10 frames (6 times per second at 60fps)
    // This prevents expensive stats calculations from running every frame
    if (this.performance.frameCount % 10 !== 0) {
      return;
    }

    const physicsStats = this.physicsEngine.getStats();
    const poolStats = this.particlePool.getStats();
    const quadtreeInfo = this.physicsEngine.getQuadtreeInfo();
    const renderStats = this.pixiRenderer ? this.pixiRenderer.getStats() : null;

    const stats = {
      particleCount: this.particles.length,
      fps: this.performance.fps,
      poolEfficiency: poolStats.efficiency,
      avgSpeed: physicsStats?.avgSpeed || 0,
      quadtreeDepth: quadtreeInfo.enabled ? quadtreeInfo.depth : 0,
      renderTime: renderStats?.averageFrameTime || 0,
      gpuAccelerated: renderStats?.gpuAccelerated || false,
    };

    this.uiManager.updateStats(stats);
  }

  // ========================================
  // PUBLIC CONTROL METHODS
  // ========================================

  /**
   * Toggle pause state
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    this.uiManager.updatePauseButton(this.isPaused);
    console.log(`${this.isPaused ? "⏸️ Paused" : "▶️ Resumed"} simulation`);
  }

  /**
   * Reset the entire simulation
   */
  resetSimulation() {
    // Clear existing particles
    this.clearParticles();

    // Reset options to true defaults
    this.resetOptions();

    // Create new particles with interesting pattern
    this.createParticles("random");

    console.log("🔄 Simulation reset with default options");
  }

  /**
   * Add random particles
   */
  addParticles() {
    const type =
      PARTICLE_CONFIG.types[
        Math.floor(Math.random() * PARTICLE_CONFIG.types.length)
      ];
    let addedCount = 0;

    for (let i = 0; i < 200; i++) {
      if (this.particles.length < CONFIG.MAX_TOTAL_PARTICLES) {
        const x = 20 + Math.random() * (this.canvas.width - 40);
        const y = 20 + Math.random() * (this.canvas.height - 40);

        const particle = this.particlePool.getParticle(
          x,
          y,
          type,
          PARTICLE_CONFIG.colors,
          PARTICLE_CONFIG.types,
          this.particleOptions
        );

        // Give particles some initial velocity
        const speed = 1 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        this.particles.push(particle);
        addedCount++;
      }
    }

    console.log(`➕ Added ${addedCount} particles`);
  }

  /**
   * Clear all particles
   */
  clearParticles() {
    this.particlePool.returnParticles(this.particles);
    this.particles = [];

    // Clear quadtree
    if (this.physicsEngine && this.physicsEngine.quadtree) {
      this.physicsEngine.quadtree.clear();
    }

    // Reset physics engine statistics that could affect performance
    if (this.physicsEngine) {
      this.physicsEngine.resetStats();
    }

    // Reset particle pool statistics
    if (this.particlePool) {
      this.particlePool.resetStats();
    }

    // Reset performance tracking to prevent slow recovery from high particle counts
    this.resetPerformanceTracking();

    // Force physics engine to update with empty particle array
    this.physicsEngine.setParticles(this.particles);

    console.log("🧹 All particles cleared and performance state reset");
  }

  /**
   * Randomize all rules
   */
  randomizeRules() {
    this.ruleManager.randomizeForceRules("Random force rules");
    this.physicsEngine.setRules(this.ruleManager.getRules());
    this.rulesPanel.updateRules(this.ruleManager.getRules());
    console.log("🎲 All rules randomized");
  }

  /**
   * Randomize force rules only
   */
  randomizeForceRules() {
    this.ruleManager.randomizeForceRules("Random force rules");
    this.physicsEngine.setRules(this.ruleManager.getRules());
    this.rulesPanel.updateRules(this.ruleManager.getRules());
    console.log("🎲 Force rules randomized");
  }

  /**
   * Randomize collision rules only
   */
  randomizeCollisionRules() {
    this.ruleManager.randomizeCollisionRules("Random collision rules");
    this.physicsEngine.setRules(this.ruleManager.getRules());
    this.rulesPanel.updateRules(this.ruleManager.getRules());
    console.log("💥 Collision rules randomized");
  }

  /**
   * Clear all rules
   */
  clearAllRules() {
    this.ruleManager.clearAllRules();
    this.physicsEngine.setRules(this.ruleManager.getRules());
    this.rulesPanel.updateRules(this.ruleManager.getRules());
    console.log("🧹 All rules cleared");
  }

  /**
   * Undo last rule change
   */
  undoRules() {
    if (this.ruleManager.undo()) {
      this.physicsEngine.setRules(this.ruleManager.getRules());
      this.rulesPanel.updateRules(this.ruleManager.getRules());
    }
  }

  /**
   * Redo last undone rule change
   */
  redoRules() {
    if (this.ruleManager.redo()) {
      this.physicsEngine.setRules(this.ruleManager.getRules());
      this.rulesPanel.updateRules(this.ruleManager.getRules());
    }
  }

  /**
   * Load a preset
   * @param {string} presetName - Name of preset to load
   */
  loadPreset(presetName) {
    if (!presetName) return;

    let preset = null;

    // Handle custom presets
    if (presetName.startsWith("custom_")) {
      const customName = presetName.substring(7);
      preset = presetManager.getCustomPresets()[customName];
    } else {
      preset = presetManager.getBuiltInPresets()[presetName];
    }

    if (preset) {
      // Apply physics settings
      if (preset.physics) {
        Object.assign(this.particleOptions, preset.physics);
        this.physicsEngine.updateOptions(this.particleOptions);
        this.optionsPanel.updateOptions(this.particleOptions);
        this.applyOptionsToParticles();
      }

      // Apply rules
      if (preset.rules) {
        this.ruleManager.setRules(
          preset.rules,
          `Loaded preset: ${preset.name}`
        );
        this.physicsEngine.setRules(preset.rules);
        this.rulesPanel.updateRules(preset.rules);
      }

      console.log(`🎮 Loaded preset: ${preset.name}`);
      this.uiManager.showNotification(
        `Loaded preset: ${preset.name}`,
        "success"
      );
    } else {
      console.error(`❌ Preset not found: ${presetName}`);
      this.uiManager.showNotification(
        `Preset not found: ${presetName}`,
        "error"
      );
    }
  }

  /**
   * Save current state as preset
   */
  saveCurrentPreset() {
    const presetName = prompt("Enter a name for your custom preset:");
    if (!presetName || presetName.trim() === "") {
      return;
    }

    const preset = {
      name: presetName,
      description: `Custom preset - ${presetName}`,
      physics: { ...this.particleOptions },
      rules: this.ruleManager.getRules(),
    };

    presetManager.saveCustomPreset(presetName, preset);
    this.updatePresetSelector();

    console.log(`💾 Preset saved: ${presetName}`);
    this.uiManager.showNotification(`Preset saved: ${presetName}`, "success");
  }

  /**
   * Reset options to defaults
   */
  resetOptions() {
    this.particleOptions = { ...PARTICLE_CONFIG.defaultOptions };
    this.physicsEngine.updateOptions(this.particleOptions);
    this.optionsPanel.updateOptions(this.particleOptions);
    this.applyOptionsToParticles();

    console.log("🔄 Options reset to defaults");
    this.uiManager.showNotification("Options reset to defaults", "info");
  }

  /**
   * Export current options
   */
  exportOptions() {
    const json = this.optionsPanel.exportOptions();
    this.downloadFile("particle-life-options.json", json);
    console.log("📁 Options exported");
  }

  /**
   * Export current rules
   */
  exportRules() {
    const json = this.ruleManager.exportRules();
    this.downloadFile("particle-life-rules.json", json);
    console.log("📁 Rules exported");
  }

  /**
   * Import rules from file
   */
  importRules() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (this.ruleManager.importRules(e.target.result)) {
            this.physicsEngine.setRules(this.ruleManager.getRules());
            this.rulesPanel.updateRules(this.ruleManager.getRules());
            this.uiManager.showNotification(
              "Rules imported successfully",
              "success"
            );
          } else {
            this.uiManager.showNotification("Failed to import rules", "error");
          }
        } catch (error) {
          console.error("Import error:", error);
          this.uiManager.showNotification("Error importing rules", "error");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Update preset selector in UI
   */
  updatePresetSelector() {
    const presets = {
      builtin: presetManager.getBuiltInPresets(),
      custom: presetManager.getCustomPresets(),
    };
    this.uiManager.updatePresetSelector(presets);
  }

  /**
   * Log current statistics
   */
  logStats() {
    const physicsStats = this.physicsEngine.getStats();
    const poolStats = this.particlePool.getStats();
    const rulesStats = this.ruleManager.getRulesSummary();

    console.log("📊 CURRENT STATISTICS:");
    console.log("Particles:", this.particles.length);
    console.log("FPS:", this.performance.fps);
    console.log("Physics:", physicsStats);
    console.log("Pool:", poolStats);
    console.log("Rules:", rulesStats);
  }

  /**
   * Download a file with given content
   * @param {string} filename - File name
   * @param {string} content - File content
   */
  downloadFile(filename, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get current game state
   * @returns {Object} - Current game state
   */
  getState() {
    return {
      particles: this.particles.length,
      isPaused: this.isPaused,
      fps: this.performance.fps,
      options: this.particleOptions,
      rules: this.ruleManager.getRules(),
      poolStats: this.particlePool.getStats(),
      physicsStats: this.physicsEngine.getStats(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop game loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clear particles
    this.clearParticles();

    // Cleanup components
    this.uiManager.cleanup();
    this.optionsPanel.cleanup();
    this.rulesPanel.cleanup();

    // Cleanup PixiJS renderer
    if (this.pixiRenderer) {
      this.pixiRenderer.destroy();
    }

    this.isInitialized = false;
    console.log("🧹 Game cleanup complete");
  }

  /**
   * Validate game state
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    if (!this.isInitialized) {
      issues.push("Game not initialized");
    }

    if (!this.canvas) {
      issues.push("Canvas not created");
    }

    if (!this.ctx) {
      issues.push("Canvas context not available");
    }

    // Validate components
    const componentValidations = [
      this.physicsEngine.validate(),
      this.particlePool.validate(),
      this.ruleManager.validateRules(),
      this.uiManager.validate(),
    ];

    componentValidations.forEach((validation, index) => {
      if (!validation.valid) {
        issues.push(
          `Component ${index} validation failed: ${validation.issues.join(
            ", "
          )}`
        );
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      state: this.getState(),
    };
  }
}

// Export singleton instance
export const game = new Game();

// Export class for multiple instances if needed
export default Game;
