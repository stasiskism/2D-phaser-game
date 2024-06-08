class SettingsButtonWithPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        this.button = scene.add.image(0, 0, 'settingsButton').setInteractive().setScale(0.1);
        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.toggleSettingsPanel();
        });

        this.createSettingsPanel();

        scene.add.existing(this);
    }

    createSettingsPanel() {
        this.shadow = this.scene.add.graphics();
        this.shadow.fillStyle(0x000000, 0.5);
        this.shadow.fillRoundedRect(-245, 5, 200, 300, 15);
        this.shadow.setVisible(false);

        this.panelBackground = this.scene.add.graphics();
        this.panelBackground.fillStyle(0x000000, 0.8);
        this.panelBackground.fillRoundedRect(-250, 0, 200, 300, 15);
        this.panelBackground.lineStyle(2, 0xffffff, 1);
        this.panelBackground.strokeRoundedRect(-250, 0, 200, 300, 15);
        this.panelBackground.setVisible(false);

        const textStyle = {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        };

        this.nameText = this.scene.add.text(-240, 20, 'OPTIONS', textStyle);
        this.nameText.setVisible(false);

        this.volumeText = this.scene.add.text(-240, 50, 'Volume:', textStyle);
        this.volumeText.setVisible(false);

        this.volumeValue = this.scene.add.text(-240, 80, '100%', textStyle);
        this.volumeValue.setVisible(false);

        this.exitGameText = this.scene.add.text(-240, 130, 'Exit Game', { ...textStyle, fontSize: '18px', fontStyle: 'bold' }).setInteractive();
        this.exitGameText.setVisible(false);

        this.exitGameText.on('pointerdown', () => {
            const promptContainer = document.getElementById('prompt-container');
            promptContainer.style.display = 'block';

            const yesButton = document.getElementById('yesButton');
            const noButton = document.getElementById('noButton');

            const handleYesClick = () => {
                console.log("Yes button clicked");
                socket.emit('logout');
                socket.removeAllListeners();
                console.log("Socket emitted logout and listeners removed");

                this.scene.scene.start('authenticate');
                this.scene.scene.stop();
                console.log("Scene switched to authenticate and stopped");

                promptContainer.style.display = 'none';
                yesButton.removeEventListener('click', handleYesClick);
                noButton.removeEventListener('click', handleNoClick);
                console.log("Event listeners removed and prompt container hidden");
            };

            const handleNoClick = () => {
                promptContainer.style.display = 'none';
                yesButton.removeEventListener('click', handleYesClick);
                noButton.removeEventListener('click', handleNoClick);
            };

            yesButton.addEventListener('click', handleYesClick);
            noButton.addEventListener('click', handleNoClick);
        });

        this.add(this.nameText);
        this.add(this.shadow);
        this.add(this.panelBackground);
        this.add(this.volumeText);
        this.add(this.volumeValue);
        this.add(this.exitGameText);
    }

    toggleSettingsPanel() {
        const isVisible = this.panelBackground.visible;
        this.nameText.setVisible(!isVisible);
        this.shadow.setVisible(!isVisible);
        this.panelBackground.setVisible(!isVisible);
        this.volumeText.setVisible(!isVisible);
        this.volumeValue.setVisible(!isVisible);
        this.exitGameText.setVisible(!isVisible);
    }
}

export default SettingsButtonWithPanel;
