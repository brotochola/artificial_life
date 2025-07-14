import { CONFIG, PARTICLE_CONFIG } from "../core/Config.js";
import { Quadtree, Rectangle } from "../spatial/Quadtree.js";

/**
 * Physics Engine for particle interactions and force calculations
 * Handles both brute force and optimized quadtree-based physics
 */
export class PhysicsEngine {
  constructor() {
    this.quadtree = null;
    this.particles = [];
    this.rules = {};
    this.options = { ...PARTICLE_CONFIG.defaultOptions };
    this.collisionsThisFrame = 0;
    this.particlesToAdd = [];
    this.particlesToRemove = [];

    // Performance tracking
    this.stats = {
      forceCalculations: 0,
      quadtreeQueries: 0,
      collisionsProcessed: 0,
      averageForceTime: 0,
      lastFrameTime: 0,
    };
  }

  /**
   * Set the particles array reference
   * @param {Array} particles - Array of particles to simulate
   */
  setParticles(particles) {
    this.particles = particles;
  }

  /**
   * Set the rules object reference
   * @param {Object} rules - Rules object for particle interactions
   */
  setRules(rules) {
    this.rules = rules;
  }

  /**
   * Update physics options
   * @param {Object} newOptions - New physics options
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
  }

  /**
   * Main physics update loop
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  update(canvasWidth, canvasHeight) {
    const startTime = performance.now();

    // Store canvas dimensions for quadtree
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Reset collision processing arrays and counter
    this.particlesToAdd = [];
    this.particlesToRemove = [];
    this.collisionsThisFrame = 0;

    // Reset forces for all particles
    this.particles.forEach((particle) => {
      particle.resetForces();
    });

    // Calculate inter-particle forces
    if (this.options.useQuadtree && this.particles.length > 0) {
      this.calculateForcesWithQuadtree();
    } else {
      this.calculateForcesBruteForce();
    }

    // Apply edge repulsion forces
    this.applyEdgeRepulsion(canvasWidth, canvasHeight);

    // Update particle positions
    this.particles.forEach((particle) => {
      particle.update(canvasWidth, canvasHeight);
    });

    // Track performance
    this.stats.lastFrameTime = performance.now() - startTime;
    this.stats.averageForceTime =
      this.stats.averageForceTime * 0.9 + this.stats.lastFrameTime * 0.1;

    // Return collision results for processing
    return {
      particlesToAdd: this.particlesToAdd,
      particlesToRemove: this.particlesToRemove,
      collisionsThisFrame: this.collisionsThisFrame,
    };
  }

  /**
   * Calculate forces using quadtree optimization
   */
  calculateForcesWithQuadtree() {
    if (this.particles.length === 0) return;

    // Create and populate quadtree
    const boundary = new Rectangle(0, 0, this.canvasWidth, this.canvasHeight);
    this.quadtree = new Quadtree(boundary, this.options.quadtreeCapacity);

    // Insert all particles into quadtree
    this.particles.forEach((particle) => {
      this.quadtree.insert(particle);
    });

    // For each particle, query nearby particles within interaction range
    this.particles.forEach((particle) => {
      const nearbyParticles = this.quadtree.queryCircle(
        particle.x,
        particle.y,
        this.options.maxDistance
      );

      this.stats.quadtreeQueries++;

      // Calculate forces with nearby particles only
      nearbyParticles.forEach((otherParticle) => {
        if (particle !== otherParticle) {
          this.calculateParticleInteraction(particle, otherParticle);
        }
      });
    });
  }

