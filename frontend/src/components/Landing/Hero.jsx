import { Link } from "react-router";
import { RiAuctionLine } from "react-icons/ri";

export const Hero = () => {
  return (
    <section className="relative theme-gradient overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-8">
            <RiAuctionLine className="text-white" />
            Trusted by thousands of bidders worldwide
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Discover, Bid & Win
            <span className="block text-white/90 mt-2">On Auction World</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            The modern real-time auction marketplace where you can buy, sell, and bid on exclusive items. Join a community of collectors, enthusiasts, and smart shoppers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-[var(--color-bg-secondary)] theme-text-heading px-10 py-4 rounded-xl hover:opacity-90 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105">
                Get Started — It's Free
              </button>
            </Link>
            <Link to="/login">
              <button className="bg-white/10 backdrop-blur text-white border-2 border-white/30 px-10 py-4 rounded-xl hover:bg-white/20 transition-all font-bold text-lg">
                Sign In
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">1000+</p>
              <p className="text-white/70 text-sm font-semibold mt-1">Items Auctioned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">500+</p>
              <p className="text-white/70 text-sm font-semibold mt-1">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">24/7</p>
              <p className="text-white/70 text-sm font-semibold mt-1">Always Open</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
