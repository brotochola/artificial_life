import { CONFIG, PARTICLE_CONFIG } from "../core/Config.js";

/**
 * Pattern Generator for creating interesting particle arrangements
 * Generates various spatial patterns for particles on initialization
 */
export class PatternGenerator {
  constructor() {
    this.patterns = new Map();
    this.registerDefaultPatterns();
  }

  /**
   * Register all default patterns
   */
  registerDefaultPatterns() {
    this.registerPattern("random", this.createRandomPattern);
    this.registerPattern("spiral", this.createSpiralPattern);
    this.registerPattern("corners", this.createCornersPattern);
    this.registerPattern("grid", this.createGridPattern);
    this.registerPattern("concentric", this.createConcentricPattern);
    this.registerPattern("wave", this.createWavePattern);
    this.registerPattern("clusters", this.createClustersPattern);
    this.registerPattern("line", this.createLinePattern);
    this.registerPattern("cross", this.createCrossPattern);
    this.registerPattern("explosion", this.createExplosionPattern);

    console.log(
      `🎨 PatternGenerator initialized with ${this.patterns.size} patterns`
    );
  }

  /**
   * Register a new pattern
   * @param {string} name - Pattern name
   * @param {Function} generator - Pattern generator function
   */
  registerPattern(name, generator) {
    this.patterns.set(name, generator.bind(this));
  }

  /**
   * Generate particles using a specific pattern
   * @param {string} patternName - Name of pattern to use
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of generated particles
   */
  generatePattern(patternName, canvasWidth, canvasHeight, particleFactory) {
    const pattern = this.patterns.get(patternName);
    if (!pattern) {
      console.warn(`Pattern "${patternName}" not found, using random`);
      return this.generatePattern(
        "random",
        canvasWidth,
        canvasHeight,
        particleFactory
      );
    }

    const particles = pattern(canvasWidth, canvasHeight, particleFactory);
    console.log(
      `🎨 Generated ${particles.length} particles using "${patternName}" pattern`
    );
    return particles;
  }

  /**
   * Get list of available patterns
   * @returns {Array} - Array of pattern names
   */
  getAvailablePatterns() {
    return Array.from(this.patterns.keys());
  }

