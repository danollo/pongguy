'use strict';

let ball;
//let ghostBall;
let levelSize;
let player;
let computer;
const sound_bounce = new Sound([, , 1e3, , .03, .02, 1, 2, , , 940, .03, , , , , .2, .6, , .06], 0);

class Player extends EngineObject {
    constructor(pos) {
        super(vec2(0, 1), vec2(.5, 3.5), 0);
        this.mass = 0;
        this.setCollision();
    }

    update() {
        this.pos.y = mousePos.y;
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
    }
}

class Computer extends EngineObject {
    constructor(pos) {
        super(vec2(levelSize.x, .5), vec2(.5, 3.5), 0);
        this.mass = 0;
        this.setCollision();
    }

    update() {
        if (ball) {
            this.pos.y = ball.pos.y + 1.75;
        }
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
    }

}

class Ball extends EngineObject {
    constructor(pos) {
        super(pos, vec2(.5), tile(0));
        this.setCollision();
        this.velocity = vec2(-.1, -.1);
        this.elasticity = 1;
    }

    update() {
        super.update();
    }

    collideWithObject(o) {
        const speed = min(1.04 * this.velocity.length(), .5)
        this.velocity = this.velocity.normalize(speed);
        //ghostBall = new GhostBall();
        if (o == player) {
            this.velocity = this.velocity.rotate(.2 * (this.pos.y - o.pos.y));
            this.velocity.x = max(-this.velocity.x, .2);
            return 0;
        }
        return 1;
    }
}

/*class GhostBall extends EngineObject {
    constructor(pos) {
        super(pos, vec2(.5), tile(0));
        this.setCollision();
        this.elasticity = 1;
    }

    collideWithObject(o) {
        const speed = min(1.11 * this.velocity.length(), .5)
        this.velocity = this.velocity.normalize(speed);

        if (o == player || o == computer) {
            this.velocity = this.velocity.rotate(1 * (this.pos.y - o.pos.y));
            this.velocity.x = max(-this.velocity.x, 1);
            return 0;
        }
        return 1;
    }
}*/

class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size);
        this.setCollision();
        this.mass = 0;
        this.elasticity = 1;
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    // called once after the engine starts up
    // setup the game
    canvasFixedSize = vec2(1280, 720);
    levelSize = vec2(38, 20);
    cameraPos = levelSize.scale(.5);
    player = new Player(vec2(levelSize.y));
    computer = new Computer(vec2(levelSize.y));
    const pos = vec2();
    new Wall(vec2(levelSize.y / 2, -1), vec2(100, 2))// top// left
    new Wall(vec2(levelSize.x / 2, levelSize.y + 1), vec2(100, 2)) // right

}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    // called every frame at 60 frames per second
    // handle input and update the game state
    /*  if (ghostBall && (ghostBall.pos.x > 39 || ghostBall.pos.x < -1)) {
          ghostBall.destroy();
          ghostBall = 0;
      }*/

    if (ball && ball.pos.x > 39 || ball && ball.pos.x < -1) {
        ball.destroy();
        ball = 0;
    }
    // if (ball.pos.x > 39){ point player }
    // if (ball.pos.x < -1){ point computer }

    if (!ball && (mouseWasPressed(0))) {
        ball = new Ball(vec2(levelSize.x / 2, levelSize.y / 2));
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
    // called after physics and objects are updated
    // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
    // called before objects are rendered
    // draw any background effects that appear behind objects
    drawRect(cameraPos, levelSize.scale(2), hsl(0, 0, .5));
    drawRect(cameraPos, levelSize, hsl(0, 0, .02));
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    // called after objects are rendered
    // draw effects or hud that appear above all objects
    drawTextScreen('god i miss bfa', mainCanvasSize.scale(.5), 80);
    if (!ball) {
        drawText("click to play", cameraPos.add(vec2(0, -5)), .8, true);
    }

}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);