const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1;
const cars = generateCars(N);

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.2);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(2), -100, 30, 50, "DOMMY", 1.5),
    new Car(road.getLaneCenter(1), -200, 30, 50, "DOMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DOMMY", 3),
    new Car(road.getLaneCenter(0), -400, 30, 50, "DOMMY", 0.5),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DOMMY", 1),
    new Car(road.getLaneCenter(2), -600, 30, 50, "DOMMY", 1.4),
    new Car(road.getLaneCenter(0), -700, 30, 50, "DOMMY", 2),
    new Car(road.getLaneCenter(0), -800, 30, 50, "DOMMY", 1),
]

animation();

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function animation(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y)));

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "black");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "black", true);

    carCtx.restore();
    networkCtx.lineDashOffset = -time / 55;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animation);
}
