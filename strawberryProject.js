"use strict";

let ctx;
let topY = 30;
let rightX = 1000;
let bottomY = 600;
let level = 1;
let timer;
let tenthOfSecond = 0;
let strawbsCaught = 0;

let kiki = {
    x: 105,
    y: 160,
	speed: 12,
    hasBasket: false,
    hasStrawb: false,
    movingR: true,
    movingL: false
}

let strawbsArray = [];

let basketX = 970;
let basketY = 570;

let villagesArray = [];
let designatedVill;
let needDelivery = false;

let beesArray = [];

//sets interval for animation function and accesses context in Canvas.
function setup () {
    ctx = document.getElementById("gameCanvas").getContext("2d");
    draw();
    document.getElementById("progressDisplay").innerHTML = "Level " + level + ": Grab the basket. Be careful, Jiji will eat the strawberry if you touch it.";
    timer = setInterval(strawbBeeAnimation, 100);
}

//reset variables to original values.
function reset () {
    stopAnimation();
    tenthOfSecond = 0;
    strawbsArray = [];
    strawbsCaught = 0;
    kiki.x = 105;
    kiki.y = 160;
    kiki.movingR = true;
    kiki.movingL = false;
    kiki.hasStrawb = false;
    kiki.hasBasket = false;
    basketX = 970;
    basketY = 570;
    villagesArray = [];
    beesArray = [];
    setup();
}

//reset to level one settings.
function resetToLv1 () {
    level = 1;
    reset();
}

//stop animation via clear interval.
function stopAnimation () {
    clearInterval(timer);
}

//By locating the event key, it moves the player accordingly.
function moveKiki (e) {
    if (e.key == "ArrowLeft" && kiki.x >= 0) {
        kiki.x -= kiki.speed;
        kiki.movingR = false;
        kiki.movingL = true;
    } else if (e.key == "ArrowRight" && kiki.x <= 1000) {
        kiki.x += kiki.speed;
        kiki.movingL = false;
        kiki.movingR = true;
    }
	if (e.key == "ArrowUp" && kiki.y >= 40) {
        kiki.y -= kiki.speed;
    } else if (e.key == "ArrowDown" && kiki.y <= 600) {
        kiki.y += kiki.speed;
    }
}

//draws bees, strawberries, villages and things that need to be continuously updated.
function strawbBeeAnimation () {
    tenthOfSecond++;
    if (tenthOfSecond == 1 || tenthOfSecond%30 == 0) {
        addANewStrawb(); //add a new strawb every 3 seconds.
        for (let k = 0; k < beesArray.length; k++) {
            beesArray[k].xSpeed = randomPosNegSpeed(); //bee changes direction every 3 seconds.
            beesArray[k].ySpeed = randomPosNegSpeed();
        }
    }
    if (villagesArray.length == 0) {
        addANewVillage(); //add a new village when there are no villages.
        if (level >= 2) {
            for (let j = 0; j < 2*level - 1; j++) {
                addANewVillage();
            }
        }
    }
    if (beesArray.length == 0) {
        addANewBee(); //add a new bee when there are no bees.
        if (level >= 2) {
            for (let i = 0; i < level-1; i++) {
                addANewBee();
            }
        }
    }
    if (tenthOfSecond > 20) {
        for (let k = 0; k < beesArray.length; k++) {
            beesArray[k].x += beesArray[k].xSpeed;
            beesArray[k].y += beesArray[k].ySpeed;
            if (beesArray[k].x <= 0 || beesArray[k].x >= 1000) {
                beesArray[k].xSpeed *= -1;
            } else if (beesArray[k].y <= 35 || beesArray[k].y >= 600) {
                beesArray[k].ySpeed *= -1;
            }
        }  
    }
    for (let i = 0; i < strawbsArray.length; i++) {
        strawbsArray[i].y += strawbsArray[i].ySpeed;
    }
    drawStrawberriesAndBee(); //draw strawbs at new coordinate with y increased by their ySpeed property.
    collision();
    if (strawbsCaught > 0 && strawbsCaught < 5) {
        document.getElementById("progressDisplay").innerHTML = "Catch " + (5-strawbsCaught) + " more strawberries.";
    } else if (strawbsCaught == 5) {
        level++;
        if (level > 3) {
            document.getElementById("progressDisplay").innerHTML = "Congratulations! You completed the game."
            stopAnimation();
            level = 1;
        } else if (level < 4) {
            alert("Level " + level);
            reset();
        }
    }
}

