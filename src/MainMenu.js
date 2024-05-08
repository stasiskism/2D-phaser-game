
class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'mainMenu' });
    this.player = null;
    this.eKey = null;
    this.objects = null;
    this.popupText = null;
    this.singleplayerObject = null;
    this.multiplayerObject = null;
    this.login = true
  }

  preload() {
    this.load.image('menu', 'assets/menuPhoto.jpg');
    this.load.image('create', 'assets/create.png')
    this.load.image('join', 'assets/join.png')
    this.load.image('exit', 'assets/exit.png')
    this.load.image('enemy', 'assets/enemy.png')
  }

  create() {
    this.fetchLeaderboardData()
    this.setupScene()
    this.setupInputEvents()
    this.setupAnimations()
  }

  setupInputEvents() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  setupScene() {
    let centerX = this.cameras.main.width / 2;
    let centerY = this.cameras.main.height / 2;

    const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
    const tileset = map.addTilesetImage("asd", "tiles");
    const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);
    
    //this.add.text(350, 350, 'Controls:').setScale(1.5)
    this.add.sprite(430, 430, 'wasd').setScale(0.2)
    this.add.text(375, 350, 'Movement').setScale(1.5)

    this.player = this.physics.add.sprite(864, 624, 'WwalkDown2').setScale(3); // 'WwalkDown2' is the idle frame

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

  setupAnimations() {
    const animations = [
      { key: 'WwalkUp', frames: ['WwalkUp1', 'WwalkUp2', 'WwalkUp3'] },
      { key: 'WwalkRight', frames: ['WwalkRight1', 'WwalkRight2', 'WwalkRight3'] },
      { key: 'WwalkUpRight', frames: ['WwalkUpRight1', 'WwalkUpRight2', 'WwalkUpRight3'] },
      { key: 'WwalkDownRight', frames: ['WwalkDownRight1', 'WwalkDownRight2', 'WwalkDownRight3'] },
      { key: 'WwalkDown', frames: ['WwalkDown1', 'WwalkDown2', 'WwalkDown3'] },
      { key: 'WwalkDownLeft', frames: ['WwalkDownLeft1', 'WwalkDownLeft2', 'WwalkDownLeft3'] },
      { key: 'WwalkLeft', frames: ['WwalkLeft1', 'WwalkLeft2', 'WwalkLeft3'] },
      { key: 'WwalkUpLeft', frames: ['WwalkUpLeft1', 'WwalkUpLeft2', 'WwalkUpLeft3'] },
      { key: 'idle', frames: ['WwalkDown2'] }
  ];
  animations.forEach(anim => this.anims.create({
      key: anim.key,
      frames: anim.frames.map(frame => ({ key: frame })),
      frameRate: 10,
      repeat: -1
  }));
  }

  update() {
    this.updatePlayerMovement()
  }

  updatePlayerMovement() {
    if (!this.player) return;
    const player = this.player
    let moving = false;
    let direction = '';

    if (this.w.isDown) {
        moving = true;
        direction += 'Up';
        player.y -= 2;
    } else if (this.s.isDown) {
        moving = true;
        direction += 'Down';
        player.y += 2;
    }

    if (this.a.isDown) {
        moving = true;
        direction += 'Left';
        player.x -= 2;
    } else if (this.d.isDown) {
        moving = true;
        direction += 'Right';
        player.x += 2;
    }

    if (moving) {
        if (player && player.anims) {
            const animationName = `Wwalk${direction}`;
            player.anims.play(animationName, true);
        }
    } else {
        if (player && player.anims) {
        player.anims.stop();
        }
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

        this.scene.start('Singleplayer', {login: this.login});
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
