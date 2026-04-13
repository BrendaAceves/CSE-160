// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_prevPos = null;

function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick   = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; gl.clearColor(0.0, 0.0, 0.0, 1.0); renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT };
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE };


  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });
  
  // Size slider events
  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlider').addEventListener('mouseup', function() { g_selectedSegments = this.value });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI Elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);
    g_prevPos = [x, y];
    click(ev);
  };

  canvas.onmousemove = function(ev) {
    if (ev.buttons !== 1) return;

    let [x, y] = convertCoordinatesEventToGL(ev);

    if (g_prevPos === null) {
      g_prevPos = [x, y];
      return;
    }

    drawBetweenPoints(g_prevPos, [x, y]);

    g_prevPos = [x, y];
    renderAllShapes();
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point = new Triangle();
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  // Store the coordinates to g_points array
  return([x, y]);
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(`numdot: ${len} ms: ${Math.floor(duration)} fps: ${Math.floor(10000/duration)}`, "numdot");
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

    g_shapesList.push(shape);
  }
}

function drawPicture() {
  g_shapesList = [];
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Helper to add triangles
  function addTri(vertices, color) {
    let t = new Triangle();
    t.vertices = vertices;
    t.color = color;
    g_shapesList.push(t);
  }

  // Right Stem
  addTri([
    -0.2, 0.1, 
    -0.2, -0.3, 
    0.0, -0.8
  ], [0.831,0.604,0.035,1]);
  addTri([
    -0.2, -0.3,
    -0.2, -0.9, 
    0.0, -0.8
  ], [0.831,0.604,0.035,1]);


  // Left Stem
  addTri([
    -0.2, 0.1, 
    -0.2, -0.3, 
    -0.4, -0.8
  ], [0.71, 0.506, 0,1]);

  addTri([
    -0.2, -0.3,
    -0.2, -0.9,
    -0.4, -0.8
  ], [0.71, 0.506, 0,1]);

  // Pedals
  addTri([
    -0.4, 0.15,
    -0.15, -0.2,
    -0.0, 0.15
  ], [0.60, 0.18, 0.18, 1]);
  addTri([
    -0.35, 0.15,
    0.15, -0.15,
    0.1, 0.3,
  ], [0.51, 0.027, 0.11, 1]);
  addTri([
    -0.6, 0.25,
    -0.55, -0.1,
    -0.4, 0.25
  ], [0.51, 0.027, 0.11, 1]);
  // dark green
  addTri([
    -0.8, 0.2,
    -0.3, 0.5,
    -0.3, 0.1
  ], [0.631, 0.047, 0.149, 1]);
  // dark red
  addTri([
    -0.4, 0.25,
    -0.55, -0.1,
    -0.1, 0.25
  ], [0.8,0,0,1]);
  // darker blue
  addTri([
    -0.1, 0.65,
    -0.1, 0.0,
    0.55, 0.2
  ], [0.631, 0.047, 0.149, 1]);
  // purple-ish
  addTri([
    0.2, 0.5,
    0.1, 0.1,
    0.5, 0.3
  ], [0.902, 0.173, 0.298, 1]);
  // pink
  addTri([
    -0.4, 0.5,
    -0.6, 0.2,
    -0.0, 0.2
  ], [0.969, 0.239, 0.365, 1]);
  // aqua
  addTri([
    -0.6, 0.55,
    -0.45, 0.2,
    -0.4, 0.55
  ], [0.831, 0.035, 0.169 , 1]);
  // brown
  addTri([
    -0.45, 0.55,
    -0.45, 0.2,
    -0.2, 0.55,
  ], [0.51, 0.027, 0.11, 1]);
  addTri([
    -0.45, 0.55,
    -0.05, 0.7,
    -0.1, 0.25,
  ], [0.76, 0, 0.125, 1]);
  addTri([
    -0.05, 0.7,
    0.45, 0.6,
    -0.1, 0.25,
  ], [0.969, 0.239, 0.365, 1]);
  // orange
  addTri([
    -0.1, 0.2,
    0.2, 0.4,
    -0.3, 0.4,
  ], [0.96, 0.18, 0.18, 1]);
  // black
  addTri([
    -0.2, 0.2,
    0.1, 0.4,
    0.1, 0.0,
  ], [0.902, 0.173, 0.298, 1]);
  // aqua
  addTri([
    0.3, 0.35,
    0.1, 0.4,
    0.1, 0.0,
  ], [0.969, 0.239, 0.365, 1]);

  // orange
  addTri([
    -0.2, 0.6,
    0.2, 0.4,
    -0.3, 0.4,
  ], [0.902, 0.173, 0.298, 1]);

  /**
   *  INITIALS - black
   */
  // B

  addTri([
    -0.31, -0.55,
    -0.31, -0.65,
    -0.23, -0.6,
  ], [0.51, 0.027, 0.11, 1]);
    addTri([
    -0.31, -0.6,
    -0.31, -0.7,
    -0.23, -0.65,
  ], [0.21, 0.027, 0.11, 1]);

  // A
  addTri([
    -0.05, -0.7,
    -0.15, -0.7,
    -0.1, -0.55,
  ], [0.81, 0.027, 0.11, 1]);
  addTri([
    -0.05, -0.7,
    -0.15, -0.7,
    -0.1, -0.65,
  ], [0.71, 0.027, 0.11, 1]);

  renderAllShapes();
}