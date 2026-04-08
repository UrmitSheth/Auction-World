import { useQuery } from "@tanstack/react-query";
import { getGlobalHistory } from "../api/auction";
import LoadingScreen from "../components/LoadingScreen";
import { FaHistory, FaCheckCircle, FaTimesCircle, FaUserTag, FaGavel } from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { convertPrice, currencySymbols } from "../utils/currency.js";
import { Link } from "react-router";

export const History = () => {
  const { currency } = useCurrency();
  const symbol = currencySymbols[currency] ?? "$";

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["global-history"],
    queryFn: getGlobalHistory,
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) return <LoadingScreen />;

  if (isError) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-red-500 font-bold text-lg">Failed to load auction history.</p>
    </div>
  );

  const formatPrice = (price) => {
    return convertPrice(price, currency).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  return (
    <div className="min-h-screen theme-bg transition-colors">
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        
        {/* Page Header */}
        <div className="mb-8 border-b theme-border pb-6">
          <div className="flex items-center gap-3">
            <div className="theme-accent-bg p-3 rounded-xl text-white shadow-sm">
                <FaHistory className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold theme-text-heading">Marketplace History</h1>
              <p className="theme-text-secondary mt-1 font-medium">Explore records of past auctions and market trends.</p>
            </div>
          </div>
        </div>

        {/* Global History Table / List */}
        {history?.length === 0 ? (
           <div className="theme-card rounded-2xl border-2 border-dashed theme-border py-20 px-4 text-center transition-colors">
             <h3 className="text-2xl font-bold theme-text-heading mb-2">No historical records found</h3>
             <p className="theme-text-secondary">Auctions that have ended will appear here.</p>
           </div>
        ) : (
          <div className="theme-card rounded-xl shadow-sm border theme-border overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="theme-bg-tertiary theme-border border-b font-bold tracking-wide text-sm uppercase">
                    <th className="px-6 py-4 theme-text-heading">Item Details</th>
                    <th className="px-6 py-4 text-center theme-text-heading">Status</th>
                    <th className="px-6 py-4 text-right theme-text-heading">Final Bid</th>
                    <th className="px-6 py-4 hidden md:table-cell theme-text-heading">Participants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-[var(--color-bg-tertiary)] transition-colors">
                      {/* Item Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={record.itemPhoto || "https://picsum.photos/100"} 
                            alt={record.itemName} 
                            className="w-16 h-16 rounded-lg object-cover bg-[var(--color-bg-tertiary)] border theme-border shadow-sm"
                          />
                          <div>
                            <Link to={`/auction/${record._id}`} className="font-bold theme-text-heading hover:theme-accent hover:underline mb-1 w-full line-clamp-1 block">
                              {record.itemName}
                            </Link>
                            <span className="text-xs font-semibold theme-accent bg-[var(--color-accent-light)] px-2 py-0.5 rounded-full">
                                {record.category}
                            </span>
                            <p className="text-xs theme-text-muted mt-1">
                                Ended: {new Date(record.itemEndDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {record.isSold ? (
                          <div className="inline-flex flex-col items-center justify-center">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-success-bg)] theme-accent text-[var(--color-success)]">
                                <FaCheckCircle /> Sold
                            </span>
                            <span className="text-xs text-gray-500 mt-1 font-medium">{record.bidsCount} Bids</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center justify-center">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
                                <FaTimesCircle /> Unsold
                            </span>
                            <span className="text-xs text-gray-500 mt-1 font-medium">Reserve not met</span>
                          </div>
                        )}
                      </td>

                      {/* Final Price */}
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold text-lg ${record.isSold ? 'text-green-600' : 'text-gray-500'}`}>
                           {symbol}{formatPrice(record.currentPrice)}
                        </span>
                      </td>

                      {/* Participants */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1.5 text-sm">
                           <div className="flex items-center gap-2">
                              <FaUserTag className="theme-accent" /> 
                              <span className="theme-text"><span className="theme-text-muted mr-1 text-xs uppercase">Seller:</span>{record.sellerName}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <FaGavel className="theme-accent" /> 
                              <span className="theme-text"><span className="theme-text-muted mr-1 text-xs uppercase">Buyer:</span>{record.buyerName}</span>
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
