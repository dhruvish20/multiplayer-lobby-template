import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  public id: string; // Add id property to uniquely identify each player

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, id: string) {
    super(scene, x, y, texture, frame);
    this.id = id; // Set the player's id

    scene.add.existing(this);
    scene.physics.world.enable(this); // Enable physics for this player

    // Set the default properties
    this.setCollideWorldBounds(true); // Prevent the player from going out of bounds
    this.setOrigin(0.5, 0.5);
  }
}
