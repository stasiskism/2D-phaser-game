

class Marketplace extends Phaser.Scene {
    constructor() {
      super({ key: 'Marketplace' });
      this.player = null;
      this.eKey = null;
      this.objects = null;
      this.popupText = null;
      this.map = null;
    }
  
    preload() {
      this.load.image('WwalkUp1', 'assets/8-dir-chars/WwalkUp1.png');
      this.load.image('WwalkUp2', 'assets/8-dir-chars/WwalkUp2.png');
      this.load.image('WwalkUp3', 'assets/8-dir-chars/WwalkUp3.png');
      this.load.image('WwalkRight1', 'assets/8-dir-chars/WwalkRight1.png');
      this.load.image('WwalkRight2', 'assets/8-dir-chars/WwalkRight2.png');
      this.load.image('WwalkRight3', 'assets/8-dir-chars/WwalkRight3.png');
      this.load.image('WwalkUpRight1', 'assets/8-dir-chars/WwalkUpRight1.png');
      this.load.image('WwalkUpRight2', 'assets/8-dir-chars/WwalkUpRight2.png');
      this.load.image('WwalkUpRight3', 'assets/8-dir-chars/WwalkUpRight3.png');
      this.load.image('WwalkDownRight1', 'assets/8-dir-chars/WwalkDownRight1.png');
      this.load.image('WwalkDownRight2', 'assets/8-dir-chars/WwalkDownRight2.png');
      this.load.image('WwalkDownRight3', 'assets/8-dir-chars/WwalkDownRight3.png');
      this.load.image('WwalkDown1', 'assets/8-dir-chars/WwalkDown1.png');
      this.load.image('WwalkDown2', 'assets/8-dir-chars/WwalkDown2.png');
      this.load.image('WwalkDown3', 'assets/8-dir-chars/WwalkDown3.png');
      this.load.image('WwalkDownLeft1', 'assets/8-dir-chars/WwalkDownLeft1.png');
      this.load.image('WwalkDownLeft2', 'assets/8-dir-chars/WwalkDownLeft2.png');
      this.load.image('WwalkDownLeft3', 'assets/8-dir-chars/WwalkDownLeft3.png');
      this.load.image('WwalkLeft1', 'assets/8-dir-chars/WwalkLeft1.png');
      this.load.image('WwalkLeft2', 'assets/8-dir-chars/WwalkLeft2.png');
      this.load.image('WwalkLeft3', 'assets/8-dir-chars/WwalkLeft3.png');
      this.load.image('WwalkUpLeft1', 'assets/8-dir-chars/WwalkUpLeft1.png');
      this.load.image('WwalkUpLeft2', 'assets/8-dir-chars/WwalkUpLeft2.png');
      this.load.image('WwalkUpLeft3', 'assets/8-dir-chars/WwalkUpLeft3.png');
      this.load.image('player', 'assets/player_23.png');
      this.load.image('multiplayer', 'assets/multiplayer.png');
      this.load.image('singleplayer', 'assets/singleplayer.png');
      this.load.image('marketplace', 'assets/marketplace.png');
      this.load.image("tiles1", 'assets/marketplace/TX Plant.png');
      this.load.image("tiles2", 'assets/marketplace/TX Props.png');
      this.load.image("tiles3", 'assets/marketplace/TX Struct.png');
      this.load.image("tiles4", 'assets/marketplace/TX Tileset Grass.png');
      this.load.image("tiles5", 'assets/marketplace/TX Tileset Stone Ground.png');
      this.load.image("tiles6", 'assets/marketplace/TX Tileset Wall.png');
      this.load.tilemapTiledJSON('map1', 'assets/marketplace/maps_marketplace.json');
      this.load.image('gun1', 'assets/Weapons/tile001.png');
      this.load.image('gun2', 'assets/Weapons/tile002.png');
      this.load.image('gun3', 'assets/Weapons/tile003.png');
      this.load.image('gun4', 'assets/Weapons/tile004.png');
    }
  
