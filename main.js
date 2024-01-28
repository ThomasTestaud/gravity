document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    function resizeCanvas() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    class Ball {
        constructor(x, y, size, color = "blue", xSpeed = 0, ySpeed = 0) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.xSpeed = xSpeed;
            this.ySpeed = ySpeed;
            this.color = color;
        }
    }

    let balls = [
        new Ball(canvas.width / 2, canvas.height / 2, 43, "yellow"),
        new Ball(canvas.width / 2, canvas.height / 2 + 100, 8, "pink", 1),
        new Ball(canvas.width / 2, canvas.height / 2 - 200, 20, "orange", -0.4),
        new Ball(canvas.width / 2, canvas.height / 2 - 240, 5, "brown", 0.8),
        new Ball(canvas.width / 2 + 300, canvas.height / 2, 2, "grey", 0, -0.9),
        new Ball(canvas.width / 2 - 300, canvas.height / 2, 2, "white", 0, 1.1),
    ];
    let colors = ["pink", "orange", "brown", "grey", "white", "cyan", "green"]


    let amount = 200;
    let ballWidth = 3;
    function fillArray() {
        for(let i = 0; i < amount; i++) {
            balls.push(new Ball(canvas.width / 2 + (Math.random() * 2000 - 1000), canvas.height / 2 + (Math.random() * 2000 - 1000), ballWidth, colors[Math.round(Math.random() * colors.length)], Math.random(), Math.random()));
        }
    }
    
    /////////////////////////////////
    //         DOM STUFF           //
    /////////////////////////////////
    
    let amoutInput = document.getElementById('amount');
    amoutInput.value = amount;
    amoutInput.addEventListener('input', () => {
        amount = amoutInput.value;
        balls = [];
        fillArray();
        draw();
    });
    
    
    let ballSizeInput = document.getElementById('ballSize');
    ballSizeInput.value = ballWidth;
    ballSizeInput.addEventListener('input', () => {
        let inputValue = parseInt(ballSizeInput.value, 10); // Convert the input value to an integer
        if (!isNaN(inputValue) && inputValue > 0) { // Check if the value is a number and positive
            ballWidth = inputValue;
        } else {
            ballWidth = 3;
        }
    });


    let xLast = null;
    let yLast = null;
    let xNew = null;
    let yNew = null;
    let throwing = false; 
    canvas.addEventListener('mousedown', (event) => {
        xLast = event.clientX;
        yLast = event.clientY;
        throwing = true;
    })
    canvas.addEventListener('mousemove', (event) => {
        xNew = event.clientX;
        yNew = event.clientY;
        /*if(!play) {
            draw();
            drawTrowLine()
        }*/
    })
    canvas.addEventListener('mouseup', (event) => {
        throwing = false;
        balls.push(new Ball(xLast, yLast, ballWidth, colors[Math.round(Math.random() * colors.length)], (xLast - xNew) / 50, (yLast - yNew) / 50));
        if (!play) {
            draw();
        }
    })

    function drawTrowLine() {
        if (throwing) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(xLast, yLast, ballWidth, 0, 2 * Math.PI);
            ctx.fill();
            
            
            ctx.strokeStyle = "white";
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(xLast, yLast);
            ctx.lineTo(xNew, yNew);
            ctx.stroke();
        }
    }

    /////////////////////////////////


    function combinedCircleRadius(radius1, radius2) {
        return Math.sqrt(radius1 * radius1 + radius2 * radius2);
    }

    function getArea(radius) {
        return Math.PI * radius * radius;
    }

    function getBackIntoScreen(ball) {
        if (ball.x < 0) {
            ball.x = screenWidth;
        } else if (ball.x > screenWidth) {
            ball.x = 0;
        }

        if (ball.y < 0) {
            ball.y = screenHeight;
        } else if (ball.y > screenHeight) {
            ball.y = 0;
        }
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
            getBackIntoScreen(ball);
            lookForInfluence(ball);
            ball.y += ball.ySpeed;
            ball.x += ball.xSpeed;
        });
    }

    function draw() {
        const zoom = 1;
        const xOffSet = 0//balls[0].x || 0;
        const yOffSet = 0//balls[0].y || 0;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        balls.forEach(ball => {
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc((ball.x - xOffSet) * zoom /*+ screenWidth/2*/, (ball.y - yOffSet) * zoom /*+ screenHeight/2*/, ball.size*zoom, 0*zoom, (2 * Math.PI)*zoom);
            ctx.fill();
        });
    }

    let play = true;
    function mainLoop() {
        if (play) {
            update();
            draw();
            drawTrowLine();
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



    
});