//detects collision between different objects/values and displays user messages.
function collision () {
    let basketWithinKiki = withinRadius(kiki.x + 20, kiki.y, 50, 40, basketX, basketY);
    if (basketWithinKiki) {
        kiki.hasBasket = true;
        document.getElementById("progressDisplay").innerHTML = "Catch a Strawberry. Be careful, Jiji will eat the strawberry if you have a full basket.";
    }
    let strawbWithinBasket;
    let strawbWithinKiki;
    let kikiWStrawbWithinVillage;
    for (let i = 0; i < strawbsArray.length; i++) {
        if (kiki.hasStrawb) {
            needDelivery = true;
        }
        if (needDelivery && designatedVill == undefined) {
            designatedVill = villageInNeedIndex();
        }
        if (kiki.movingR) {
            strawbWithinBasket = withinRadius(kiki.x + 50, kiki.y + 20, 25, 25, strawbsArray[i].x, strawbsArray[i].y);
        } else if (kiki.movingL) {
            strawbWithinBasket = withinRadius(kiki.x - 50, kiki.y + 20, 25, 25, strawbsArray[i].x, strawbsArray[i].y);
        }
        if (!kiki.hasStrawb && kiki.hasBasket && strawbWithinBasket) { //if kiki has basket and does not have strawb, and she catches a strawb
            strawbsArray.splice(i,1);
            kiki.hasStrawb = true;
            i--;
        }  
        if (kiki.hasStrawb && kiki.hasBasket || !kiki.hasBasket) { //stopping the game when strawb touches kiki with a full basket or kiki without a basket.//if the strawb is inside the basket
                strawbWithinKiki = withinRadius(kiki.x, kiki.y, 35, 40, strawbsArray[i].x, strawbsArray[i].y);
            if (strawbWithinKiki) {
                stopAnimation();
                document.getElementById("progressDisplay").innerHTML = "You lost! Jiji ate the strawberry.";
                level = 1;
            }
        } 
        for (let j = 0; j < villagesArray.length; j++) {
            if (level == 1) {
                let centerX = villagesArray[j].x + (villagesArray[j].width/2);
                let centerY = villagesArray[j].y + (villagesArray[j].height/2);
                kikiWStrawbWithinVillage = withinRadius(centerX, centerY, villagesArray[j].width +20, villagesArray[j].height, kiki.x, kiki.y);
            } else if (level >= 2 && needDelivery) {
                let toCenterOnX = villagesArray[designatedVill].width+20;
                let toCenterOnY = villagesArray[designatedVill].height;
                let designatedX = villagesArray[designatedVill].x + toCenterOnX/2;
                let designatedY = villagesArray[designatedVill].y + toCenterOnY/2;
                kikiWStrawbWithinVillage = withinRadius(designatedX, designatedY, toCenterOnX, toCenterOnY, kiki.x, kiki.y);
            }
            if (kiki.hasStrawb && kikiWStrawbWithinVillage) { //if kiki has strawb and delivers it to the village
                kiki.hasStrawb = false;
                strawbsCaught++;
                needDelivery = false;
                designatedVill = undefined;
            }
        }
    }
    let beeWithinKikiRadius;
    for (let k = 0; k < beesArray.length; k++) {
        beeWithinKikiRadius = withinRadius(kiki.x, kiki.y, 30, 40, beesArray[k].x, beesArray[k].y)
        if (beeWithinKikiRadius) {
            stopAnimation();
            document.getElementById("progressDisplay").innerHTML = "You lost. Kiki got stung by the bee.";
            level = 1;
        }    
    }
}