  /**
   * Calculate forces using brute force method (fallback)
   */
  calculateForcesBruteForce() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        // Calculate bidirectional forces
        this.calculateParticleInteraction(p1, p2);
        this.calculateParticleInteraction(p2, p1);
      }
    }
  }

  /**
   * Calculate interaction between two particles
   * @param {Particle} particle1 - First particle
   * @param {Particle} particle2 - Second particle
   */
  calculateParticleInteraction(particle1, particle2) {
    // Calculate force from particle2 on particle1
    const force = particle1.calculateForce(particle2, this.rules, this.options);
    particle1.applyForce(force);

    // Check for collision if enabled
    if (this.collisionsThisFrame < CONFIG.MAX_COLLISIONS_PER_FRAME) {
      this.checkCollision(particle1, particle2);
    }

    this.stats.forceCalculations++;
  }

  /**
   * Check for collision between two particles
   * @param {Particle} p1 - First particle
   * @param {Particle} p2 - Second particle
   */
  checkCollision(p1, p2) {
    // Skip if either particle is in collision cooldown
    if (p1.collisionCooldown > 0 || p2.collisionCooldown > 0) {
      return;
    }

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const collisionDistance =
      (p1.size + p2.size) * this.options.collisionDistanceRatio;

    if (distance < collisionDistance) {
      this.processCollision(p1, p2);
    }
  }

  /**
   * Process collision between two particles
   * @param {Particle} p1 - First particle
   * @param {Particle} p2 - Second particle
   */
  processCollision(p1, p2) {
    const rule = this.rules[p1.type] && this.rules[p1.type][p2.type];

    if (!rule) return;

    // Set collision cooldown
    p1.collisionCooldown = CONFIG.COLLISION_COOLDOWN_FRAMES;
    p2.collisionCooldown = CONFIG.COLLISION_COOLDOWN_FRAMES;

    // Mark particles for removal if rule says to destroy them
    if (rule.destroyOriginals) {
      this.particlesToRemove.push(p1, p2);
    }

    // Create new particles if rule specifies
    if (rule.createParticles && rule.createParticles.length > 0) {
      rule.createParticles.forEach((creation) => {
        for (let i = 0; i < creation.count; i++) {
          // Calculate position between the two colliding particles
          const centerX = (p1.x + p2.x) / 2;
          const centerY = (p1.y + p2.y) / 2;

          // Add small random offset to prevent particles from spawning exactly on top of each other
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;

          // Calculate average velocity for new particles
          const avgVx = (p1.vx + p2.vx) / 2;
          const avgVy = (p1.vy + p2.vy) / 2;

          // Add some random velocity component
          const randomVx = (Math.random() - 0.5) * 2;
          const randomVy = (Math.random() - 0.5) * 2;

          this.particlesToAdd.push({
            x: centerX + offsetX,
            y: centerY + offsetY,
            type: creation.type,
            colors: PARTICLE_CONFIG.colors,
            types: PARTICLE_CONFIG.types,
            options: this.options,
            initialVx: avgVx + randomVx,
            initialVy: avgVy + randomVy,
          });
        }
      });
    }

    this.collisionsThisFrame++;
    this.stats.collisionsProcessed++;
  }

  /**
   * Apply edge repulsion forces to all particles
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  applyEdgeRepulsion(canvasWidth, canvasHeight) {
    this.particles.forEach((particle) => {
      const edgeForce = particle.calculateEdgeRepulsion(
        canvasWidth,
        canvasHeight,
        this.options
      );
      particle.applyForce(edgeForce);
    });
  }

  /**
   * Get physics statistics
   * @returns {Object} - Physics statistics
   */
  getStats() {
    if (this.particles.length === 0) return null;

    let totalSpeed = 0;
    let totalAcceleration = 0;
    let maxVelParticles = 0;
    let maxAccelParticles = 0;

    this.particles.forEach((particle) => {
      totalSpeed += particle.getSpeed();
      totalAcceleration += particle.getAcceleration();
      if (particle.isAtMaxVelocity()) maxVelParticles++;
      if (particle.isAtMaxAcceleration()) maxAccelParticles++;
    });

    return {
      avgSpeed: totalSpeed / this.particles.length,
      avgAcceleration: totalAcceleration / this.particles.length,
      particlesAtMaxVelocity: maxVelParticles,
      particlesAtMaxAcceleration: maxAccelParticles,
      maxVelocityLimit: this.particles[0]?.maxVelocity || 0,
      maxAccelerationLimit: this.particles[0]?.maxAcceleration || 0,
      forceCalculations: this.stats.forceCalculations,
      quadtreeQueries: this.stats.quadtreeQueries,
      collisionsProcessed: this.stats.collisionsProcessed,
      averageForceTime: this.stats.averageForceTime,
      lastFrameTime: this.stats.lastFrameTime,
    };
  }

  /**
   * Reset physics statistics
   */
  resetStats() {
    this.stats = {
      forceCalculations: 0,
      quadtreeQueries: 0,
      collisionsProcessed: 0,
      averageForceTime: 0,
      lastFrameTime: 0,
    };
  }

  /**
   * Get quadtree information (for debugging)
   * @returns {Object} - Quadtree info
   */
  getQuadtreeInfo() {
    if (!this.quadtree) {
      return { enabled: false };
    }

    return {
      enabled: true,
      depth: this.quadtree.depth(),
      size: this.quadtree.size(),
      capacity: this.options.quadtreeCapacity,
    };
  }

  /**
   * Render quadtree visualization
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} color - Stroke color
   * @param {number} lineWidth - Line width
   */
  renderQuadtree(ctx, color = "rgba(0, 255, 136, 0.15)", lineWidth = 1) {
    if (this.quadtree) {
      this.quadtree.render(ctx, color, lineWidth);
    }
  }

  /**
   * Get quadtree nodes data for rendering
   * @returns {Object} - Quadtree data with nodes array
   */
  getQuadtreeData() {
    if (!this.quadtree) {
      return { nodes: [] };
    }

    const nodes = [];
    this.quadtree.getAllNodes(nodes);

    return {
      nodes: nodes.map((node) => ({
        x: node.boundary.x,
        y: node.boundary.y,
        width: node.boundary.width,
        height: node.boundary.height,
        depth: node.depth || 0,
        particleCount: node.particles ? node.particles.length : 0,
      })),
    };
  }

  /**
   * Apply physics settings to all particles
   * @param {Array} particles - Array of particles
   * @param {Object} options - Physics options
   */
  applyOptionsToParticles(particles, options) {
    particles.forEach((particle) => {
      particle.setMaxVelocity(options.maxVelocity);
      particle.setMaxAcceleration(options.maxAcceleration);
      particle.friction = options.friction;
      particle.bounceDecay = options.bounceDecay;
      particle.size = options.size;
    });
  }

  /**
   * Validate physics engine state
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    if (!this.particles) {
      issues.push("Particles array not set");
    }

    if (!this.rules) {
      issues.push("Rules object not set");
    }

    if (this.options.maxDistance <= 0) {
      issues.push("Max distance must be positive");
    }

    if (this.options.forceMultiplier < 0) {
      issues.push("Force multiplier must be non-negative");
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      stats: this.getStats(),
    };
  }
}

// Export singleton instance
export const physicsEngine = new PhysicsEngine();

// Export class for multiple instances if needed
export default PhysicsEngine;
