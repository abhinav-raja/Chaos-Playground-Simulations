let state;
let cursorStyle = 0;
let obstacleAdditionCountdown = 10;
const INF = 100000000000;

const horizonInputEl = document.getElementById("horizonInput");

function draggable(obj){
    let mouseCollision = (obj.dist(mouseX, mouseY) < obj.size);
    if(mouseCollision){ 
        cursorStyle = 1;
        if(mouseIsPressed){
            obj.dragState = true;
        } else {
            obj.mouseOffsetX = obj.x - mouseX;
            obj.mouseOffsetY = obj.y - mouseY;
        }
    } 
    //If was being dragged
    if(obj.dragState){
        cursorStyle = 1;
        obj.x = mouseX + obj.mouseOffsetX;
        obj.y = mouseY + obj.mouseOffsetY;
        obj.dragState = mouseIsPressed;
    }
}

const chaser = {
    x: 0,
    y: 0,

    maxStepSize: 10,
    horizon: 15,

    mouseOffsetX: 0,
    mouseOffsetY: 0,

    dragState: false,
    
    size: 40,

    dist: function(x0, y0){
        return Math.sqrt(Math.pow(this.x - x0, 2) + Math.pow(this.y - y0, 2));
    },

    draw: function(){
        push();
        fill(0, 200, 200);
        noStroke();
        translate(this.x, this.y);
        ellipse(0, 0, this.size, this.size);
        pop();
    },

    cost: function(x, y){
        let c = 0;
        c += target.dist(x, y);
        for(const obstacle of obstacleList){
            if(obstacle.intersects(x, y)){
                c = INF;
            } else if (dist(obstacle.x, obstacle.y, x, y) < 50){
                c += Math.pow((50 - dist(obstacle.x, obstacle.y, x, y)), 2);
            }
        }
        return c;
    },

        
    mpc: function(){
        let px = this.x;
        let py = this.y;
        let maxStepSize = this.maxStepSize;
        this.horizon = horizonInputEl.value();
        let horizon = this.horizon;

        let minCost = 1e15;
        let minCostAng = 0;
        let minCostStepSize = 0;
        for(let ang = 0; ang < 360; ang+=4){
            for(let stepMult = 1; stepMult <= 3; stepMult++){
                let step = stepMult*maxStepSize/3;
                let totalCost = 0;
                for(let i = 0; i < horizon; i++){
                    let x = px + i*step*cos(ang);
                    let y = py + i*step*sin(ang);
                    totalCost += this.cost(x, y);
                }
                if(totalCost < minCost){
                    minCost = totalCost;
                    minCostAng = ang;
                    minCostStepSize = step;
                }
            }
        }
        // console.log(minCost);
        // console.log(minCostAng);
        // console.log(minCostStepSize);
        let optx = px + minCostStepSize*cos(minCostAng);
        let opty = py + minCostStepSize*sin(minCostAng);
        this.x = optx;
        this.y = opty;
    },
  
    update: function(){
        if(state == "EDIT"){
            draggable(this);
        } else if (state == "PLAY"){
            this.mpc();
        }
    }
};

const target = {
    x: 0,
    y: 0,

    mouseOffsetX: 0,
    mouseOffsetY: 0,

    dragState: false,

    size: 40,

    dist: function(x0, y0){
        return Math.sqrt(Math.pow(this.x - x0, 2) + Math.pow(this.y - y0, 2));
    },

    draw: function(){
        push();
        fill(255, 153, 0);
        noStroke();
        translate(this.x + this.size/2, this.y + this.size/2);
        rotate(45);
        rect(0, 0, this.size, this.size);
        pop();
    },

    update: function(){
        if(state == "EDIT"){
            draggable(this);
        } else if (state == "PLAY"){
            //Stationary target, does nothing
        }
    }
};

function Obstacle(x, y){
    let obj = {
        size: 20,
        x: x,
        y: y,

        draw: function(){
            push();
            fill(255, 32, 113);
            noStroke();
            ellipse(this.x, this.y, this.size);
            pop();
        },

        intersects: function(x, y){
            let d = dist(x, y, this.x, this.y);
            return d <= this.size;
        }
    };
    return obj;
}

let obstacleList = [];

function reset(){
    target.x = 0.7*windowWidth;
    target.y = 0.4*windowHeight;

    chaser.x = 0.1*windowWidth;
    chaser.y = 0.4*windowHeight;

    state = "EDIT";

    obstacleList = [];
}

function setup() {
    let cnv = createCanvas(0.8*windowWidth, 0.8*windowHeight);
    angleMode(DEGREES);
  
    reset();
}

function draw() {
    cursorStyle = 0;
    background(255);
    
    //Do no matter what
    
    target.update();
    target.draw();
    chaser.update();
    chaser.draw();
    if(cursorStyle == 1) cursor("grab");
    else cursor(ARROW);

    if(state === "EDIT"){
        if(cursorStyle == 0 && mouseIsPressed){
            obstacleList.push(Obstacle(mouseX, mouseY));
            // let obs = Obstacle(mouseX, mouseY);
            // obstacleList.push(obs);
            // print(obstacleList);
            obstacleAdditionCountdown = 1;
        }
    } 

    for(const obstacle of obstacleList){
        //console.log(obstacle);
        obstacle.draw();
    }

    obstacleAdditionCountdown--;
}

function keyReleased() {
    if (keyCode === 32){
        if(state === "EDIT") state = "PLAY";
        else state = "EDIT";
    } else if (keyCode === 8){
        reset();
    }
    return false; // prevent any default behavior
}