//a constructor for strawberry.
function Strawb (xVal, yVal, radius, ySpeed, inBasket) {
    this.x = xVal;
    this.y = yVal;
    this.rad = radius;
    this.ySpeed = ySpeed;
    this.inBasket = inBasket;
    this.drawStrawb = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2*Math.PI); //strawb body
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x-5,this.y, 1, 0, 2*Math.PI); //seed1
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x-1, this.y+7, 1, 0, 2*Math.PI); //seed2
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x+6, this.y+2, 1, 0, 2*Math.PI);//seed3
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x+1, this.y-3, 1, 0, 2*Math.PI); //seed4
        ctx.fill();

        ctx.save();
        ctx.translate(this.x+3, this.y-5);
        ctx.rotate(25*Math.PI/180);

        ctx.beginPath();
        ctx.lineTo(-1, -8); //stalk
        ctx.lineTo(-1, -12);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "green";
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(-8, -3); //leaf1
        ctx.lineTo(-10, 5);
        ctx.lineTo(-2, -3);
        ctx.lineTo(-8, -3);
        ctx.fillStyle = "green";
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(-3, -3); //leaf2
        ctx.lineTo(2, 3);
        ctx.lineTo(3, -3);
        ctx.lineTo(-2, -3);
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(7, -3); //leaf3
        ctx.lineTo(10, 6);
        ctx.lineTo(2, -3);
        ctx.lineTo(7, -3);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 8, 200*Math.PI/180, 340*Math.PI/180); //leaf body
        ctx.fill();
        ctx.restore();
    }
}

//adds a new strawb with according properties
function addANewStrawb () {
    let xVal = randomXCoord();
    let yVal = topY;
    let radius;
    if (level == 1) {
        radius = 10;
    } else if (level >= 2) {
        radius = randomStrawbRadius();
    }
    let ySpeed = randomPosSpeed(); 
    let inBasket = false;
    let strawbObj = new Strawb (xVal, yVal, radius, ySpeed, inBasket); //call constructor Strawb to create strawb objects with corresponding properties.
    strawbsArray.push(strawbObj); //add objects to array.
}

//draws strawberries and bees in its arrays.
function drawStrawberriesAndBee () {
    ctx.clearRect(0, 0,rightX,bottomY);
    draw(); //draw everything other than strawbs and bee.
    for (let k = 0; k < beesArray.length; k++) {
        beesArray[k].drawBee(); //draw bee object.
    }
    for (let i = 0; i < strawbsArray.length; i++) {
        strawbsArray[i].drawStrawb(); //at index i of strawb object, call method inside drawstrawb property.
    }
}

//a constructor for bee object.
function Bee (xVal, yVal, xSpeed, ySpeed) {
    this.x = xVal;
    this.y = yVal;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.drawBee = function () {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.arc(0, -10, 8, Math.PI/2, 270*Math.PI/180);
        ctx.fillStyle = "Powderblue";
        ctx.fill();

        ctx.rotate(-45*Math.PI/180);
        ctx.beginPath();
        ctx.arc(-6, -10, 8, 270*Math.PI/180, Math.PI/2);
        ctx.fillStyle = "Powderblue";
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2*Math.PI); //bee
        ctx.fillStyle = "yellow";
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(10*Math.cos(220*Math.PI/180), 10*Math.sin(220*Math.PI/180)); //bee body line1
        ctx.lineTo(10*Math.cos(80*Math.PI/180), 10*Math.sin(80*Math.PI/180));
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(10*Math.cos(260*Math.PI/180), 10*Math.sin(260*Math.PI/180)); //bee body line2
        ctx.lineTo(10*Math.cos(40*Math.PI/180), 10*Math.sin(40*Math.PI/180));
        ctx.stroke();

        ctx.restore();
    }
}

//adds a new bee object to array with these properties.
function addANewBee () {
    let xVal = randomBeeXCoord();
    let yVal = randomYCoord();
    let xSpeed = randomPosNegSpeed();
    let ySpeed = randomPosNegSpeed();
    let beeObj = new Bee (xVal, yVal, xSpeed, ySpeed);
    beesArray.push(beeObj);
}

//a constructor for village object.
function Village (xVal, yVal, width, height, wallColour, roofColour, doorColour) {
    this.x = xVal;
    this.y = yVal;
    this.width = width;
    this.height = height;
    this.wallColour = wallColour;
    this.roofColour = roofColour;
    this.doorColour = doorColour;
}

//adds a new village object to its array with these properties.
function addANewVillage () {
    let xVal;
    let yVal;
    let newWithinExisting = true;
    while (newWithinExisting) {
        xVal = randomVillageX();
        yVal = randomVillageY();
        newWithinExisting = false;
        for (let j = 0; j < villagesArray.length; j++) {
            let existingCentX = villagesArray[j].x + villagesArray[j].width/2;
            let existingCentY = villagesArray[j].y + villagesArray[j].height/2;
            let xRadius = villagesArray[j].width + 60;
            let yRadius = villagesArray[j].height + 60;
            if (withinRadius(existingCentX, existingCentY, xRadius, yRadius, xVal, yVal)) {
                newWithinExisting = true;
            }
        }
    }
    let width = 70; 
    let height = 50;
    let wallColour;
    let newColourEqualsExisting = true;
    while (newColourEqualsExisting) {
        wallColour = randomWallColour();
        newColourEqualsExisting = false;
        for (let i = 0; i < villagesArray.length; i++) {
            if (villagesArray[i].wallColour == wallColour) {
                newColourEqualsExisting = true;
            }
        }
    }
    let roofColour = randomRoofColour();
    let doorColour = randomDoorColour();
    let villageObj = new Village (xVal, yVal, width, height, wallColour, roofColour, doorColour);
    villagesArray.push(villageObj);
}

