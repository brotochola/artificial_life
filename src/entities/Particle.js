// Particle.js - Object-oriented particle class for the artificial life simulation

// Global counter for unique particle IDs
let nextParticleId = 1;

class Particle {
  constructor(x, y, type, colors, types, options = {}) {
    this.id = nextParticleId++;
    this.x = x;
    this.y = y;
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.fx = 0; // force x
    this.fy = 0; // force y
    this.type = type;
    this.size = options.size || 2;
    this.options = options;

    // Store references for rendering
    this.colors = colors;
    this.types = types;

    // Physics constants (can be overridden by options)
    this.friction = options.friction || 0.9;
    this.bounceDecay = options.bounceDecay || 0.8;
    this.maxAcceleration = options.maxAcceleration || 0.5; // Maximum acceleration per frame
    this.maxVelocity = options.maxVelocity || 8.0; // Maximum velocity magnitude

    // Collision cooldown to prevent immediate re-collisions
    this.collisionCooldown = 0;
  }

  // Calculate forces from other particles
  calculateForce(otherParticle, rules, options = {}) {
    this.rules = rules;

    const dx = otherParticle.x - this.x;
    const dy = otherParticle.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use options or defaults
    const maxDistance = options.maxDistance || 80;
    const forceMultiplier = options.forceMultiplier || 0.1;

    if (distance === 0 || distance > maxDistance) {
      return { fx: 0, fy: 0 };
    }

    const rule = rules[this.type][otherParticle.type] || {
      closeForce: 0,
      farForce: 0,
      threshold: 30,
    };

    // Normalize direction
    const nx = dx / distance;
    const ny = dy / distance;

    // Apply distance-based force falloff
    const falloff = 1 - distance / maxDistance;

    // Determine which force to use based on threshold
    const force = distance < rule.threshold ? rule.closeForce : rule.farForce;

    // Collision repulsion (always repulsive at very close range)
    // Use sum of both particle radii multiplied by ratio for adjustable collision detection
    const collisionDistanceRatio = options.collisionDistanceRatio || 1.0;
    const collisionDistance =
      (this.size + otherParticle.size) * collisionDistanceRatio;
    let collisionForce = 0;
    if (distance < collisionDistance) {
      this.onCollision(otherParticle, options);
      collisionForce = -3 * (1 - distance / collisionDistance);
    }

    // Calculate final force
    const finalForce = (force * falloff + collisionForce) * forceMultiplier;
    this.prevRules = rules;
    return {
      fx: finalForce * nx,
      fy: finalForce * ny,
    };
  }
  onCollision(otherParticle, options) {
    // Check collision cooldown to prevent immediate re-collisions
    if (this.collisionCooldown > 0 || otherParticle.collisionCooldown > 0) {
      return;
    }

    // Check collision limits
    if (
      typeof collisionsThisFrame !== "undefined" &&
      collisionsThisFrame >=
        (typeof MAX_COLLISIONS_PER_FRAME !== "undefined"
          ? MAX_COLLISIONS_PER_FRAME
          : 50)
    ) {
      return;
    }

    // Check total particle limit
    if (
      typeof particles !== "undefined" &&
      typeof MAX_TOTAL_PARTICLES !== "undefined" &&
      particles.length >= MAX_TOTAL_PARTICLES
    ) {
      return;
    }

    // Check if collision rules exist in global scope
    if (
      typeof rules === "undefined" ||
      !rules[this.type] ||
      !rules[this.type][otherParticle.type]
    ) {
      return; // No collision rules defined
    }

    const rule = rules[this.type][otherParticle.type];

    // Only process collision if there's actual behavior defined
    if (!rule.destroyOriginals && rule.createParticles.length === 0) {
      return; // No-op collision
    }

    // Increment collision counter
    if (typeof collisionsThisFrame !== "undefined") {
      collisionsThisFrame++;
    }

    // Set collision cooldown for both particles
    this.collisionCooldown = 30; // 30 frames = ~0.5 seconds at 60fps
    otherParticle.collisionCooldown = 30;

    // Mark particles for destruction if required
    if (rule.destroyOriginals) {
      if (typeof particlesToRemove !== "undefined") {
        particlesToRemove.push(this, otherParticle);
      }
    }

    // Create new particles at collision point
    rule.createParticles.forEach((creation) => {
      for (let i = 0; i < creation.count; i++) {
        if (typeof particlesToAdd !== "undefined") {
          // Calculate collision momentum and direction
          const collisionCenterX = (this.x + otherParticle.x) / 2;
          const collisionCenterY = (this.y + otherParticle.y) / 2;

          // Calculate average velocity of colliding particles for momentum transfer
          const avgVx = (this.vx + otherParticle.vx) / 2;
          const avgVy = (this.vy + otherParticle.vy) / 2;

          // Add some randomness to the velocity direction and magnitude
          const velocityMagnitude = Math.sqrt(avgVx * avgVx + avgVy * avgVy);
          const baseSpeed = Math.max(1, velocityMagnitude * 0.7); // 70% of average collision speed
          const randomSpeed =
            baseSpeed + (Math.random() - 0.5) * baseSpeed * 0.5; // ±25% variation

          // Random direction with bias towards collision momentum
          const momentumAngle = Math.atan2(avgVy, avgVx);
          const randomAngle =
            momentumAngle + (Math.random() - 0.5) * Math.PI * 0.8; // ±72° variation

          // Calculate initial velocity components
          const initialVx = Math.cos(randomAngle) * randomSpeed * 0.01;
          const initialVy = Math.sin(randomAngle) * randomSpeed * 0.01;

          // Position new particles at collision center (no offset needed with velocity)
          const x = collisionCenterX;
          const y = collisionCenterY;

          particlesToAdd.push({
            x: x,
            y: y,
            type: creation.type,
            colors: this.colors,
            types: this.types,
            options: this.options,
            // Include initial velocity in the particle data
            initialVx: initialVx,
            initialVy: initialVy,
          });
        }
      }
    });
  }

