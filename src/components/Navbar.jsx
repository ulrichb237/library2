import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Receipt, 
  Home, 
  Moon, 
  Sun, 
  Menu, 
  X 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * Navbar - Sidebar de navigation fixe pour Library-ui
 * 
 * Fonctionnalités :
 * - Navigation principale (Home, Books, Customers, Loans)
 * - Toggle dark mode avec icônes sun/moon
 * - Design responsive avec hamburger menu mobile
 * - Header "Library Pro" avec font Playfair Display
 * - Animations Framer Motion subtiles
 * - Couleurs corporate : bleu marine header, gris anthracite text
 */
export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Configuration des liens de navigation
  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Accueil', 
      icon: Home,
      description: 'Tableau de bord principal'
    },
    {
      path: '/categories',
      label: 'Catégories',
      icon: BookOpen,
      description: 'Gestion catégories'
    },
    { 
      path: '/books', 
      label: 'Livres', 
      icon: BookOpen,
      description: 'Gestion des livres'
    },
    { 
      path: '/customers', 
      label: 'Clients', 
      icon: Users,
      description: 'Gestion des clients'
    },
    { 
      path: '/loans', 
      label: 'Prêts', 
      icon: Receipt,
      description: 'Gestion des prêts'
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-primary text-white shadow-md' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary'
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-30">
        {/* Header */}
        <div className="flex items-center justify-center h-16 bg-primary text-white px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-display text-2xl font-bold">Library Pro</h1>
            <p className="text-primary-200 text-xs">Système de gestion</p>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={navLinkClass}
                  title={item.description}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer avec toggle dark mode */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="text-yellow-400" />
                <span>Mode clair</span>
              </>
            ) : (
              <>
                <Moon size={20} className="text-gray-600" />
                <span>Mode sombre</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <BookOpen size={24} />
          <h1 className="font-display text-xl font-bold">Library Pro</h1>
        </div>
        
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-primary-600 transition-colors"
          aria-label="Menu de navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Mobile */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-50"
          >
            {/* Navigation Mobile */}
            <nav className="flex-1 px-4 py-6 space-y-2 mt-16">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={navLinkClass}
                    onClick={toggleMobileMenu}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer Mobile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={20} className="text-yellow-400" />
                    <span>Mode clair</span>
                  </>
                ) : (
                  <>
                    <Moon size={20} className="text-gray-600" />
                    <span>Mode sombre</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
}


