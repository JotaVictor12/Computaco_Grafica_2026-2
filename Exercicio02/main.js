const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


const canvasCoordinates =
    document.getElementById(
        "canvasCoordinates"
    );

const webglCoordinates =
    document.getElementById(
        "webglCoordinates"
    );


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

let vertices = new Float32Array([]);0


// --------------------------------------------------
// 1. CORES
// --------------------------------------------------

let colors = new Float32Array([]);

// --------------------------------------------------
// 1. TAMANHO DOS PONTOS
// --------------------------------------------------

let pointSizes = new Float32Array([]);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. INTERAÇÃO COM O MOUSE
// --------------------------------------------------
const MODES = {
    LINE: 'line',
    TRIANGLE: 'triangle',
};

let currentMode = MODES.LINE; // Modo inicial
let pointsNum = 0;
let pointPair = [];
let pointTriple = [];

function setMode(newMode) {
    if (Object.values(MODES).includes(newMode)) {
        currentMode = newMode;
        pointPair = [];
        pointTriple = [];

        document.getElementById("modeDisplay").textContent = 
            `Modo: ${newMode === MODES.LINE ? "LINHAS (2 pontos)" : "TRIÂNGULOS (3 pontos)"}`;
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === "l") setMode(MODES.LINE);
    if (event.key.toLowerCase() === "t") setMode(MODES.TRIANGLE);
});

const pointColors = [
    [1.0, 0.0, 0.0],   // Vermelho
    [0.0, 1.0, 0.0],   // Verde
    [0.0, 0.0, 1.0],   // Azul
    [1.0, 1.0, 0.0],   // Amarelo
    [1.0, 0.0, 1.0],   // Magenta
    [0.0, 1.0, 1.0]    // Ciano
];

function addPointToArrays(webglX, webglY, isLinePoint = false) {
    // Adicionar novo ponto ao array existente
    const newVertices = new Float32Array(vertices.length + 2);
    newVertices.set(vertices);
    newVertices[vertices.length] = webglX;
    newVertices[vertices.length + 1] = webglY;
    vertices = newVertices;

    // Adicionar cor do novo ponto
    const newColors = new Float32Array(colors.length + 3);
    newColors.set(colors);
    
    if (isLinePoint) {
        // Linha em branco
        newColors[colors.length] = 1.0;
        newColors[colors.length + 1] = 1.0;
        newColors[colors.length + 2] = 1.0;
    } else {
        // Ponto clicado com cor própria
        const colorIndex = pointsNum % pointColors.length;
        newColors[colors.length] = pointColors[colorIndex][0];
        newColors[colors.length + 1] = pointColors[colorIndex][1];
        newColors[colors.length + 2] = pointColors[colorIndex][2];
    }
    colors = newColors;

    // Adicionar tamanho do novo ponto
    const newPointSizes = new Float32Array(pointSizes.length + 1);
    newPointSizes.set(pointSizes);
    newPointSizes[pointSizes.length] = isLinePoint ? 3.0 : 10.0; // Linha mais fina
    pointSizes = newPointSizes;

    // Atualizar os buffers na GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
}

canvas.addEventListener("mousedown", mouseClick, false);

// Função para reorganizar pontos (linha/triângulo por baixo, vértices por cima)
function reorderPointsToTop(originalVertexCount) {
    const newVertices = new Float32Array(vertices.length);
    const newColors = new Float32Array(colors.length);
    const newPointSizes = new Float32Array(pointSizes.length);
    
    let idx = 0;
    // Primeiro: pontos das linhas/triângulos (desenhados por baixo)
    for (let i = 0; i < originalVertexCount * 2; i += 2) {
        newVertices[idx * 2] = vertices[i];
        newVertices[idx * 2 + 1] = vertices[i + 1];
        newColors[idx * 3] = colors[i / 2 * 3];
        newColors[idx * 3 + 1] = colors[i / 2 * 3 + 1];
        newColors[idx * 3 + 2] = colors[i / 2 * 3 + 2];
        newPointSizes[idx] = pointSizes[i / 2];
        idx++;
    }
    
    // Depois: pontos clicados (desenhados por cima)
    const lastPointsStart = originalVertexCount * 2;
    for (let i = lastPointsStart; i < vertices.length; i += 2) {
        newVertices[idx * 2] = vertices[i];
        newVertices[idx * 2 + 1] = vertices[i + 1];
        newColors[idx * 3] = colors[i / 2 * 3];
        newColors[idx * 3 + 1] = colors[i / 2 * 3 + 1];
        newColors[idx * 3 + 2] = colors[i / 2 * 3 + 2];
        newPointSizes[idx] = pointSizes[i / 2];
        idx++;
    }
    
    vertices = newVertices;
    colors = newColors;
    pointSizes = newPointSizes;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
}

