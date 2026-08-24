const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// HELPER: Gerador de Círculos
// --------------------------------------------------
function criarCirculo(cx, cy, raio, r, g, b, segmentos = 30) {
    const v = [cx, cy];
    const c = [r, g, b];
    for (let i = 0; i <= segmentos; i++) {
        const angulo = (i / segmentos) * 2 * Math.PI;
        v.push(cx + raio * Math.cos(angulo), cy + raio * Math.sin(angulo));
        c.push(r, g, b);
    }
    return { vertices: v, cores: c, total: v.length / 2 };
}

// Array para registrar cada ordem de desenho
const ordensDesenho = [];

function registrarForma(modo, verticesArr, coresArr) {
    verticesTotais.push(...verticesArr);
    coresTotais.push(...coresArr);
    ordensDesenho.push({ modo, total: verticesArr.length / 2 });
}

let verticesTotais = [];
let coresTotais = [];

// --------------------------------------------------
// 1. GATO (Centro)
// --------------------------------------------------
// Círculo Rosto
const cRosto = criarCirculo(0.0, 0.0, 0.45, 0.0, 0.0, 0.0, 100);
registrarForma(gl.TRIANGLE_FAN, cRosto.vertices, cRosto.cores);

// Círculos Olhos
const cOlhoE = criarCirculo(-0.18, 0.15, 0.07, 1.0, 1.0, 1.0, 50);
registrarForma(gl.TRIANGLE_FAN, cOlhoE.vertices, cOlhoE.cores);

const cOlhoD = criarCirculo(0.18, 0.15, 0.07, 1.0, 1.0, 1.0, 50);
registrarForma(gl.TRIANGLE_FAN, cOlhoD.vertices, cOlhoD.cores);

// Nariz e Orelhas
const vertTriangulosGato = [
    0.08, -0.05,  -0.08, -0.05,   0.0, -0.13,  // Nariz (Vermelho)
   -0.35,  0.25,  -0.35,  0.6,   -0.1,  0.35,  // Orelha E (Preta)
    0.35,  0.25,   0.35,  0.6,    0.1,  0.35   // Orelha D (Preta)
];
const coresTriangulosGato = [
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0
];
registrarForma(gl.TRIANGLES, vertTriangulosGato, coresTriangulosGato);

// Boca
const bocaGato = [-0.08, -0.18,  0.0, -0.23,  0.08, -0.18];
const corBocaGato = [1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0];
registrarForma(gl.LINE_STRIP, bocaGato, corBocaGato);

// Bigodes
const bigodesGato = [
   -0.25, -0.05, -0.55,  0.05,   -0.25, -0.07, -0.55, -0.04,   -0.25, -0.09, -0.55, -0.12,
    0.25, -0.05,  0.55,  0.05,    0.25, -0.07,  0.55, -0.04,    0.25, -0.09,  0.55, -0.12
];
const corBigodesGato = new Array(12 * 3).fill(1.0);
registrarForma(gl.LINES, bigodesGato, corBigodesGato);

// --------------------------------------------------
// 2. FLOR (Canto Inferior Esquerdo)
// --------------------------------------------------
// Caule (Linha verde)
registrarForma(gl.LINES, [-0.7, -0.9, -0.7, -0.6], [0.0, 0.8, 0.2, 0.0, 0.8, 0.2]);

// Pétalas (4 Círculos Rosas)
const petalaC = criarCirculo(-0.7, -0.53, 0.05, 1.0, 0.4, 0.7);
const petalaB = criarCirculo(-0.7, -0.67, 0.05, 1.0, 0.4, 0.7);
const petalaE = criarCirculo(-0.77, -0.6, 0.05, 1.0, 0.4, 0.7);
const petalaD = criarCirculo(-0.63, -0.6, 0.05, 1.0, 0.4, 0.7);
registrarForma(gl.TRIANGLE_FAN, petalaC.vertices, petalaC.cores);
registrarForma(gl.TRIANGLE_FAN, petalaB.vertices, petalaB.cores);
registrarForma(gl.TRIANGLE_FAN, petalaE.vertices, petalaE.cores);
registrarForma(gl.TRIANGLE_FAN, petalaD.vertices, petalaD.cores);

