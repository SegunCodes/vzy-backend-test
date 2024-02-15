const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const userController = require('./controllers/UserController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require('./middlewares/AuthenticateToken');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// API Endpoints
app.get('/', (req, res) => {
  res.send('Hello, human!');
});
app.post('/api/register', userController.register);
app.post('/api/login', userController.login);
app.put('/api/update', authenticateToken, userController.updateStatus);

// Stripe Webhook endpoint
app.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const userId = event.data.object.customer;
  
      // Update user status to 'paid' in the database
      try {
        await User.findOneAndUpdate({ _id: userId }, { status: 'paid' });
        res.status(200).json({ message: 'User status updated to paid' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating user status' });
      }
    }
  
    res.status(200).end();
}); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
