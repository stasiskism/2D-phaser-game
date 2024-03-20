/* global Phaser */
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
    this.load.image('background', 'assets/backgroundas1.jpg');
    this.load.image('player', 'assets/player_23.png');
    this.load.image('object', 'assets/Multiplayer.png');
  }

  create() {

    let centerX = this.cameras.main.width / 2;
    let centerY = this.cameras.main.height / 2;

    const blackBackground = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0.5);

    this.add.image(centerX, centerY, 'background').setOrigin(0.5, 0.5);

    this.player = this.physics.add.sprite(958, 617, 'player');

    this.objects = this.physics.add.staticGroup();
    this.singleplayerObject = this.objects.create(1056, 787, 'object');
    this.multiplayerObject = this.objects.create(965, 446, 'object');

    this.objects.getChildren().forEach(object => {
      object.setScale(0.3); // Adjust scale factor as needed
    });

    const invisibleWalls = [
      { x: 576, y: 872, width: 768, height: 10 }, // Wall 1
      { x: 1344, y: 146, width: 10, height: 694 }, // Wall 2
      { x: 578, y: 146, width: 10, height: 694 }, // Wall 3
      { x: 576, y: 141, width: 768, height: 10 }, // Wall 4
      // Add more walls as needed 1344 144
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

    if (cursors.left.isDown || aKey.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors.right.isDown || dKey.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    if (cursors.up.isDown || wKey.isDown) {
      this.player.setVelocityY(-160);
    } else if (cursors.down.isDown || sKey.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
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


      this.popupText.setPosition(object.x - 100, object.y - 50);
      this.popupText.setText(message);
      this.popupText.setVisible(true);
    } else {

      this.popupText.setVisible(false);
    }

    if (this.eKey.isDown && distance < 50) {
      if (object === this.singleplayerObject) {

        this.scene.start('Singleplayer');
      } else if (object === this.multiplayerObject) {

        this.scene.start('Multiplayer');
      }
    }
  }
}

export default MainMenu;
