var gl;

var cube;

var cubeVertices = new Float32Array([
  -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
   0.5, 0.5,  -0.5, -0.5,  0.5,  -0.5,  -0.5,  0.5,  0.5, 0.5,  0.5, 0.5,
  -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
   0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5, -0.5, 0.5,  -0.5, -0.5,  0.5,  0.5, -0.5,  -0.5, 0.5

])

var cubeTextureCoordinates = new Float32Array([
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
  0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,
]);

var cubeVertexIndices = new Uint16Array([
    0,  1,  2,      0,  2,  3,
    4,  5,  6,      4,  6,  7,
    8,  9,  10,     8,  10, 11,
    12, 13, 14,     12, 14, 15,
    16, 17, 18,     16, 18, 19,
    20, 21, 22,     20, 22, 23
  ]);

var floor;
var floorVertices = new Float32Array([
  -7.5, -7.5, -0.5, -7.5,  7.5, -0.5,  7.5,  7.5, -0.5,  7.5, -7.5, -0.5,   // Back face
]);


var floorTextureCoordinates = new Float32Array([
  0.0,  0.0,     20.0,  0.0,     20.0,  20.0,     0.0,  20.0,  // Front
]);

var floorVertexIndices = new Uint16Array([
    0,  1,  2,      0,  2,  3
  ]);

var sky;


var skyVertices = new Float32Array([
  -7.5, -7.5, 0.5, -7.5,  7.5, 0.5,  7.5,  7.5, 0.5,  7.5, -7.5, 0.5,   // Back face
]);

var skyTextureCoordinates = new Float32Array([
  0.0,  0.0,     32.0,  0.0,     32.0,  32.0,     0.0,  32.0,  // Front
]);

var skyVertexIndices = new Uint16Array([
    0,  1,  2,      0,  2,  3
  ]);


var mMatrix   = new Matrix4();
var vMatrix   = new Matrix4();
var pMatrix   = new Matrix4();
var mvpMatrix = new Matrix4();
var u_MvpMatrix;
var buttons = [];

var VSHADER_SOURCE =
  'attribute vec3 a_VertexPosition;\n' +
  'attribute vec2 a_TextureCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying highp vec2 v_TextureCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * vec4(a_VertexPosition, 1.0);\n' +
  '  v_TextureCoord = a_TextureCoord;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying highp vec2 v_TextureCoord;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, vec2(v_TextureCoord.s, v_TextureCoord.t));\n' +
  '}\n';


function Shape(vertices, TextureCoordinates, vertexIndices, src) {

  var that = this;

  this.verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  this.vertices = vertices;
  gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

  this.textureCoordinates = TextureCoordinates;

  this.vertexIndices = vertexIndices;
  this.numElements = this.vertexIndices.length;

  this.verticesTextureCoordBuffer = gl.createBuffer();
  this.verticesIndexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.textureCoordinates, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.verticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, gl.STATIC_DRAW);

  this.texture = gl.createTexture();
  var shapeImage = new Image();
  shapeImage.onload = function() { that.handleTextureLoaded(shapeImage); }
  shapeImage.src = src;

}