function randomXCoord () {
    let random = Math.random()*1000;
    if (tenthOfSecond < 30) {
        random = Math.random()*800 + 150;
    }
    return random;
}

function randomYCoord () {
    let random = Math.random()*570 + 30;
    return random;
}

function randomPosSpeed () {
    let random = Math.ceil(Math.random()*7) + 2;
    return random;
}

function randomPosNegSpeed () {
    let random = Math.ceil(Math.random()*20) - 10;
    return random;
}

function randomStrawbRadius () {
    let random = Math.ceil(Math.random()*10) + 7;
    return random;
}

function randomBeeXCoord() {
    let random = Math.random()*700 +200;
    return random;

}

function randomWallColour () {
    let random = Math.ceil(Math.random()*6);
    let colour;
    if (random == 1) {
        colour = "blueViolet";
    } else if (random == 2) {
        colour = "crimson";
    } else if (random == 3) {
        colour = "gold";
    } else if (random == 4) {
        colour = "darkOrange";
    } else if (random == 5) {
        colour = "hotPink";
    } else if (random == 6) {
        colour = "teal";
    }
    return colour;
}

function randomRoofColour () {
    let random = Math.ceil(Math.random()*5);
    let colour;
    if (random == 1) {
        colour = "maroon";
    } else if (random == 2) {
        colour = "darkOliveGreen";
    } else if (random == 3) {
        colour = "goldenRod";
    } else if (random == 4) {
        colour = "darkSalmon";
    } else if (random == 5) {
        colour = "oldLace";
    }
    return colour;
}

function randomDoorColour () {
    let random = Math.ceil(Math.random()*5);
    let colour;
    if (random == 1) {
        colour = "mintCream";
    } else if (random == 2) {
        colour = "pink";
    } else if (random == 3) {
        colour = "turquoise";
    } else if (random == 4) {
        colour = "darkBlue";
    } else if (random == 5) {
        colour = "cadetBlue";
    }
    return colour;
}

function randomVillageX () {
    let random = Math.random()*650 + 150;
    return random;
}

function randomVillageY () {
    let random = Math.random()*400 + 150;
    return random;
}

//chooses random index number for village to be delivered to.
function villageInNeedIndex () {
    let num = 2*level;
    let random = Math.floor(Math.random()*num);
    return random;
}

//detects if object is within radius of another.
function withinRadius (centerX, centerY, xRadius, yRadius, objectX, objectY) {
    let inRadius;
    let leftX = centerX - xRadius;
    let rightX = centerX + xRadius;
    let upperY = centerY - yRadius;
    let lowerY = centerY + yRadius;
    if (objectX >= leftX && objectX <= rightX) {
        if (objectY >= upperY && objectY <= lowerY) {
            inRadius = true;
        }
    }
    return inRadius;
}

//returns distance between two objects.
function distance (x1, y1, x2, y2) {
    let partOne = Math.pow(x1-x2,2);
    let partTwo = Math.pow(y1-y2,2);
    let distance = Math.sqrt(partOne+partTwo);
    return distance;
}

