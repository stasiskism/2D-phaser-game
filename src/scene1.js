/* global Phaser */

class Scene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'scene1'});
    }

    init (data) {
        this.cameras.main.setBackgroundColor('#ffffff')
    }

    preload () {
        this.load.image('vaizdas', 'assets/INTRO.png')
        this.load.image('background', 'assets/ginklas.png')
        this.load.image('login', 'assets/login.PNG')
        this.load.image('register', 'assets/register.PNG')
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
        this.load.image('mapas', 'assets/mapas.png')
        this.load.image('player', 'assets/player_23.png')
        this.load.image('bullet', 'assets/Bullets/bullet.png')
        this.load.image('crosshair', 'assets/crosshair008.png')
        this.load.image('shotgun', 'assets/Weapons/tile001.png')
        this.load.image('enemy', 'assets/enemy.png')
        this.load.image('fullscreen', 'assets/full-screen.png')
        this.load.image('multiplayer', 'assets/multiplayer.png');
        this.load.image('singleplayer', 'assets/singleplayer.png');
        this.load.image('marketplace', 'assets/marketplace.png');
        this.load.image("tiles", 'assets/assetas.png')
        this.load.image('smokeGrenade', 'assets/smokeGrenade.png')
        this.load.spritesheet('singleShot', 'assets/V1.00/Sprite-sheets/Assault_rifle_V1.00/WEAPON/[SINGLE_SHOT] Assault_rifle_V1.00.png', { frameWidth: 128, frameHeight: 48 });
        this.load.spritesheet('reload', 'assets/V1.00/Sprite-sheets/Assault_rifle_V1.00/WEAPON/[RELOAD] Assault_rifle_V1.00 - Reload.png', { frameWidth: 96, frameHeight: 64 });
        this.load.spritesheet('emptying', 'assets/V1.00/Sprite-sheets/Assault_rifle_V1.00/WEAPON/[EMPTYING] Assault_rifle_V1.00.png', { frameWidth: 96, frameHeight: 64 });
        this.load.spritesheet('smoke', 'assets/smoke.png', { frameWidth: 32, frameHeight: 32, endFrame: 33 });
        this.load.tilemapTiledJSON('map', 'assets/maps.json');
        this.load.image('wasd', 'assets/wasd.png')
        this.load.image('tutorial', 'assets/tutorials.png')
        this.load.image('R', 'assets/R-Key.png')
        this.load.image('G', 'assets/G-Key.png')
        this.load.image('left-click', 'assets/left-click.png')
    }

    create (data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.vaizdasImage = this.add.sprite(centerX, centerY, 'vaizdas');

    }

    update (time, delta) {
        if (time > 1000){
            this.scene.stop()
            this.scene.start('authenticate')
        }
    }
}

export default Scene1
