class Camera {

  constructor() {

    this.fov = 60;

    this.eye = new Vector3([0, 2, 6]);

    this.at = new Vector3([0, 2, -100]);

    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();

    this.projectionMatrix = new Matrix4();

    this.yaw = -90;
    this.pitch = 0;

    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    this.updateView();
  }

  updateView() {

    this.viewMatrix.setLookAt(

      this.eye.elements[0],
      this.eye.elements[1],
      this.eye.elements[2],

      this.at.elements[0],
      this.at.elements[1],
      this.at.elements[2],

      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );
  }

  moveForward(speed = 0.2) {

    let fx =
      this.at.elements[0] - this.eye.elements[0];

    let fy =
      this.at.elements[1] - this.eye.elements[1];

    let fz =
      this.at.elements[2] - this.eye.elements[2];

    let len = Math.sqrt(fx*fx + fy*fy + fz*fz);

    fx /= len;
    fy /= len;
    fz /= len;

    this.eye.elements[0] += fx * speed;
    this.eye.elements[1] += fy * speed;
    this.eye.elements[2] += fz * speed;

    this.at.elements[0] += fx * speed;
    this.at.elements[1] += fy * speed;
    this.at.elements[2] += fz * speed;

    this.updateView();
  }

  moveBackward(speed = 0.2) {

    let fx =
      this.eye.elements[0] - this.at.elements[0];

    let fy =
      this.eye.elements[1] - this.at.elements[1];

    let fz =
      this.eye.elements[2] - this.at.elements[2];

    let len = Math.sqrt(fx*fx + fy*fy + fz*fz);

    fx /= len;
    fy /= len;
    fz /= len;

    this.eye.elements[0] += fx * speed;
    this.eye.elements[1] += fy * speed;
    this.eye.elements[2] += fz * speed;

    this.at.elements[0] += fx * speed;
    this.at.elements[1] += fy * speed;
    this.at.elements[2] += fz * speed;

    this.updateView();
  }

  moveLeft(speed = 0.2) {

    let fx =
      this.at.elements[0] - this.eye.elements[0];

    let fz =
      this.at.elements[2] - this.eye.elements[2];

    let sx = -fz;
    let sz = fx;

    let len = Math.sqrt(sx*sx + sz*sz);

    sx /= len;
    sz /= len;

    this.eye.elements[0] += sx * speed;
    this.eye.elements[2] += sz * speed;

    this.at.elements[0] += sx * speed;
    this.at.elements[2] += sz * speed;

    this.updateView();
  }

  moveRight(speed = 0.2) {

    let fx =
      this.at.elements[0] - this.eye.elements[0];

    let fz =
      this.at.elements[2] - this.eye.elements[2];

    let sx = fz;
    let sz = -fx;

    let len = Math.sqrt(sx*sx + sz*sz);

    sx /= len;
    sz /= len;

    this.eye.elements[0] += sx * speed;
    this.eye.elements[2] += sz * speed;

    this.at.elements[0] += sx * speed;
    this.at.elements[2] += sz * speed;

    this.updateView();
  }
  panLeft(alpha = 5) {

    this.yaw -= alpha;

    this.updateRotation();
  }

  panRight(alpha = 5) {

    this.yaw += alpha;

    this.updateRotation();
  }

  panUp(alpha = 5) {

    this.pitch += alpha;

    // Prevent flipping
    if (this.pitch > 89) this.pitch = 89;
    if (this.pitch < -89) this.pitch = -89;

    this.updateRotation();
  }

  updateRotation() {

  let yawRad =
    this.yaw * Math.PI / 180;

  let pitchRad =
    this.pitch * Math.PI / 180;

  let fx =
    Math.cos(pitchRad) * Math.cos(yawRad);

  let fy =
    Math.sin(pitchRad);

  let fz =
    Math.cos(pitchRad) * Math.sin(yawRad);

  this.at.elements[0] =
    this.eye.elements[0] + fx;

  this.at.elements[1] =
    this.eye.elements[1] + fy;

  this.at.elements[2] =
    this.eye.elements[2] + fz;

  this.updateView();
}

}