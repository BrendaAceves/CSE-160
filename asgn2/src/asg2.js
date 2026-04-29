// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_vertexBuffer = null;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create buffer');
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;

function addActionsForHtmlUI() {

  // Button Events (INC, cant see functions at the end)
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; }
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; }

  // Color Slider Events
  // document.getElementById('yellowSlide').addEventListener('mousemove',   function() { this.value; renderScene(); });
  // document.getElementById('magentaSlide').addEventListener('mousemove', function() { this.value; renderScene(); });
  
  // Size slider events
  document.getElementById('angleSlide').addEventListener('mousemove',  function() { g_globalAngle = this.value; renderScene(); });

  // Body Parts
  document.getElementById('thighSlide').oninput = function() { g_thighAngle = this.value; };

  document.getElementById('calfSlide').oninput = function() { g_calfAngle = this.value; };

  document.getElementById('footSlide').oninput = function() { g_footAngle = this.value; };
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for the HTML UI Elements
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); g_globalAngle = ev.clientX % 360; renderScene(); }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  g_thighAngle = 30 * Math.sin(g_seconds);
  g_calfAngle = 20 * Math.sin(g_seconds + 0.5);
  g_footAngle = 10 * Math.sin(g_seconds + 1);
}

let g_thighAngle = 0;
let g_calfAngle = 0;
let g_footAngle = 0;
let thighLength = 0.18;
let calfLength = 0.18;
let footLength = 0.10;

// Draw every shape that is supposed to be in the canvas
function renderScene() {
  var startTime = performance.now();

  // Global rotation
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Dimensions
  let thighLength = 0.25;
  let calfLength = 0.25;
  let footLength = 0.15;

  // Body
  var body = new Cube();
  body.color = [1, 0.6, 0.2, 1];
  body.matrix.setTranslate(-0.3, -0.5, 0.0);
  body.matrix.scale(0.6, 0.3, 0.4);
  body.render();

  // Head
  var head = new Cube();
  head.color = [1, 0.7, 0.3, 1];
  head.matrix.setTranslate(0.3, -0.35, 0);
  head.matrix.scale(0.2, 0.2, 0.2);
  head.render();

  // Eye
  var eye = new Circle();
  eye.position = [0.42, -0.28];
  eye.size = 10;
  eye.color = [0, 0, 0, 1];
  eye.render();

  // Draw leg helper function (creates thigh, calf and foot)
  function drawLeg(x, z) {
    var thigh = new Cube();
    thigh.color = [1, 0.5, 0.2, 1];
    thigh.matrix.setTranslate(x, -0.35, z);
    thigh.matrix.rotate(g_thighAngle, 0, 0, 1);
    var thighMatrix = new Matrix4(thigh.matrix);
    thigh.matrix.scale(0.1, -thighLength, 0.1);
    thigh.render();

    var calf = new Cube();
    calf.color = [1, 0.5, 0.2, 1];
    calf.matrix = new Matrix4(thighMatrix);
    calf.matrix.translate(0, -thighLength, 0);
    calf.matrix.rotate(g_calfAngle, 0, 0, 1);
    var calfMatrix = new Matrix4(calf.matrix);
    calf.matrix.scale(0.08, -calfLength, 0.08);
    calf.render();

    var foot = new Cube();
    foot.color = [0.9, 0.4, 0.1, 1];
    foot.matrix = new Matrix4(calfMatrix);
    foot.matrix.translate(0, -calfLength, 0);
    foot.matrix.rotate(g_footAngle, 0, 0, 1);
    foot.matrix.scale(0.1, -footLength+0.05, 0.1);
    foot.render();
  }

  drawLeg(-0.2,  0.15); // front left
  drawLeg(-0.2, -0.15); // front right
  drawLeg( 0.2,  0.15); // back left
  drawLeg( 0.2, -0.15); // back right

  // TAIL (animated)
  var tail = new Cube();
  tail.color = [1, 0.5, 0.2, 1];
  tail.matrix.setTranslate(-0.35, -0.4, 0);
  tail.matrix.rotate(30 * Math.sin(g_seconds), 0, 0, 1);
  tail.matrix.scale(0.1, -0.3, 0.1);
  tail.render();

  // Performance Display
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "numdot");
}

function click(ev) {
  if (ev.shiftKey) {
    g_poke = true;
    setTimeout(() => g_poke = false, 500);
  }
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  // Store the coordinates to g_points array
  return([x, y]);
}


function drawBetweenPoints(p1, p2) {
  let dx = p2[0] - p1[0];
  let dy = p2[1] - p1[1];

  let distance = Math.sqrt(dx * dx + dy * dy);

  let steps = Math.floor(distance * 100);

  for (let i = 0; i < steps; i++) {
    let t = i / steps;

    let x = p1[0] + dx * t;
    let y = p1[1] + dy * t;

    let shape;

    if (g_selectedType == POINT) {
      shape = new Point();
    } else if (g_selectedType == TRIANGLE) {
      shape = new Triangle();
    } else {
      shape = new Circle();
      shape.segments = g_selectedSegments;
    }

    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
  }
}

function updateBackgroundColor() {
  gl.clearColor(g_backgroundColor[0],g_backgroundColor[1],g_backgroundColor[2],1.0);
}

function drawTriangle3D(vertices) {
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log(`Failed to get ${htmlID} from HTML`);
    return;
  }
  htmlElm.innerHTML = text;
}