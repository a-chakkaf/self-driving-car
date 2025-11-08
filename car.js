class Car {
	constructor(x, y, width, height, controlType, maxSpeed = 3) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = 0;
		this.accelaration = 0.2;
		this.maxSpeed = maxSpeed;
		this.friction = 0.05;
		this.angle = 0;
		this.damaged = false;
		this.polygon = [];

		this.useBrain = controlType == "AI";

		if (controlType != "DOMMY") {
			this.sensor = new Sensor(this);

			this.brain = new NeuralNetwork(
				[this.sensor.rayCount, 6, 4]
			);
		}
		this.control = new Control(controlType);
	}

	update(borders, traffic) {
		if (!this.damage) {
			this.#move();
			this.polygon = this.#createPolygon();
			this.damage = this.#assessDamage(borders, traffic);
		}
		if (this.sensor) {
			this.sensor.update(borders, traffic);
			const offsets = this.sensor.readings.map(
				s => s == null ? 0 : 1 - s.offset
			);
			const outputs = NeuralNetwork.feedForward(offsets, this.brain);

			// console.log(outputs);

			if (this.useBrain) {
				this.control.forward = outputs[0];
				this.control.left = outputs[1];
				this.control.right = outputs[2];
				this.control.reverse = outputs[3];
			} 
		}

	}

	#assessDamage(borders, traffic) {
		for (let i = 0; i < borders.length; i++) {
			if (polyIntersection(this.polygon, borders[i])) {
				return true;
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			if (polyIntersection(this.polygon, traffic[i].polygon)) {
				return true;
			}
		}
		return false;
	}

	#move() {
		if (this.control.forward) {
			this.speed += this.accelaration;
		}
		if (this.control.reverse) {
			this.speed -= this.accelaration;
		}

		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		}
		if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2;
		}

		if (this.speed > 0) {
			this.speed -= this.friction;
		}
		if (this.speed < 0) {
			this.speed += this.friction;
		}

		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		if (this.speed != 0) {

			const flip = this.speed > 0 ? 1 : -1;

			if (this.control.left) {
				this.angle += 0.03 * flip;
			}
			if (this.control.right) {
				this.angle -= 0.03 * flip;
			}
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	#createPolygon() {

		const polygon = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);

		polygon.push({
			x: this.x - rad * Math.sin(this.angle - alpha),
			y: this.y - rad * Math.cos(this.angle - alpha)
		});

		polygon.push({
			x: this.x - rad * Math.sin(this.angle + alpha),
			y: this.y - rad * Math.cos(this.angle + alpha)
		});

		polygon.push({
			x: this.x - rad * Math.sin(Math.PI + this.angle - alpha),
			y: this.y - rad * Math.cos(Math.PI + this.angle - alpha)
		});

		polygon.push({
			x: this.x - rad * Math.sin(Math.PI + this.angle + alpha),
			y: this.y - rad * Math.cos(Math.PI + this.angle + alpha)
		});

		return polygon;
	}

	draw(ctx, color, drawSensor = false) {
		if (this.damage) {
			ctx.fillStyle = "gray";
		} else {
			ctx.fillStyle = color;
		}

		ctx.save();
		ctx.beginPath();

		ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
		for (let i = 1; i < this.polygon.length; i++) {
			ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
		}

		ctx.fill();
		ctx.restore();
		if (this.sensor && drawSensor)
			this.sensor.draw(ctx);
	}
}
