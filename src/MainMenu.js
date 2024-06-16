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
    this.progressBar = null;
    this.progressBarBackground = null;
    this.currentLevelText = null;
    this.nextLevelText = null;
    this.percentageText = null;
  }

  init(data) {
    this.username = data.username;
  }

  preload() {
  }

  create() {
    this.fetchLeaderboardData();
    this.setupScene();
    this.setupInputEvents();
    this.fetchInfo();
    this.setupPaymentListener();
    this.settingsButton = new SettingsButtonWithPanel(this, 1890, 90);
    this.setupProgressBar();
    this.events.on('settingsPanelOpened', this.onSettingsPanelOpened, this);
  }

  onSettingsPanelOpened() {
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.W);
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.A);
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.S);
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.D);
  }

  setupInputEvents() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  setupScene() {
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;

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

    this.player = this.physics.add.sprite(864, 624, 'idleDown').setScale(3);
    this.player.setCollideWorldBounds(true);

    this.objects = this.physics.add.staticGroup();
    this.singleplayerObject = this.objects.create(530, 613, 'singleplayer');
    this.multiplayerObject = this.objects.create(720, 613, 'multiplayer');
    this.marketplaceObject = this.objects.create(910, 613, 'marketplace');
    this.tutorialObject = this.objects.create(1105, 613, 'tutorial');

    const newWidth = 150;
    const newHeight = 100;

    this.singleplayerObject.setDisplaySize(newWidth, newHeight);
    this.multiplayerObject.setDisplaySize(newWidth, newHeight);
    this.marketplaceObject.setDisplaySize(newWidth, newHeight);
    this.tutorialObject.setDisplaySize(newWidth, newHeight);

    this.singleplayerObject.body.setSize(newWidth, newHeight, true);
    this.multiplayerObject.body.setSize(newWidth, newHeight, true);
    this.marketplaceObject.body.setSize(newWidth, newHeight, true);
    this.tutorialObject.body.setSize(newWidth, newHeight, true);

    this.singleplayerObject.body.setOffset((this.singleplayerObject.width - newWidth) / 2, (this.singleplayerObject.height - newHeight) / 2);
    this.multiplayerObject.body.setOffset((this.multiplayerObject.width - newWidth) / 2, (this.multiplayerObject.height - newHeight) / 2);
    this.marketplaceObject.body.setOffset((this.marketplaceObject.width - newWidth) / 2, (this.marketplaceObject.height - newHeight) / 2);
    this.tutorialObject.body.setOffset((this.tutorialObject.width - newWidth) / 2, (this.tutorialObject.height - newHeight) / 2);


    this.objects.getChildren().forEach(object => {
      object.setScale(0.2);
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

    this.coinsText = this.add.text(1730, 20, 'Coins: ', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });
    this.plusButton = this.add.sprite(1890, 30, 'plus').setScale(0.05).setInteractive({ useHandCursor: true });
    this.plusButton.on('pointerdown', () => {
      this.showCoinPurchaseOptions(this.username);
    });
  }

  setupProgressBar() {
    this.barWidth = 200;
    this.barHeight = 20;
    this.barX = 1400;
    this.barY = 25;

    this.progressBarBackground = this.add.graphics();
    this.progressBarBackground.fillStyle(0x000000, 1);
    this.progressBarBackground.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);

    this.progressBar = this.add.graphics();

    this.currentLevelText = this.add.text(this.barX - 80, this.barY - 2, 'Level ', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });

    this.nextLevelText = this.add.text(this.barX + this.barWidth + 10, this.barY - 2, 'Level ', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });

    this.percentageText = this.add.text(this.barX + this.barWidth / 2, this.barY - 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    this.updateProgressBar(0, 1); //default
  }

  updateProgressBar(percentage, level) {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(this.barX, this.barY, this.barWidth * percentage, this.barHeight);

    this.currentLevelText.setText(`Level ${level}`);
    this.nextLevelText.setText(`Level ${level + 1}`);
    this.percentageText.setText(`${Math.round(percentage * 100)}%`);
  }

  showLogout() {
    const promptContainer = document.getElementById('prompt-container');
    promptContainer.style.display = 'block';

    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');

    const handleYesClick = () => {
      socket.emit('logout');
      socket.removeAllListeners();
      this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.W);
      this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.A);
      this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.S);
      this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.D);
      this.scene.start('authenticate');
      this.scene.stop();
      promptContainer.style.display = 'none';
      yesButton.removeEventListener('click', handleYesClick);
      noButton.removeEventListener('click', handleNoClick);
    };

    const handleNoClick = () => {
      promptContainer.style.display = 'none';
      yesButton.removeEventListener('click', handleYesClick);
      noButton.removeEventListener('click', handleNoClick);
    };

    yesButton.addEventListener('click', handleYesClick);
    noButton.addEventListener('click', handleNoClick);
  }

  setupPaymentListener() {
    this.paymentSuccessHandler = (event) => {
      const { username, amount } = event.detail;
      this.handlePaymentSuccess(username, amount);
      this.clearPaymentForm();
    };
    window.addEventListener('payment-success', this.paymentSuccessHandler);
  }

  shutdown() {
    console.log('isjungia')
    window.removeEventListener('payment-success', this.paymentSuccessHandler);
  }

  showCoinPurchaseOptions(username) {
    const options = [
      { label: '100 Coins - €1', amount: 100, cost: 1 },
      { label: '500 Coins - €4', amount: 500, cost: 4 },
      { label: '1000 Coins - €7', amount: 1000, cost: 7 },
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
          const coins = option.amount;
          const cost = option.cost;
          this.showPaymentForm(clientSecret, coins, cost);
          coinPurchaseContainer.style.display = 'none'; // Hide the prompt after selection
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

  showPaymentForm(clientSecret, coins, cost) {
    // Clear any previous instances of the payment form
    const existingForm = document.getElementById('payment-form');
    if (existingForm) {
      existingForm.remove();
    }

    const formHtml = `
      <div id="payment-form">
        <form id="payment-element-form">
          <div id="coin-details" style="margin-bottom: 10px; font-size: 24px;">
            <div>Coins: ${coins}</div>
            <div>Cost: €${cost.toFixed(2)}</div>
          </div>
          <div id="payment-element"></div>
          <button id="submit-button" class="prompt-button">Pay</button>
          <button id="cancel-button" class="prompt-button" type="button">Cancel</button>
          <div id="error-message"></div>
        </form>
      </div>
    `;
    const paymentForm = this.add.dom(400, 300).createFromHTML(formHtml);

    this.time.delayedCall(100, () => {
      this.setupStripeElements(clientSecret, coins);
    });

    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', () => {
      this.clearPaymentForm();
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

    // Clear any child nodes in the payment element container
    const paymentElementContainer = document.getElementById('payment-element');
    while (paymentElementContainer.firstChild) {
      paymentElementContainer.removeChild(paymentElementContainer.firstChild);
    }

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
      if (data.success) {
        this.coinsText.setText(`Coins: ${data.coins}`);
      } else {
        console.error('Failed to update coins.');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  }

  clearPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.style.display = 'none';
      const paymentElementForm = document.getElementById('payment-element-form');
      if (paymentElementForm) {
        paymentElementForm.reset();
      }
    }
  }

  fetchInfo() {
    fetch(`/get-info?username=${encodeURIComponent(this.username)}`)
      .then(response => response.json())
      .then(data => {
        this.coins = data.coins
        this.level = data.level
        this.coinsText.setText(`Coins: ${this.coins}`);
        
        const experiencePercentage = data.xp / (data.level * 100);
        this.updateProgressBar(experiencePercentage, this.level);
      })
      .catch(error => console.error('Error fetching info:', error));
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
      const animationName = `Walk${direction}`;
      player.anims.play(animationName, true);
      this.lastDirection = direction;
    } else {
      let idleAnimationName;
      if (this.lastDirection) {
          if (this.lastDirection.includes('Up')) {
              idleAnimationName = 'IdleUp';
          } else if (this.lastDirection.includes('Down')) {
              idleAnimationName = 'IdleDown';
          } else if (this.lastDirection.includes('Left') || this.lastDirection.includes('Right')) {
              idleAnimationName = this.lastDirection.includes('Left') ? 'IdleLeft' : 'IdleRight';
          } else {
              idleAnimationName = 'IdleDown';
          }
      } else {
          idleAnimationName = 'IdleDown';
      }
      player.anims.play(idleAnimationName, true);
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
      } else if (object == this.marketplaceObject) {
        message = 'Press E to go to marketplace'
      }

      this.popupText.setPosition(object.x - 100, object.y - 80);
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
        this.shutdown()
        this.scene.start('marketplace', {username: this.username})
        this.scene.stop()
      } else if (object === this.tutorialObject) {
        this.scene.start('tutorial', {username: this.username});
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