  /**
   * Generate random pattern (default)
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createRandomPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 20;

    PARTICLE_CONFIG.types.forEach((typeId) => {
      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const x = margin + Math.random() * (canvasWidth - 2 * margin);
        const y = margin + Math.random() * (canvasHeight - 2 * margin);
        particles.push(particleFactory(x, y, typeId));
      }
    });

    return particles;
  }

  /**
   * Generate spiral pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createSpiralPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    PARTICLE_CONFIG.types.forEach((typeId, typeIndex) => {
      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const progress = i / CONFIG.PARTICLE_COUNT_PER_TYPE;
        const angle = progress * Math.PI * 6 + (typeIndex * Math.PI) / 2; // 3 full rotations per type
        const radius =
          30 + progress * Math.min(canvasWidth, canvasHeight) * 0.3;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Ensure particle is within bounds
        if (x > 0 && x < canvasWidth && y > 0 && y < canvasHeight) {
          particles.push(particleFactory(x, y, typeId));
        }
      }
    });

    return particles;
  }

  /**
   * Generate corners pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createCornersPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 50;
    const cornerSize = 100;

    const corners = [
      [margin, margin], // Top-left
      [canvasWidth - margin, margin], // Top-right
      [margin, canvasHeight - margin], // Bottom-left
      [canvasWidth - margin, canvasHeight - margin], // Bottom-right
    ];

    PARTICLE_CONFIG.types.forEach((typeId, typeIndex) => {
      const corner = corners[typeIndex % corners.length];

      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const x = corner[0] + (Math.random() - 0.5) * cornerSize;
        const y = corner[1] + (Math.random() - 0.5) * cornerSize;

        // Clamp to canvas bounds
        const clampedX = Math.max(20, Math.min(canvasWidth - 20, x));
        const clampedY = Math.max(20, Math.min(canvasHeight - 20, y));

        particles.push(particleFactory(clampedX, clampedY, typeId));
      }
    });

    return particles;
  }

  /**
   * Generate grid pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createGridPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 30;
    const usableWidth = canvasWidth - 2 * margin;
    const usableHeight = canvasHeight - 2 * margin;

    const totalParticles =
      PARTICLE_CONFIG.types.length * CONFIG.PARTICLE_COUNT_PER_TYPE;
    const cols = Math.ceil(
      Math.sqrt(totalParticles * (usableWidth / usableHeight))
    );
    const rows = Math.ceil(totalParticles / cols);

    const cellWidth = usableWidth / cols;
    const cellHeight = usableHeight / rows;

    let particleIndex = 0;

    PARTICLE_CONFIG.types.forEach((typeId) => {
      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const col = particleIndex % cols;
        const row = Math.floor(particleIndex / cols);

        const x =
          margin +
          col * cellWidth +
          cellWidth / 2 +
          (Math.random() - 0.5) * cellWidth * 0.5;
        const y =
          margin +
          row * cellHeight +
          cellHeight / 2 +
          (Math.random() - 0.5) * cellHeight * 0.5;

        particles.push(particleFactory(x, y, typeId));
        particleIndex++;
      }
    });

    return particles;
  }

  /**
   * Generate concentric circles pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createConcentricPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4;

    PARTICLE_CONFIG.types.forEach((typeId, typeIndex) => {
      const radius =
        (typeIndex + 1) * (maxRadius / PARTICLE_CONFIG.types.length);
      const circumference = 2 * Math.PI * radius;
      const particlesOnCircle = Math.max(1, Math.floor(circumference / 20)); // Space particles ~20 units apart

      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const angle = (i / particlesOnCircle) * Math.PI * 2;
        const radiusVariation = radius + (Math.random() - 0.5) * 20;

        const x = centerX + Math.cos(angle) * radiusVariation;
        const y = centerY + Math.sin(angle) * radiusVariation;

        if (x > 20 && x < canvasWidth - 20 && y > 20 && y < canvasHeight - 20) {
          particles.push(particleFactory(x, y, typeId));
        }
      }
    });

    return particles;
  }

  /**
   * Generate wave pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createWavePattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 30;
    const usableWidth = canvasWidth - 2 * margin;

    PARTICLE_CONFIG.types.forEach((type, typeIndex) => {
      const waveOffset = (typeIndex * Math.PI) / 2;
      const baseY =
        canvasHeight / 2 + typeIndex * 30 - PARTICLE_CONFIG.types.length * 15;

      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const progress = i / CONFIG.PARTICLE_COUNT_PER_TYPE;
        const x = margin + progress * usableWidth;
        const waveY = Math.sin(progress * Math.PI * 4 + waveOffset) * 50;
        const y = baseY + waveY + (Math.random() - 0.5) * 20;

        const clampedY = Math.max(20, Math.min(canvasHeight - 20, y));
        particles.push(particleFactory(x, clampedY, type));
      }
    });

    return particles;
  }

  /**
   * Generate clusters pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createClustersPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 60;
    const clustersPerType = 3;
    const clusterRadius = 40;

    PARTICLE_CONFIG.types.forEach((type) => {
      for (let cluster = 0; cluster < clustersPerType; cluster++) {
        // Random cluster center
        const centerX = margin + Math.random() * (canvasWidth - 2 * margin);
        const centerY = margin + Math.random() * (canvasHeight - 2 * margin);

        const particlesPerCluster = Math.floor(
          CONFIG.PARTICLE_COUNT_PER_TYPE / clustersPerType
        );

        for (let i = 0; i < particlesPerCluster; i++) {
          // Generate particle within cluster using normal distribution approximation
          const angle = Math.random() * Math.PI * 2;
          const distance =
            ((Math.random() + Math.random() + Math.random()) / 3) *
            clusterRadius;

          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;

          const clampedX = Math.max(20, Math.min(canvasWidth - 20, x));
          const clampedY = Math.max(20, Math.min(canvasHeight - 20, y));

          particles.push(particleFactory(clampedX, clampedY, type));
        }
      }
    });

    return particles;
  }

  /**
   * Generate line pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createLinePattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const margin = 50;

    PARTICLE_CONFIG.types.forEach((type, typeIndex) => {
      const lineY =
        margin +
        (typeIndex / (PARTICLE_CONFIG.types.length - 1)) *
          (canvasHeight - 2 * margin);

      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const x =
          margin +
          (i / (CONFIG.PARTICLE_COUNT_PER_TYPE - 1)) *
            (canvasWidth - 2 * margin);
        const y = lineY + (Math.random() - 0.5) * 30; // Add some vertical spread

        particles.push(particleFactory(x, y, type));
      }
    });

    return particles;
  }

  /**
   * Generate cross pattern
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createCrossPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const armLength = Math.min(canvasWidth, canvasHeight) * 0.3;

    PARTICLE_CONFIG.types.forEach((type, typeIndex) => {
      const angle = (typeIndex / PARTICLE_CONFIG.types.length) * Math.PI * 2;
      const armDir = { x: Math.cos(angle), y: Math.sin(angle) };

      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const progress = i / CONFIG.PARTICLE_COUNT_PER_TYPE;
        const distance = progress * armLength;

        const x = centerX + armDir.x * distance + (Math.random() - 0.5) * 30;
        const y = centerY + armDir.y * distance + (Math.random() - 0.5) * 30;

        const clampedX = Math.max(20, Math.min(canvasWidth - 20, x));
        const clampedY = Math.max(20, Math.min(canvasHeight - 20, y));

        particles.push(particleFactory(clampedX, clampedY, type));
      }
    });

    return particles;
  }

  /**
   * Generate explosion pattern (particles moving outward from center)
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createExplosionPattern(canvasWidth, canvasHeight, particleFactory) {
    const particles = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.2;

    PARTICLE_CONFIG.types.forEach((type) => {
      for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const particle = particleFactory(x, y, type);

        // Give particles initial velocity away from center
        const speed = 1 + Math.random() * 3;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        particles.push(particle);
      }
    });

    return particles;
  }

  /**
   * Generate random pattern selection
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  generateRandomPattern(canvasWidth, canvasHeight, particleFactory) {
    const patterns = this.getAvailablePatterns().filter(
      (name) => name !== "random"
    );
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return this.generatePattern(
      randomPattern,
      canvasWidth,
      canvasHeight,
      particleFactory
    );
  }

  /**
   * Get pattern info
   * @param {string} patternName - Pattern name
   * @returns {Object} - Pattern information
   */
  getPatternInfo(patternName) {
    const descriptions = {
      random: "Particles randomly distributed across the canvas",
      spiral: "Particles arranged in spiral patterns, different for each type",
      corners: "Each particle type clustered in a different corner",
      grid: "Particles arranged in a regular grid pattern",
      concentric: "Particles arranged in concentric circles by type",
      wave: "Particles arranged in wave patterns",
      clusters: "Multiple clusters of each particle type",
      line: "Particles arranged in horizontal lines by type",
      cross: "Particles arranged in cross/star pattern radiating from center",
      explosion: "Particles start near center with outward velocity",
    };

    return {
      name: patternName,
      description: descriptions[patternName] || "Unknown pattern",
      exists: this.patterns.has(patternName),
    };
  }

