import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, ArrowRight, ShieldCheck, Mail, 
  MapPin, Calendar, Gem, Sparkles, Award, Phone
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getOrderData = () => {
    if (location.state?.order) return location.state.order;
    try {
      const stored = JSON.parse(localStorage.getItem('kohinoor_orders') || '[]');
      if (stored && stored.length > 0) return stored[0];
    } catch { /* ignore */ }
    return {
      orderId: 'KOH-892415',
      items: [{ _id: '1', name: { english: 'Natural Royal Sapphire' }, category: 'Blue Sapphire', price: 75000, quantity: 1 }],
      total: 75000,
      paymentMethod: 'card',
      shipping: {
        fullName: 'Patron Customer',
        phone: '+91 9876543210',
        address: 'Showroom Suite 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      date: new Date().toISOString()
    };
  };

  const order = getOrderData();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-12 px-4 transition-all">
      <SEOHead 
        title="Order Placed Successfully - Kohinoor Gemstones" 
        description="Thank you for shopping with us. Your certified natural gemstone order is being prepared for secure insured shipment." 
      />

      <div className="max-w-3xl mx-auto text-center space-y-8">
        
        {/* Animated Green Check Icon */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 rounded-full uppercase tracking-wider">
            Transaction Successful
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Thank You For Your Patronage
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Your payment was successfully processed. A digital invoice has been dispatched to your email address.
          </p>
        </div>

        {/* Order Info Summary */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-md text-left space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral-100 dark:border-neutral-800 gap-2.5 text-xs font-semibold">
            <div>
              <span className="text-neutral-400 block text-[10px]">Order Reference</span>
              <span className="text-neutral-900 dark:text-white font-mono font-bold text-sm">{order.orderId || 'KOH-123456'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Date Placed</span>
              <span className="text-neutral-900 dark:text-white">{new Date(order.date || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Payment Method</span>
              <span className="text-neutral-900 dark:text-white uppercase font-bold">{order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI Instant Pay'}</span>
            </div>
          </div>

          {/* Purchased Listings */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Purchased Items</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(order.items || []).map((item) => (
                <div key={item._id || Math.random()} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-200/50">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name?.english} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-500" /></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 text-xs font-semibold">
                    <h4 className="text-neutral-900 dark:text-white truncate">{item.name?.english || 'Natural Gemstone'}</h4>
                    <p className="text-neutral-400 text-[10px] mt-0.5">{item.category || 'Gemstone'} • Weight: {item.weight?.value || item.ratti || 3.5} {item.weight?.unit || 'carats'}</p>
                    <p className="text-neutral-400 text-[10px]">Quantity: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right text-xs font-bold text-neutral-900 dark:text-white">
                    ₹{(((item.price || item.priceRange?.min || 25000)) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 text-xs font-semibold">
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Shipping Destination</span>
              </h4>
              <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-4.5">
                <p className="font-bold text-neutral-900 dark:text-white">{order.shipping?.fullName || 'Patron Customer'}</p>
                <p>{order.shipping?.address || 'Showroom Suite 4B'}</p>
                <p>{order.shipping?.city || 'Mumbai'}, {order.shipping?.state || 'Maharashtra'} - {order.shipping?.pincode || '400001'}</p>
                <p className="mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {order.shipping?.phone || '+91 9876543210'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Delivery Estimates</span>
              </h4>
              <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-4.5">
                <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Insured Express Shipment</span>
                </p>
                <p className="mt-1">Estimated Delivery: <span className="font-bold text-neutral-800 dark:text-neutral-200">3 - 5 Business Days</span></p>
                <p className="text-[10px] text-neutral-500 mt-1">Our customer experience desk will share government lab cert certificates and live shipping tracking IDs shortly.</p>
              </div>
            </div>
          </div>
          
          {/* Bill totals */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-between items-center text-xs font-bold">
            <span className="text-neutral-500">Paid Grand Total</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{(order.total || 25000).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Navigation Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/gemstones"
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <span>Browse More Gemstones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/profile"
            className="w-full sm:w-auto border border-neutral-250 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Patron Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
