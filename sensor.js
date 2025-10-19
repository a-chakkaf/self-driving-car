class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 3;
        this.rayLength = 100;
        this.raySpread = Math.PI / 4;

        this.rays = [];
    }

    update(){

        for (let i = 0; i < this.rayCount; i++){
            const angle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                i / (this.rayCount - 1)
            );

            const start = {x: this.car.x, y: this.car.y};

            const end = {
                x: this.car.x - Math.sin(angle) * this.rayLength,
                y: this.car.y - Math.cos(angle) * this.rayLength
            }
            this.rays.push([start, end]);
        }
    }

    draw(ctx){
        this.rays.forEach(ray => {
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(ray[0].x, ray[0].y);
            ctx.lineTo(ray[1].x, ray[1].y);
            ctx.stroke();
        });
    }
}