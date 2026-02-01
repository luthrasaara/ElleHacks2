"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge.";
import { Button } from "'@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NewsItem {
  symbol: string;
  headline: string;
  summary: string;
  category: string;
}

const newsData: NewsItem[] = [
  {
    symbol: "GLD",
    headline: "Gold Prices Reach 6-Month High Amid Market Uncertainty",
    summary:
      "Gold ETF GLD surges as investors seek safe-haven assets during global economic concerns. Bullion prices hit their highest levels since early 2024.",
    category: "Commodities",
  },
  {
    symbol: "QQQ",
    headline: "Tech Stocks Rally on AI Optimism and Earnings Beats",
    summary:
      "The Nasdaq 100 ETF QQQ gains momentum as major technology companies report strong quarterly results driven by artificial intelligence investments.",
    category: "Technology",
  },
  {
    symbol: "RBLX",
    headline: "Roblox Announces New Creator Monetization Features",
    summary:
      "Roblox Corporation launches enhanced revenue-sharing tools for platform creators, aiming to attract more game developers and boost user engagement.",
    category: "Gaming",
  },
  {
    symbol: "USO",
    headline: "Oil Prices Stabilize Following OPEC Production Decisions",
    summary:
      "The USO oil ETF steadies as OPEC+ maintains production levels. Energy market remains volatile amid geopolitical tensions and supply concerns.",
    category: "Energy",
  },
  {
    symbol: "XRT",
    headline: "Retail Sector Shows Mixed Signals Heading into Holiday Season",
    summary:
      "The Retail ETF XRT reflects cautious consumer spending patterns. Major retailers report varied performance as inflation impacts purchasing power.",
    category: "Retail",
  },
  {
    symbol: "VHT",
    headline: "Healthcare Stocks Advance on Positive Drug Approval News",
    summary:
      "The Healthcare ETF VHT rises as the FDA approves several new medications. Investors show renewed confidence in the biotech and pharmaceutical sectors.",
    category: "Healthcare",
  },
];

export default function StockNews() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">Stock News</h1>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.map((news) => (
            <Card
              key={news.symbol}
              className="bg-white border border-slate-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Symbol Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-lg font-semibold">
                    {news.symbol}
                  </Badge>
                  <Badge className="bg-slate-200 text-slate-800 px-2 py-1 text-xs font-medium">
                    {news.category}
                  </Badge>
                </div>

                {/* Headline */}
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  {news.headline}
                </h2>

                {/* Summary */}
                <p className="text-slate-600 text-sm mb-4">{news.summary}</p>

                {/* Read More Button */}
                <Button
                  variant="outline"
                  className="w-full rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Read More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