//draws everything on the canvas other than those drawn in animation function
function draw () {
    ctx.beginPath();
    ctx.rect(0, 30, 1000, 570);
    ctx.fillStyle = "lightskyblue";
    ctx.fill();

    drawScenery();

    ctx.beginPath();
    ctx.lineTo(0, topY); //top edge
    ctx.lineTo(rightX, topY);
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.font = "80px, Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Strawberries Caught: ", 15, 15); //Strawbs Text Display

    let x = 150;
    for (let i = 0; i < strawbsCaught; i++) {
        drawStaticStrawb(x, 15);
        x += 50;
    }
    
    if (level >= 2) {
        ctx.beginPath();
        ctx.rect(875, 0, 125, 125); //Delivery display
        ctx.fillStyle = "white";
        ctx.fill();

        ctx.lineTo(875, 0); //Delivery display border
        ctx.lineTo(875, 125);
        ctx.lineTo(1000, 125);
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "100px, Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Deliver to:", 900, 25); //Delivery Display

        if (needDelivery) {
            ctx.save();
            ctx.translate(902, 60);
    
            ctx.beginPath();
            ctx.rect(0, 0, villagesArray[designatedVill].width, villagesArray[designatedVill].height); //village
            ctx.fillStyle = villagesArray[designatedVill].wallColour;
            ctx.fill();

            ctx.beginPath();
            ctx.lineTo(0, 0); //roof
            ctx.lineTo(10, -20);
            ctx.lineTo(villagesArray[designatedVill].width-10, -20);
            ctx.lineTo(villagesArray[designatedVill].width, 0);
            ctx.lineTo(0, 0);
            ctx.fillStyle = villagesArray[designatedVill].roofColour;
            ctx.fill();
            
            ctx.restore();

            ctx.save();
            ctx.translate(902+villagesArray[designatedVill].width/2, 60+villagesArray[designatedVill].height);
            ctx.beginPath();
            ctx.rect(-10, -30, 20, 30); //door
            ctx.fillStyle = villagesArray[designatedVill].doorColour;
            ctx.fill();
            ctx.restore();
        }
    }

    ctx.save();
    ctx.translate(75, 120);
    ctx.beginPath();
    ctx.rect(0, 0, 60, 200); //home
    ctx.fillStyle = "fireBrick";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(-5, 0); //roof
    ctx.lineTo(10, -20);
    ctx.lineTo(20, -20);
    ctx.lineTo(20, -50);
    ctx.lineTo(30, -60); //peak
    ctx.lineTo(40, -50);
    ctx.lineTo(40, -20);
    ctx.lineTo(50, -20);
    ctx.lineTo(65, 0);
    ctx.lineTo(-5, 0);
    ctx.fillStyle = "teal";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(30, 40, 25, 0, 2*Math.PI); //clock
    ctx.fillStyle = "papayaWhip";
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.translate(105, 160);

    ctx.beginPath();
    ctx.lineTo(0, 0); //clock long hand
    ctx.lineTo(0, 20);
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.rotate(45*Math.PI/180);
    ctx.beginPath();
    ctx.lineTo(0, 0); //clock short hand
    ctx.lineTo(0, 15);
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    for (let i = 0; i < villagesArray.length; i++) {
        ctx.save();
        ctx.translate(villagesArray[i].x, villagesArray[i].y);

        ctx.beginPath();
        ctx.rect(0, 0, villagesArray[i].width, villagesArray[i].height); //villages
        ctx.fillStyle = villagesArray[i].wallColour;
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(0, 0) //roofs
        ctx.lineTo(10, -20);
        ctx.lineTo(villagesArray[i].width-10, -20);
        ctx.lineTo(villagesArray[i].width, 0);
        ctx.lineTo(0, 0);
        ctx.fillStyle = villagesArray[i].roofColour;
        ctx.fill();
        
        ctx.restore();

        ctx.save();
        ctx.translate(villagesArray[i].x+villagesArray[i].width/2, villagesArray[i].y+villagesArray[i].height);
        ctx.beginPath();
        ctx.rect(-10, -30, 20, 30); //doors
        ctx.fillStyle = villagesArray[i].doorColour;
        ctx.fill();
        ctx.restore();
    }
    if (kiki.movingR) {
        drawKikiMovingR(); //player facing R
    } else if (kiki.movingL) {
        drawKikiMovingL(); //player facing L
    }
    if (kiki.hasStrawb) {
        if (kiki.movingR) {
            drawStaticStrawb(kiki.x + 60, kiki.y + 22);
        } else if (kiki.movingL) {
            drawStaticStrawb(kiki.x - 60, kiki.y + 22);
        }  
    }
    if (!kiki.hasBasket) {
        drawBasket(basketX, basketY);
    } else if (kiki.hasBasket) {
        if (kiki.movingR) {
            drawBasket(kiki.x + 60, kiki.y + 25);
        } else if (kiki.movingL) {
            drawBasket(kiki.x - 60, kiki.y + 25);
        }
        
    }
}

