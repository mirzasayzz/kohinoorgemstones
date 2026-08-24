import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from '../common/Toast';

const Layout = () => {
  const { ToastContainer } = useToast();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Layout; 