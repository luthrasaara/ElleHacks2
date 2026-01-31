import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI; // Your connection string from Atlas
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("🚀 Connected to MongoDB!");
  } catch (e) {
    console.error(e);
  }
}
connectDB();


// A simple "Sign Up" route for your kids' stock app
app.post('/api/signup', async (req, res) => {
  const db = client.db('stock_app');
  const users = db.collection('users');
  
  const newUser = req.body; // { username, balance: 10000 }
  const result = await users.insertOne(newUser);
  
  res.status(201).send(result);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = client.db('stock_app');
  const user = await db.collection('users').findOne({ username });

  if (user && user.password === password) {
    res.status(200).json({ message: "Success", username: user.username });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});
app.listen(5000, () => console.log('Server running on port 5000'));