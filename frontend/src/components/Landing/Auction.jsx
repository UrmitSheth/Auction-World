import { FaClock, FaArrowRight, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router";
// import { AdsComponent } from "../AdsComponent";

export const Auction = () => {
  return (
    <section className="py-20 theme-bg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold theme-text-heading">Live Auctions</h2>
          <Link
            to="/signup"
            className="theme-text-secondary hover:opacity-80 flex items-center"
          >
            View all <FaChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
          
        </div>
        
      </div>
    </section>
  );
};
