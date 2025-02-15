import Player from "./player.js";
import Ground from "./ground.js";
import CactiController  from "./CactiControllers.js";
import Score from "./score.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const game_Speed_Start = 0.75;
const game_Increment_Value = 0.00001

const game_Width = 800;
const game_Height = 200;
const player_Width = 88 / 1.5; //58
const player_height = 94 / 1.5; //62
const max_Jump_Height = game_Height;
const min_Jump_Height = 150;
const ground_Width = 2400;
const ground_Height = 24;
const ground_And_Cactus_Speed = 0.5;

const cacti_Config = [
    {width: 48 / 1.5, height: 100 /1.5, image:"Dino Run game/images/cactus_1.png"},
    {width: 98 / 1.5, height: 100 /1.5, image:"Dino Run game/images/cactus_2.png"},
    {width: 68 / 1.5, height: 70 /1.5, image:"Dino Run game/images/cactus_3.png"},]


// Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = game_Speed_Start;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;


const createSprites = () => {
    const playerWidthInGame = player_Width * scaleRatio;
    const playerHeightInGame = player_height * scaleRatio;
    const minJumpHeightInGame = min_Jump_Height * scaleRatio;
    const maxJumpHeightInGame = max_Jump_Height * scaleRatio; 

    const groundWidthInGame = ground_Width * scaleRatio;
    const groundHeightInGame = ground_Height * scaleRatio;

    player = new Player(
        ctx,
         playerWidthInGame,
        playerHeightInGame,
        minJumpHeightInGame,
        maxJumpHeightInGame,
         scaleRatio);

    ground = new Ground(
        ctx,
        groundWidthInGame,
        groundHeightInGame,
        ground_And_Cactus_Speed,
        scaleRatio
    );

    const cactiImages = cacti_Config.map(cactus => {
        const image = new Image();
        image.src = cactus.image;
        return {
            image: image,
            width: cactus.width * scaleRatio,
            height: cactus.height * scaleRatio,
        };
    })
    cactiController = new CactiController(ctx, cactiImages, scaleRatio, ground_And_Cactus_Speed);

    score = new Score( ctx, scaleRatio);
};


const getScaleRatio = () => {
    const screenHeight = Math.min(window.innerHeight,
        document.documentElement.clientHeight);

    const  screenWidth = Math.min(window.innerWidth,
         document.documentElement.clientWidth);

// Window is wider than game width
    if (screenWidth / screenHeight < game_Width / game_Height) {
        return screenWidth / game_Width;
    }   else {
        return screenHeight / game_Height;
    }
};

const setScreen = () => {
    scaleRatio = getScaleRatio();
    canvas.width = game_Width * scaleRatio;
    canvas.height = game_Height * scaleRatio;
    createSprites();
};

setScreen();
// Use setTimeout on Safarimobile rotaion otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
    screen.orientation.addEventListener("change", setScreen);
}

const showGameOver = () => {
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width / 4.5;
    const y = canvas.height / 2;
    ctx.fillText("GAME OVER", x, y);
}

const setupGameReset = () => {
    if (!hasAddedEventListenersForRestart) {
        hasAddedEventListenersForRestart = true;

        setTimeout(() => {
        window.addEventListener("keyup", reset,{once: true});
        window.addEventListener("touchstart", reset,{once: true});
        }, 1000);
    }
}

const reset = () => {
    hasAddedEventListenersForRestart = false;
    gameOver = false;
    waitingToStart = false;
    ground.reset();
    cactiController.reset();
    gameSpeed = game_Speed_Start;
    score.reset();
}

const showStartGameText = () => {
    const fontSize = 40 *scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "grey";
    const x = canvas.width / 14;
    const y = canvas.height / 2;
    ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

const updateGameSpeed =(frameTimeDelta) => {
    gameSpeed += frameTimeDelta * game_Increment_Value
}

const clearScreen = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const gameLoop = (currentTime) => {
    if (previousTime === null) {
        previousTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }

    const frameTimeDelta = currentTime - previousTime;
    previousTime = currentTime;
    clearScreen();

    if(!gameOver && !waitingToStart) {
    //Update game objects
    ground.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    updateGameSpeed(frameTimeDelta);
    }

    if(!gameOver && cactiController.collideWith(player)) {
        gameOver = true;
        setupGameReset();
        score.setHighScore();
    }

    //Draw game objects
    ground.draw();
    cactiController.draw();
    player.draw();
    score.draw();
    
    if (gameOver) {
        showGameOver();
    }

    if (waitingToStart) {
        showStartGameText();
    }

    requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset,{once: true});
window.addEventListener("touchstart", reset,{once: true});
