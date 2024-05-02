
class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'mainMenu' });
    this.player = null;
    this.eKey = null;
    this.objects = null;
    this.popupText = null;
    this.singleplayerObject = null;
    this.multiplayerObject = null;
  }

  preload() {
    this.load.image('WwalkUp1', 'assets/8-dir-chars/WwalkUp1.png')
    this.load.image('WwalkUp2', 'assets/8-dir-chars/WwalkUp2.png')
    this.load.image('WwalkUp3', 'assets/8-dir-chars/WwalkUp3.png')
    this.load.image('WwalkRight1', 'assets/8-dir-chars/WwalkRight1.png')
    this.load.image('WwalkRight2', 'assets/8-dir-chars/WwalkRight2.png')
    this.load.image('WwalkRight3', 'assets/8-dir-chars/WwalkRight3.png')
    this.load.image('WwalkUpRight1', 'assets/8-dir-chars/WwalkUpRight1.png')
    this.load.image('WwalkUpRight2', 'assets/8-dir-chars/WwalkUpRight2.png')
    this.load.image('WwalkUpRight3', 'assets/8-dir-chars/WwalkUpRight3.png')
    this.load.image('WwalkDownRight1', 'assets/8-dir-chars/WwalkDownRight1.png')
    this.load.image('WwalkDownRight2', 'assets/8-dir-chars/WwalkDownRight2.png')
    this.load.image('WwalkDownRight3', 'assets/8-dir-chars/WwalkDownRight3.png')
    this.load.image('WwalkDown1', 'assets/8-dir-chars/WwalkDown1.png')
    this.load.image('WwalkDown2', 'assets/8-dir-chars/WwalkDown2.png')
    this.load.image('WwalkDown3', 'assets/8-dir-chars/WwalkDown3.png')
    this.load.image('WwalkDownLeft1', 'assets/8-dir-chars/WwalkDownLeft1.png')
    this.load.image('WwalkDownLeft2', 'assets/8-dir-chars/WwalkDownLeft2.png')
    this.load.image('WwalkDownLeft3', 'assets/8-dir-chars/WwalkDownLeft3.png')
    this.load.image('WwalkLeft1', 'assets/8-dir-chars/WwalkLeft1.png')
    this.load.image('WwalkLeft2', 'assets/8-dir-chars/WwalkLeft2.png')
    this.load.image('WwalkLeft3', 'assets/8-dir-chars/WwalkLeft3.png')
    this.load.image('WwalkUpLeft1', 'assets/8-dir-chars/WwalkUpLeft1.png')
    this.load.image('WwalkUpLeft2', 'assets/8-dir-chars/WwalkUpLeft2.png')
    this.load.image('WwalkUpLeft3', 'assets/8-dir-chars/WwalkUpLeft3.png')
    this.load.image('player', 'assets/player_23.png');
    this.load.image('multiplayer', 'assets/multiplayer.png');
    this.load.image('singleplayer', 'assets/singleplayer.png');
    this.load.image('marketplace', 'assets/marketplace.png');
    this.load.image("tiles", 'assets/assetas.png')
    this.load.tilemapTiledJSON('map', 'assets/maps.json');
    this.load.image('wasd', 'assets/wasd.png')
    this.load.image('tutorial', 'assets/tutorials.png')
    this.load.image('fullscreen', 'assets/full-screen.png')
  }

  create() {
    this.fetchLeaderboardData()
    
    let centerX = this.cameras.main.width / 2;
    let centerY = this.cameras.main.height / 2;

    const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
    const tileset = map.addTilesetImage("asd", "tiles");
    const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
    
    //this.add.text(350, 350, 'Controls:').setScale(1.5)
    this.add.sprite(430, 430, 'wasd').setScale(0.2)
    this.add.text(375, 350, 'Movement').setScale(1.5)

    this.player = this.physics.add.sprite(864, 624, 'WwalkDown2').setScale(3); // 'WwalkDown2' is the idle frame

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

  this.fullscreenButton = this.add.sprite(1890, 30, 'fullscreen').setDepth().setScale(0.1)
  this.fullscreenButton.setInteractive({ useHandCursor: true })
  this.fullscreenButton.on('pointerdown', () => {
      document.getElementById('phaser-example');
      if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
      } else {
          this.scale.startFullscreen();
      }
  })



    this.objects = this.physics.add.staticGroup();
    this.singleplayerObject = this.objects.create(720, 653, 'singleplayer')
    this.multiplayerObject = this.objects.create(1010, 653, 'multiplayer')
    this.marketplaceObject = this.objects.create(1290, 653, 'marketplace')
    this.tutorialObject = this.objects.create(1290, 453, 'tutorial')

    this.objects.getChildren().forEach(object => {
      object.setScale(0.2);
    });

    const invisibleWalls = [
      { x: 336, y: 959, width: 1250, height: 10 }, // Wall 1
      { x: 326, y: 315, width: 10, height: 650 }, // Wall 2
      { x: 1580, y: 315, width: 10, height: 650 }, // Wall 3
      { x: 326, y: 315, width: 1250, height: 10 }, // Wall 4
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

    this.leaderboard = this.add.dom(-250, -250).createFromHTML(`
        <div id="displayLeaderboard" style="position: absolute; padding: 8px; font-size: 38px; user-select: none; background: rgba(0, 0, 0, 0.5); color: white;">
            <div style="margin-bottom: 8px">Leaderboard</div>
            <div id="playerLabels"></div>
        </div>
        `);

        this.leaderboard.setPosition(100, 100).setScrollFactor(0);
        this.document = this.leaderboard.node.querySelector(`#playerLabels`)
  }

  update() {

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

  interactWithObject(player, object) {
    const distance = Phaser.Math.Distance.Between(player.x, player.y, object.x, object.y);

    if (distance < 50) {
      let message = '';
      if (object === this.singleplayerObject) {
        message = 'Press E to start singleplayer';
      } else if (object === this.multiplayerObject) {
        message = 'Press E to start multiplayer';
      }
      else if (object === this.tutorialObject) {
        message = 'Press E to start tutorial';
      }


      this.popupText.setPosition(object.x - 100, object.y - 50);
      this.popupText.setText(message);
      this.popupText.setVisible(true);
    } else {

      this.popupText.setVisible(false);
    }

    if (this.eKey.isDown && distance < 50) {
      if (object === this.singleplayerObject) {

        this.scene.start('Singleplayer');
        this.scene.stop()
      } else if (object === this.multiplayerObject) {

        this.scene.start('lobby');
        this.scene.stop()
      } else if (object === this.marketplaceObject) {

      }
        else if (object === this.tutorialObject) {
          this.scene.start('tutorial')
          this.scene.stop()
        }
    }
  }

  fetchLeaderboardData() {
    // Fetch top 10 players from the server
    fetch('/leaderboard')
      .then(response => response.json())
      .then(data => {
        // Clear existing leaderboard data
        this.document.innerHTML = '';

        // Update leaderboard with fetched data
        data.forEach((player, index) => {
          const playerDiv = document.createElement('div');
          playerDiv.textContent = `${index + 1}. ${player.user_name}: ${player.high_score}`;
          playerDiv.style.fontFamily = 'Arial';
          playerDiv.style.fontSize = '24px';
          playerDiv.style.color = '#ffffff';
          playerDiv.style.marginBottom = '8px';
          this.document.appendChild(playerDiv);
        });
      })
      .catch(error => console.error('Error fetching leaderboard data:', error));
  }


}

export default MainMenu;
