import { useState, useMemo } from "react";
import { Link } from "react-router"; // Assuming you use react-router for the 'Create' button
import AuctionCard from "../components/AuctionCard";
import { useQuery } from "@tanstack/react-query";
import { getMyAuctions } from "../api/auction";
import LoadingScreen from "../components/LoadingScreen";
import { 
  FaPlus, FaSearch, FaFilter, FaBoxOpen, 
  FaGavel, FaCheckCircle, FaClock 
} from "react-icons/fa";

export const MyAuction = () => {
  // Grouped state for advanced filtering
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all", // 'all', 'active', or 'ended'
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myauctions"],
    queryFn: getMyAuctions,
    staleTime: 30 * 1000,
  });

  // useMemo optimizes performance by only recalculating when data or filters change
  const { filteredAuctions, categories, stats } = useMemo(() => {
    if (!data) return { filteredAuctions: [], categories: [], stats: {} };

    const now = new Date();
    const uniqueCategories = ["all", ...new Set(data.map((a) => a.itemCategory).filter(Boolean))];

    let activeCount = 0;
    let endedCount = 0;

    const filtered = data.filter((auction) => {
      // 1. Calculate Status
      const isEnded = new Date(auction.itemEndDate) < now;
      if (isEnded) endedCount++; else activeCount++;

      // 2. Apply Search Filter
      const matchesSearch = auction.itemName.toLowerCase().includes(filters.search.toLowerCase());
      
      // 3. Apply Category Filter
      const matchesCategory = filters.category === "all" || auction.itemCategory === filters.category;
      
      // 4. Apply Status Filter
      const matchesStatus = 
        filters.status === "all" ? true :
        filters.status === "active" ? !isEnded :
        isEnded; 

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return {
      filteredAuctions: filtered,
      categories: uniqueCategories,
      stats: { total: data.length, active: activeCount, ended: endedCount }
    };
  }, [data, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <LoadingScreen />;
  
  if (isError) return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <p className="font-bold text-lg text-[var(--color-danger)]">Failed to load your auctions. Please try again.</p>
    </div>
  );

  return (
    <div className="min-h-screen theme-bg transition-colors">
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        
        {/* Page Header & Call to Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold theme-text-heading">My Seller Dashboard</h1>
            <p className="theme-text-secondary mt-1 font-medium">Manage your inventory and track your auction performance.</p>
          </div>
          <Link to="/create">
            <button className="flex items-center gap-2 theme-accent-bg text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90">
              <FaPlus /> List New Item
            </button>
          </Link>
        </div>

        {/* Seller Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-4">
            <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-full theme-accent">
              <FaGavel className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold theme-text-secondary uppercase tracking-wide">Total Listings</p>
              <p className="text-3xl font-extrabold theme-text-heading">{stats.total || 0}</p>
            </div>
          </div>
          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-4">
            <div className="p-4 bg-[var(--color-success-bg)] rounded-full text-[var(--color-success)] theme-accent">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold theme-text-secondary uppercase tracking-wide">Active Auctions</p>
              <p className="text-3xl font-extrabold theme-text-heading">{stats.active || 0}</p>
            </div>
          </div>
          <div className="theme-card p-6 rounded-2xl shadow-sm border theme-border flex items-center gap-4">
            <div className="p-4 bg-[var(--color-danger-bg)] rounded-full text-[var(--color-danger)]">
              <FaClock className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold theme-text-secondary uppercase tracking-wide">Ended Auctions</p>
              <p className="text-3xl font-extrabold theme-text-heading">{stats.ended || 0}</p>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toolbar */}
        <div className="theme-card p-4 rounded-xl shadow-sm border theme-border mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-md">
            <FaSearch className="absolute top-3.5 left-3 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by item name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="theme-input w-full pl-10 pr-4 py-2.5 rounded-lg focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Status Toggle Buttons */}
            <div className="flex bg-[var(--color-bg-tertiary)] p-1 rounded-lg border theme-border w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'active', label: 'Active' },
                { id: 'ended', label: 'Ended' }
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleFilterChange("status", status.id)}
                  className={`flex-1 sm:flex-none px-5 py-2 rounded-md text-sm font-bold transition-all ${
                    filters.status === status.id
                      ? "theme-card theme-text-heading shadow-sm"
                      : "theme-text-muted hover:theme-text-secondary"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <FaFilter className="absolute top-3.5 left-3 theme-text-muted pointer-events-none" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="theme-input w-full sm:w-auto appearance-none pl-10 pr-8 py-2.5 rounded-lg focus:ring-1 focus:ring-[var(--color-accent)] outline-none cursor-pointer capitalize"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex justify-between items-end border-b theme-border pb-2">
          <h2 className="text-xl font-bold theme-text-heading capitalize">
            {filters.status === "all" ? "Inventory" : `${filters.status} Inventory`}
          </h2>
          <span className="text-sm font-bold theme-accent bg-[var(--color-accent-light)] px-3 py-1 rounded-full">
            Showing {filteredAuctions.length} Items
          </span>
        </div>

        {/* Auctions Grid / Empty State */}
        {filteredAuctions.length === 0 ? (
          <div className="theme-card rounded-2xl border-2 border-dashed theme-border py-20 px-4 text-center flex flex-col items-center justify-center">
            <FaBoxOpen className="theme-text-muted text-6xl mb-4" />
            <h3 className="text-2xl font-bold theme-text-heading mb-2">No auctions found</h3>
            <p className="theme-text-secondary max-w-md mb-6">
              {filters.search || filters.category !== 'all' || filters.status !== 'all'
                ? "We couldn't find any items matching your current filters. Try adjusting your search criteria."
                : "Your inventory is currently empty. List your first item to start receiving bids!"}
            </p>
            {filters.search || filters.category !== 'all' || filters.status !== 'all' ? (
              <button 
                onClick={() => setFilters({ search: "", category: "all", status: "all" })}
                className="theme-accent font-bold hover:underline transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <Link to="/create-auction">
                <button className="bg-[var(--color-bg-tertiary)] theme-accent px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-colors shadow-sm">
                  Create your first listing
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};