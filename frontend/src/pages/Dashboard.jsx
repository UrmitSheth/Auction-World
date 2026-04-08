import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import AuctionCard from "../components/AuctionCard.jsx";
import { dashboardStats } from "../api/auction.js";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { 
  FaGlobe, FaBolt, FaBoxOpen, FaArrowRight, 
  FaPlus, FaGavel 
} from "react-icons/fa";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["stats"],
    queryFn: () => dashboardStats(),
    staleTime: 30 * 1000,
  });

  if (isLoading) return <LoadingScreen />;

  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
      <p className="font-bold text-lg mb-4" style={{ color: "var(--color-danger)" }}>Failed to load dashboard data.</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: "var(--color-accent)" }}>Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        
        {/* Welcome Hero Section */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--color-border)" }}>
          <h1 className="text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
            Welcome back, {user?.user?.name || "User"}! 👋
          </h1>
          <p className="mt-2 text-lg font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Here is what is happening in the Auction World today.
          </p>
        </div>

        {/* Global Platform Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-full theme-accent">
              <FaGlobe className="text-3xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Platform Total</h3>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--color-text-heading)" }}>
                {data?.totalAuctions || 0}
              </p>
            </div>
          </div>

          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-full theme-accent">
              <FaBolt className="text-3xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Live Auctions</h3>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--color-text-heading)" }}>
                {data?.activeAuctions || 0}
              </p>
            </div>
          </div>

          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-full theme-accent">
              <FaBoxOpen className="text-3xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Your Active Items</h3>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--color-text-heading)" }}>
                {data?.userAuctionCount || 0}
              </p>
            </div>
          </div>

        </div>

        {/* Latest Platform Auctions Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--color-text-heading)" }}>
              <FaBolt className="text-yellow-500" /> Trending Auctions
            </h2>
            <Link to="/auction">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors" style={{ color: "var(--color-accent)", backgroundColor: "var(--color-accent-light)" }}>
                View Marketplace <FaArrowRight />
              </button>
            </Link>
          </div>

          {!data?.latestAuctions || data.latestAuctions.length === 0 ? (
            <div className="text-center py-16 theme-card rounded-2xl shadow-sm border-2 border-dashed" style={{ borderColor: "var(--color-border)" }}>
              <FaGavel className="mx-auto text-5xl mb-4" style={{ color: "var(--color-text-muted)" }} />
              <p className="text-xl font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>The marketplace is quiet.</p>
              <p style={{ color: "var(--color-text-secondary)" }}>Check back soon for new items, or list your own!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.latestAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </div>

        {/* User's Latest Auctions Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--color-text-heading)" }}>
              <FaBoxOpen style={{ color: "var(--color-accent)" }} /> Your Recent Listings
            </h2>
            <Link to="/myauction">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors" style={{ color: "var(--color-accent)", backgroundColor: "var(--color-accent-light)" }}>
                Manage Inventory <FaArrowRight />
              </button>
            </Link>
          </div>

          {!data?.latestUserAuctions || data.latestUserAuctions.length === 0 ? (
            <div className="text-center py-16 theme-card rounded-2xl shadow-sm border-2 border-dashed flex flex-col items-center" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-xl font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>You haven't listed any items yet.</p>
              <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>Turn your unused items into cash today.</p>
              <Link to="/create">
                <button className="text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2" style={{ backgroundColor: "var(--color-accent)" }}>
                  <FaPlus /> Create Your First Auction
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.latestUserAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;