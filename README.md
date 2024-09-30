# Nike Monitor

Nike Monitor is a Node.js bot that keeps you updated on new product additions and updates on Nike and SNKRS. It also alerts you when SNKRS passes drop, ensuring you never miss a release. Notifications are sent directly to your Discord channel via a webhook.

## Features

- **Product Monitoring:** Tracks new products and updates from Nike and SNKRS.
- **SNKRS Pass Alerts:** Notifies you when SNKRS passes are available.
- **Discord Integration:** Sends real-time notifications to your Discord channel.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A Discord webhook URL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Krxnky/nike-monitor.git
   cd nike-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your webhook URL:
   - Create a `.env` file in the root directory and add your Discord webhook:
     ```
     DISCORD_WEBHOOK_URL=your_webhook_url
     ```

4. Run the bot:
   ```bash
   npm start
   ```

## Usage

Once the bot is running, it will monitor the Nike and SNKRS APIs and send notifications to your specified Discord channel.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests for improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Stay ahead of the sneaker game with Nike Monitor! 🏆👟