  /**
   * Create custom pattern from configuration
   * @param {Object} config - Pattern configuration
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Function} particleFactory - Function to create particles
   * @returns {Array} - Array of particles
   */
  createCustomPattern(config, canvasWidth, canvasHeight, particleFactory) {
    const particles = [];

    // Support for custom point arrays
    if (config.points && Array.isArray(config.points)) {
      config.points.forEach((point) => {
        const x = point.x * canvasWidth;
        const y = point.y * canvasHeight;
        const type = point.type || PARTICLE_CONFIG.types[0];
        particles.push(particleFactory(x, y, type));
      });
    }

    // Support for mathematical functions
    if (config.function && typeof config.function === "function") {
      PARTICLE_CONFIG.types.forEach((type) => {
        for (let i = 0; i < CONFIG.PARTICLE_COUNT_PER_TYPE; i++) {
          const progress = i / CONFIG.PARTICLE_COUNT_PER_TYPE;
          const coords = config.function(progress, canvasWidth, canvasHeight);
          if (coords && coords.x !== undefined && coords.y !== undefined) {
            particles.push(particleFactory(coords.x, coords.y, type));
          }
        }
      });
    }

    return particles;
  }

  /**
   * Validate pattern generator
   * @returns {Object} - Validation results
   */
  validate() {
    const issues = [];

    if (this.patterns.size === 0) {
      issues.push("No patterns registered");
    }

    // Test each pattern with dummy parameters
    const dummyFactory = (x, y, type) => ({ x, y, type });

    this.patterns.forEach((pattern, name) => {
      try {
        const result = pattern(800, 600, dummyFactory);
        if (!Array.isArray(result)) {
          issues.push(`Pattern "${name}" does not return an array`);
        }
      } catch (error) {
        issues.push(`Pattern "${name}" throws error: ${error.message}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      patternCount: this.patterns.size,
      availablePatterns: this.getAvailablePatterns(),
    };
  }
}

// Export singleton instance
export const patternGenerator = new PatternGenerator();

// Export class for multiple instances if needed
export default PatternGenerator;
