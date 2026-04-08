import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuction } from "../api/auction.js";
import { useNavigate } from "react-router";
import { 
  FaTag, FaAlignLeft, FaList, FaDollarSign, FaCalendarAlt, 
  FaCloudUploadAlt, FaTimes, FaBox, FaGavel, FaBolt 
} from "react-icons/fa";
import { CurrencySelector } from "../components/CurrencySelector.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { currencySymbols, convertToUSD, rates } from "../utils/currency.js";


export const CreateAuction = () => {
  const fileInputRef = useRef();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [prevCurrency, setPrevCurrency] = useState(currency);
  const [error, setError] = useState("");

  
  // Expanded state to include condition, reserve, and buy-it-now prices
  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCategory: "",
    itemCondition: "Used", // Default condition
    startingPrice: "",
    reservePrice: "", // New optional field
    buyItNowPrice: "", // New optional field
    itemStartDate: "",
    itemEndDate: "",
    itemPhoto: "",
  });

  // Handle currency change - scale existing prices
  useEffect(() => {
    if (prevCurrency !== currency) {
      setFormData((prev) => {
        const scale = (val) => {
          if (!val) return "";
          // convert from old currency to USD, then from USD to new currency
          const usd = convertToUSD(Number(val), prevCurrency);
          const scaled = (usd * (rates[currency] || 1)).toFixed(2);
          return scaled.endsWith(".00") ? Math.round(scaled) : scaled;
        };

        return {
          ...prev,
          startingPrice: scale(prev.startingPrice),
          reservePrice: scale(prev.reservePrice),
          buyItNowPrice: scale(prev.buyItNowPrice),
        };
      });
      setPrevCurrency(currency);
    }
  }, [currency, prevCurrency]);


  const { mutate, isPending } = useMutation({
    mutationFn: createAuction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["viewAuctions", "allAuction", "myauctions", "stats"] });
      navigate(`/auction/${data.newAuction._id}`);
    },
    onError: (error) => setError(error?.response?.data?.message || "Something went wrong"),
  });

  const categories = [
    "Electronics", "Antiques", "Art", "Books", "Clothing",
    "Collectibles", "Home & Garden", "Jewelry", "Musical Instruments",
    "Sports", "Toys", "Vehicles", "Other",
  ];

  const conditions = ["Brand New", "Like New", "Used", "Refurbished", "Parts/Repair"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) return setError("Only image files are allowed.");
      if (file.size / (1024 * 1024) > 5) return setError("File size must be less than 5 MB.");
      setFormData((prev) => ({ ...prev, itemPhoto: file }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemPhoto) return setError("Please upload an image.");
    
    const start = new Date(formData.itemStartDate);
    const end = new Date(formData.itemEndDate);
    if (end <= start) return setError("End date must be after start date.");

    // Validate optional pricing logic
    if (formData.reservePrice && Number(formData.reservePrice) < Number(formData.startingPrice)) {
      return setError("Reserve price must be higher than starting price.");
    }
    if (formData.buyItNowPrice && Number(formData.buyItNowPrice) <= Number(formData.startingPrice)) {
      return setError("Buy It Now price must be significantly higher than starting price.");
    }

    // Convert locally formatted prices back to USD before saving
    const payload = {
      ...formData,
      startingPrice: convertToUSD(Number(formData.startingPrice), currency),
      reservePrice: formData.reservePrice ? convertToUSD(Number(formData.reservePrice), currency) : "",
      buyItNowPrice: formData.buyItNowPrice ? convertToUSD(Number(formData.buyItNowPrice), currency) : "",
    };

    mutate(payload);
  };

  const today = new Date().toISOString().split("T")[0];
  const maxStart = new Date();
  maxStart.setDate(maxStart.getDate() + 15);
  const maxStartDate = maxStart.toISOString().split("T")[0];

  let maxEndDate = "";
  if (formData.itemStartDate) {
    const end = new Date(formData.itemStartDate);
    end.setDate(end.getDate() + 15);
    maxEndDate = end.toISOString().split("T")[0];
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold theme-text-heading">Create New Listing</h1>
          <p className="theme-text-secondary mt-1 font-medium">Add details, set your pricing strategy, and publish your auction.</p>
        </div>

        <div className="theme-card rounded-2xl shadow-sm border theme-border">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Basic Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold theme-text-heading border-b theme-border pb-2">Item Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold theme-text-heading mb-2">Item Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaTag className="absolute top-3.5 left-3 theme-accent" />
                      <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg" placeholder="E.g., Vintage Rolex Submariner" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaList className="absolute top-3.5 left-3 theme-accent" />
                      <select name="itemCategory" value={formData.itemCategory} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg appearance-none" required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Condition <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaBox className="absolute top-3.5 left-3 theme-accent" />
                      <select name="itemCondition" value={formData.itemCondition} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg appearance-none" required>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold theme-text-heading mb-2">Description <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaAlignLeft className="absolute top-3.5 left-3 theme-accent" />
                      <textarea name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} rows={4} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg resize-y" placeholder="Describe the item completely..." required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing Strategy */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold theme-text-heading border-b theme-border pb-2">Pricing & Duration</h2>
                
                {/* Currency Selection - Full width, above prices */}
                <div>
                  <label className="block text-sm font-bold theme-text-heading mb-2">Select Currency</label>
                  <CurrencySelector variant="create" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Starting Price <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-3 theme-accent font-bold">{currencySymbols[currency]}</span>
                      <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleInputChange} min="1" className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg transition-colors focus:ring-1 focus:ring-[var(--color-accent)]" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Reserve Price <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <FaGavel className="absolute top-3.5 left-3 theme-accent" />
                      <input type="number" name="reservePrice" value={formData.reservePrice} onChange={handleInputChange} min={formData.startingPrice || 1} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg transition-colors focus:ring-1 focus:ring-[var(--color-accent)]" placeholder="Minimum accepted" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Buy It Now <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <FaBolt className="absolute top-3.5 left-3 text-yellow-500" />
                      <input type="number" name="buyItNowPrice" value={formData.buyItNowPrice} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg transition-colors focus:ring-1 focus:ring-[var(--color-accent)]" placeholder="Instant purchase price" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">Start Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-3.5 left-3 theme-accent" />
                      <input type="date" name="itemStartDate" min={today} max={maxStartDate} value={formData.itemStartDate} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg transition-colors focus:ring-1 focus:ring-[var(--color-accent)]" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold theme-text-heading mb-2">End Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-3.5 left-3 theme-accent" />
                      <input type="date" name="itemEndDate" min={formData.itemStartDate || today} max={maxEndDate} value={formData.itemEndDate} onChange={handleInputChange} className="theme-input w-full pl-10 pr-3 py-2.5 rounded-lg transition-colors focus:ring-1 focus:ring-[var(--color-accent)]" required disabled={!formData.itemStartDate} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Media */}
              <div>
                <h2 className="text-xl font-bold theme-text-heading border-b theme-border pb-2 mb-4">Item Photo <span className="text-red-500">*</span></h2>
                {!formData.itemPhoto ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 theme-border border-dashed rounded-xl cursor-pointer theme-bg-tertiary hover:opacity-80 transition-opacity">
                    <FaCloudUploadAlt className="w-12 h-12 theme-accent mb-3" />
                    <p className="mb-2 text-sm theme-text-secondary"><span className="font-bold">Click to upload</span> an image</p>
                    <p className="text-xs theme-text-muted">PNG, JPG or JPEG (MAX. 5MB)</p>
                    <input type="file" onChange={handleFileChange} ref={fileInputRef} accept="image/*" className="hidden" />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={URL.createObjectURL(formData.itemPhoto)} alt="Preview" className="w-48 h-48 object-cover border theme-border rounded-xl shadow-sm" />
                    <button type="button" onClick={() => { setFormData(p => ({ ...p, itemPhoto: "" })); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 shadow-sm"><FaTimes /></button>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md font-medium">{error}</div>}

              <button type="submit" disabled={isPending} className="w-full py-4 theme-accent-bg text-white rounded-xl font-bold text-lg transition-all shadow-md disabled:opacity-50">
                {isPending ? "Publishing Listing..." : "Publish Auction"}
              </button>
            </form>
          </div>
        </div>
        <HelpSection />
      </main>
    </div>
  );
};

export const HelpSection = () => (
  <div className="mt-8 theme-card border theme-border shadow-sm rounded-2xl p-6">
    <h3 className="text-lg font-bold theme-text-heading mb-4 flex items-center gap-2"><FaTag className="theme-accent" /> Seller Best Practices</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium theme-text-secondary">
      <ul className="space-y-3">
        <li>• Use clear, well-lit photos.</li>
        <li>• Be transparent about flaws.</li>
        <li>• Set a reserve price only if necessary to avoid deterring bidders.</li>
      </ul>
      <ul className="space-y-3">
        <li>• 3 to 7 days is the optimal auction duration.</li>
        <li>• The "Buy It Now" price should represent a premium value.</li>
      </ul>
    </div>
  </div>
);