// Modo linha: 2 pontos conectados por Bresenham
function handleLineMode(x, y, webglX, webglY) {
    // Se iniciando uma nova forma E já existe uma forma no canvas, limpar tudo
    if (pointPair.length === 0 && vertices.length > 0) {
        vertices = new Float32Array([]);
        colors = new Float32Array([]);
        pointSizes = new Float32Array([]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
    }

    pointPair.push({ x: Math.round(x), y: Math.round(y) });
    addPointToArrays(webglX, webglY);

    if (pointPair.length === 2) {
        const [p1, p2] = pointPair;
        const linePoints = bresenham(p1.x, p1.y, p2.x, p2.y);
        const originalVertexCount = vertices.length / 2;
        
        // Adicionar todos os pontos da linha
        linePoints.forEach(point => {
            const lineWebglX = (point.x / canvas.width) * 2 - 1;
            const lineWebglY = -((point.y / canvas.height) * 2 - 1);
            addPointToArrays(lineWebglX, lineWebglY, true);
        });
        
        // Reorganizar para colocar pontos clicados no final
        reorderPointsToTop(originalVertexCount);
        pointPair = [];
    }
}

// Modo triângulo: 3 pontos conectados por Bresenham
function handleTriangleMode(x, y, webglX, webglY) {
    // Se iniciando uma nova forma E já existe uma forma no canvas, limpar tudo
    if (pointTriple.length === 0 && vertices.length > 0) {
        vertices = new Float32Array([]);
        colors = new Float32Array([]);
        pointSizes = new Float32Array([]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
    }

    pointTriple.push({ x: Math.round(x), y: Math.round(y) });
    addPointToArrays(webglX, webglY);

    if (pointTriple.length === 3) {
        const [p1, p2, p3] = pointTriple;
        const originalVertexCount = vertices.length / 2;
        
        // Desenhar 3 arestas do triângulo
        const edge1 = bresenham(p1.x, p1.y, p2.x, p2.y);
        const edge2 = bresenham(p2.x, p2.y, p3.x, p3.y);
        const edge3 = bresenham(p3.x, p3.y, p1.x, p1.y);
        
        // Adicionar todos os pontos das arestas
        [edge1, edge2, edge3].forEach(edge => {
            edge.forEach(point => {
                const lineWebglX = (point.x / canvas.width) * 2 - 1;
                const lineWebglY = -((point.y / canvas.height) * 2 - 1);
                addPointToArrays(lineWebglX, lineWebglY, true);
            });
        });
        
        // Reorganizar para colocar pontos do triângulo no final
        reorderPointsToTop(originalVertexCount);
        pointTriple = [];
    }
}

function mouseClick(event) {
    // Posição do clique em pixels
    const x = event.offsetX;
    const y = event.offsetY;

    canvasCoordinates.textContent = `Canvas: (${x}, ${y})`;

    // Converter X para o intervalo [-1, 1]
    const webglX = (x / canvas.width) * 2 - 1;

    // Converter Y para o intervalo [-1, 1]
    const webglY = -((y / canvas.height) * 2 - 1);

    webglCoordinates.textContent = `WebGL: (${webglX.toFixed(3)}, ${webglY.toFixed(3)})`;

    // Executar lógica conforme o modo
    if (currentMode === MODES.LINE) {
        handleLineMode(x, y, webglX, webglY);
    } else if (currentMode === MODES.TRIANGLE) {
        handleTriangleMode(x, y, webglX, webglY);
    }

    drawScene();
    pointsNum++;
}
// Pressionar 'c' para limpar canvas
document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === 'c') {
        // Resetar dados
        vertices = new Float32Array([]);
        colors = new Float32Array([]);
        pointSizes = new Float32Array([]);
        pointsNum = 0;
        pointPair = [];
        pointTriple = [];

        // Atualizar buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);

        // Limpar tela
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        canvasCoordinates.textContent = "Canvas: --";
        webglCoordinates.textContent = "WebGL: --";
    }
});

// --------------------------------------------------
// 10. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.0, 0.0, 0.0, 1.0);


// --------------------------------------------------
// 11. DESENHAR
// --------------------------------------------------

const numComponents = 2;

gl.useProgram(program);

function drawScene(){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / numComponents
    );
}

// Algoritmo de Bresenham - retorna array de pontos da linha
function bresenham(x0, y0, x1, y1) {
    const points = [];
    
    // Valores absolutos das diferenças
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    
    // Determinar direção do incremento
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    
    // Parâmetro de decisão inicial
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    // Iterar até alcançar o ponto final
    while (true) {
        points.push({ x: x, y: y });
        
        if (x === x1 && y === y1) break;
        
        // Calcular erro para decidir próximo pixel
        const e2 = 2 * err;
        
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
    
    return points;
}

drawScene();
