class Triangle {
  constructor() {
    this.type='triangle';
    this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = 5.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    // Draw
    if (this.vertices) {
      drawTriangle(this.vertices);
    } else {
      var xy = this.position;
      var d = this.size/200.0; // Delta
      drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
    }
  }
}

function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);

}

let g_vertexBuffer = null;

function initTriangle3D() {

  g_vertexBuffer = gl.createBuffer();

  if (!g_vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_Position);
}


function drawTriangle3D(vertices) {

  let n = vertices.length / 3;

  if (g_vertexBuffer == null) {
    initTriangle3D();
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.DYNAMIC_DRAW
  );

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {

  let n = vertices.length / 3;

  // Vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBufferUV);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.DYNAMIC_DRAW
  );

  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_Position);

  // UV buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(uv),
    gl.DYNAMIC_DRAW
  );

  gl.vertexAttribPointer(
    a_UV,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// function drawTriangle3DUV(vertices, uv) {
//   var n = 3;

//   var vertexBuffer = gl.createBuffer();
//   if (!vertexBuffer) {
//     console.log('Failed to create the buffer object');
//     return -1;
//   }
  
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
//   gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(a_Position);

//   var uvBuffer = gl.createBuffer();
//   if (!uvBuffer) {
//     console.log('Failed to create the buffer object');
//     return -1;
//   }
//   gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
//   gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(a_UV);
//   gl.drawArrays(gl.TRIANGLES, 0, n);
//   g_vertexBuffer = null;

// }

let g_vertexBufferUV = null;
let g_uvBuffer = null;

function initTriangle3DUV() {

  g_vertexBufferUV = gl.createBuffer();
  g_uvBuffer = gl.createBuffer();

  if (!g_vertexBufferUV || !g_uvBuffer) {
    console.log("Failed to create buffers");
    return;
  }
}