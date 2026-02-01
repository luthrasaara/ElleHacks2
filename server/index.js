import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import AccountPage from './AccountPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;


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
  const db = client.db('StockKidZ');
  const users = db.collection('users');
  
  const newUser = req.body; // { username, balance: 10000 }
  const result = await users.insertOne(newUser);
  
  res.status(201).send(result);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = client.db('StockKidZ');
  const user = await db.collection('users').findOne({ username });

  if (user && user.password === password) {
    res.status(200).json({ message: "Success", username: user.username });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});
app.listen(5000, () => console.log('Server running on port 5000'));

app.post('/api/update-balance', async (req, res) => {
  const { username, newBalance } = req.body;
  try {
    const database = client.db('StockKidZ');
    await database.collection('users').updateOne(
      { username: username },
      { $set: { balance: newBalance } }
    );
    res.status(200).json({ message: "Bank updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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