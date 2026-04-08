import { Link } from "react-router";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { convertPrice, currencySymbols } from "../utils/currency.js";
import { toggleWatchlist } from "../api/user.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function AuctionCard({ auction }) {
  const { user } = useSelector((state) => state.auth);
  const { currency } = useCurrency();
  const priceUSD = Number(auction.currentPrice ?? auction.startingPrice) || 0;
  const displayPrice = convertPrice(priceUSD, currency);
  const symbol = currencySymbols[currency] ?? "$";
  const daysLeft = Math.ceil(auction.timeLeft / (1000 * 60 * 60 * 24));
  
  const [isWatchlisted, setIsWatchlisted] = useState(() => {
    return user?.user?.watchlist?.includes(auction._id) || false;
  });

  const queryClient = useQueryClient();

  const toggleWatchlistMutation = useMutation({
    mutationFn: (id) => toggleWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["watchlist"]);
    },
    onError: (err) => {
      setIsWatchlisted(!isWatchlisted);
      alert(err?.response?.data?.error || "Failed to update watchlist");
    }
  });

  const handleWatchlistToggle = (e) => {
    e.preventDefault(); 
    if(!user) return alert("Please log in to add items to your watchlist.");

    setIsWatchlisted(!isWatchlisted);
    toggleWatchlistMutation.mutate(auction._id);
  };

  return (
    <div className="theme-card rounded-xl border shadow-sm hover:shadow-md transition-all">
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img
          src={auction.itemPhoto || "https://picsum.photos/300"}
          alt={auction.itemName}
          className="object-contain aspect-[4/3] w-96"
        />
        {/* Category Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium theme-badge">
          {auction.itemCategory}
        </div>
      </div>

      <div className="p-4">
        {/* Flex container to align the title and the heart icon */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg pr-4" style={{ color: "var(--color-text-heading)" }}>
            {auction.itemName}
          </h3>
          
          {/* Watchlist Toggle Button */}
          <button 
            onClick={handleWatchlistToggle} 
            className="focus:outline-none transition-transform hover:scale-110 mt-1"
            aria-label="Add to watchlist"
          >
            {isWatchlisted ? (
              <FaHeart className="text-red-500" size={22} />
            ) : (
              <FaRegHeart className="hover:text-red-500 transition-colors" size={22} style={{ color: "var(--color-text-muted)" }} />
            )}
          </button>
        </div>

        <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
          {auction.itemDescription}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Current Price:</span>
            <span className="font-semibold text-lg theme-accent text-[var(--color-success)]">
              {symbol}{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Bids:</span>
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{auction.bidsCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Time Left:</span>
            <span className="text-sm font-medium text-[var(--color-danger)]">
              {daysLeft > 0 ? `${daysLeft} days` : "Ended"}
            </span>
          </div>
        </div>

        <div className="border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            Seller: {auction?.sellerName || auction?.seller?.name}
          </p>
          <Link to={`/auction/${auction._id}`}>
            <button className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 transition-all text-sm font-medium" style={{ backgroundColor: "var(--color-accent)" }}>
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}