function drawScenery () {
    ctx.save();
    ctx.translate(1000, 600);

    ctx.beginPath();
    ctx.arc(-200, 1000, 1500, 0, 2*Math.PI); //Greenery
    ctx.fillStyle = "yellowgreen";
    ctx.fill();

    ctx.beginPath(); 
    ctx.arc(-400, 400, 600, 180*Math.PI/180, 280*Math.PI/180); //river bottom
    ctx.lineWidth = 50;
    ctx.strokeStyle = "royalblue";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-350, -590, 400, 20*Math.PI/180, 80*Math.PI/180); //river top
    ctx.lineWidth = 50;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(500, 400);

    ctx.beginPath();
    ctx.arc(0, 0, 200, 345*Math.PI/180, 15*Math.PI/180); //bridge1
    ctx.lineWidth = 50;
    ctx.strokeStyle = "slategrey";
    ctx.stroke();

    ctx.restore();
}

function drawStaticStrawb (xVal, yVal) {
        ctx.save();
        ctx.translate(xVal, yVal);

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2*Math.PI); //strawb body
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-5, 0, 1, 0, 2*Math.PI); //seed1
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-1, 7, 1, 0, 2*Math.PI); //seed2
        ctx.fill();

        ctx.beginPath();
        ctx.arc(6, 2, 1, 0, 2*Math.PI);//seed3
        ctx.fill();

        ctx.beginPath();
        ctx.arc(1, 3, 1, 0, 2*Math.PI); //seed4
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.translate(xVal + 3, yVal - 5);
        ctx.rotate(25*Math.PI/180);

        ctx.beginPath();
        ctx.lineTo(-1, -8); //stalk
        ctx.lineTo(-1, -12);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "green";
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(-8, -3); //leaf1
        ctx.lineTo(-10, 5);
        ctx.lineTo(-2, -3);
        ctx.lineTo(-8, -3);
        ctx.fillStyle = "green";
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(-3, -3); //leaf2
        ctx.lineTo(2, 3);
        ctx.lineTo(3, -3);
        ctx.lineTo(-2, -3);
        ctx.fill();

        ctx.beginPath();
        ctx.lineTo(7, -3); //leaf3
        ctx.lineTo(10, 6);
        ctx.lineTo(2, -3);
        ctx.lineTo(7, -3);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 8, 200*Math.PI/180, 340*Math.PI/180); //leaf body
        ctx.fill();
        ctx.restore();
}

function drawBasket (xVal, yVal) {
    ctx.save();
    ctx.translate(xVal, yVal);

    ctx.beginPath();
    ctx.arc(0, 0, 20, 350*Math.PI/180, 190*Math.PI/180);
    ctx.fillStyle = "peru";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI, 2*Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "peru";
    ctx.stroke();

    ctx.restore();
}

function drawJijiMovingR () {
    ctx.save();
    ctx.translate(kiki.x - 45, kiki.y - 1);

    ctx.beginPath();
    ctx.lineTo(-6, 8); //left ear
    ctx.lineTo(-5, -6);
    ctx.lineTo(-1, 0);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(6, 8); //right ear
    ctx.lineTo(5, -6);
    ctx. lineTo(1, 0);
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x - 45, kiki.y + 20);

    ctx.beginPath();
    ctx.arc(-6, -2, 10, 90*Math.PI/180, 210*Math.PI/180); //bottom tail
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-21, -9, 7, 270*Math.PI/180, 20*Math.PI/180); //top tail
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -2, 9, 160*Math.PI/180, 20*Math.PI/180); //top body
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 2, 9, 340*Math.PI/180, 200*Math.PI/180); //bottom body
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -16, 6, 0, 2*Math.PI); //head
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-3, -18, 2.5, 0, 2*Math.PI); //left eye
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(3, -18, 2.5, 0, 2*Math.PI); //right eye
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-2, -18, 0.75, 0, 2*Math.PI); //left eyeball;
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2, -18, 0.75, 0, 2*Math.PI); //right eyeball;
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
}

