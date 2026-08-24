import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from '../common/Toast';
import GemstoneAI from '../common/GemstoneAI';
import CustomerChat from '../common/CustomerChat';
import CartDrawer from '../common/CartDrawer';
import WishlistDrawer from '../common/WishlistDrawer';

const Layout = () => {
  const { ToastContainer } = useToast();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Floating AI Assistant */}
      <GemstoneAI />
      
      {/* Customer Chat - for logged in users */}
      <CustomerChat />
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Wishlist Drawer */}
      <WishlistDrawer />
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Layout; 