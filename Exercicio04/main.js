const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getUniformLocation(
                program,
                "uColor"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransform =
            m3.identity();

        this.verticesBuffer =
            gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform =
            viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(
            this.colorLocation,
            object.color
        );

        gl.uniformMatrix3fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewTransformLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}

// ==================================================
// FUNÇÕES AUXILIARES DE GEOMETRIA
// ==================================================

function rectangleVertices(x,y,width,height){
    return [
        x, y,
        x+width, y+height,
        x, y+height,

        x, y,
        x+width, y,
        x+width, y+height
    ];
}

// ==================================================
// VÉRTICES DO CHÃO
// ==================================================

function groundVertices() {

    const vertices = rectangleVertices(-2.0,-0.98,4.0,0.08);

    return new Float32Array(vertices);
}

// ==================================================
// VÉRTICES DAS PARTES DO ROBÔ
// ==================================================
// Cada parte é desenhada com a origem local (0,0) no seu
// ponto de articulação (pivô / encaixe), para que a rotação
// aconteça exatamente onde a peça se conecta ao robô.

// Tronco: centrado na própria origem (pivô = centro do robô)
function bodyVertices() {
    return new Float32Array(rectangleVertices(-0.15,-0.22,0.30,0.44));
}

// Cabeça: pivô no "pescoço" (base da cabeça), cresce para cima
function headVertices() {
    return new Float32Array(rectangleVertices(-0.09,0.0,0.18,0.18));
}

// Olho: pequeno quadrado, pivô no próprio centro
function eyeVertices() {
    return new Float32Array(rectangleVertices(-0.018,-0.018,0.036,0.036));
}

// Antena: haste fina que sai do topo da cabeça
function antennaRodVertices() {
    return new Float32Array(rectangleVertices(-0.008,0.0,0.016,0.09));
}

// Ponta da antena: pequena bolinha (quadrado) colorida de detalhe
function antennaTipVertices() {
    return new Float32Array(rectangleVertices(-0.022,-0.022,0.044,0.044));
}

// Painel do peito: detalhe retangular no tronco
function chestPanelVertices() {
    return new Float32Array(rectangleVertices(-0.08,-0.05,0.16,0.16));
}

// Braço: pivô no "ombro" (topo do braço), desce para baixo
function armVertices() {
    return new Float32Array(rectangleVertices(-0.035,-0.26,0.07,0.26));
}

// Mão: bloco preso na ponta do braço
function handVertices() {
    return new Float32Array(rectangleVertices(-0.045,-0.05,0.09,0.05));
}

// Perna: pivô no "quadril" (topo da perna), desce para baixo
function legVertices() {
    return new Float32Array(rectangleVertices(-0.045,-0.32,0.09,0.32));
}

// Pé: bloco preso na ponta da perna
function footVertices() {
    return new Float32Array(rectangleVertices(-0.04,-0.05,0.14,0.05));
}


// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {

        this.vertices = vertices;

        this.color = color;

        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform = modelTransform;
    }
}


// ==================================================
// CLASSE GROUND (CHÃO)
// ==================================================

class Ground extends SceneObject {

    constructor() {

        super(
            groundVertices(),

            new Float32Array([
                0.15,
                0.15,
                0.15
            ])
        );
    }

    draw(renderer) {

        renderer.draw(this);
    }
}


// ==================================================
// CLASSE ATTACHED PART
// ==================================================
// Representa qualquer peça presa a um ponto de articulação do
// robô (cabeça, olhos, antena, braços, mãos, pernas, pés...).
// A peça primeiro é deslocada dentro do seu próprio referencial
// local (extraOffset), depois gira em torno do ponto de encaixe
// (angle) e, por fim, é posicionada no corpo do robô (baseOffset).

class AttachedPart extends SceneObject {

    constructor(vertices, color, baseOffsetX, baseOffsetY, extraOffsetX = 0.0, extraOffsetY = 0.0) {

        super(vertices, color);

        this.baseOffsetX = baseOffsetX;
        this.baseOffsetY = baseOffsetY;

        this.extraOffsetX = extraOffsetX;
        this.extraOffsetY = extraOffsetY;
    }

    updateModelTransform(robotTransform, angle = 0.0) {

        const localTransform =

            m3.multiply(
                m3.translation(this.baseOffsetX,this.baseOffsetY),
                m3.multiply(
                    m3.rotation(angle),
                    m3.translation(this.extraOffsetX,this.extraOffsetY)
                )
            );

        this.modelTransform =

            m3.multiply(
                robotTransform,
                localTransform
            );
    }
}


// ==================================================
// CLASSE ROBOT BODY (TRONCO)
// ==================================================

class RobotBody extends SceneObject {

    constructor(color) {

        super(
            bodyVertices(),
            color
        );
    }
}


// ==================================================
// CLASSE ROBOT
// ==================================================

class Robot {