function drawJijiMovingL () {
    ctx.save();
    ctx.translate(kiki.x + 45, kiki.y - 1);

    ctx.beginPath();
    ctx.lineTo(-6, 8); //left ear
    ctx.lineTo(-5, -6);
    ctx.lineTo(-1, 0);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(6, 8); //right ear
    ctx.lineTo(5, -6);
    ctx. lineTo(1, 0);
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x + 45, kiki.y + 20);

    ctx.beginPath();
    ctx.arc(6, -2, 10, 330*Math.PI/180, 90*Math.PI/180); //bottom tail
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(21, -9, 7, 160*Math.PI/180, 270*Math.PI/180); //top tail
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -2, 9, 160*Math.PI/180, 20*Math.PI/180); //top body
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 2, 9, 340*Math.PI/180, 200*Math.PI/180); //bottom body
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -16, 6, 0, 2*Math.PI); //head
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-3, -18, 2.5, 0, 2*Math.PI); //left eye
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(3, -18, 2.5, 0, 2*Math.PI); //right eye
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-2, -18, 0.75, 0, 2*Math.PI); //left eyeball;
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2, -18, 0.75, 0, 2*Math.PI); //right eyeball;
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
}

function drawKikiMovingR () {
    ctx.save();
    ctx.translate(kiki.x, kiki.y);

    ctx.rotate(10*Math.PI/180);
    ctx.beginPath();
    ctx.lineTo(2, -9); //Kiki's neck
    ctx.lineTo(2, -18);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    
    ctx.lineTo(0, -10); //Kiki's body trunk
    ctx.lineTo(0, 15);
    ctx.lineWidth = 16;
    ctx.strokeStyle = "indigo";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 13, 120*Math.PI/180, 240*Math.PI/180); //Kiki's back
    ctx.fillStyle = "indigo";
    ctx.fill();

    ctx.rotate(-40*Math.PI/180);

    ctx.beginPath();
    ctx.lineTo(12, 26); //Kiki's arm
    ctx.lineTo(12, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(10, -2); //Kiki's sleeve
    ctx.lineTo(10, 13);
    ctx.strokeStyle = "indigo";
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x+4, kiki.y-24);

    ctx.beginPath();
    ctx.lineTo(-10, -6); //bow
    ctx.lineTo(-10, -20);
    ctx.lineTo(10, -8); 
    ctx.lineTo(-10, -6);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(0, -7); //Kiki's face center
    ctx.lineTo(0, 7);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 290*Math.PI/180, 70*Math.PI/180); //Kiki's face front
    ctx.fillStyle = "bisque";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-8, -2, 9, 0, 2*Math.PI); //Kiki's hair blob
    ctx.fillStyle = "saddlebrown";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-1, -1, 13, 200*Math.PI/180, 340*Math.PI/180); //Kiki's hair top
    ctx.fill();

    ctx.beginPath();
    ctx.arc(12, -3, 20, 150*Math.PI/180, 215*Math.PI/180); //bow ribbon
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x, kiki.y+25);
    ctx.rotate(75*Math.PI/180);

    ctx.beginPath();
    ctx.lineTo(-18, 50);
    ctx.lineTo(-18, 80);
    ctx.lineTo(-16, 50);
    ctx.lineTo(-14, 80);
    ctx.lineTo(-12, 50);
    ctx.lineTo(-10, 80);
    ctx.lineTo(-8, 50);
    ctx.lineTo(-6, 80);
    ctx.lineTo(-4, 50);
    ctx.lineTo(-2, 80);
    ctx.lineTo(0, 50);
    ctx.lineTo(2, 80);
    ctx.lineTo(4, 50);
    ctx.lineTo(6, 80);
    ctx.lineTo(8, 50);
    ctx.lineTo(10, 80);
    ctx.lineTo(12, 50);
    ctx.lineTo(14, 80);
    ctx.lineTo(16, 50);
    ctx.lineTo(-18, 50);
    ctx.fillStyle = "sandybrown";
    ctx.fill();


    ctx.beginPath();
    ctx.lineTo(0, 50); //Broomstick shaft
    ctx.lineTo(0, -70);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "sandybrown";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 50, 16, 130*Math.PI/180, 50*Math.PI/180); //Broomstick bristles
    ctx.fillStyle = "sandybrown";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -25, 3, 0, 2*Math.PI); //Kiki's hand
    ctx.fillStyle = "bisque";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(5, 25); //Kiki's leg
    ctx.lineTo(5, 10);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(7, 25, 4, 70*Math.PI/180, 290*Math.PI/180); //shoe heel
    ctx.fillStyle = "orangered";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(9, 25, 4, 250*Math.PI/180, 110*Math.PI/180); //shoe toes
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(-3, 0); //Kiki's dress
    ctx.lineTo(-3, -14);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "indigo";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-5, 0, 15, 290*Math.PI/180, 70*Math.PI/180); //Kiki's dress bottom
    ctx.fillStyle = "indigo";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-3, -10, 8, 210*Math.PI/180, 350*Math.PI/180); //Kiki's knee
    ctx.fill();

    ctx.rotate(-75*Math.PI/180);

    ctx.beginPath();
    ctx.arc(-9, -5, 12, 0, 2*Math.PI); //Kiki's bum
    ctx.fill();

    ctx.restore();

    drawJijiMovingR();
}

