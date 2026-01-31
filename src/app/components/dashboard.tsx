import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { LogOut, TrendingUp, TrendingDown, Wallet, Package, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  currentPrice: number;
  change: number;
}

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface PerformanceData {
  time: string;
  value: number;
}

const INITIAL_STOCKS: Stock[] = [
  { id: '1', name: 'EcoBoost Inc', symbol: 'TECH', basePrice: 150, currentPrice: 150, change: 0 },
  { id: '2', name: 'KindInvest Corp', symbol: 'GAME', basePrice: 85, currentPrice: 85, change: 0 },
  { id: '3', name: 'BuddyBuilders Co', symbol: 'SWET', basePrice: 42, currentPrice: 42, change: 0 },
  { id: '4', name: 'EcoFriendly Ltd', symbol: 'ECO', basePrice: 120, currentPrice: 120, change: 0 },
  { id: '5', name: 'IdeaFactory', symbol: 'SPCE', basePrice: 200, currentPrice: 200, change: 0 },
  { id: '6', name: 'GrowTree Group', symbol: 'PETS', basePrice: 55, currentPrice: 55, change: 0 },
];

export function Dashboard({ username, onLogout }: DashboardProps) {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [buyAmounts, setBuyAmounts] = useState<Record<string, number>>({});
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    // Load user data
    const users = JSON.parse(localStorage.getItem('stockSimUsers') || '{}');
    const userData = users[username];
    if (userData) {
      setBalance(userData.balance);
      setPortfolio(userData.portfolio);
    }

    // Initialize performance data
    const now = new Date();
    const initialData: PerformanceData[] = [];
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000);
      initialData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: 10000
      });
    }
    setPerformanceData(initialData);

    // Simulate stock price changes every 3 seconds
    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => {
          const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5%
          const newPrice = stock.currentPrice * (1 + changePercent);
          const change = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
          return {
            ...stock,
            currentPrice: Math.max(1, parseFloat(newPrice.toFixed(2))),
            change: parseFloat(change.toFixed(2))
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [username]);

  // Update performance data when stocks or portfolio changes
  useEffect(() => {
    const currentTotalValue = balance + calculatePortfolioValue();
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setPerformanceData(prev => {
      const newData = [...prev, { time: timeString, value: currentTotalValue }];
      // Keep only the last 20 data points
      return newData.slice(-20);
    });
  }, [stocks, balance, portfolio]);

  const saveUserData = (newBalance: number, newPortfolio: Record<string, number>) => {
    const users = JSON.parse(localStorage.getItem('stockSimUsers') || '{}');
    users[username] = {
      ...users[username],
      balance: newBalance,
      portfolio: newPortfolio
    };
    localStorage.setItem('stockSimUsers', JSON.stringify(users));
    setBalance(newBalance);
    setPortfolio(newPortfolio);
  };

  const handleBuy = (stock: Stock) => {
    const quantity = buyAmounts[stock.id] || 1;
    const totalCost = stock.currentPrice * quantity;

    if (totalCost > balance) {
      toast.error(`Not enough money! You need $${totalCost.toFixed(2)}`);
      return;
    }

    const newBalance = balance - totalCost;
    const newPortfolio = {
      ...portfolio,
      [stock.id]: (portfolio[stock.id] || 0) + quantity
    };

    saveUserData(newBalance, newPortfolio);
    toast.success(`Bought ${quantity} shares of ${stock.symbol} for $${totalCost.toFixed(2)}`);
    setBuyAmounts({ ...buyAmounts, [stock.id]: 1 });
  };

  const handleSell = (stock: Stock) => {
    const quantity = buyAmounts[stock.id] || 1;
    const owned = portfolio[stock.id] || 0;

    if (owned < quantity) {
      toast.error(`You only own ${owned} shares of ${stock.symbol}`);
      return;
    }

    const totalValue = stock.currentPrice * quantity;
    const newBalance = balance + totalValue;
    const newPortfolio = {
      ...portfolio,
      [stock.id]: owned - quantity
    };

    saveUserData(newBalance, newPortfolio);
    toast.success(`Sold ${quantity} shares of ${stock.symbol} for $${totalValue.toFixed(2)}`);
    setBuyAmounts({ ...buyAmounts, [stock.id]: 1 });
  };

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [stockId, quantity]) => {
      const stock = stocks.find(s => s.id === stockId);
      return total + (stock ? stock.currentPrice * quantity : 0);
    }, 0);
  };

  const totalValue = balance + calculatePortfolioValue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-cyan-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <TrendingUp className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Stock Kidz</h1>
              <p className="text-sm text-slate-400">Hello, {username}!</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Performance Chart and Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Portfolio Performance
              </CardTitle>
              <CardDescription>Real-time tracking of your total value</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a4f" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#1e3a4f' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#1e3a4f' }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2333', 
                      border: '1px solid #1e3a4f',
                      borderRadius: '8px',
                      color: '#e0e7ff'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6ee7b7" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#6ee7b7', stroke: '#34d399', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Balance Summary Cards */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-300">
                  <Wallet className="w-5 h-5" />
                  Cash Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl text-emerald-200">${balance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-300">
                  <TrendingUp className="w-5 h-5" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl text-blue-200">${totalValue.toFixed(2)}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {totalValue >= 10000 
                    ? `+$${(totalValue - 10000).toFixed(2)}` 
                    : `-$${(10000 - totalValue).toFixed(2)}`}
                  {' from start'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Stocks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Stocks</CardTitle>
            <CardDescription>Click buy or sell to trade stocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map(stock => (
                <Card key={stock.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-900/30 hover:border-cyan-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-cyan-300">{stock.symbol}</CardTitle>
                        <CardDescription className="text-sm">{stock.name}</CardDescription>
                      </div>
                      <Badge variant={stock.change >= 0 ? "default" : "destructive"} className="gap-1">
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stock.change.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl text-emerald-300">${stock.currentPrice.toFixed(2)}</p>
                      {portfolio[stock.id] > 0 && (
                        <p className="text-sm text-slate-400 mt-1">
                          You own: {portfolio[stock.id]} shares
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={buyAmounts[stock.id] || 1}
                        onChange={(e) => setBuyAmounts({ ...buyAmounts, [stock.id]: parseInt(e.target.value) || 1 })}
                        className="w-20"
                      />
                      <Button
                        onClick={() => handleBuy(stock)}
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                      >
                        Buy
                      </Button>
                      <Button
                        onClick={() => handleSell(stock)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-cyan-500/50 hover:bg-cyan-500/20"
                        disabled={!portfolio[stock.id]}
                      >
                        Sell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Portfolio */}
        {Object.keys(portfolio).some(id => portfolio[id] > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>My Portfolio</CardTitle>
              <CardDescription>Your current stock holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(portfolio)
                  .filter(([_, quantity]) => quantity > 0)
                  .map(([stockId, quantity]) => {
                    const stock = stocks.find(s => s.id === stockId);
                    if (!stock) return null;
                    const value = stock.currentPrice * quantity;
                    return (
                      <div key={stockId} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <div>
                          <p className="font-medium text-cyan-300">{stock.symbol} - {stock.name}</p>
                          <p className="text-sm text-slate-400">{quantity} shares</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-300">${value.toFixed(2)}</p>
                          <p className="text-sm text-slate-400">${stock.currentPrice.toFixed(2)} per share</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}