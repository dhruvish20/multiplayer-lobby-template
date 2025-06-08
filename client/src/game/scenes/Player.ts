import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  public id: string;
  private usernameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, id: string) {
    super(scene, x, y, texture, frame);
    this.id = id;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);

    // Add username text above the player
    this.usernameText = scene.add.text(x, y - 40, "", {
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: { left: 4, right: 4, top: 2, bottom: 2 },
    }).setOrigin(0.5);
  }

  setUsername(name: string) {
    this.usernameText.setText(name);
  }

  updateLabelPosition() {
    this.usernameText.setPosition(this.x, this.y - 40);
  }

  destroy(fromScene?: boolean) {
    this.usernameText.destroy();
    super.destroy(fromScene);
  }
}