// Centro da Flor (Amarelo)
const florCentro = criarCirculo(-0.7, -0.6, 0.04, 1.0, 0.8, 0.0);
registrarForma(gl.TRIANGLE_FAN, florCentro.vertices, florCentro.cores);

// --------------------------------------------------
// 3. ROBÔ (Canto Superior Direito)
// --------------------------------------------------
// Corpo (Cinza) e Cabeça (Cinza Claro)
const roboCorpo = [
    0.5, 0.3,  0.8, 0.3,  0.5, 0.55,  0.5, 0.55,  0.8, 0.3,  0.8, 0.55, // Corpo
    0.55, 0.6, 0.75, 0.6, 0.55, 0.75, 0.55, 0.75, 0.75, 0.6, 0.75, 0.75  // Cabeça
];
const corRobo = [
    ...new Array(6 * 3).fill(0.4), // Cinza
    ...new Array(6 * 3).fill(0.6)  // Cinza claro
];
registrarForma(gl.TRIANGLES, roboCorpo, corRobo);

// Olhos do Robô (Ciano)
const olhoroboE = criarCirculo(0.6, 0.68, 0.025, 0.0, 1.0, 1.0);
const olhoroboD = criarCirculo(0.7, 0.68, 0.025, 0.0, 1.0, 1.0);
registrarForma(gl.TRIANGLE_FAN, olhoroboE.vertices, olhoroboE.cores);
registrarForma(gl.TRIANGLE_FAN, olhoroboD.vertices, olhoroboD.cores);

// Antena (Linha vermelha + Luz)
registrarForma(gl.LINES, [0.65, 0.75, 0.65, 0.85], [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
const luzAntena = criarCirculo(0.65, 0.87, 0.02, 1.0, 0.0, 0.0);
registrarForma(gl.TRIANGLE_FAN, luzAntena.vertices, luzAntena.cores);

// --------------------------------------------------
// 4. CARRO (Canto Inferior Direito)
// --------------------------------------------------
// Chassi (Azul) e Cabine (Ciano)
const carroCorpo = [
    // Base do Carro
    0.35, -0.75,  0.85, -0.75,  0.35, -0.62,
    0.35, -0.62,  0.85, -0.75,  0.85, -0.62,
    // Teto / Vidros
    0.45, -0.62,  0.75, -0.62,  0.50, -0.50,
    0.50, -0.50,  0.75, -0.62,  0.70, -0.50
];
const corCarro = [
    ...new Array(6 * 3).fill(0.1).map((v, i) => (i % 3 === 2 ? 0.9 : 0.1)), // Azul
    ...new Array(6 * 3).fill(0.2).map((v, i) => (i % 3 === 0 ? 0.2 : 0.8))  // Ciano
];
registrarForma(gl.TRIANGLES, carroCorpo, corCarro);

// Rodas (Cinza Escuro)
const rodaE = criarCirculo(0.48, -0.78, 0.06, 0.2, 0.2, 0.2);
const rodaD = criarCirculo(0.72, -0.78, 0.06, 0.2, 0.2, 0.2);
registrarForma(gl.TRIANGLE_FAN, rodaE.vertices, rodaE.cores);
registrarForma(gl.TRIANGLE_FAN, rodaD.vertices, rodaD.cores);

// --------------------------------------------------
// CONVERSÃO DOS BUFFERS
// --------------------------------------------------
const vertices = new Float32Array(verticesTotais);
const colors = new Float32Array(coresTotais);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

// --------------------------------------------------
// SHADERS & PROGRAMA
// --------------------------------------------------
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 vColor;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
    outColor = vec4(vColor, 1.0);
}`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getAttribLocation(program, "aColor");

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// --------------------------------------------------
// RENDERIZAÇÃO
// --------------------------------------------------
gl.clearColor(1.0, 0.98, 0.8, 1.0);
gl.clear(gl.COLOR_COLOR_BUFFER_BIT);
gl.useProgram(program);

// Loop automático percorrendo os offsets de cada elemento
let offsetVértice = 0;
for (const item of ordensDesenho) {
    gl.drawArrays(item.modo, offsetVértice, item.total);
    offsetVértice += item.total;
}
