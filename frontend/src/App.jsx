import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { BusinessProvider } from './context/BusinessContext';
import { WishlistProvider } from './context/WishlistContext';
import { useToast } from './components/common/Toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AllGemstones from './pages/AllGemstones';
import GemstoneDetail from './pages/GemstoneDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import './index.css';

// 404 Not Found component
const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="font-heading text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
    <a href="/" className="btn-primary">
      Return Home
    </a>
  </div>
);

// App wrapper with toast notifications
const AppWithToasts = () => {
  const { ToastContainer, showUpdate } = useToast();
  
  // Handle business update notifications
  const handleBusinessUpdate = (businessInfo, updateInfo) => {
    if (updateInfo.type === 'auto-update') {
      showUpdate(updateInfo.message, {
        duration: 5000,
        actionButton: (
          <button
            onClick={() => window.location.reload()}
            className="text-purple-600 hover:text-purple-800 text-xs font-medium underline"
          >
            Refresh
          </button>
        )
      });
    }
  };
  
  return (
    <BusinessProvider onBusinessUpdate={handleBusinessUpdate}>
      <WishlistProvider>
        <Router>
          <div className="App font-body">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="gemstones" element={<AllGemstones />} />
                <Route path="gemstone/:slug" element={<GemstoneDetail />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
          
          {/* Toast notifications for auto-updates */}
          <ToastContainer />
        </Router>
      </WishlistProvider>
    </BusinessProvider>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AppWithToasts />
    </HelmetProvider>
  );
}

export default App;
