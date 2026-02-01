import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Single export, fixed duplicate function issue
export function Accounts({
  username,
  onBack,
}: {
  username: string;
  onBack: () => void;
}) {
  const [principal, setPrincipal] = useState<number>(1000);
  const [rate, setRate] = useState<number>(5);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [targetAmount, setTargetAmount] = useState<number>(10000);
  const [targetYears, setTargetYears] = useState<number>(5);

  const futureValue =
    principal *
    Math.pow(1 + rate / 100 / compoundFrequency, compoundFrequency * years);

  const chartData = Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    balance:
      principal *
      Math.pow(1 + rate / 100 / compoundFrequency, compoundFrequency * i),
  }));

  const presentValue =
    targetAmount /
    Math.pow(
      1 + rate / 100 / compoundFrequency,
      compoundFrequency * targetYears,
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Account Page</h1>
      <p className="mb-6">Welcome, {username}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Compound Interest Calculator */}
        <div className="bg-slate-900 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Compound Interest Calculator
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Principal: ${principal}</label>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2">Annual Rate (%): {rate}%</label>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2">
                Compounded: {compoundFrequency}x/year
              </label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(Number(e.target.value))}
                className="w-full p-2 bg-slate-800 rounded text-white"
              >
                <option value={1}>Annually</option>
                <option value={2}>Semi-Annually</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
                <option value={365}>Daily</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Years: {years}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <p className="text-lg font-semibold text-cyan-400">
              Future Value: ${futureValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Target Savings Calculator */}
        <div className="bg-slate-900 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Target Savings Calculator
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                Target Amount: ${targetAmount}
              </label>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2">
                Years to Target: {targetYears}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={targetYears}
                onChange={(e) => setTargetYears(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <p className="text-lg font-semibold text-cyan-400">
              Save Now: ${presentValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Account Growth Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="year" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #06b6d4",
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#06b6d4"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={onBack}
        className="p-2 bg-cyan-600 rounded hover:bg-cyan-700 transition"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
