import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  BarChart3,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  onLeaderboard: () => void;
  onAccount: () => void;
}

interface PerformanceData {
  time: string;
  value: number;
  timestamp: number;
}

const INITIAL_STOCKS: Stock[] = [
  {
    id: "1",
    name: "GLD",
    symbol: "⚜️ Get Gold",
    basePrice: 150,
    currentPrice: 150,
    change: 0,
  },
  {
    id: "2",
    name: "QQQ",
    symbol: "🧊 Cubes",
    basePrice: 85,
    currentPrice: 85,
    change: 0,
  },
  {
    id: "3",
    name: "RBLX",
    symbol: "🌞 Roblocks",
    basePrice: 42,
    currentPrice: 42,
    change: 0,
  },
  {
    id: "4",
    name: "USO",
    symbol: "⛽ Big Oil",
    basePrice: 120,
    currentPrice: 120,
    change: 0,
  },
  {
    id: "5",
    name: "XRT",
    symbol: "🛍️ Shopping Spree",
    basePrice: 200,
    currentPrice: 200,
    change: 0,
  },
  {
    id: "6",
    name: "VHT",
    symbol: "🩺 Health",
    basePrice: 55,
    currentPrice: 55,
    change: 0,
  },
];

export function Dashboard({
  username,
  onLogout,
  onLeaderboard,
  onAccount,
}: DashboardProps) {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [buyAmounts, setBuyAmounts] = useState<Record<string, number>>({});
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [lastRecordedMinute, setLastRecordedMinute] = useState<string>("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<
    { username: string; balance: number }[]
  >([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [input, setInput] = useState("");

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // show user message instantly
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: [
              {
                role: "user",
                content: [{ type: "text", text }],
              },
            ],
          }),
        },
      );

      const data = await res.json();

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // 1. Get Balance from DB
      try {
        const res = await fetch(`http://localhost:5000/api/user/${username}`);
        const data = await res.json();
        setBalance(data.balance ?? 10000);
      } catch (err) {
        console.error("Balance fetch failed:", err);
        setBalance(10000);
      }

      // 2. Get Portfolio from LocalStorage
      const savedPortfolio = localStorage.getItem(`portfolio_${username}`);
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }
    };

    // 3. Get Real Prices from Flask
    const fetchRealPrices = async () => {
      try {
        const res = await fetch("http://localhost:5000/prices");
        const apiData = await res.json();

        setStocks((prevStocks) =>
          prevStocks.map((stock) => {
            const updatedInfo = apiData[stock.id];
            if (updatedInfo) {
              const change =
                ((updatedInfo.currentPrice - updatedInfo.basePrice) /
                  updatedInfo.basePrice) *
                100;
              return {
                ...stock,
                currentPrice: updatedInfo.currentPrice,
                basePrice: updatedInfo.basePrice,
                change: parseFloat(change.toFixed(2)),
              };
            }
            return stock;
          }),
        );
      } catch (error) {
        console.error("Failed to fetch real prices:", error);
      }
    };

    loadData();
    fetchRealPrices(); // Initial fetch

    const priceInterval = setInterval(fetchRealPrices, 30000); // Update every 30s

    return () => clearInterval(priceInterval);
  }, [username]);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (showLeaderboard) {
        try {
          const res = await fetch("http://127.0.0.1:5000/api/leaderboard");
          const data = await res.json();
          setLeaderboardData(data);
        } catch (err) {
          console.error("Leaderboard fetch failed:", err);
          toast.error("Could not load leaderboard");
        }
      }
    };

    fetchLeaderboard();
  }, [showLeaderboard]);
  // Update performance data only when a new minute arrives
  useEffect(() => {
    const currentTotalValue = balance + calculatePortfolioValue();
    const now = new Date();
    const currentMinute = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Only add a new data point if we're in a new minute
    if (currentMinute !== lastRecordedMinute) {
      setPerformanceData((prev) => {
        const newData = [
          ...prev,
          {
            time: currentMinute,
            value: currentTotalValue,
            timestamp: now.getTime(),
          },
        ];
        // Keep only the last 12 data points (last hour of 5-min intervals)
        return newData.slice(-12);
      });
      setLastRecordedMinute(currentMinute);
    } else {
      // Update the current minute's value
      setPerformanceData((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            time: currentMinute,
            value: currentTotalValue,
            timestamp: now.getTime(),
          };
        }
        return updated;
      });
    }
  }, [stocks, balance, portfolio]);

  const saveUserData = async (
    newBalance: number,
    newPortfolio: Record<string, number>,
  ) => {
    // 1. Update React State (Instant)
    setBalance(newBalance);
    setPortfolio(newPortfolio);

    // 2. Save ONLY Portfolio to LocalStorage
    localStorage.setItem(`portfolio_${username}`, JSON.stringify(newPortfolio));

    // 3. Save ONLY Balance to MongoDB
    try {
      await fetch("http://localhost:5000/api/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newBalance }),
      });
    } catch (err) {
      console.error("Database sync failed, but local state is fine.");
    }
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
      [stock.id]: (portfolio[stock.id] || 0) + quantity,
    };

    saveUserData(newBalance, newPortfolio);
    toast.success(
      `Bought ${quantity} shares of ${stock.symbol} for $${totalCost.toFixed(2)}`,
    );
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
      [stock.id]: owned - quantity,
    };

    saveUserData(newBalance, newPortfolio);
    toast.success(
      `Sold ${quantity} shares of ${stock.symbol} for $${totalValue.toFixed(2)}`,
    );
    setBuyAmounts({ ...buyAmounts, [stock.id]: 1 });
  };

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [stockId, quantity]) => {
      const stock = stocks.find((s) => s.id === stockId);
      return total + (stock ? stock.currentPrice * quantity : 0);
    }, 0);
  };

  const totalValue = balance + calculatePortfolioValue();

  // Custom tooltip to show actual time
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      const timeString = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-xs mb-1">{timeString}</p>
          <p className="text-emerald-300 font-semibold">
            ${data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

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
              <h1 className="text-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Stock Kidz
              </h1>
              <p className="text-sm text-slate-400">Hello, {username}!</p>
            </div>
          </div>
          <Button
            onClick={() => setShowLeaderboard(true)}
            variant="outline"
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button onClick={onAccount} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Account
          </Button>

          <Button onClick={onLeaderboard} variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Stock News
          </Button>

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
              <CardDescription>
                Real-time tracking of your total value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a4f" />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={{ stroke: "#1e3a4f" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickLine={{ stroke: "#1e3a4f" }}
                    domain={["dataMin - 100", "dataMax + 100"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6ee7b7"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "#6ee7b7",
                      stroke: "#34d399",
                      strokeWidth: 2,
                    }}
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
                <p className="text-3xl text-emerald-200">
                  ${balance.toFixed(2)}
                </p>
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
                <p className="text-3xl text-blue-200">
                  ${totalValue.toFixed(2)}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {totalValue >= 10000
                    ? `+$${(totalValue - 10000).toFixed(2)}`
                    : `-$${(10000 - totalValue).toFixed(2)}`}
                  {" from start"}
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
              {stocks.map((stock) => (
                <Card
                  key={stock.id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-900/30 hover:border-cyan-500/50 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-cyan-300">
                          {stock.symbol}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {stock.name}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={stock.change >= 0 ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {stock.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {stock.change.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl text-emerald-300">
                        ${stock.currentPrice.toFixed(2)}
                      </p>
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
                        onChange={(e) =>
                          setBuyAmounts({
                            ...buyAmounts,
                            [stock.id]: parseInt(e.target.value) || 1,
                          })
                        }
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
        {Object.keys(portfolio).some((id) => portfolio[id] > 0) && (
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
                    const stock = stocks.find((s) => s.id === stockId);
                    if (!stock) return null;
                    const value = stock.currentPrice * quantity;
                    return (
                      <div
                        key={stockId}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-cyan-300">
                            {stock.symbol} - {stock.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {quantity} shares
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-300">
                            ${value.toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-400">
                            ${stock.currentPrice.toFixed(2)} per share
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl p-6 w-[400px] shadow-xl border border-cyan-500/30">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl text-cyan-300 font-bold">Top Traders</h2>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {leaderboardData.length > 0 ? (
                leaderboardData.map((user, index) => (
                  <div
                    key={user.username}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      user.username === username
                        ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                        : "bg-slate-800/40 border-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-bold w-6 ${index < 3 ? "text-yellow-400" : "text-slate-500"}`}
                      >
                        #{index + 1}
                      </span>
                      <span className="text-slate-200 font-semibold">
                        {user.username}
                      </span>
                      {user.username === username && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 border-cyan-500 text-cyan-400"
                        >
                          YOU
                        </Badge>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">
                      $
                      {user.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  Loading rankings...
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowLeaderboard(false)}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showChat && (
        <div
          className="
      fixed bottom-24 right-6
      w-80 h-[420px]
      bg-slate-900
      border border-cyan-500/30
      rounded-2xl
      shadow-2xl
      flex flex-col
      z-40
    "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">
                Stock Kidz AI
              </span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto text-sm text-slate-300">
            <p className="text-slate-400">
              👋 Hi {username}! Ask me about stocks, your portfolio, or trading
              tips.
            </p>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-cyan-500/20"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </form>
        </div>
      )}

      <Button
        onClick={() => setShowChat((prev) => !prev)}
        className="
    fixed bottom-6 right-6
    h-14 w-14 rounded-full
    bg-emerald-500 hover:bg-emerald-600
    shadow-lg shadow-emerald-500/40
    flex items-center justify-center
    z-50
  "
        title="Chat with Stock Kidz AI"
      >
        {showChat ? (
          <X className="w-6 h-6 text-slate-900" />
        ) : (
          <MessageCircle className="w-6 h-6 text-slate-900" />
        )}
      </Button>
    </div>
  );
}
