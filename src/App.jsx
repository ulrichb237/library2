import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Customers from './pages/Customers.jsx';
import Loans from './pages/Loans.jsx';
import Categories from './pages/Categories.jsx';
import { Toaster } from 'react-hot-toast';

/**
 * App.jsx - Composant principal de Library-ui
 * Structure globale avec Router, ThemeProvider, ErrorBoundary, layout responsive.
 * Navbar fixe, animations subtiles, dark mode.
 */
export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Layout principal avec sidebar fixe */}
            <div className="flex">
              {/* Sidebar Navigation */}
              <Navbar />
              
              {/* Contenu principal */}
              <main className="flex-1 ml-64 lg:ml-72">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6"
                >
                  <Routes>
                    {/* Route racine redirige vers dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Routes principales */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/loans" element={<Loans />} />
                    <Route path="/categories" element={<Categories />} />
                    
                    {/* Route 404 redirige vers dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </motion.div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
}
