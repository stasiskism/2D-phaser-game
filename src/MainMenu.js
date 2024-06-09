import SettingsButtonWithPanel from './options.js'

class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'mainMenu' });
    this.player = null;
    this.eKey = null;
    this.objects = null;
    this.popupText = null;
    this.singleplayerObject = null;
    this.multiplayerObject = null;
    this.login = true;
    this.coinsText = null;
    this.plusButton = null;
  }

  init(data) {
    this.username = data.username
  }

  preload() {
    this.load.image('create', 'assets/Room_Button.png');
    this.load.image('join', 'assets/join.png');
    this.load.image('exit', 'assets/Exit_Button.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('plus', 'assets/Plus_Button.png');
  }

  create() {
    this.fetchLeaderboardData();
    this.setupScene();
    this.setupInputEvents();
    this.fetchCoins();
    this.setupPaymentListener();
    this.settingsButton = new SettingsButtonWithPanel(this, 1890, 90);
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

    const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32 });
    const tileset = map.addTilesetImage("asd", "tiles");
    const layer = map.createLayer("Tile Layer 1", tileset, 0, 0);

    const textStyle = {
      fontFamily: 'Arial',
      fontSize: '30px',
      align: 'center'
  };
    
    this.add.sprite(430, 430, 'wasd').setScale(0.2);
    this.add.text(365, 350, 'Movement', textStyle);

    this.player = this.physics.add.sprite(864, 624, 'WwalkDown2').setScale(3);

    this.fullscreenButton = this.add.sprite(1890, 30, 'fullscreen').setDepth().setScale(0.6);
    this.fullscreenButton.setInteractive({ useHandCursor: true });
    this.fullscreenButton.on('pointerdown', () => {
      document.getElementById('phaser-example');
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.objects = this.physics.add.staticGroup();
    this.singleplayerObject = this.objects.create(720, 653, 'singleplayer');
    this.multiplayerObject = this.objects.create(1010, 653, 'multiplayer');
    this.marketplaceObject = this.objects.create(1290, 653, 'marketplace');
    this.tutorialObject = this.objects.create(1290, 453, 'tutorial');

    this.objects.getChildren().forEach(object => {
      object.setScale(0.2);
    });

    const invisibleWalls = [
      { x: 336, y: 959, width: 1250, height: 10 },
      { x: 326, y: 315, width: 10, height: 650 },
      { x: 1580, y: 315, width: 10, height: 650 },
      { x: 326, y: 315, width: 1250, height: 10 },
    ];

    invisibleWalls.forEach(wall => {
      const invisibleWall = this.physics.add.sprite(wall.x + wall.width / 2, wall.y + wall.height / 2, 'invisible-wall').setVisible(false).setSize(wall.width, wall.height);
      invisibleWall.body.setAllowGravity(false);
      invisibleWall.body.setImmovable(true);
      this.physics.add.collider(this.player, invisibleWall);
    });

    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.popupText = this.add.text(100, 100, '', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
    this.popupText.setVisible(false);

    this.physics.add.overlap(this.player, this.objects, this.interactWithObject, null, this);

    this.leaderboard = this.add.dom(-250, -250).createFromHTML(`
    <div id="displayLeaderboard" style="position: absolute; padding: 16px; font-size: 38px; user-select: none; background: rgba(0, 0, 0, 0.8); color: white; border: 2px solid #ffffff; border-radius: 15px;">
      <div style="margin-bottom: 16px; text-align: center;">Leaderboard</div>
      <div id="playerLabels"></div>
    </div>
  `);

    this.leaderboard.setPosition(50, 50).setScrollFactor(0);
    this.document = this.leaderboard.node.querySelector(`#playerLabels`);

    this.coinsText = this.add.text(1650, 20, 'Coins: ', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
    this.plusButton = this.add.sprite(1830, 30, 'plus').setScale(0.05).setInteractive({ useHandCursor: true });
    this.plusButton.on('pointerdown', () => {
      this.showCoinPurchaseOptions(this.username);

    });
  }


  setupPaymentListener() {
    window.addEventListener('payment-success', (event) => {
      const { username, amount } = event.detail;
      console.log('usernam', event.detail)
      this.handlePaymentSuccess(username, amount);
    });
  }

  showCoinPurchaseOptions(username) {
    const options = [
      { label: '100 Coins - $1', amount: 100 },
      { label: '500 Coins - $4', amount: 500 },
      { label: '1000 Coins - $7', amount: 1000 },
    ];

    const coinPurchaseContainer = document.getElementById('coin-purchase-container');
    const coinOptions = document.getElementById('coin-options');
    coinOptions.innerHTML = '';

    options.forEach(option => {
      const optionButton = document.createElement('div');
      optionButton.className = 'prompt-button';
      optionButton.textContent = option.label;
      optionButton.addEventListener('click', async () => {
        try {
          const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: option.amount, username })
          });
          const { clientSecret } = await response.json();
          this.showPaymentForm(clientSecret, option.amount);
          coinPurchaseContainer.style.display = 'none';
        } catch (err) {
          console.error('Error creating payment intent:', err);
        }
      });
      coinOptions.appendChild(optionButton);
    });

    const coinCancelButton = document.getElementById('coinCancelButton');
    coinCancelButton.addEventListener('click', () => {
      coinPurchaseContainer.style.display = 'none';
    });

    coinPurchaseContainer.style.display = 'block';
  }


  showPaymentForm(clientSecret, amount) {
    const formHtml = `
      <div id="payment-form">
        <form id="payment-element-form">
          <div id="payment-element"><!-- Stripe.js will insert the Payment Element here --></div>
          <button id="submit-button">Pay</button>
          <div id="error-message"></div>
        </form>
      </div>
    `;
    const paymentForm = this.add.dom(400, 300).createFromHTML(formHtml);

    this.time.delayedCall(100, () => {
      this.setupStripeElements(clientSecret, amount);
    });
  }

  setupStripeElements(clientSecret, amount) {
    const stripe = Stripe('pk_test_51PJtjWP7nzuSu7T7Q211oUu5LICFrh0QjI6hx4KiOAjZSXXhe0HgNlImYdEdPDAa5OGKG4y8hyR1B0SuiiP3okTP00OOp963M1');
    const options = {
      layout: {
        type: 'accordion',
        defaultCollapsed: false,
        radios: false,
        spacedAccordionItems: true
      },
      wallets: {
        applePay: 'never',
        googlePay: 'never'
      }
    };
    const appearance = {
      theme: 'stripe',
    };
    const elements = stripe.elements({ clientSecret, appearance });
    const paymentElement = elements.create('payment', options);
    paymentElement.mount('#payment-element');

    const form = document.getElementById('payment-element-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: 'if_required'
      });

      if (error) {
        document.getElementById('error-message').textContent = error.message;
      } else {
        const event = new CustomEvent('payment-success', { detail: { username: this.username, amount } });
        window.dispatchEvent(event);
      }
    });
  }

  async handlePaymentSuccess(username, amount) {
    console.log(`Payment successful for user: ${username}`);
    try {
      const response = await fetch('/update-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, amount })
      });
      const data = await response.json();
      console.log('data', data)
      if (data.success) {
        this.coinsText.setText(`Coins: ${data.coins}`);
      } else {
        console.error('Failed to update coins.');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  }

  fetchCoins() {
    fetch(`get-coins?username=${encodeURIComponent(this.username)}`)
      .then(response => response.json())
      .then(data => {
        this.coinsText.setText(`Coins: ${data.coins}`);
      })
      .catch(error => console.error('Error fetching coins:', error));
  }

  update() {
    this.updatePlayerMovement();
  }

  updatePlayerMovement() {
    if (!this.player) return;
    const player = this.player;
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
        player.anims.play('idle', true);
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
      } else if (object === this.tutorialObject) {
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
        this.scene.start('Singleplayer', { login: this.login });
        this.scene.stop();
      } else if (object === this.multiplayerObject) {
        this.scene.start('lobby');
        this.scene.stop();
      } else if (object === this.marketplaceObject) {
      } else if (object === this.tutorialObject) {
        this.scene.start('tutorial');
        this.scene.stop();
      }
    }
  }

  fetchLeaderboardData() {
    fetch('/leaderboard')
      .then(response => response.json())
      .then(data => {
        this.document.innerHTML = '';
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
