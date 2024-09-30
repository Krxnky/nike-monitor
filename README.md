# Nike Monitor

Nike Monitor is a Node.js bot that tracks new product additions and updates from Nike and SNKRS. It also alerts you when SNKRS passes drop, ensuring you never miss a release. Notifications are sent directly to your Discord channel via a webhook. Additionally, the bot stores current product data in a MongoDB database.

## Features

- **Product Monitoring:** Keeps track of new products and updates from Nike and SNKRS.
- **SNKRS Pass Alerts:** Notifies you when SNKRS passes are available.
- **MongoDB Integration:** Stores current product data for easy access.
- **Discord Integration:** Sends real-time notifications to your Discord channel.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- A Discord webhook URL

## Getting Started

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

3. Configure your environment:
   - Create a `.env` file in the root directory and add your MongoDB URL and Discord webhook:
     ```
     MONGODB_URL=your_mongodb_url
     DISCORD_WEBHOOK_URL=your_webhook_url
     ```

4. Run the bot:
   ```bash
   npm start
   ```

## Usage

Once the bot is running, it will monitor the Nike and SNKRS APIs, store current product data in MongoDB, and send notifications to your specified Discord channel.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests for improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Stay ahead of the sneaker game with Nike Monitor! 🏆👟
