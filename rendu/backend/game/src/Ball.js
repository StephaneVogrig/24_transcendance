import * as Vec2D from "vector2d"

export class Ball {
    constructor()
    {
        this.radius = 2.5;
        this.position = new Vec2D.Vector(0, 0);
        this.speed = new Vec2D.Vector(0.375, 0);
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
        this.speed.x = direction * speed * Math.cos(bounceAngle) + 0.2;
        this.speed.y = speed * Math.sin(bounceAngle) + 0.2;
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
            this.position.x = 0;
            this.position.y = 0;
            this.speed.x = Math.random() < 0.5 ? -1 : 1;
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