    create() {
  
      let centerX = this.cameras.main.width / 2;
      let centerY = this.cameras.main.height / 2;
  
    const map1 = this.make.tilemap({ key: "map1", tileWidth: 32, tileHeight: 32});
    const tileset4 = map1.addTilesetImage("TX Tileset Grass", "tiles4");
    const tileset1 = map1.addTilesetImage("TX Plant", "tiles1");
    const tileset3 = map1.addTilesetImage("TX Struct", "tiles3");
    const tileset5 = map1.addTilesetImage("TX Tileset Stone Ground", "tiles5");
    const tileset6 = map1.addTilesetImage("TX Tileset Wall", "tiles6");
    const tileset2 = map1.addTilesetImage("TX Props", "tiles2");
    const layer1 = map1.createLayer("Tile Layer 1", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);





      this.player = this.physics.add.sprite(247, 517, 'WwalkDown2').setScale(3); // 'WwalkDown2' is the idle frame
  
        this.anims.create({
          key: 'WwalkUp',
          frames: [
              { key: 'WwalkUp1' },
              { key: 'WwalkUp2' },
              { key: 'WwalkUp3' }
          ],
          frameRate: 10,
          repeat: -1
      });
  
      this.anims.create({
        key: 'WwalkUpRight',
        frames: [
            { key: 'WwalkUpRight1' },
            { key: 'WwalkUpRight2' },
            { key: 'WwalkUpRight3' }
        ],
        frameRate: 10,
        repeat: -1
    });
  
      this.anims.create({
        key: 'WwalkRight',
        frames: [
            { key: 'WwalkRight1' },
            { key: 'WwalkRight2' },
            { key: 'WwalkRight3' }
        ],
        frameRate: 10,
        repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkDownRight',
      frames: [
          { key: 'WwalkDownRight1' },
          { key: 'WwalkDownRight2' },
          { key: 'WwalkDownRight3' }
      ],
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkDown',
      frames: [
          { key: 'WwalkDown1' },
          { key: 'WwalkDown2' },
          { key: 'WwalkDown3' }
      ],
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkDownLeft',
      frames: [
          { key: 'WwalkDownLeft1' },
          { key: 'WwalkDownLeft2' },
          { key: 'WwalkDownLeft3' }
      ],
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkLeft',
      frames: [
          { key: 'WwalkLeft1' },
          { key: 'WwalkLeft2' },
          { key: 'WwalkLeft3' }
      ],
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'WwalkUpLeft',
      frames: [
          { key: 'WwalkUpLeft1' },
          { key: 'WwalkUpLeft2' },
          { key: 'WwalkUpLeft3' }
      ],
      frameRate: 10,
      repeat: -1
    });
  
      
  
  
  
      this.objects = this.physics.add.staticGroup();
      this.gun1Object = this.objects.create(432, 400, 'gun1');
      this.gun2Object = this.objects.create(785, 400, 'gun2');
      this.gun3Object = this.objects.create(1100, 400, 'gun3');
    //   this.singleplayerObject = this.objects.create(720, 653, 'singleplayer');
    //   this.multiplayerObject = this.objects.create(1010, 653, 'multiplayer');
    //   this.marketplaceObject = this.objects.create(1290, 653, 'marketplace');
  
      this.objects.getChildren().forEach(object => {
        object.setScale(3);
      });
  
      const invisibleWalls = [
        { x: 2, y: 2, width: 1920, height: 10 }, // Wall 1
        { x: 2, y: 2, width: 10, height: 1080 }, // Wall 2
        { x: 1910, y: 10, width: 10, height: 1080 }, // Wall 3
        { x: 10, y: 1060, width: 1920, height: 10 }, // Wall 4
      ];
  
      invisibleWalls.forEach(wall => {
        const invisibleWall = this.physics.add.sprite(wall.x + wall.width / 2, wall.y + wall.height / 2, 'invisible-wall').setVisible(false).setSize(wall.width, wall.height);
        invisibleWall.body.setAllowGravity(false);
        invisibleWall.body.setImmovable(true);
        this.physics.add.collider(this.player, invisibleWall);
      });
  
      // from 576x 872y to 1344x 872y
  
      this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  
      this.popupText = this.add.text(100, 100, '', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
      this.popupText.setVisible(false);
  
      this.physics.add.overlap(this.player, this.objects, this.interactWithObject, null, this);
    }
  
    update() {
  
      console.log('Player Position:', this.player.x, this.player.y);
  
      const cursors = this.input.keyboard.createCursorKeys();
      const wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      const aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      const sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      const dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
      // Reset player velocity
      this.player.setVelocity(0);
  
      // Horizontal movement
      if (cursors.left.isDown || aKey.isDown) {
          this.player.setVelocityX(-160);
          this.player.anims.play('WwalkLeft', true);
      } else if (cursors.right.isDown || dKey.isDown) {
          this.player.setVelocityX(160);
          this.player.anims.play('WwalkRight', true);
      }
  
      // Vertical movement
      if (cursors.up.isDown || wKey.isDown) {
          this.player.setVelocityY(-160);
          this.player.anims.play('WwalkUp', true);
      } else if (cursors.down.isDown || sKey.isDown) {
          this.player.setVelocityY(160);
          this.player.anims.play('WwalkDown', true);
      }
  
      // Normalize diagonal movement
      if ((cursors.up.isDown || wKey.isDown) && (cursors.left.isDown || aKey.isDown)) {
          this.player.body.velocity.normalize().scale(160);
          this.player.anims.play('WwalkUpLeft', true);
      } else if ((cursors.up.isDown || wKey.isDown) && (cursors.right.isDown || dKey.isDown)) {
          this.player.body.velocity.normalize().scale(160);
          this.player.anims.play('WwalkUpRight', true);
      } else if ((cursors.down.isDown || sKey.isDown) && (cursors.left.isDown || aKey.isDown)) {
          this.player.body.velocity.normalize().scale(160);
          this.player.anims.play('WwalkDownLeft', true);
      } else if ((cursors.down.isDown || sKey.isDown) && (cursors.right.isDown || dKey.isDown)) {
          this.player.body.velocity.normalize().scale(160);
          this.player.anims.play('WwalkDownRight', true);
      }
    }
   }
  
  export default Marketplace;
  
