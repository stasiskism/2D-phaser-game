/* global Phaser */

import Scene1 from './scene1.js'
import MainMenu from './MainMenu.js'
import Singleplayer from './Singleplayer.js'
import Multiplayer from './Multiplayer.js'
import Restart from './Restart.js'


const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    backgroundColor: 0x5F6e7a,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

const game = new Phaser.Game(config)

game.scene.add('scene1', Scene1)
game.scene.add('mainMenu', MainMenu)
game.scene.add('Singleplayer', Singleplayer)
game.scene.add('Multiplayer', Multiplayer)
game.scene.add('Restart', Restart)
game.scene.start('scene1')