function drawKikiMovingL () {
    ctx.save();
    ctx.translate(kiki.x, kiki.y);

    ctx.rotate(-10*Math.PI/180);
    ctx.beginPath();
    ctx.lineTo(-2, -9); //Kiki's neck
    ctx.lineTo(-2, -18);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    
    ctx.lineTo(0, -10); //Kiki's body trunk
    ctx.lineTo(0, 15);
    ctx.lineWidth = 16;
    ctx.strokeStyle = "indigo";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 13, 300*Math.PI/180, 60*Math.PI/180); //Kiki's back
    ctx.fillStyle = "indigo";
    ctx.fill();

    ctx.rotate(40*Math.PI/180);

    ctx.beginPath();
    ctx.lineTo(-12, 26); //Kiki's arm
    ctx.lineTo(-12, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(-10, -2); //Kiki's sleeve
    ctx.lineTo(-10, 13);
    ctx.strokeStyle = "indigo";
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x-4, kiki.y-24);

    ctx.beginPath();
    ctx.lineTo(10, -6); //bow
    ctx.lineTo(10, -20);
    ctx.lineTo(-10, -8); 
    ctx.lineTo(10, -6);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(0, -7); //Kiki's face center
    ctx.lineTo(0, 7);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 110*Math.PI/180, 250*Math.PI/180); //Kiki's face front
    ctx.fillStyle = "bisque";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(8, -2, 9, 0, 2*Math.PI); //Kiki's hair blob
    ctx.fillStyle = "saddlebrown";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(1, -1, 13, 200*Math.PI/180, 340*Math.PI/180); //Kiki's hair top
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-12, -3, 20, 325*Math.PI/180, 30*Math.PI/180); //bow ribbon
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(kiki.x, kiki.y+25);
    ctx.rotate(-75*Math.PI/180);

    ctx.beginPath();
    ctx.lineTo(18, 50);
    ctx.lineTo(18, 80);
    ctx.lineTo(16, 50);
    ctx.lineTo(14, 80);
    ctx.lineTo(12, 50);
    ctx.lineTo(10, 80);
    ctx.lineTo(8, 50);
    ctx.lineTo(6, 80);
    ctx.lineTo(4, 50);
    ctx.lineTo(2, 80);
    ctx.lineTo(0, 50);
    ctx.lineTo(-2, 80);
    ctx.lineTo(-4, 50);
    ctx.lineTo(-6, 80);
    ctx.lineTo(-8, 50);
    ctx.lineTo(-10, 80);
    ctx.lineTo(-12, 50);
    ctx.lineTo(-14, 80);
    ctx.lineTo(-16, 50);
    ctx.lineTo(18, 50);
    ctx.fillStyle = "sandybrown";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(0, 50); //Broomstick shaft
    ctx.lineTo(0, -70);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "sandybrown";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 50, 16, 130*Math.PI/180, 50*Math.PI/180); //Broomstick bristles
    ctx.fillStyle = "sandybrown";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -25, 3, 0, 2*Math.PI); //Kiki's hand
    ctx.fillStyle = "bisque";
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(-5, 25); //Kiki's leg
    ctx.lineTo(-5, 10);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "bisque";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-7, 25, 4, 250*Math.PI/180, 110*Math.PI/180); //shoe heel
    ctx.fillStyle = "orangered";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-9, 25, 4, 70*Math.PI/180, 290*Math.PI/180); //shoe toes
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(3, 0); //Kiki's dress
    ctx.lineTo(3, -14);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "indigo";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(5, 0, 15, 110*Math.PI/180, 250*Math.PI/180); //Kiki's dress bottom
    ctx.fillStyle = "indigo";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(3, -10, 8, 190*Math.PI/180, 330*Math.PI/180); //Kiki's knee
    ctx.fill();

    ctx.rotate(75*Math.PI/180);

    ctx.beginPath();
    ctx.arc(9, -5, 12, 0, 2*Math.PI); //Kiki's bum
    ctx.fill();

    ctx.restore();

    drawJijiMovingL();
}
