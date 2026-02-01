import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("🚀 Connected to MongoDB!");
  } catch (e) {
    console.error("MongoDB Connection Error:", e);
  }
}
connectDB();

// --- ROUTES ---

// 1. Sign Up
app.post('/api/signup', async (req, res) => {
  try {
    const db = client.db('StockKidZ');
    const users = db.collection('users');
    const newUser = req.body; 
    const result = await users.insertOne(newUser);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = client.db('StockKidZ');
    const user = await db.collection('users').findOne({ username });

    if (user && user.password === password) {
      res.status(200).json({ message: "Success", username: user.username });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Balance (MOVED ABOVE LISTEN)
app.post('/api/update-balance', async (req, res) => {
  const { username, newBalance } = req.body;
  try {
    const database = client.db('StockKidZ');
    await database.collection('users').updateOne(
      { username: username },
      // parseFloat ensures we store a Number, not a String
      { $set: { balance: parseFloat(newBalance) } } 
    );
    res.status(200).json({ message: "Bank updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get User Data (MOVED ABOVE LISTEN)
app.get('/api/user/:username', async (req, res) => {
  try {
    const db = client.db('StockKidZ'); 
    const user = await db.collection('users').findOne({ username: req.params.username });
    
    if (user) {
      res.json({ 
        balance: user.balance !== undefined ? user.balance : 10000 
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/leaderboard', async (req, res) => {
  try {
    const db = client.db('StockKidZ');
    const users = db.collection('users');

    // 1. Get all users
    // 2. Only pull username and balance (projection)
    // 3. Sort by balance: -1 (Highest to Lowest)
    const topUsers = await users
      .find({})
      .project({ username: 1, balance: 1, _id: 0 })
      .sort({ balance: -1 })
      .toArray();

    res.status(200).json(topUsers);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// --- THE LISTEN COMMAND GOES AT THE VERY END ---
app.listen(5000, () => console.log('✅ Server running on port 5000 and all routes registered!'));