import { CONFIG, PARTICLE_CONFIG } from "../core/Config.js";

/**
 * Particle Pool Manager for efficient particle creation and recycling
 * Uses object pooling to reduce garbage collection and improve performance
 */
export class ParticlePool {
  constructor(Particle) {
    this.Particle = Particle;
    this.pool = [];
    this.poolSize = 0;
    this.maxPoolSize = CONFIG.MAX_TOTAL_PARTICLES + CONFIG.MIN_POOL_SIZE;
    this.initialized = false;

    // Statistics
    this.stats = {
      totalCreated: 0,
      totalRecycled: 0,
      peakUsage: 0,
      currentActive: 0,
    };
  }

  /**
   * Initialize the particle pool with pre-allocated particles
   * @param {number} initialSize - Initial pool size
   */
  initialize(initialSize = null) {
    if (this.initialized) {
      console.warn("ParticlePool already initialized");
      return;
    }

    const totalParticles =
      PARTICLE_CONFIG.types.length * CONFIG.PARTICLE_COUNT_PER_TYPE;
    const poolBuffer = Math.max(CONFIG.MIN_POOL_SIZE, totalParticles);
    this.poolSize = initialSize || totalParticles + poolBuffer;
    this.pool = [];

    // Pre-allocate all particles in the pool
    for (let i = 0; i < this.poolSize; i++) {
      const particle = new this.Particle(
        0,
        0,
        PARTICLE_CONFIG.types[0],
        PARTICLE_CONFIG.colors,
        PARTICLE_CONFIG.types,
        PARTICLE_CONFIG.defaultOptions
      );
      this.pool.push(particle);
    }

    this.initialized = true;
    console.log(`🏊 Particle pool initialized with ${this.poolSize} particles`);
  }

  /**
   * Get a particle from the pool
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} type - Particle type
   * @param {Array} colors - Color array
   * @param {Array} types - Types array
   * @param {Object} options - Particle options
   * @returns {Particle} - A recycled or new particle
   */
  getParticle(x, y, type, colors, types, options) {
    if (!this.initialized) {
      console.warn("ParticlePool not initialized, creating new particle");
      return new this.Particle(x, y, type, colors, types, options);
    }

    let particle;

    if (this.pool.length === 0) {
      // Pool is empty, create new particle
      console.warn("⚠️ Particle pool is empty! Creating new particle.");
      particle = new this.Particle(x, y, type, colors, types, options);
      this.stats.totalCreated++;
    } else {
      // Get particle from pool and reset it
      particle = this.pool.pop();
      particle.reset(x, y, type, colors, types, options);
      this.stats.totalRecycled++;
    }

    this.stats.currentActive++;
    this.stats.peakUsage = Math.max(
      this.stats.peakUsage,
      this.stats.currentActive
    );

    return particle;
  }

  /**
   * Return a particle to the pool
   * @param {Particle} particle - Particle to return
   */
  returnParticle(particle) {
    if (!this.initialized) {
      console.warn("ParticlePool not initialized");
      return;
    }

    if (this.pool.length >= this.maxPoolSize) {
      // Pool is full, just discard the particle
      console.warn("⚠️ Particle pool is full, discarding particle");
      return;
    }

    // Reset particle state before returning to pool
    particle.reset(
      0,
      0,
      PARTICLE_CONFIG.types[0],
      PARTICLE_CONFIG.colors,
      PARTICLE_CONFIG.types,
      PARTICLE_CONFIG.defaultOptions
    );
    this.pool.push(particle);
    this.stats.currentActive--;
  }

  /**
   * Return multiple particles to the pool
   * @param {Array} particles - Array of particles to return
   */
  returnParticles(particles) {
    particles.forEach((particle) => this.returnParticle(particle));
  }

  /**
   * Get pool statistics
   * @returns {Object} - Pool statistics
   */
  getStats() {
    return {
      total: this.poolSize,
      active: this.stats.currentActive,
      available: this.pool.length,
      efficiency:
        this.poolSize > 0
          ? ((this.stats.currentActive / this.poolSize) * 100).toFixed(1) + "%"
          : "0%",
      totalCreated: this.stats.totalCreated,
      totalRecycled: this.stats.totalRecycled,
      peakUsage: this.stats.peakUsage,
      poolUtilization:
        this.poolSize > 0
          ? ((this.stats.peakUsage / this.poolSize) * 100).toFixed(1) + "%"
          : "0%",
    };
  }

