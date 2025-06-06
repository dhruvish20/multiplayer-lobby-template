// import e from "express";
import Phaser from "phaser";
import Player from "./Player.ts";

interface GameSceneInitData {
  officeCode?: string;
  token?: string;
}

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private adam!: Phaser.Physics.Arcade.Sprite;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private players: { [id: string]: Player } = {}; 
  private socket!: WebSocket;
  private myPlayerId: string | null = null
  groundlayer: Phaser.Tilemaps.TilemapLayer | null;

  private officeCode: string | undefined;
  private token: string | undefined;

  constructor(initData: GameSceneInitData) {
    super("GameScene");
    this.officeCode = initData.officeCode;
    this.token = initData.token;
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    console.log("Cursors created:", this.cursors);
    this.load.image("tileset", "/assets/FloorAndGround.png");
    this.load.tilemapTiledJSON("office", "/assets/office_map.json")
    this.load.atlas("adam" , "/assets/Characters/adam.png",  "/assets/Characters/adam.json") 
  }

  create() {


    this.initializeSocket()

    const map = this.make.tilemap({ key: "office" });
    const tileset = map.addTilesetImage("map", "tileset");

    if (!tileset) {
      console.error("Tileset not found!");
      return;
    }

    this.groundlayer = map.createLayer("ground", tileset);
    this.wallsLayer = map.createLayer("walls", tileset); // Store wallsLayer

    if (this.wallsLayer) {
      this.wallsLayer.setCollisionByProperty({ collide: true }); // Ensure it has collision
    }

    // if (!this.myPlayerId) {
    //   console.error("Player ID is null");
    //   return;
    // }
    // const player = new Player(this, 450, 400, "adam", "Adam_idle_anim_7.png", this.myPlayerId);
    
    // this.myPlayerId = player.id;
    // console.log("Player created, myPlayerId:", this.myPlayerId);



    // this.players[player.id] = player;
    this.groundlayer?.setScale(1.5);
    this.wallsLayer?.setScale(1.5);
    this.anims.create({
      key: "idle_right",
      frames: this.anims.generateFrameNames("adam", {
        start: 1,
        end: 6,
        prefix: "Adam_idle_anim_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({
      key: "idle_down",
      frames: this.anims.generateFrameNames("adam", {
        start: 7,
        end: 12,
        prefix: "Adam_idle_anim_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });
    
    this.anims.create({
      key: "idle_left",
      frames: this.anims.generateFrameNames("adam", {
        start: 13,
        end: 18,
        prefix: "Adam_idle_anim_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({
      key: "idle_up",
      frames: this.anims.generateFrameNames("adam", {
        start: 19,
        end: 24,
        prefix: "Adam_idle_anim_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({           
      key: "run_right",
      frames: this.anims.generateFrameNames("adam", {
        start: 1,
        end: 6,
        prefix: "Adam_run_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({           
      key: "run_down",
      frames: this.anims.generateFrameNames("adam", {
        start: 7,
        end: 12,
        prefix: "Adam_run_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({           
      key: "run_left",
      frames: this.anims.generateFrameNames("adam", {
        start: 13,
        end: 18,
        prefix: "Adam_run_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({           
      key: "run_up",
      frames: this.anims.generateFrameNames("adam", {
        start: 18,
        end: 24,
        prefix: "Adam_run_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });


    // Set camera boundaries to prevent showing background
    this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
  }

  private initializeSocket() {
    if (!this.officeCode || !this.token) {
      console.error("Missing office code or token.");
      return;
    }
  
    this.socket = new WebSocket(`ws://localhost:5001?officeCode=${this.officeCode}&token=${this.token}`);
  
    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");
      this.socket.send(
        JSON.stringify({
          type: "joinOffice",
          officeCode: this.officeCode,
          username: "YourUsername", // Make sure to send a username here
        })
      );
    };
  
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
  
      switch (data.type) {
        case "assignId":
          this.myPlayerId = data.id;
          this.createPlayer();
          break;
  
        case "newPlayer":
          console.log("New player joined:", data.id);
          this.addPlayer(data.id, data.username, { x: data.position.x, y: data.position.y }); // Ensure correct data access
          break;
  
        case "existingPlayers":
          console.log("Existing players received:", data.players);
          data.players.forEach((player: any) => {
            if (player.id !== this.myPlayerId) {
              this.addPlayer(player.id, player.username, player.position); // Accessing position directly
            }
          });
          break;
  
        case "playerMovement":
          this.updatePlayerPosition(data.id, data.x, data.y);
          break;

          
        case "removePlayer":
          this.removePlayer(data.id);
          break;
        
        // case "chatMessage":
        //   this.displayChatMessage(data.chatMessage); 
        //   break;
      
      }
    };
  
    this.socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };
  
    this.socket.onclose = () => {
      console.warn("WebSocket connection closed. Attempting to reconnect...");
      setTimeout(() => this.initializeSocket(), 3000);
    };
  }

  // private displayChatMessage(chatMessage: { sender: string, message: string }) {
  //   console.log(`${chatMessage.sender}: ${chatMessage.message}`);
    
  //   // Optionally, display in a chat window/UI component (like a div or chat box)
  //   const chatBox = document.getElementById('chatBox'); // Make sure this exists in your HTML
  //   const messageElement = document.createElement('div');
  //   messageElement.textContent = `${chatMessage.sender}: ${chatMessage.message}`;
  //   chatBox?.appendChild(messageElement);
  
  //   // Scroll to the bottom of the chat box (if needed)
  //   chatBox?.scrollTo(0, chatBox.scrollHeight);
  // }
  
  private createPlayer() {
    if (!this.myPlayerId) {
      console.error("Player ID is missing!");
      return;
    }
  
    const player = new Player(this, 450, 400, "adam", "Adam_idle_anim_7.png", this.myPlayerId);
    this.players[this.myPlayerId] = player;
  
    // Ensure physics exists before applying collider
    this.physics.add.collider(player, this.wallsLayer!);
  
    // Camera follows player
    this.cameras.main.startFollow(player);
  
    // Default animation
    player.anims.play("idle_up");
  }
  
  private removePlayer(id: string) {
    if (this.players[id]) {
      this.players[id].destroy();
      delete this.players[id];
    }
  }
  
  private addPlayer(id: string, username: string, position: { x: number; y: number } | null = null) {
    const x = position ? position.x : Math.random() * 800; // Use provided position or random
    const y = position ? position.y : Math.random() * 600; // Use provided position or random
  
    const player = new Player(this, x, y, "adam", "Adam_idle_anim_7.png", id);
    player.setData("username", username);
    this.players[id] = player;
  
    // Ensure physics exists before applying collider
    this.physics.add.collider(player, this.wallsLayer!);
  }
  
  private updatePlayerPosition(id: string, x: number, y: number) {
    const player = this.players[id];
    if (player) {
      player.setPosition(x, y);
    } else {
      // Optionally, you could create a new player if it doesn't exist
      console.warn(`Player with ID ${id} does not exist in the local state.`);
    }
  }
  
  update(time: number, delta: number): void {
    // console.log("Update loop running", time);
    if (!this.cursors || !this.players[this.myPlayerId!]) {
      return;
    }
  
    const speed = 250;
    let moving = false; // Track movement
    const player = this.players[this.myPlayerId!];

    if (this.cursors.left?.isDown) {
      console.log("Left key is pressed");
    }
    if (this.cursors.right?.isDown) {
      console.log("Right key is pressed");
    }
    if (this.cursors.up?.isDown) {
      console.log("Up key is pressed");
    }
    if (this.cursors.down?.isDown) {
      console.log("Down key is pressed");
    }
  
  
    if (this.cursors.left?.isDown) {
      console.log("Left key is pressed");
      player.setVelocityX(-speed);
      player.anims.play("run_left", true);
      moving = true;
    } else if (this.cursors.right?.isDown) {
      player.setVelocityX(speed);
      player.anims.play("run_right", true);
      moving = true;
    } else if (this.cursors.up?.isDown) {
      player.setVelocityY(-speed);
      player.anims.play("run_up", true);
      moving = true;
    } else if (this.cursors.down?.isDown) {
      player.setVelocityY(speed);
      player.anims.play("run_down", true);
      moving = true;
    }
  
    // Stop movement if no key is pressed
    if (!moving) {
      player.setVelocity(0, 0);
      player.anims.play("idle_up", true);
    } 

    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.send(
        JSON.stringify({
          type: "playerMovement",
          id : this.myPlayerId,
          officeCode: this.officeCode,
          x: player.x,
          y: player.y
        })
      )
    }
  }
}