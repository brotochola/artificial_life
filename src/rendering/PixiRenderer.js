/**
 * Simple WebGL GPU renderer for particle life simulation
 * Uses WebGL for GPU-accelerated rendering of thousands of particles
 */
export class PixiRenderer {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Shader program and locations
    this.program = null;
    this.locations = {};

    // Buffers
    this.positionBuffer = null;
    this.colorBuffer = null;
    this.sizeBuffer = null;

    // Vertex data
    this.maxParticles = 10000;
    this.positions = new Float32Array(this.maxParticles * 2);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    // Stats
    this.renderStats = {
      particlesRendered: 0,
      lastFrameTime: 0,
      averageFrameTime: 0,
    };
  }

  /**
   * Initialize WebGL renderer
   * @param {HTMLElement} container - Container to mount the canvas
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  async initialize(container, width, height) {
    if (this.initialized) {
      console.warn("Renderer already initialized");
      return;
    }

    try {
      // Create canvas
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = width;
      this.height = height;

      // Get WebGL context
      this.gl =
        this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
      if (!this.gl) {
        throw new Error("WebGL not supported");
      }

      // Add canvas to container
      container.appendChild(this.canvas);

      // Setup WebGL
      this.setupWebGL();
      this.createShaders();
      this.createBuffers();

      this.initialized = true;
      console.log("🎨 WebGL renderer initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize WebGL renderer:", error);
      throw error;
    }
  }

  /**
   * Setup WebGL state
   */
  setupWebGL() {
    const gl = this.gl;

    // Set viewport
    gl.viewport(0, 0, this.width, this.height);

    // Enable additive blending for metaballs effect
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);

    // Clear color
    gl.clearColor(0, 0, 0, 0.9);
  }

  /**
   * Create and compile shaders
   */
  createShaders() {
    const gl = this.gl;

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_size;
      
      uniform vec2 u_resolution;
      
      varying vec3 v_color;
      varying float v_size;
      
      void main() {
        // Convert from pixels to clip space
        vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
        
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size;
        
        v_color = a_color;
        v_size = a_size ;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 v_color;
      varying float v_size;
      
      
      void main() {
        // Create metaballs effect
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        // Smooth falloff for metaballs - no hard cutoff
        float falloff = 330000.0; 
        float alpha = 1.0 / (1.0 + dist * dist *dist* falloff);
        
        // Create clean circular edges
        // float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        
        gl_FragColor = vec4(v_color, alpha);
      }
    `;

    // Compile shaders
    const vertexShader = this.compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    // Create program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        "Could not link shader program: " + gl.getProgramInfoLog(this.program)
      );
    }

    // Get attribute and uniform locations
    this.locations = {
      position: gl.getAttribLocation(this.program, "a_position"),
      color: gl.getAttribLocation(this.program, "a_color"),
      size: gl.getAttribLocation(this.program, "a_size"),
      resolution: gl.getUniformLocation(this.program, "u_resolution"),
    };
  }

  /**
   * Compile a shader
   * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
   * @param {string} source - Shader source code
   * @returns {WebGLShader} - Compiled shader
   */
  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("Could not compile shader: " + error);
    }

    return shader;
  }

  /**
   * Create WebGL buffers
   */
  createBuffers() {
    const gl = this.gl;

    // Position buffer
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);

    // Color buffer
    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);

    // Size buffer
    this.sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.sizes, gl.DYNAMIC_DRAW);
  }

  /**
   * Update renderer size
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    if (!this.canvas) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    if (this.gl) {
      this.gl.viewport(0, 0, width, height);
    }
  }

  /**
   * Render all particles
   * @param {Array} particles - Array of particle objects
   * @param {Object} options - Rendering options
   */
  render(particles, options = {}) {
    if (!this.initialized || !this.gl) return;

    const startTime = performance.now();
    const gl = this.gl;

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!particles || particles.length === 0) {
      this.updateRenderStats(startTime, 0);
      return;
    }

    // Use shader program
    gl.useProgram(this.program);

    // Set resolution uniform
    gl.uniform2f(this.locations.resolution, this.width, this.height);

    // Update particle data
    this.updateParticleData(particles);

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
    gl.enableVertexAttribArray(this.locations.position);
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);

    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.colors);
    gl.enableVertexAttribArray(this.locations.color);
    gl.vertexAttribPointer(this.locations.color, 3, gl.FLOAT, false, 0, 0);

    // Bind size buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.sizes);
    gl.enableVertexAttribArray(this.locations.size);
    gl.vertexAttribPointer(this.locations.size, 1, gl.FLOAT, false, 0, 0);

    // Draw particles
    gl.drawArrays(gl.POINTS, 0, particles.length);

    // Update stats
    this.updateRenderStats(startTime, particles.length);
  }

  /**
   * Update particle data in buffers
   * @param {Array} particles - Array of particle objects
   */
  updateParticleData(particles) {
    const count = Math.min(particles.length, this.maxParticles);

    for (let i = 0; i < count; i++) {
      const particle = particles[i];

      // Position
      this.positions[i * 2] = particle.x;
      this.positions[i * 2 + 1] = particle.y;

      // Color
      const color = this.getParticleColor(particle);
      this.colors[i * 3] = color.r;
      this.colors[i * 3 + 1] = color.g;
      this.colors[i * 3 + 2] = color.b;

      // Size - fixed 2px radius (4px diameter)
      this.sizes[i] = 120;
    }
  }

  /**
   * Get particle color based on type
   * @param {Object} particle - Particle object
   * @returns {Object} - RGB color object
   */
  getParticleColor(particle) {
    const colorIndex = particle.types.indexOf(particle.type);
    const colorString = particle.colors[colorIndex] || "#ffffff";

    // Convert hex string to RGB
    const hex = parseInt(colorString.replace("#", ""), 16);
    return {
      r: ((hex >> 16) & 0xff) / 255,
      g: ((hex >> 8) & 0xff) / 255,
      b: (hex & 0xff) / 255,
    };
  }

  /**
   * Update render statistics
   * @param {number} startTime - Frame start time
   * @param {number} particleCount - Number of particles rendered
   */
  updateRenderStats(startTime, particleCount) {
    this.renderStats.lastFrameTime = performance.now() - startTime;
    this.renderStats.particlesRendered = particleCount;

    // Calculate average frame time
    this.renderStats.averageFrameTime =
      this.renderStats.averageFrameTime * 0.9 +
      this.renderStats.lastFrameTime * 0.1;
  }

  /**
   * Get rendering statistics
   * @returns {Object} - Render statistics
   */
  getStats() {
    return {
      ...this.renderStats,
      gpuAccelerated: true,
      maxParticles: this.maxParticles,
      renderMode: "webgl",
    };
  }

  /**
   * Set rendering mode (kept for compatibility)
   * @param {string} mode - Rendering mode
   */
  setRenderMode(mode) {
    console.log(`🎨 WebGL renderer mode: ${mode}`);
  }

  /**
   * Get the canvas element
   * @returns {HTMLCanvasElement} - Canvas element
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get the underlying app (kept for compatibility)
   * @returns {Object} - Mock app object
   */
  getApp() {
    return {
      canvas: this.canvas,
      renderer: { resize: this.resize.bind(this) },
    };
  }

  /**
   * Cleanup renderer resources
   */
  destroy() {
    if (this.gl) {
      // Delete buffers
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);
      if (this.sizeBuffer) this.gl.deleteBuffer(this.sizeBuffer);

      // Delete program
      if (this.program) this.gl.deleteProgram(this.program);
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.gl = null;
    this.initialized = false;

    console.log("🧹 WebGL renderer destroyed");
  }
}