Shape.prototype.handleTextureLoaded = function(image)  {
  console.log("handleTextureLoaded, image = " + image.src+ "["+this.texture+"]");
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

Shape.prototype.preDraw = function() {

  var vertexPositionAttribute = gl.getAttribLocation(gl.program, "a_VertexPosition");
  var textureCoordAttribute = gl.getAttribLocation(gl.program, "a_TextureCoord");
  var vertexNormalAttribute = gl.getAttribLocation(gl.program, "a_VertexNormal");


  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.enableVertexAttribArray(textureCoordAttribute);
  gl.enableVertexAttribArray(vertexNormalAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler"), 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.verticesIndexBuffer);


}

Shape.prototype.getModelMatrix = function() {
  return this.mMatrix;
}


function cos(deg) {
  return Math.cos(deg * Math.PI / 180);
}
function sin(deg) {
  return Math.sin(deg * Math.PI / 180);
}

var canvas = document.getElementById('webgl');
var canvas1 = document.getElementById('maze');
var ctx = canvas1.getContext("2d");




var eyeX1, eyeY1;
var eyeX, eyeY, eyeZ =0;
var atX = 0, atY= 0, atZ = 0;
var eyeX1, eyeY1;

var k = 0.05;
var angle = 90;


var wall = [];

var totalTiempo=61;

function updateReloj(){

  if(totalTiempo != 0){
      totalTiempo-=1;
      setTimeout("updateReloj()",1000);
  }

}


function main() {

    gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }


    if(gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clearDepth(1.0);                 // Clear everything
      gl.enable(gl.DEPTH_TEST);           // Enable depth testing
      gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

      document.addEventListener('keydown', keydown, false);
      document.addEventListener('keyup', keyup, false);

      var TheMaze = new Maze(MAZESZ);

      TheMaze.randPrim(new Pos(0, 0));
      var pos1 = TheMaze.pos;

      for (i = 0; i < TheMaze.sz; i++){
        for(j = 0; j < TheMaze.sz; j++){
          if(!TheMaze.iswall(i,j)){
            wall.push(new Pos(i,j));
          }
        }
      }

      var pos2 = new Pos(Math.floor((Math.random() * 15)),Math.floor((Math.random() * 15)));

      while(!TheMaze.iswall(pos2.x, pos2.y)){
        pos2.x = Math.floor((Math.random() * 15));
        pos2.y = Math.floor((Math.random() * 15));

      }
      eyeX, eyeX1 = pos2.x;
      eyeY, eyeY1 = pos2.y;
      pos1.x = pos2.x;
      pos1.y = pos2.y;

      sky = new Shape(skyVertices, skyTextureCoordinates,skyVertexIndices, "resources/c4.jpg")
      floor = new Shape(floorVertices, floorTextureCoordinates, floorVertexIndices, "resources/floor2.jpg");
      cube = new Shape(cubeVertices, cubeTextureCoordinates, cubeVertexIndices, "resources/wall.jpg");

      setInterval(function(){keyhandler(pos1)},25);
      setInterval(function(){drawScene(gl, u_MvpMatrix, mMatrix, vMatrix, pMatrix, mvpMatrix,TheMaze, pos1)},5);

      updateReloj();

  }
}

function keydown(ev){
  buttons[ev.keyCode]=true;
}

function keyup(ev){
  buttons[ev.keyCode]=false;
}
var win = false;

function keyhandler(pos1) {

    win = false;

    if (pos1.x != 0 && pos1.y != 0){

     if(buttons[68]) { // D
         eyeX1 -= -sin(angle) * k;
         eyeY1 -= cos(angle) * k;
     }
     if (buttons[65]) { // A
         eyeX1 += -sin(angle) * k;
         eyeY1 += cos(angle) * k;
     }
     if (buttons[83] || buttons[40]) { // S
         eyeX1 -= cos(angle) * k;
         eyeY1 -= sin(angle) * k;

     }
     if (buttons[87] || buttons[38]) { // W
         eyeX1 += cos(angle) * k;
         eyeY1 += sin(angle) * k;

     }
     if(buttons[39]) { // DERECHA
        angle -= 2;
     }
     if (buttons[37]) { // IZQUIERDA
        angle += 2;
     }

     var inside = false;
     for (i = 0; i<wall.length; i++){
       if(eyeX1 > wall[i].x - 0.7 && eyeX1 < wall[i].x + 0.7 && eyeY1 > wall[i].y -0.7 && eyeY1 < wall[i].y + 0.7){
         inside = true;
       }
     }
     if(inside){
       eyeX1 = eyeX;
       eyeY1 = eyeY;
     }else{
       eyeX = eyeX1;
       eyeY = eyeY1;
     }

     pos1.x = Math.floor(eyeX + 0.5);
     pos1.y = Math.floor(eyeY + 0.5);
   }else{
     win = true;
   }
}

function drawScene(gl, u_MvpMatrix, mMatrix, vMatrix, pMatrix, mvpMatrix,TheMaze,pos1) {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

  if(TheMaze.iswall(pos1.x, pos1.y)){
    TheMaze.pos = pos1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    TheMaze.draw(ctx, 10, 10, 10, 0);
  }else{
    pos1 = TheMaze.pos;
  }

  atX = eyeX + cos(angle);
  atY = eyeY + sin(angle);


  vMatrix.setLookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, 0, 0, 1);
  pMatrix.setPerspective(90, canvas.width/canvas.height, 0.1, 100);

  mMatrix.setTranslate(7, 7, 0);
  mvpMatrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  floor.preDraw();
  gl.drawElements(gl.TRIANGLES, floor.numElements, gl.UNSIGNED_SHORT, 0);

  mMatrix.setTranslate(7, 7, 0);
  mvpMatrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  sky.preDraw();
  gl.drawElements(gl.TRIANGLES, floor.numElements, gl.UNSIGNED_SHORT, 0);

  for (i = 0; i < wall.length; i++){
      mMatrix.setTranslate(wall[i].x, wall[i].y, 0);
      mvpMatrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);
      gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

      cube.preDraw();
      gl.drawElements(gl.TRIANGLES, cube.numElements, gl.UNSIGNED_SHORT, 0);
  }

  ctx.fillStyle = 'red';
  ctx.font = '30pt VTFMisterPixelRegular';
  ctx.fillText(totalTiempo, 750, 50);

  if(win){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.font = '50pt VTFMisterPixelRegular';
    ctx.fillText('YOU WIN',canvas.width/2-140, canvas.height/2);
  }else{
    if(totalTiempo==0){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      ctx.fillStyle = 'red';
      ctx.font = '50pt VTFMisterPixelRegular';
      ctx.fillText('GAME OVER',canvas.width/2-180, canvas.height/2);
    }
  }

}
