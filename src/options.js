class SettingsButtonWithPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.button = scene.add.image(0, 0, 'settingsButton').setInteractive().setScale(0.1);

        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.toggleSettingsPanel();
        });

        this.createSettingsPanel();

        scene.add.existing(this);
    }

    createSettingsPanel() {
        this.panelBackground = this.scene.add.graphics();
        this.panelBackground.fillStyle(0x000000, 0.8);
        this.panelBackground.fillRect(-250, 0, 200, 300);
        this.panelBackground.setVisible(false);

        this.volumeText = this.scene.add.text(-250, 50, 'Volume:', { fontSize: '16px', fill: '#fff' });
        this.volumeText.setVisible(false);

        this.volumeValue = this.scene.add.text(-250, 80, '100%', { fontSize: '16px', fill: '#fff' });
        this.volumeValue.setVisible(false);
        
        // this.exitGameText = this.scene.add.text(-90, -90, 'Exit Game', { fontSize: '16px', fill: '#fff' }).setInteractive();
        // this.exitGameText.setVisible(false);

        // this.exitGameText.on('pointerdown', () => {
        //     this.exitGame();
        // });

        this.add(this.panelBackground);
        this.add(this.volumeText);
        this.add(this.volumeValue);
        // this.add(this.exitGameText);
    }

    toggleSettingsPanel() {
        const isVisible = this.panelBackground.visible;
        this.panelBackground.setVisible(!isVisible);
        this.volumeText.setVisible(!isVisible);
        this.volumeValue.setVisible(!isVisible);
        // this.exitGameText.setVisible(!isVisible);
    }

    // exitGame() {
    //     console.log('Exit game clicked');
    //     this.scene.scene.start('MainMenuScene');
    // }
}

export default SettingsButtonWithPanel;
