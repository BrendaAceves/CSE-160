class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.cubeVerts32 = new Float32Array([
      0,0,0, 1,1,0, 1,0,0
      ,
      0,0,0, 0,1,0, 1,1,0
      ,
      0,1,0, 0,1,1, 1,1,1
      ,
      0,1,0, 1,1,1, 1,1,0
      ,
      1,1,0, 1,1,1, 1,0,0
      ,
      1,0,0, 1,1,1, 1,0,1
      ,
      0,1,0, 0,1,1, 0,0,0
      ,
      0,0,0, 0,1,1, 0,0,1
      ,
      0,0,0, 0,0,1, 1,0,1
      ,
      0,0,0, 1,0,1, 1,0,0
      ,
      0,0,1, 1,1,1, 1,0,1
      ,
      0,0,1, 0,1,1, 1,1,1
    ]);
    this.cubeVerts = [
      0,0,0, 1,1,0, 1,0,0
      ,
      0,0,0, 0,1,0, 1,1,0
      ,
      0,1,0, 0,1,1, 1,1,1
      ,
      0,1,0, 1,1,1, 1,1,0
      ,
      1,1,0, 1,1,1, 1,0,0
      ,
      1,0,0, 1,1,1, 1,0,1
      ,
      0,1,0, 0,1,1, 0,0,0
      ,
      0,0,0, 0,1,1, 0,0,1
      ,
      0,0,0, 0,0,1, 1,0,1
      ,
      0,0,0, 1,0,1, 1,0,0
      ,
      0,0,1, 1,1,1, 1,0,1
      ,
      0,0,1, 0,1,1, 1,1,1
    ];
  }

render() {
  var rgba = this.color;

  gl.uniform1i(u_whichTexture, this.textureNum);
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

  // Front face (z=0)
  drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
  drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

  // Back
  drawTriangle3DUV([1,0,1, 1,1,1, 0,0,1], [0,0, 0,1, 1,0]);
  drawTriangle3DUV([1,1,1, 0,1,1, 0,0,1], [0,1, 1,1, 1,0]);

  // Top
  drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
  drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

  // Bottom
  drawTriangle3DUV([0,0,1, 0,0,0, 1,0,0], [0,0, 0,1, 1,1]);
  drawTriangle3DUV([0,0,1, 1,0,0, 1,0,1], [0,0, 1,1, 1,0]);

  // Right
  drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
  drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);

  // Left
  drawTriangle3DUV([0,0,1, 0,1,1, 0,1,0], [0,0, 0,1, 1,1]);
  drawTriangle3DUV([0,0,1, 0,1,0, 0,0,0], [0,0, 1,1, 1,0]);
}
  
  renderfast() {
    var rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];

    // front
    allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
    allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
  
    // top
    allverts = allverts.concat( [0,1,0, 0,1,1, 1,1,1]);
    allverts = allverts.concat( [0,1,0, 1,1,1, 1,1,0]);
  
    // right
    allverts = allverts.concat( [1,1,0, 1,1,1, 1,0,0]);
    allverts = allverts.concat( [1,0,0, 1,1,1, 1,0,1]);

    // left
    allverts = allverts.concat( [0,1,0, 0,0,1, 1,0,1]);
    allverts = allverts.concat( [0,0,0, 1,0,1, 1,0,0]);

    // bottom
    allverts = allverts.concat( [0,0,0, 0,0,1, 1,0,1]);
    allverts = allverts.concat( [0,0,0, 1,0,1, 1,0,0]);
    
    // back
    allverts = allverts.concat( [0,0,1, 1,1,1, 1,0,1]);
    allverts = allverts.concat( [0,0,1, 0,1,1, 1,1,1]);

    drawTriangle3D(allverts);

  }

  renderfaster() {
    var rgba = this.color;
    gl.uniform1i (u_whichTexture, -2);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (g_vertexBuffer == null) {
      initTriangle3D();
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

}