'use strict';

let ball;
//let ghostBall;//
let levelSize;
let player;
let computer;
let playerScore = 0;
let computerScore = 0;
const sound_bounce = new Sound([.7,,106,.01,.05,.04,3,2.8,-17,20,,,,,,,.04,.92,.02,,-1490]);
const antialiasing = setCanvasPixelated();
fontDefault = "'Press Start 2P', sans-serif";

class Player extends EngineObject {
    constructor(pos) {
        super(vec2(0, 1), vec2(.6, 3.25), 0);
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
        super(vec2(levelSize.x, .5), vec2(.6, 3.25), 0);
        this.mass = 0;
        this.setCollision();
    }
    update() {
        if (ball) {

            let speedFactor = 0.3 + Math.min(0.1 * (playerScore + computerScore), 0.8);
            this.pos.y += (ball.pos.y - this.pos.y) * speedFactor;

            this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
        }
    }
}

class Ball extends EngineObject {
    constructor(pos) {
        super(pos, vec2(.5), tile(0));
        this.setCollision();
        this.velocity = vec2(-.1, -.1);
        this.elasticity = 1;
        this.trail = []; // Array to store the trail segments
        this.trailLifeSpan = 12; // Life span of each trail segment (in updates)
        this.trailSize = .2;
    }

    update() {
        if (this.pos.y - this.size.y / 2 < 0) {
            this.pos.y = this.size.y / 2;  // Keep the ball inside the top wall
            this.velocity.y *= -1;  // Reverse the vertical direction
        }
        if (this.pos.y + this.size.y / 2 > levelSize.y) {
            this.pos.y = levelSize.y - this.size.y / 2;  // Keep the ball inside the bottom wall
            this.velocity.y *= -1;  // Reverse the vertical direction
        }

        this.trail.push(new Trail(this.pos.copy(), this.trailSize, rgb(1, 0, 0, 0.5), this.trailLifeSpan));
        this.trail = this.trail.filter(trail => trail.age < trail.lifeSpan);

        for (let t of this.trail) {
            t.update();
        } 
        super.update();
    }



collideWithObject(o) {
    const speed = min(1.04 * this.velocity.length(), .5)
    this.velocity = this.velocity.normalize(speed);
    sound_bounce.play(this.pos, 1, speed * 1.25);
    //ghostBall = new GhostBall();//
    if (o == player) {
        this.velocity = this.velocity.rotate(.1 * (this.pos.y - o.pos.y));
        this.velocity.x = max(-this.velocity.x, .3);
        return 0;
    }
    return 1;
}
render() {
    for (let t of this.trail) {
        t.render();
    }
    super.render();
}
}
/*
class GhostBall extends EngineObject {
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
}
*/

class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size);
        this.setCollision();
        this.mass = 0;
        this.elasticity = 1;
        this.color = rgb(0, 0, 0)
    }
}

class Trail {
    constructor(position, size, color, lifeSpan) {
        this.position = position;   // Position of the trail segment
        this.size = size;           // Size of the trail segment
        this.color = color;         // Color of the trail (with alpha)
        this.lifeSpan = lifeSpan;   // How long the trail lasts before fading
        this.age = 0;               // How old the trail segment is
    }

    // Update the trail's lifespan and fade it out
    update() {
        this.age++;
        this.color = rgb(1, 1, 1, 1 - this.age / this.lifeSpan); // Fades out over time
    }

    // Render the trail
    render() {
        drawCircle(this.position, this.size, this.color);
    }
}
///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    canvasFixedSize = vec2(1280, 720);
    levelSize = vec2(38, 20);
    cameraPos = levelSize.scale(.5);
    player = new Player(vec2(levelSize.y));
    computer = new Computer(vec2(levelSize.y));
    const pos = vec2();
    new Wall(vec2(levelSize.x / 2, -2), vec2(levelSize.x + 10, 2));
    new Wall(vec2(levelSize.x / 2, levelSize.y + 2), vec2(levelSize.x + 10, 2));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    if (ball) {
        if (ball.pos.x > 39) {
            playerScore++;
            ball.destroy();
            ball = 0;
        } else if (ball.pos.x < -1) {
            computerScore++;
            ball.destroy();
            ball = 0;
        }
    }

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
    for (let y = 0; y < levelSize.y; y += .8999) {
        drawRect(vec2(levelSize.x / 2, y), vec2(0.25, 0.5), hsl(0, 0, 1));
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    drawTextScreen(computerScore, vec2(900, 60), 50);
    drawTextScreen(playerScore, vec2(360, 60), 50);
    if (!ball) {
        drawText("Click to Play", cameraPos.add(vec2(0 + Math.sin(time * 2.1) * 2, 2)), 1);
    }
}
///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);