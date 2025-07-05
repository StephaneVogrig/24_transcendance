import * as Vec2D from "vector2d"

export class Ball {
    constructor(players)
    {
		this.players = players;
        this.radius = 2.5;
        this.position = new Vec2D.Vector(0, 0);
        this.speed = new Vec2D.Vector(0.42, 0);
    }

    getPosition()
    {
        return this.position;
    }

    applyRebound(paddle)
    {
        const paddleCenter = paddle.getPosition().y;
        const ballCenter = this.position.y;
        const distanceFromCenter = ballCenter - paddleCenter;
        const normalized = distanceFromCenter / (paddle.size / 2);
        const maxBounceAngle = Math.PI / 4;
        const bounceAngle = normalized * maxBounceAngle;
        const speed = Math.hypot(this.speed.x, this.speed.y);

        const direction = this.speed.x > 0 ? -1 : 1;
		const xfactor = (this.speed.x < 0 ? 0.0275 : -0.0275);
		const yfactor = (this.speed.y < 0 ? 0.0275 : -0.0275);
		this.speed.x = direction * speed * Math.cos(bounceAngle) + (this.speed.x < 1.3 ? xfactor : 0);
		this.speed.y = speed * Math.sin(bounceAngle) + (this.speed.y < 1.3 ? yfactor : 0);
    }

    checkPaddleCollision(paddle1, paddle2)
    {
        if (this.speed.x > 0 &&
            this.position.x + this.radius >= paddle1.getPosition().x &&
            this.position.y + this.radius >= paddle1.getPosition().y - paddle1.size / 2 &&
            this.position.y - this.radius <= paddle1.getPosition().y + paddle1.size / 2) {
                this.applyRebound(paddle1);
        }

        if (this.speed.x < 0 &&
            this.position.x - this.radius <= paddle2.getPosition().x &&
            this.position.y + this.radius >= paddle2.getPosition().y - paddle2.size / 2 &&
            this.position.y - this.radius <= paddle2.getPosition().y + paddle2.size / 2) {
                this.applyRebound(paddle2);
        }
    }

    checkWallCollision()
    {
        if (this.position.y - this.radius <= -25 || this.position.y + this.radius >= 25) {
            this.position.y = Math.max(-25, Math.min(25, this.position.y));
            this.speed.y = -this.speed.y;
        }

        if (this.position.x - this.radius <= -53 || this.position.x + this.radius >= 53) {
			this.players[this.position.x - this.radius <= -53 ? 1 : 0].score++;
            this.position.x = 0;
            this.position.y = 0;
            this.speed.x = Math.random() < 0.5 ? -0.42 : 0.42;
            this.speed.y = 0;
        }
    }

    move(paddle1, paddle2)
    {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        this.checkPaddleCollision(paddle1, paddle2);
        this.checkWallCollision();
    }

}