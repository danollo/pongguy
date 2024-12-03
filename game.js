"use strict";
let ball;
let levelSize;
let player;
let computer;
let playerScore = 0;
let computerScore = 0;
const sound_bounce = new Sound([0.7, , 106, 0.01, 0.05, 0.04, 3, 2.8, -17, 20, , , , , , , 0.04, 0.92, 0.02, , -1490,]);
const antialiasing = setCanvasPixelated();
fontDefault = "'Press Start 2P', sans-serif";
class Player extends EngineObject {
    constructor(pos) {
        super(vec2(0, 1), vec2(0.6, 3.25), 0);
        this.mass = 0;
        this.setCollision();
    }
    update() {
        this.pos.y = mousePos.y;
        this.pos.y = clamp(
            this.pos.y,
            this.size.y / 2,
            levelSize.y - this.size.y / 2
        );
    }
}
class Computer extends EngineObject {
    constructor(pos) {
        super(vec2(levelSize.x, 0.5), vec2(0.6, 3.25), 0);
        this.mass = 0;
        this.setCollision();
    }
    update() {
        if (ball) {
            let speedFactor = 0.3 + Math.tanh(0.1 * (playerScore + computerScore));

            this.pos.y += (ball.pos.y - this.pos.y) * speedFactor;

            this.pos.y = clamp(
                this.pos.y,
                this.size.y / 2,
                levelSize.y - this.size.y / 2
            );
        }
    }
}
class Ball extends EngineObject {
    constructor(pos) {
        super(pos, vec2(0.5), tile(0));
        this.setCollision();
        this.velocity = vec2(-0.1, -0.1);
        this.elasticity = 1;
        this.trail = [];
        this.trailLifeSpan = 12;
        this.trailSize = 0.2;
    }
    update() {
        if (this.pos.y - this.halfSizeY < 0 || this.pos.y + this.halfSizeY > levelSize.y) {
            this.pos.y = clamp(this.pos.y, this.halfSizeY, levelSize.y - this.halfSizeY);
            this.velocity.y *= -1;
        }

        this.trail.push(
            new Trail(
                this.pos.copy(),
                this.trailSize,
                rgb(1, 0, 0, 0.5),
                this.trailLifeSpan
            )
        );
        this.trail = this.trail.filter((trail) => trail.age < trail.lifeSpan);

        for (let t of this.trail) {
            t.update();
        }
        super.update();
    }
    collideWithObject(o) {
        const speed = min(1.04 * this.velocity.length(), 0.5);
        this.velocity = this.velocity.normalize(speed);
        sound_bounce.play(this.pos, 1, speed * 1.25);
        const angleAdjustment = 75 * ((this.pos.y / o.size.y) * (75 * 2));
        if (o == player) {
            //this.velocity = this.velocity.rotate(.1 * (this.pos.y - o.pos.y));
            this.velocity = this.velocity = this.velocity.rotate(angleAdjustment);
            this.velocity.x = max(-this.velocity.x, 0.3);
            return 0;
        } else if (o == computer) {
            //this.velocity = this.velocity.rotate(.1 * (this.pos.x - o.pos.x));
            this.velocity = this.velocity.rotate(angleAdjustment);
            this.velocity.x = max(this.velocity.x, 0.3);
        }
        return 1;
    }
    render() {
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const t = this.trail[i];
            t.update();
            if (t.age >= t.lifeSpan) this.trail.splice(i, 1);
        }
        super.render();
    }
}
class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size);
        this.setCollision();
        this.mass = 0;
        this.elasticity = 1;
        this.color = rgb(0, 0, 0);
    }
}
class Trail {
    constructor(position, size, color, lifeSpan) {
        this.position = position;
        this.size = size;
        this.color = color;
        this.lifeSpan = lifeSpan;
        this.age = 0;
    }
    update() {
        this.age++;
        this.color = rgb(1, 1, 1, 1 - this.age / this.lifeSpan);
    }

    // Render the trail
    render() {
        drawCircle(this.position, this.size, this.color);
    }
}
function gameInit() {
    canvasFixedSize = vec2(1280, 720);
    levelSize = vec2(38, 20);
    cameraPos = levelSize.scale(0.5);
    player = new Player(vec2(levelSize.y));
    computer = new Computer(vec2(levelSize.y));
    const pos = vec2();
    new Wall(vec2(levelSize.x / 2, -2), vec2(levelSize.x + 10, 2));
    new Wall(vec2(levelSize.x / 2, levelSize.y + 2), vec2(levelSize.x + 10, 2));
}
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

    if (!ball && mouseWasPressed(0)) {
        ball = new Ball(vec2(levelSize.x / 2, levelSize.y / 2));
    }
}
function gameUpdatePost() { }
function gameRender() {
    for (let y = 0; y < levelSize.y; y += 0.8999) {
        drawRect(vec2(levelSize.x / 2, y), vec2(0.25, 0.5), hsl(0, 0, 1));
    }
}
function gameRenderPost() {
    drawTextScreen(computerScore, vec2(900, 60), 50);
    drawTextScreen(playerScore, vec2(360, 60), 50);
    if (!ball) {
        drawText(
            "Click to Play",
            cameraPos.add(vec2(0 + Math.sin(time * 2.1) * 2, 2)),
            1
        );
    }
}
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