  // Reset forces to zero
  resetForces() {
    this.fx = 0;
    this.fy = 0;
  }

  // Apply force from another particle
  applyForce(force) {
    this.fx += force.fx;
    this.fy += force.fy;
  }

  // Calculate repulsion force from canvas edges
  calculateEdgeRepulsion(canvasWidth, canvasHeight, options = {}) {
    const minDistance = options.minDistanceToEdges || 50;
    const repulsionForce = options.edgeRepulsionForce || 0.3;

    let fx = 0;
    let fy = 0;

    // Distance to each edge
    const distToLeft = this.x;
    const distToRight = canvasWidth - this.x;
    const distToTop = this.y;
    const distToBottom = canvasHeight - this.y;

    // Apply repulsion from left edge
    if (distToLeft < minDistance) {
      const force = repulsionForce * (1 - distToLeft / minDistance);
      fx += force;
    }

    // Apply repulsion from right edge
    if (distToRight < minDistance) {
      const force = repulsionForce * (1 - distToRight / minDistance);
      fx -= force;
    }

    // Apply repulsion from top edge
    if (distToTop < minDistance) {
      const force = repulsionForce * (1 - distToTop / minDistance);
      fy += force;
    }

    // Apply repulsion from bottom edge
    if (distToBottom < minDistance) {
      const force = repulsionForce * (1 - distToBottom / minDistance);
      fy -= force;
    }

    return { fx, fy };
  }

  // Clamp acceleration to maximum values
  clampAcceleration() {
    const accelerationMagnitude = Math.sqrt(
      this.fx * this.fx + this.fy * this.fy
    );

    if (accelerationMagnitude > this.maxAcceleration) {
      const scale = this.maxAcceleration / accelerationMagnitude;
      this.fx *= scale;
      this.fy *= scale;
    }
  }

