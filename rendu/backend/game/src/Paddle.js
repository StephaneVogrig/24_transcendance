import * as Vec2D from "vector2d"

export class Paddle {
    constructor(side)
    {
        this.side = side;
        if (side === 'left')
            this.position = new Vec2D.Vector(47, 0);
        else if (side === 'right')
            this.position = new Vec2D.Vector(-47, 0);
        this.size = 11.5;
        this.speed = 0.5;
    }

    moveUp()
    {
        if (this.position.y + this.size / 2 <= 25)
            this.position.y += this.speed;
    }

    moveDown()
    {
        if (this.position.y - this.size / 2 >= -25)
            this.position.y -= this.speed;
    }

    getPosition()
    {
        return this.position;
    }
}