document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    class Ball {
        constructor(x, y, size, color = blue, xSpeed = 0, ySpeed = 0) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.xSpeed = xSpeed;
            this.ySpeed = ySpeed;
            this.color = color;
        }
    }

    let balls = [
        new Ball(canvas.width / 2, canvas.height / 2, 45, "yellow"),
        new Ball(canvas.width / 2, canvas.height / 2 + 100, 10, "pink", 0.7),
        new Ball(canvas.width / 2, canvas.height / 2 - 200, 20, "orange", -0.4),
        new Ball(canvas.width / 2, canvas.height / 2 - 240, 5, "brown", 0.8),
    ];



    function combinedCircleRadius(radius1, radius2) {
        return Math.sqrt(radius1 * radius1 + radius2 * radius2);
    }

    function getArea(radius) {
        return Math.PI * radius * radius;
    }

    function lookForInfluence(ball) {
        for (let i = 0; i < balls.length; i++) {
            if (ball !== balls[i]) {
                let xDistance = ball.x - balls[i].x;
                let yDistance = ball.y - balls[i].y;
                let distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

                if (distance < ball.size + balls[i].size) {
                    ball.size = combinedCircleRadius(ball.size, balls[i].size);
                    const areaI = getArea(balls[i].size);
                    const areaBall = getArea(ball.size);
                    const totalArea = areaI + areaBall;

                    ball.xSpeed = (balls[i].xSpeed * areaI + ball.xSpeed * areaBall) / totalArea;
                    ball.ySpeed = (balls[i].ySpeed * areaI + ball.ySpeed * areaBall) / totalArea;
                    ball.x = (balls[i].x * areaI + ball.x * areaBall) / totalArea;
                    ball.y = (balls[i].y * areaI + ball.y * areaBall) / totalArea;

                    balls.splice(i, 1);
                    i--;
                } else {
                    let angle = Math.atan2(yDistance, xDistance);
                    let force = (balls[i].size / ball.size) / (distance * distance * 0.1);
                    ball.xSpeed -= Math.cos(angle) * force;
                    ball.ySpeed -= Math.sin(angle) * force;
                }
            }
        }
    }

    function update() {
        balls.forEach(ball => {
            lookForInfluence(ball);
            ball.y += ball.ySpeed;
            ball.x += ball.xSpeed;
        });
    }

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        balls.forEach(ball => {
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    let play = true;
    function mainLoop() {
        if (play) {
            update();
            draw();
            requestAnimationFrame(mainLoop);
        }
    }

    mainLoop();
    const playBtn = document.getElementById('play');
    playBtn.addEventListener('click', () => {
        play = !play;
        if (play) {
            mainLoop();
        }

    });

    let xLast = null;
    let ylast = null;
    canvas.addEventListener('mousedown', (event) => {
        xLast = event.clientX;
        ylast = event.clientY;
        /*
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(xLast, ylast, 2, 0, 2 * Math.PI); //// DO THAT IN AN OVERLAY ARRAY
        ctx.fill();*/
    })

    /*
    canvas.addEventListener('mousemove', (event) => {
        if (xLast && ylast) {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(xLast, ylast);
            ctx.lineTo(event.clientX, event.clientY); //// DO THAT IN AN OVERLAY ARRAY
            ctx.stroke();
        }
    })*/

    canvas.addEventListener('mouseup', (event) => {
        balls.push(new Ball(xLast, ylast, 2, "blue", (xLast - event.clientX) / 50, (ylast - event.clientY) / 50));
        draw();
    })
});
