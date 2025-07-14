// Quadtree.js - Spatial partitioning data structure for efficient collision detection

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(particle) {
    return (
      particle.x >= this.x &&
      particle.x < this.x + this.width &&
      particle.y >= this.y &&
      particle.y < this.y + this.height
    );
  }

  intersects(range) {
    return !(
      range.x > this.x + this.width ||
      range.x + range.width < this.x ||
      range.y > this.y + this.height ||
      range.y + range.height < this.y
    );
  }
}

class Quadtree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.particles = [];
    this.divided = false;
    this.subdivisions = {
      northeast: null,
      northwest: null,
      southeast: null,
      southwest: null,
    };
  }

  // Insert a particle into the quadtree
  insert(particle) {
    if (!this.boundary.contains(particle)) {
      return false;
    }

    if (this.particles.length < this.capacity) {
      this.particles.push(particle);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.subdivisions.northeast.insert(particle) ||
      this.subdivisions.northwest.insert(particle) ||
      this.subdivisions.southeast.insert(particle) ||
      this.subdivisions.southwest.insert(particle)
    );
  }

  // Subdivide the quadtree into four quadrants
  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    const ne = new Rectangle(x + w, y, w, h);
    const nw = new Rectangle(x, y, w, h);
    const se = new Rectangle(x + w, y + h, w, h);
    const sw = new Rectangle(x, y + h, w, h);

    this.subdivisions.northeast = new Quadtree(ne, this.capacity);
    this.subdivisions.northwest = new Quadtree(nw, this.capacity);
    this.subdivisions.southeast = new Quadtree(se, this.capacity);
    this.subdivisions.southwest = new Quadtree(sw, this.capacity);

    this.divided = true;
  }

  // Query particles within a given range
  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (const particle of this.particles) {
      if (range.contains(particle)) {
        found.push(particle);
      }
    }

    if (this.divided) {
      this.subdivisions.northeast.query(range, found);
      this.subdivisions.northwest.query(range, found);
      this.subdivisions.southeast.query(range, found);
      this.subdivisions.southwest.query(range, found);
    }

    return found;
  }

  // Query particles within a circular range (more efficient for particle interactions)
  queryCircle(x, y, radius, found = []) {
    // First check if the circle intersects with this quadrant's boundary
    const closestX = Math.max(
      this.boundary.x,
      Math.min(x, this.boundary.x + this.boundary.width)
    );
    const closestY = Math.max(
      this.boundary.y,
      Math.min(y, this.boundary.y + this.boundary.height)
    );

    const dx = x - closestX;
    const dy = y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared > radius * radius) {
      return found;
    }

    // Check particles in this quadrant
    for (const particle of this.particles) {
      const particleDx = particle.x - x;
      const particleDy = particle.y - y;
      const particleDistanceSquared =
        particleDx * particleDx + particleDy * particleDy;

      if (particleDistanceSquared <= radius * radius) {
        found.push(particle);
      }
    }

    // Recursively search subdivisions
    if (this.divided) {
      this.subdivisions.northeast.queryCircle(x, y, radius, found);
      this.subdivisions.northwest.queryCircle(x, y, radius, found);
      this.subdivisions.southeast.queryCircle(x, y, radius, found);
      this.subdivisions.southwest.queryCircle(x, y, radius, found);
    }

    return found;
  }

  // Clear all particles from the quadtree
  clear() {
    this.particles = [];
    this.divided = false;
    this.subdivisions = {
      northeast: null,
      northwest: null,
      southeast: null,
      southwest: null,
    };
  }

  // Get the total number of particles in the quadtree
  size() {
    let count = this.particles.length;
    if (this.divided) {
      count += this.subdivisions.northeast.size();
      count += this.subdivisions.northwest.size();
      count += this.subdivisions.southeast.size();
      count += this.subdivisions.southwest.size();
    }
    return count;
  }

  // Get the depth of the quadtree
  depth() {
    if (!this.divided) {
      return 1;
    }
    return (
      1 +
      Math.max(
        this.subdivisions.northeast.depth(),
        this.subdivisions.northwest.depth(),
        this.subdivisions.southeast.depth(),
        this.subdivisions.southwest.depth()
      )
    );
  }

  // Render the quadtree boundaries for debugging
  render(ctx, strokeStyle = "rgba(255,255,255,0.2)", lineWidth = 1) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(
      this.boundary.x,
      this.boundary.y,
      this.boundary.width,
      this.boundary.height
    );

    if (this.divided) {
      this.subdivisions.northeast.render(ctx, strokeStyle, lineWidth);
      this.subdivisions.northwest.render(ctx, strokeStyle, lineWidth);
      this.subdivisions.southeast.render(ctx, strokeStyle, lineWidth);
      this.subdivisions.southwest.render(ctx, strokeStyle, lineWidth);
    }
  }

  // Get all nodes in the quadtree for rendering
  getAllNodes(nodes = []) {
    // Add current node
    nodes.push({
      boundary: this.boundary,
      particles: this.particles,
      depth: this.getDepth(),
    });

    // Recursively add subdivisions
    if (this.divided) {
      this.subdivisions.northeast.getAllNodes(nodes);
      this.subdivisions.northwest.getAllNodes(nodes);
      this.subdivisions.southeast.getAllNodes(nodes);
      this.subdivisions.southwest.getAllNodes(nodes);
    }

    return nodes;
  }

  // Get the depth of this specific node
  getDepth() {
    if (!this.divided) {
      return 0;
    }
    return (
      1 +
      Math.max(
        this.subdivisions.northeast.getDepth(),
        this.subdivisions.northwest.getDepth(),
        this.subdivisions.southeast.getDepth(),
        this.subdivisions.southwest.getDepth()
      )
    );
  }
}

// Export for use in other files
export { Quadtree, Rectangle };