  // Clamp velocity to maximum values
  clampVelocity() {
    const velocityMagnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    if (velocityMagnitude > this.maxVelocity) {
      const scale = this.maxVelocity / velocityMagnitude;
      this.vx *= scale;
      this.vy *= scale;
    }
  }

  // Update particle physics
  update(canvasWidth, canvasHeight) {
    // Update collision cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }

    // Clamp acceleration to prevent runaway forces
    if (this.options.enableAccelerationClamp) {
      this.clampAcceleration();
    }

    // Update velocity with forces
    this.vx += this.fx;
    this.vy += this.fy;

    // Clamp velocity to prevent excessive speeds
    if (this.options.enableVelocityClamp) {
      this.clampVelocity();
    }

    // Apply friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }

  // Render the particle
  render(ctx) {
    const colorIndex = this.types.indexOf(this.type);
    const color = this.colors[colorIndex];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Get particle's velocity magnitude (for debugging/effects)
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  // Get particle's acceleration magnitude
  getAcceleration() {
    return Math.sqrt(this.fx * this.fx + this.fy * this.fy);
  }

  // Check if particle is at maximum velocity
  isAtMaxVelocity() {
    return this.getSpeed() >= this.maxVelocity * 0.95; // 95% threshold
  }

  // Check if particle is at maximum acceleration
  isAtMaxAcceleration() {
    return this.getAcceleration() >= this.maxAcceleration * 0.95; // 95% threshold
  }

  // Get distance to another particle
  distanceTo(otherParticle) {
    const dx = this.x - otherParticle.x;
    const dy = this.y - otherParticle.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if particle is near canvas edge
  isNearEdge(canvasWidth, canvasHeight, margin = 50) {
    return (
      this.x < margin ||
      this.x > canvasWidth - margin ||
      this.y < margin ||
      this.y > canvasHeight - margin
    );
  }

  // Create a copy of this particle
  clone() {
    const newParticle = new Particle(
      this.x,
      this.y,
      this.type,
      this.colors,
      this.types
    );
    newParticle.vx = this.vx;
    newParticle.vy = this.vy;
    newParticle.size = this.size;
    return newParticle;
  }

  // Set particle position
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Add velocity to particle
  addVelocity(vx, vy) {
    this.vx += vx;
    this.vy += vy;
  }

  // Set particle type and update visual properties
  setType(newType) {
    if (this.types.includes(newType)) {
      this.type = newType;
    }
  }

  // Dynamically adjust physics limits
  setMaxVelocity(newMaxVelocity) {
    this.maxVelocity = Math.max(0.1, newMaxVelocity);
  }

  setMaxAcceleration(newMaxAcceleration) {
    this.maxAcceleration = Math.max(0.01, newMaxAcceleration);
  }

  // Get physics info as an object
  getPhysicsInfo() {
    return {
      id: this.id,
      type: this.type,
      position: { x: this.x, y: this.y },
      velocity: { x: this.vx, y: this.vy },
      force: { x: this.fx, y: this.fy },
      speed: this.getSpeed(),
      acceleration: this.getAcceleration(),
      isAtMaxVelocity: this.isAtMaxVelocity(),
      isAtMaxAcceleration: this.isAtMaxAcceleration(),
      collisionCooldown: this.collisionCooldown,
    };
  }

  // Reset particle properties for reuse in object pooling
  reset(x, y, type, colors, types, options = {}) {
    // Keep the same ID when recycling particles for performance
    // this.id stays the same
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.fx = 0;
    this.fy = 0;
    this.type = type;
    this.size = options.size || 2;
    this.options = options;

    // Store references for rendering
    this.colors = colors;
    this.types = types;

    // Reset physics properties
    this.friction = options.friction || 0.9;
    this.bounceDecay = options.bounceDecay || 0.8;
    this.maxAcceleration = options.maxAcceleration || 0.5;
    this.maxVelocity = options.maxVelocity || 8.0;

    // Reset collision cooldown
    this.collisionCooldown = 0;
  }
}

// Export for use in other files
export { Particle };
