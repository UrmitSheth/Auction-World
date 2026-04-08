import { Link } from "react-router";
import { FaArrowRight } from "react-icons/fa";
import { RiAuctionLine } from "react-icons/ri";

export const CTA = () => {
  return (
    <section className="relative theme-gradient py-20 md:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur rounded-2xl mb-6">
          <RiAuctionLine className="text-white text-3xl" />
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
          Ready to Start Bidding?
        </h2>
        <p className="text-xl text-emerald-100/80 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Join thousands of users who trust Auction World. Create an account in seconds, list your first item, or browse exclusive deals — all free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <button className="bg-[var(--color-bg-secondary)] theme-text-heading px-10 py-4 rounded-xl hover:opacity-90 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 mx-auto">
              Create Free Account <FaArrowRight />
            </button>
          </Link>
          <Link to="/auction">
            <button className="bg-white/10 backdrop-blur text-white border-2 border-white/30 px-10 py-4 rounded-xl hover:bg-white/20 transition-all font-bold text-lg">
              Explore Auctions
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
