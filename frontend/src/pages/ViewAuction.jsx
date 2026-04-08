import { useRef, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { placeBid, viewAuction, buyAuctionNow, markAuctionPaid } from "../api/auction.js";
import { toggleWatchlist } from "../api/user.js"; // Import the watchlist API
import { useSelector } from "react-redux";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { 
  FaClock, FaUsers, FaMoneyBillWave, FaRobot, 
  FaGavel, FaHeart, FaRegHeart, FaBolt, FaExclamationCircle 
} from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { convertPrice, convertToUSD, currencySymbols } from "../utils/currency.js";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useSocketContext } from "../context/SocketContext.jsx";


export const ViewAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const inputRef = useRef();


  const fmt = (priceUSD) => convertPrice(Number(priceUSD) || 0, currency).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const sym = currencySymbols[currency] ?? "$";

  const [bidType, setBidType] = useState("manual"); 
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Sync initial watchlist state if the user has it saved
  useEffect(() => {
    if (user?.user?.watchlist && id) {
      setIsWatchlisted(user.user.watchlist.includes(id));
    }
  }, [user, id]);

  // Real-time Bid Updates
  useEffect(() => {
    if (socket) {
      const handleNewBid = (payload) => {
        if (payload.auctionId === id) {
          queryClient.invalidateQueries({ queryKey: ["viewAuctions", id] });
        }
      };
      socket.on("newBid", handleNewBid);
      return () => socket.off("newBid", handleNewBid);
    }
  }, [socket, id, queryClient]);


  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["viewAuctions", id],
    queryFn: () => viewAuction(id),
    staleTime: 30 * 1000,
  });

  // 1. Place Bid Mutation (Handles both Manual and Auto/Robotic Bids)
  const placeBidMutate = useMutation({
    mutationFn: ({ bidAmount, isAutoBid, id }) => placeBid({ bidAmount, isAutoBid, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewAuctions"] });
      if (inputRef.current) inputRef.current.value = "";
      alert(bidType === "auto" ? "Auto-bid limit set successfully!" : "Bid placed successfully!");
    },
    onError: (error) => alert(error?.response?.data?.message || "Error placing bid"),
  });

  // 2. Buy It Now Mutation
  const buyItNowMutate = useMutation({
    mutationFn: () => buyAuctionNow(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["viewAuctions"] });
      alert(res?.message || "Congratulations! You have successfully purchased the item.");
    },
    onError: (error) => alert(error?.response?.data?.message || "Error processing Buy It Now"),
  });

  // 3. Watchlist Toggle Mutation
  const watchlistMutate = useMutation({
    mutationFn: () => toggleWatchlist(id),
    onSuccess: () => {
      // Invalidate user data if you need to refresh the global profile state
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (error) => {
      console.log("Error updating watchlist:", error.message);
      setIsWatchlisted(!isWatchlisted); // Revert the heart icon if API fails
    }
  });

  // 4. Mark Auction Paid Mutation
  const markPaidMutate = useMutation({
    mutationFn: () => markAuctionPaid(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["viewAuctions"] });
      alert(res?.message || "Payment successful! The seller will be notified.");
      setIsPaymentModalOpen(false);
    },
    onError: (error) => {
      alert(error?.response?.data?.message || "Payment failed to record");
    }
  });

  if (isLoading) return <LoadingScreen />;
  if (!data) return <div className="text-center py-20 font-bold text-xl text-emerald-900">Auction not found</div>;

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!user) return navigate("/login"); // Protect against unauthenticated actions
    let amountStr = e.target.amount.value.trim();
    let amountLocal = Number(amountStr);
    let amountUSD = convertToUSD(amountLocal, currency);
    placeBidMutate.mutate({ bidAmount: amountUSD, isAutoBid: bidType === "auto", id });
  };

  const handleBuyItNow = () => {
    if (!user) return navigate("/login");
    if (window.confirm(`Are you sure you want to instantly buy this for ${sym}${fmt(data.buyItNowPrice)}?`)) {
      buyItNowMutate.mutate();
    }
  };

  const handleWatchlistToggle = () => {
    if (!user) return navigate("/login");
    setIsWatchlisted(!isWatchlisted); // Optimistic UI update for instant feedback
    watchlistMutate.mutate();
  };

  const daysLeft = Math.ceil(Math.max(0, new Date(data.itemEndDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isActive = Math.max(0, new Date(data.itemEndDate) - new Date()) > 0 && !data.isSold;
  const reserveNotMet = data.reservePrice && data.currentPrice < data.reservePrice;

  // Determine if the current user is the winner
  const isWinner = !isActive && data.isSold && data.bids?.length > 0 && data.bids[0].bidder._id === user?.user?._id;
  const userCountry = user?.user?.location?.country || "US";

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) return alert("Please select a payment method");
    
    setIsProcessingPayment(true);
    // Simulate payment processing authorization over 2s
    setTimeout(() => {
      setIsProcessingPayment(false);
      markPaidMutate.mutate();
    }, 2000);
  };

  return (
    <div className="min-h-screen mx-auto" style={{ backgroundColor: "var(--color-bg)" }}>
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full aspect-square rounded-2xl shadow-sm border overflow-hidden flex items-center justify-center p-4 relative" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
              <img
                src={data.itemPhoto || "https://picsum.photos/601"}
                alt={data.itemName}
                className="h-full w-full object-contain rounded-xl"
              />
              {/* Watchlist Floating Button */}
              <button 
                onClick={handleWatchlistToggle}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {isWatchlisted ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-emerald-400 text-xl" />}
              </button>
            </div>
          </div>

          {/* Right Column: Details & Bidding */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header Info */}
            <div className="border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-[var(--color-accent-light)] theme-accent px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {data.itemCategory}
                </span>
                {data.itemCondition && (
                  <span className="bg-[var(--color-bg-tertiary)] theme-text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {data.itemCondition}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isActive ? "bg-[var(--color-success-bg)] theme-accent text-[var(--color-success)]" : data.isSold ? "bg-[var(--color-bg-tertiary)] theme-accent" : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"}`}>
                  {isActive ? "Live Auction" : data.isSold ? "Sold" : "Auction Ended"}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold mb-4" style={{ color: "var(--color-text-heading)" }}>{data.itemName}</h1>
              <p className="leading-relaxed text-lg" style={{ color: "var(--color-text-secondary)" }}>{data.itemDescription}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <FaMoneyBillWave className="text-2xl mb-2" style={{ color: "var(--color-accent)" }} />
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Current Bid</p>
                <p className="text-xl font-bold theme-accent text-[var(--color-success)]">{sym}{fmt(data.currentPrice)}</p>
              </div>
              <div className="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center relative" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <FaGavel className="text-2xl mb-2" style={{ color: "var(--color-accent)" }} />
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Starting At</p>
                <p className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>{sym}{fmt(data.startingPrice)}</p>
              </div>
              <div className="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <FaUsers className="text-2xl mb-2" style={{ color: "var(--color-accent)" }} />
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Total Bids</p>
                <p className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>{data.bids?.length || 0}</p>
              </div>
              <div className="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <FaClock className="text-2xl mb-2" style={{ color: "var(--color-accent)" }} />
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Time Left</p>
                <p className={`text-xl font-bold ${isActive ? "text-red-500" : ""}`} style={!isActive ? { color: "var(--color-text-heading)" } : {}}>
                  {isActive ? `${daysLeft} days` : "Ended"}
                </p>
              </div>
            </div>

            {/* Reserve Price Warning */}
            {isActive && reserveNotMet && (
              <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
                <FaExclamationCircle className="text-[var(--color-danger)]" /> Reserve price has not been met yet.
              </div>
            )}

            {/* Winner Section: Pay Now button or Paid Successfully banner */}
            {isWinner && (
              data.isPaid ? (
                <div className="border p-6 rounded-2xl text-center space-y-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-tertiary)", borderColor: "var(--color-border)" }}>
                  <div className="inline-flex items-center justify-center p-3 rounded-full mb-2 bg-[var(--color-success-bg)] theme-accent text-[var(--color-success)]">
                    <FaCheckCircle className="text-4xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black theme-accent text-[var(--color-success)]">Payment Complete</h3>
                    <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>Your payment has been successfully recorded. The seller will ship your item soon.</p>
                  </div>
                </div>
              ) : (
                <div className="border p-6 rounded-2xl text-center space-y-4 shadow-sm" style={{ backgroundColor: "var(--color-bg-tertiary)", borderColor: "var(--color-accent)" }}>
                  <div className="inline-flex items-center justify-center p-3 rounded-full mb-2" style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                    <FaCheckCircle className="text-4xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black" style={{ color: "var(--color-text-heading)" }}>You won this auction!</h3>
                    <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>Please complete your payment to finalize the purchase.</p>
                  </div>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    <FaMoneyBillWave /> Pay {sym}{fmt(data.currentPrice)} Now
                  </button>
                </div>
              )
            )}

            {/* Bidding & Buy It Now Module */}
            {data.seller._id !== user?.user?._id && isActive && (
              <div className="space-y-4">
                
                {/* Buy It Now */}
                {data.buyItNowPrice && (
                  <button 
                    onClick={handleBuyItNow}
                    disabled={buyItNowMutate.isPending}
                    className="w-full theme-accent-bg hover:opacity-90 text-white py-4 px-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <FaBolt /> {buyItNowMutate.isPending ? "Processing..." : `Buy It Now for ${sym}${fmt(data.buyItNowPrice)}`}
                  </button>
                )}

                <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                  {/* Tabs */}
                  <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
                    <button
                      onClick={() => setBidType("manual")}
                      className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${bidType === "manual" ? "bg-[var(--color-accent-light)] theme-accent border-b-2 border-[var(--color-accent)]" : "theme-text-muted hover:bg-[var(--color-bg-tertiary)]"}`}
                    >
                      <FaGavel /> Manual Bid
                    </button>
                    <button
                      onClick={() => setBidType("auto")}
                      className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${bidType === "auto" ? "bg-[var(--color-accent-light)] theme-accent border-b-2 border-[var(--color-accent)]" : "theme-text-muted hover:bg-[var(--color-bg-tertiary)]"}`}
                    >
                      <FaRobot /> Auto Bid (Max Limit)
                    </button>
                  </div>

                  {/* Bid Form */}
                  <div className="p-6">
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-bold text-emerald-900 mb-2">
                          {bidType === "manual" ? `Bid Amount (Min: ${sym}${fmt(data.currentPrice + 1)})` : `Your Maximum Budget`}
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-600 font-bold">{sym}</span>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            ref={inputRef}
                            min={convertPrice(data.currentPrice + 1, currency).toFixed(2)}
                            step="any"

                            className="w-full pl-8 pr-4 py-3 theme-input rounded-lg text-lg font-bold transition-colors focus:outline-none focus:ring-2"
                            placeholder={bidType === "manual" ? "Enter exact bid" : "Enter max limit"}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={placeBidMutate.isPending} className="w-full py-3.5 px-4 rounded-lg font-bold text-lg transition-all shadow-md hover:opacity-90 disabled:opacity-50 theme-accent-bg text-white">
                        {placeBidMutate.isPending ? "Processing..." : bidType === "manual" ? "Place Bid Now" : "Set Auto-Bid"}
                      </button>
                    </form>
                    {bidType === "auto" && (
                      <p className="mt-3 text-xs text-emerald-600 font-medium text-center flex items-center justify-center gap-1">
                        <FaRobot className="text-blue-500" /> We will automatically bid just enough to keep you in the lead.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="p-5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: "var(--color-bg-tertiary)", borderColor: "var(--color-border)" }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Seller</p>
                <p className="font-black text-lg" style={{ color: "var(--color-text-heading)" }}>{data.seller?.name || "Unknown Seller"}</p>
              </div>
              <Link to={`/profile/${data.seller?._id}`} className="text-sm font-bold px-4 py-2 rounded-lg border shadow-sm transition-colors" style={{ color: "var(--color-accent)", borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                View Profile
              </Link>
            </div>
            
          </div>
        </div>

        {/* Bid History Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: "var(--color-text-heading)" }}>
            <FaGavel style={{ color: "var(--color-accent)" }} /> Live Bid History
          </h2>
          <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
            {!data.bids || data.bids.length === 0 ? (
              <div className="p-12 text-center theme-text-secondary bg-[var(--color-bg-tertiary)]">
                <FaGavel className="mx-auto text-4xl mb-3 theme-text-muted" />
                <p className="text-lg font-bold">No bids have been placed yet.</p>
                <p className="text-sm">Be the first to bid and secure this item!</p>
              </div>
            ) : (
              <div className="divide-y divide-emerald-50">
                {data.bids.map((bid, index) => (
                  <div key={index} className="p-5 flex justify-between items-center transition-colors" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--color-border)" }}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                        {bid.bidder?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-heading)" }}>
                          {bid.bidder?.name} 
                          {index === 0 && <span className="text-[10px] bg-[var(--color-success-bg)] theme-accent text-[var(--color-success)] px-2 py-0.5 rounded-full uppercase">Leading</span>}
                          {bid.isAutoBid && <FaRobot className="text-blue-500 ml-1" title="Placed automatically by proxy" />}
                        </p>
                        <p className="text-xs theme-text-secondary font-medium">
                          {new Date(bid.bidTime).toLocaleDateString()} • {new Date(bid.bidTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${index === 0 ? "theme-accent text-[var(--color-success)]" : "text-[var(--color-text-heading)]"}`}>
                        {sym}{fmt(bid.bidAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-emerald-100" style={{ backgroundColor: "var(--color-card)" }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
              <h3 className="text-2xl font-black theme-text-heading">Checkout</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={isProcessingPayment}
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Order Total</p>
                  <p className="font-bold theme-text-heading leading-tight line-clamp-1">{data.itemName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black theme-accent text-[var(--color-success)]">{sym}{fmt(data.currentPrice)}</p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <p className="text-sm font-bold mb-3" style={{ color: "var(--color-text-secondary)" }}>Select Payment Method (Region: {userCountry})</p>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  
                  {/* Country Specific Payment Options */}
                  {userCountry === "IN" ? (
                    <>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'upi' ? 'bg-emerald-50/50' : 'hover:opacity-80'}`} style={{ borderColor: paymentMethod === 'upi' ? "var(--color-accent)" : "var(--color-border)" }}>
                        <input type="radio" name="payment" value="upi" onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMethod === 'upi' ? "var(--color-accent)" : "gray" }}>
                          {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></div>}
                        </div>
                        <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>UPI (Google Pay, PhonePe)</span>
                      </label>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'paytm' ? 'bg-emerald-50/50' : 'hover:opacity-80'}`} style={{ borderColor: paymentMethod === 'paytm' ? "var(--color-accent)" : "var(--color-border)" }}>
                        <input type="radio" name="payment" value="paytm" onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMethod === 'paytm' ? "var(--color-accent)" : "gray" }}>
                          {paymentMethod === 'paytm' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></div>}
                        </div>
                        <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>Paytm Wallet</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-emerald-50/50' : 'hover:opacity-80'}`} style={{ borderColor: paymentMethod === 'card' ? "var(--color-accent)" : "var(--color-border)" }}>
                        <input type="radio" name="payment" value="card" onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMethod === 'card' ? "var(--color-accent)" : "gray" }}>
                          {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></div>}
                        </div>
                        <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>Credit / Debit Card</span>
                      </label>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'paypal' ? 'bg-emerald-50/50' : 'hover:opacity-80'}`} style={{ borderColor: paymentMethod === 'paypal' ? "var(--color-accent)" : "var(--color-border)" }}>
                        <input type="radio" name="payment" value="paypal" onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMethod === 'paypal' ? "var(--color-accent)" : "gray" }}>
                          {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></div>}
                        </div>
                        <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>PayPal</span>
                      </label>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'applepay' ? 'bg-emerald-50/50' : 'hover:opacity-80'}`} style={{ borderColor: paymentMethod === 'applepay' ? "var(--color-accent)" : "var(--color-border)" }}>
                        <input type="radio" name="payment" value="applepay" onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMethod === 'applepay' ? "var(--color-accent)" : "gray" }}>
                          {paymentMethod === 'applepay' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></div>}
                        </div>
                        <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>Apple Pay / Google Pay</span>
                      </label>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsPaymentModalOpen(false)}
                    disabled={isProcessingPayment}
                    className="flex-1 py-3 px-4 font-bold rounded-xl transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-heading)" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessingPayment || !paymentMethod}
                    className="flex-[2] py-3 px-4 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {isProcessingPayment ? (
                      <span className="animate-pulse">Processing Payment...</span>
                    ) : (
                      <>Confirm Payment of {sym}{fmt(data.currentPrice)}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};