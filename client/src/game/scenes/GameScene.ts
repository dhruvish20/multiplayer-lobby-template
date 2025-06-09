import Phaser from "phaser";
import Player from "./Player.ts";

interface GameSceneInitData {
  officeCode?: string;
  token?: string;
  username?: string; 
}

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private groundlayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private players: { [id: string]: Player } = {};
  private socket!: WebSocket;
  private myPlayerId: string | null = null;
  private sceneReady = false;
  private lastDirection: 'left' | 'right' | 'up' | 'down' = 'down';

  private officeCode: string | undefined;
  private token: string | undefined;
  private username: string | undefined;

  constructor(initData: GameSceneInitData) {
    super("GameScene");
    this.officeCode = initData.officeCode;
    this.token = initData.token;
    this.username = initData.username;

  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.load.image("tileset", "/assets/FloorAndGround.png");
    this.load.tilemapTiledJSON("office", "/assets/office_map.json");
    this.load.atlas("adam", "/assets/Characters/adam.png", "/assets/Characters/adam.json");
  }

  create() {
    const map = this.make.tilemap({ key: "office" });
    const tileset = map.addTilesetImage("map", "tileset");
    if (!tileset) return;

    this.groundlayer = map.createLayer("ground", tileset);
    this.wallsLayer = map.createLayer("walls", tileset);
    this.wallsLayer?.setCollisionByProperty({ collide: true });

    this.groundlayer?.setScale(1.5);
    this.wallsLayer?.setScale(1.5);

    this.createAnimations();
    this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    this.sceneReady = true;
    this.initializeSocket();
    this.bindChatEventOnce(); 
  }

  private createAnimations() {
    const directions = ['right', 'down', 'left', 'up'];
    const frameStarts = [1, 7, 13, 19];

    directions.forEach((dir, i) => {
      this.anims.create({
        key: `idle_${dir}`,
        frames: this.anims.generateFrameNames("adam", {
          start: frameStarts[i],
          end: frameStarts[i] + 5,
          prefix: "Adam_idle_anim_",
          suffix: ".png",
        }),
        repeat: -1,
        frameRate: 10,
      });

      this.anims.create({
        key: `run_${dir}`,
        frames: this.anims.generateFrameNames("adam", {
          start: frameStarts[i],
          end: frameStarts[i] + 5,
          prefix: "Adam_run_",
          suffix: ".png",
        }),
        repeat: -1,
        frameRate: 10,
      });
    });
  }

  private chatListenerBound = false;

  private bindChatEventOnce() {
    if (this.chatListenerBound) return;
    this.chatListenerBound = true;
  
    window.addEventListener("outgoingChatMessage", (e: any) => {
      const msg = e.detail;
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: "chatMessage",
          chatMessage: {
            sender: this.username, 
            message: msg.message   
          }
        }));
      }
    });
  }

  private initializeSocket() {
    if (!this.officeCode || !this.token) return;

    this.socket = new WebSocket(`ws://localhost:5001?officeCode=${this.officeCode}&token=${this.token}`);

    const extractUsername = (token: string): string => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || "Player";
      } catch {
        return "Player";
      }
    };
    
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
      type: "joinOffice",
      officeCode: this.officeCode,
      username: extractUsername(this.token || ""),
      }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "assignId":
        if (!this.myPlayerId) {
          this.myPlayerId = data.id;
          if (!this.players[data.id]) {
            this.createPlayer();  // ✅ Prevent duplicate players
          }
        }
        break;

          case "newPlayer":
            if (!this.sys || !this.sys.isActive()) {
              console.warn("Scene not fully active. Ignoring newPlayer.");
              return;
            }
            if (this.sceneReady && !this.players[data.id]) {
              this.addPlayer(data.id, data.username, data.position);
            }
            break;          

        case "existingPlayers":
          if (this.sceneReady) {
            data.players.forEach((p: any) => {
              if (p.id !== this.myPlayerId && !this.players[p.id]) {
                this.addPlayer(p.id, p.username, p.position);
              }
            });
          }
          break;

        case "playerMovement":
          this.updatePlayerPosition(data.id, data.x, data.y, data.username);
          break;

        case "removePlayer":
          this.removePlayer(data.id);
          break;

          case "chatMessage": {
            const { sender, message } = data.chatMessage;
            if (typeof sender === "string" && typeof message === "string") {
              const chatEvent = new CustomEvent("chatMessage", {
                detail: { sender, message },
              });
              window.dispatchEvent(chatEvent);
            }
            break;
          }
      }
    };

    this.socket.onerror = (error) => console.error("WebSocket error", error);
    this.socket.onclose = () => setTimeout(() => this.initializeSocket(), 3000);

    window.addEventListener("outgoingChatMessage", (e: any) => {
      const msg = e.detail;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: "chatMessage",
          chatMessage: msg,
        }));
      }
    });
  }

  private createPlayer() {
    if (!this.myPlayerId) return;

    const player = new Player(this, 450, 400, "adam", "Adam_idle_anim_7.png", this.myPlayerId);
    player.setUsername("You");
    this.players[this.myPlayerId] = player;

    this.physics.add.collider(player, this.wallsLayer!);
    this.cameras.main.startFollow(player);
    player.anims.play("idle_down");
  }

  private addPlayer(id: string, username: string, position: { x: number; y: number }) {
    if (this.players[id]) return;
  
    try {
      const player = new Player(this, position.x, position.y, "adam", "Adam_idle_anim_7.png", id);
      player.setData("username", username);
      player.setUsername(username);
  
      this.players[id] = player; 
  
      if (id === this.myPlayerId) {
        this.physics.add.collider(player, this.wallsLayer!);
      }
    } catch (err) {
      console.error(`Failed to create player ${id}:`, err);
    }
  }

  private removePlayer(id: string) {
    if (this.players[id]) {
      this.players[id].destroy();
      delete this.players[id];
    }
  }

  private updatePlayerPosition(id: string, x: number, y: number, username?: string) {
    const player = this.players[id];
    if (player) {
      player.setPosition(x, y);
      if (username) {
        player.setUsername(username); 
      }
      player.updateLabelPosition();
    }
  }

  private lastSentX = 0;
  private lastSentY = 0;
  private lastMovementSent = 0;

  update(): void {
    if (!this.myPlayerId || !this.players[this.myPlayerId] || !this.cursors) return;

    const player = this.players[this.myPlayerId];
    const speed = 350;
    let vx = 0, vy = 0;

    if (this.cursors.left?.isDown) {
      vx = -speed;
      this.lastDirection = 'left';
      player.anims.play("run_left", true);
    } else if (this.cursors.right?.isDown) {
      vx = speed;
      this.lastDirection = 'right';
      player.anims.play("run_right", true);
    } else if (this.cursors.up?.isDown) {
      vy = -speed;
      this.lastDirection = 'up';
      player.anims.play("run_up", true);
    } else if (this.cursors.down?.isDown) {
      vy = speed;
      this.lastDirection = 'down';
      player.anims.play("run_down", true);
    } else {
      player.anims.play(`idle_${this.lastDirection}`, true);
    }
  
    player.setVelocity(vx, vy);

    Object.values(this.players).forEach((p) => {
      p.updateLabelPosition();
    });
  
    // Throttle socket sends (every ~100ms only if moved)
    const now = performance.now();
    if (
      (Math.abs(player.x - this.lastSentX) > 1 || Math.abs(player.y - this.lastSentY) > 1) &&
      now - this.lastMovementSent > 100
    ) {
      this.socket?.send(
        JSON.stringify({
          type: "playerMovement",
          id: this.myPlayerId,
          officeCode: this.officeCode,
          x: player.x,
          y: player.y,
        })
      );
      this.lastSentX = player.x;
      this.lastSentY = player.y;
      this.lastMovementSent = now;
    }
  
    // Update label position
    player.updateLabelPosition();
  }
}