  /**
   * Clear all particles from the pool
   */
  clear() {
    this.pool = [];
    this.stats.currentActive = 0;
    console.log("🧹 Particle pool cleared");
  }

  /**
   * Resize the pool
   * @param {number} newSize - New pool size
   */
  resize(newSize) {
    if (newSize < this.stats.currentActive) {
      console.warn("Cannot resize pool smaller than current active particles");
      return;
    }

    if (newSize > this.poolSize) {
      // Expand pool
      const additionalParticles = newSize - this.poolSize;
      for (let i = 0; i < additionalParticles; i++) {
        const particle = new this.Particle(
          0,
          0,
          PARTICLE_CONFIG.types[0],
          PARTICLE_CONFIG.colors,
          PARTICLE_CONFIG.types,
          PARTICLE_CONFIG.defaultOptions
        );
        this.pool.push(particle);
      }
      console.log(`🔄 Pool expanded by ${additionalParticles} particles`);
    } else if (newSize < this.poolSize) {
      // Shrink pool
      const particlesToRemove = this.poolSize - newSize;
      const removedCount = Math.min(particlesToRemove, this.pool.length);
      this.pool.splice(0, removedCount);
      console.log(`🔄 Pool reduced by ${removedCount} particles`);
    }

    this.poolSize = newSize;
    this.maxPoolSize = Math.max(this.poolSize, CONFIG.MAX_TOTAL_PARTICLES);
  }

  /**
   * Get detailed pool information for debugging
   * @returns {Object} - Detailed pool info
   */
  getDetailedInfo() {
    return {
      initialized: this.initialized,
      poolSize: this.poolSize,
      maxPoolSize: this.maxPoolSize,
      currentPoolLength: this.pool.length,
      stats: this.getStats(),
      memoryEstimate: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage of the pool
   * @returns {Object} - Memory usage estimate
   */
  estimateMemoryUsage() {
    // Rough estimate: each particle is approximately 200 bytes
    const bytesPerParticle = 200;
    const totalBytes = this.poolSize * bytesPerParticle;

    return {
      totalBytes: totalBytes,
      totalKB: (totalBytes / 1024).toFixed(2),
      totalMB: (totalBytes / 1024 / 1024).toFixed(2),
      activeBytes: this.stats.currentActive * bytesPerParticle,
      poolBytes: this.pool.length * bytesPerParticle,
    };
  }

  /**
   * Optimize pool size based on usage patterns
   */
  optimize() {
    const stats = this.getStats();
    const currentUtilization = this.stats.peakUsage / this.poolSize;

    if (currentUtilization > 0.9) {
      // High utilization, expand pool
      const newSize = Math.floor(this.poolSize * 1.2);
      this.resize(Math.min(newSize, this.maxPoolSize));
      console.log(`🔧 Pool optimized: expanded to ${this.poolSize} particles`);
    } else if (
      currentUtilization < 0.5 &&
      this.poolSize > CONFIG.MIN_POOL_SIZE
    ) {
      // Low utilization, shrink pool
      const newSize = Math.max(
        Math.floor(this.poolSize * 0.8),
        CONFIG.MIN_POOL_SIZE,
        this.stats.peakUsage * 1.2 // Keep some buffer
      );
      this.resize(newSize);
      console.log(`🔧 Pool optimized: reduced to ${this.poolSize} particles`);
    }
  }

  /**
   * Reset pool statistics
   */
  resetStats() {
    this.stats = {
      totalCreated: 0,
      totalRecycled: 0,
      peakUsage: this.stats.currentActive,
      currentActive: this.stats.currentActive,
    };
    console.log("📊 Pool statistics reset");
  }

  /**
   * Validate pool integrity
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    if (!this.initialized) {
      issues.push("Pool not initialized");
    }

    if (this.pool.length + this.stats.currentActive > this.poolSize) {
      issues.push("Pool length + active particles exceeds pool size");
    }

    if (this.stats.currentActive < 0) {
      issues.push("Negative active particle count");
    }

    // Check for duplicate particles in pool
    const particleSet = new Set();
    for (const particle of this.pool) {
      if (particleSet.has(particle)) {
        issues.push("Duplicate particle found in pool");
        break;
      }
      particleSet.add(particle);
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      stats: this.getStats(),
    };
  }
}

// Export singleton instance creator
export function createParticlePool(Particle) {
  return new ParticlePool(Particle);
}

// Export for testing
export { ParticlePool as default };
