import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MetalRatesProvider } from './contexts/MetalRatesContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastProvider } from './contexts/ToastContext';
import ScrollToTop from './components/ScrollToTop';
import BackButton from './components/BackButton';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Recommender from './pages/Recommender';
import Prices from './pages/Prices';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import OTPLogin from './pages/OTPLogin';
import Wishlist from './pages/Wishlist';
import Collections from './pages/Collections';
import SizeGuide from './pages/SizeGuide';
import CareInstructions from './pages/CareInstructions';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import BusinessCard from './pages/BusinessCard';
import CategoryRedirect from './pages/CategoryRedirect';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import ClientPrivacy from './pages/ClientPrivacy';
import Sitemap from './pages/Sitemap';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import CustomAtelier from './pages/CustomAtelier';
import CertificateVerifier from './pages/CertificateVerifier';
import GiftingSuite from './pages/GiftingSuite';
import GlimmrConcierge from './components/GlimmrConcierge';

function App() {
  return (
    <AuthProvider>
      <MetalRatesProvider>
        <CartProvider>
          <ToastProvider>
          <Router>
          <ScrollToTop />
          <BackButton />
          <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/store-grid" element={<Products />} />
                  <Route path="/store-list" element={<Products />} />
                  <Route path="/store-grid/:category" element={<Products />} />
                  <Route path="/store-list/:category" element={<Products />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/category/:material" element={<Products />} />
                  <Route path="/category/:material/:slug" element={<CategoryRedirect />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/recommender" element={<Recommender />} />
                  <Route path="/live-rates" element={<Prices />} />
                  <Route path="/prices" element={<Prices />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/otp-login" element={<OTPLogin />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/care-instructions" element={<CareInstructions />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/terms-and-conditions" element={<Terms />} />
                  <Route path="/privacy-policy" element={<ClientPrivacy />} />
                  <Route path="/privacy" element={<ClientPrivacy />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/business-card" element={<BusinessCard />} />
                  <Route path="/custom-atelier" element={<CustomAtelier />} />
                  <Route path="/verify-certificate" element={<CertificateVerifier />} />
                  <Route path="/gifting" element={<GiftingSuite />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
            <GlimmrConcierge />
          </div>
        </Router>
        </ToastProvider>
      </CartProvider>
    </MetalRatesProvider>
  </AuthProvider>
  );
}

export default App;