    constructor(tx, ty, color, speed) {

        this.tx = tx;
        this.ty = ty;

        this.speed = speed;

        // fase interna da caminhada, independente da posição,
        // usada para calcular as oscilações de cada parte
        this.walkPhase = 0.0;
        this.walkSpeed = 0.09;

        const bodyGray    = color;
        const headGray    = new Float32Array([0.78, 0.78, 0.80]);
        const limbGray    = new Float32Array([0.38, 0.38, 0.40]);
        const jointGray   = new Float32Array([0.22, 0.22, 0.24]);
        const eyeColor    = new Float32Array([0.35, 0.85, 0.95]); // detalhe: olhos ciano
        const antennaTipColor = new Float32Array([0.90, 0.35, 0.20]); // detalhe: ponta laranja
        const panelColor  = new Float32Array([0.60, 0.60, 0.63]);

        const shoulderY = 0.22;
        const hipY = -0.22;
        const armLength = 0.26;
        const legLength = 0.32;

        // corpo
        this.body = new RobotBody(bodyGray);

        // detalhe no peito
        this.chestPanel =
            new AttachedPart(chestPanelVertices(), panelColor, 0.0, 0.0);

        // cabeça
        this.head =
            new AttachedPart(headVertices(), headGray, 0.0, shoulderY);

        // olhos (detalhe do rosto), acompanham o aceno da cabeça
        this.leftEye =
            new AttachedPart(eyeVertices(), eyeColor, 0.0, shoulderY, -0.045, 0.10);
        this.rightEye =
            new AttachedPart(eyeVertices(), eyeColor, 0.0, shoulderY, 0.045, 0.10);

        // antena no topo da cabeça
        this.antennaRod =
            new AttachedPart(antennaRodVertices(), jointGray, 0.0, shoulderY, 0.0, 0.18);
        this.antennaTip =
            new AttachedPart(antennaTipVertices(), antennaTipColor, 0.0, shoulderY, 0.0, 0.27);

        // braços e mãos
        this.leftArm =
            new AttachedPart(armVertices(), limbGray, -0.18, shoulderY);
        this.rightArm =
            new AttachedPart(armVertices(), limbGray, 0.18, shoulderY);

        this.leftHand =
            new AttachedPart(handVertices(), jointGray, -0.18, shoulderY, 0.0, -armLength);
        this.rightHand =
            new AttachedPart(handVertices(), jointGray, 0.18, shoulderY, 0.0, -armLength);

        // pernas e pés
        this.leftLeg =
            new AttachedPart(legVertices(), limbGray, -0.09, hipY);
        this.rightLeg =
            new AttachedPart(legVertices(), limbGray, 0.09, hipY);

        this.leftFoot =
            new AttachedPart(footVertices(), jointGray, -0.09, hipY, 0.0, -legLength);
        this.rightFoot =
            new AttachedPart(footVertices(), jointGray, 0.09, hipY, 0.0, -legLength);
    }

    move() {

        this.tx += this.speed;

        if ( this.tx > 1.5 || this.tx < -1.5) {

            this.speed = -this.speed;
        }

        this.walkPhase += this.walkSpeed;

        // direção para a qual o robô está "olhando"
        const facing = this.speed >= 0 ? 1 : -1;

        // corpo: além de andar, quica levemente para cima e para
        // baixo com o dobro da frequência da passada das pernas
        const bounce =
            Math.abs(Math.sin(this.walkPhase * 2.0)) * 0.025;

        const robotTransform =

            m3.multiply(
                m3.translation(this.tx, this.ty + bounce),
                m3.scaling(facing,1)
            );

        this.body.updateModelTransform(robotTransform);
        this.chestPanel.updateModelTransform(robotTransform);

        // cabeça e detalhes do rosto: aceno suave, com amplitude
        // e frequência diferentes das dos braços e das pernas
        const nodAngle =
            Math.sin(this.walkPhase) * 0.08;

        this.head.updateModelTransform(robotTransform, nodAngle);
        this.leftEye.updateModelTransform(robotTransform, nodAngle);
        this.rightEye.updateModelTransform(robotTransform, nodAngle);
        this.antennaRod.updateModelTransform(robotTransform, nodAngle);
        this.antennaTip.updateModelTransform(robotTransform, nodAngle);

        // braços e pernas: pêndulos em fase oposta entre si,
        // simulando uma caminhada natural
        const legSwing = Math.sin(this.walkPhase) * 0.45;
        const armSwing = Math.sin(this.walkPhase) * 0.6;

        this.leftArm.updateModelTransform(robotTransform, armSwing);
        this.rightArm.updateModelTransform(robotTransform, -armSwing);
        this.leftHand.updateModelTransform(robotTransform, armSwing);
        this.rightHand.updateModelTransform(robotTransform, -armSwing);

        this.leftLeg.updateModelTransform(robotTransform, -legSwing);
        this.rightLeg.updateModelTransform(robotTransform, legSwing);
        this.leftFoot.updateModelTransform(robotTransform, -legSwing);
        this.rightFoot.updateModelTransform(robotTransform, legSwing);
    }

    draw(renderer) {

        renderer.draw(this.leftArm);
        renderer.draw(this.leftHand);
        renderer.draw(this.rightArm);
        renderer.draw(this.rightHand);

        renderer.draw(this.leftLeg);
        renderer.draw(this.leftFoot);
        renderer.draw(this.rightLeg);
        renderer.draw(this.rightFoot);

        renderer.draw(this.body);
        renderer.draw(this.chestPanel);

        renderer.draw(this.head);
        renderer.draw(this.leftEye);
        renderer.draw(this.rightEye);
        renderer.draw(this.antennaRod);
        renderer.draw(this.antennaTip);
    }
}


// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl,program);

        this.viewTransform = m3.setClippingWindow(-2.0,-1.0,2.0,1.0);

        this.renderer.defineViewTransform(this.viewTransform);

        this.ground = new Ground();

        // robô único, cinza, com pequenos detalhes coloridos
        this.robot =
            new Robot(0.0,-0.35,new Float32Array([0.55, 0.55, 0.58]),0.0032);
    }

    update() {

        this.robot.move();
    }

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.ground.draw(this.renderer);

        this.robot.draw(this.renderer);
    }

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.execute());
    }

    init() {

        requestAnimationFrame(() => this.execute());
    }
}


// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(
    0.05,
    0.05,
    0.08,
    1.0
);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);


// ==================================================
// CRIAR CENA
// ==================================================

const scene =
    new Scene(gl,program);


// ==================================================
// INICIAR ANIMAÇÃO
// ==================================================

scene.init();
