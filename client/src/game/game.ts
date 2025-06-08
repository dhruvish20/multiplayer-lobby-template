import Phaser from "phaser";
import GameScene from "./scenes/GameScene.ts";

interface GameInitData {
  officeCode: string | undefined;
  token: string;
  username: string;
}

const createGame = (initData: GameInitData) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [new GameScene(initData)], 
    parent: "phaser-game",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: true,
      },
    },
  });
};

export default createGame;
