let canvas;
let ctx;

// DrawRectangle.js
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('cnv1')
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element')
    }

    // Get the rendering context for 2DCG
    ctx = canvas.getContext('2d')

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a red vector v1 
    let v1 = new Vector3([2.25, 2.25, 0]);
    drawVector(v1, "red");

}

function drawVector(v, color) {
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    let scale = 20;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
        cx + v.elements[0] * scale,
        cy - v.elements[1] * scale
    );
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Read values to create v1/v2
    let x1 = parseFloat(document.getElementById('x1').value);
    let y1 = parseFloat(document.getElementById('y1').value);
    let x2 = parseFloat(document.getElementById('x2').value);
    let y2 = parseFloat(document.getElementById('y2').value);

    // Call to draw new vector 
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Read values to create v1/v2
    let x1 = parseFloat(document.getElementById('x1').value);
    let y1 = parseFloat(document.getElementById('y1').value);
    let x2 = parseFloat(document.getElementById('x2').value);
    let y2 = parseFloat(document.getElementById('y2').value);

    let operations = document.getElementById('operations');
    let operation = operations.options[operations.selectedIndex].value;
    let s = parseFloat(document.getElementById('scalar').value);
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);

    switch (operation) {
        case "add":
            v3 = v3.add(v2);
            drawVector(v1, "red");
            drawVector(v2, "blue");
            drawVector(v3, "green");
            break;
        case "sub":
            v3 = v3.sub(v2);
            drawVector(v1, "red");
            drawVector(v2, "blue");
            drawVector(v3, "green");
            break;
        case "mul":
            v3 = v3.mul(s);
            v4 = v2.mul(s);
            drawVector(v1, "red");
            drawVector(v2, "blue");
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;
        case "div":
            v3 = v3.div(s);
            v4 = v4.div(s);
            drawVector(v1, "red");
            drawVector(v2, "blue");
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;
        case "mag":
            console.log(`Magnitude v1: ${v1.magnitude()}`);
            console.log(`Magnitude v2: ${v2.magnitude()}`);
            drawVector(v1, "red");
            drawVector(v2, "blue");
            break;
        case "norm":
            v3 = v3.normalize();
            v4 = v4.normalize();
            drawVector(v1, "red");
            drawVector(v2, "blue");
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;
        case "angle":
            drawVector(v1, "red");
            drawVector(v2, "blue");
            angleBetween(v1, v2);
            break;
        case "area":
            drawVector(v1, "red");
            drawVector(v2, "blue");
            areaTriangle(v1, v2);
            break;
        default:
            console.log('no operation selected...');
            break;
    }
}

function angleBetween(v1, v2) {
    // dot product: |v1|*|v2|*cos(alpha)
    let dotProd = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    let cosAlpha = dotProd / (mag1 * mag2);
    let alpha = Math.acos(cosAlpha) * (180 / Math.PI);
    console.log(`Angle: ${alpha}`);
}

function areaTriangle(v1, v2) {
    // area: ||v1 x v2|| * 1/2
    let crossProd = Vector3.cross(v1, v2);
    let area = 0.5 * crossProd.magnitude();
    console.log(`Area of triangle: ${area}`);
}