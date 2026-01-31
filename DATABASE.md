* User Collection
{
  "_id": "ObjectId",
  "username": "stock_hero_2026",
  "password_hash": "...", // Never store plain text!
  "avatar": "penguin_icon.png",
  "virtual_balance": 10000.00,
  "created_at": "ISODate"
}

* Portfolios
{
  "_id": "ObjectId",
  "user_id": "ObjectId", // Links to the User
  "symbol": "AAPL",
  "company_name": "Apple",
  "shares_owned": 5,
  "average_buy_price": 150.25,
  "last_updated": "ISODate"
}

* Transactions
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "BUY", // or "SELL"
  "symbol": "DIS",
  "shares": 2,
  "price_per_share": 95.00,
  "total_cost": 190.00,
  "timestamp": "ISODate"
}