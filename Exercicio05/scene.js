// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();

        this.helicopterTopShaft = new HelicopterTopShaft();

        this.helicopterTail = new HelicopterTail();

        this.helicopterPropellers = new HelicopterPropellers();

        this.helicopterTailPropeller = new HelicopterTailPropeller();

        // ==================================================
        // POSIÇÃO DO HELICÓPTERO (controlada pelas setas)
        // ==================================================
        this.posX = 0.0;
        this.posY = 0.0;

        this.moveSpeed = 0.02;
        this.limitX = 0.55;
        this.limitY = 0.55;

        // ==================================================
        // ÂNGULOS DE ROTAÇÃO DAS HÉLICES
        // (independentes do movimento, sempre girando)
        // ==================================================
        this.mainRotorAngle = 0.0;
        this.tailRotorAngle = 0.0;

        this.mainRotorSpeed = 0.25;
        this.tailRotorSpeed = 0.45;

        // ==================================================
        // ESTADO DO TECLADO
        // ==================================================
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        this.setupInput();
    }

    setupInput() {

        window.addEventListener("keydown", (event) => {
            if (Object.prototype.hasOwnProperty.call(this.keys, event.key)) {
                this.keys[event.key] = true;
                event.preventDefault();
            }
        });

        window.addEventListener("keyup", (event) => {
            if (Object.prototype.hasOwnProperty.call(this.keys, event.key)) {
                this.keys[event.key] = false;
                event.preventDefault();
            }
        });
    }

    update() {

        // ==================================================
        // MOVIMENTO DO HELICÓPTERO (setas do teclado)
        // ==================================================
        if (this.keys.ArrowUp)    this.posY += this.moveSpeed;
        if (this.keys.ArrowDown)  this.posY -= this.moveSpeed;
        if (this.keys.ArrowLeft)  this.posX -= this.moveSpeed;
        if (this.keys.ArrowRight) this.posX += this.moveSpeed;

        // Mantém o helicóptero dentro da área visível
        this.posX = Math.max(-this.limitX, Math.min(this.limitX, this.posX));
        this.posY = Math.max(-this.limitY, Math.min(this.limitY, this.posY));

        const globalTranslation =
            m4.translation(this.posX, this.posY, 0);

        // ==================================================
        // ROTAÇÃO CONTÍNUA DAS HÉLICES
        // (giram sempre, esteja o helicóptero parado ou se movendo)
        // ==================================================
        this.mainRotorAngle += this.mainRotorSpeed;
        this.tailRotorAngle += this.tailRotorSpeed;

        // --------------------------------------------------
        // Corpo, haste e cauda: só acompanham o deslocamento,
        // sem nenhuma rotação própria
        // --------------------------------------------------
        this.helicopterBody.update(globalTranslation);
        this.helicopterTopShaft.update(globalTranslation);
        this.helicopterTail.update(globalTranslation);

        // --------------------------------------------------
        // Hélice principal: gira em torno do próprio eixo Y
        // (já está centralizada em x = 0, z = 0) e, em seguida,
        // acompanha o deslocamento do helicóptero
        // --------------------------------------------------
        let mainRotorTransform = m4.yRotation(this.mainRotorAngle);
        mainRotorTransform = m4.translate(
            mainRotorTransform,
            this.posX,
            this.posY,
            0
        );
        this.helicopterPropellers.update(mainRotorTransform);

        // --------------------------------------------------
        // Hélice de cauda: gira em torno do próprio eixo (Z),
        // passando pelo centro do cubo do rotor de cauda
        // (aproximadamente x = 0.7), e também acompanha
        // o deslocamento do helicóptero
        // --------------------------------------------------
        const tailHubX = 0.7;

        let tailRotorTransform = m4.translation(-tailHubX, 0, 0);
        tailRotorTransform = m4.zRotate(tailRotorTransform, this.tailRotorAngle);
        tailRotorTransform = m4.translate(tailRotorTransform, tailHubX, 0, 0);
        tailRotorTransform = m4.translate(
            tailRotorTransform,
            this.posX,
            this.posY,
            0
        );
        this.helicopterTailPropeller.update(tailRotorTransform);
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}
