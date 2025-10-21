import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Receipt, TrendingUp, Clock, AlertCircle, Plus, UserPlus, BookPlus, FileText } from 'lucide-react';
import { getCustomers, getBooks, getLoansByDate, formatDateForDisplay } from '../utils/api.js';

/**
 * Dashboard - Page d'accueil avec KPIs et vue d'ensemble
 * Affiche métriques (clients/livres/prêts actifs), actions rapides (nav vers pages),
 * activité récente placeholder. Aligné cahier : Vue d'ensemble efficace.
 */
export default function Dashboard() {
  // Queries pour les données réelles
  const { data: customersData } = useQuery({
    queryKey: ['customers-count'],
    queryFn: () => getCustomers(0, 1), // Juste pour compter
  });

  const { data: booksData } = useQuery({
    queryKey: ['books-count'],
    queryFn: () => getBooks(''), // Tous les livres
  });

  const { data: loansData } = useQuery({
    queryKey: ['loans-recent'],
    queryFn: () => getLoansByDate(new Date().toISOString().split('T')[0]), // Prêts d'aujourd'hui
  });

  // Extraction des données
  const customers = customersData?.content || customersData || [];
  const books = booksData?.content || booksData || [];
  const recentLoans = loansData?.content || loansData || [];

  // Calcul des KPIs
  const totalCustomers = customersData?.totalElements || customers.length || 0;
  const totalBooks = booksData?.totalElements || books.length || 0;
  const activeLoans = recentLoans.filter(loan => !loan.loanEndDate).length;

  // KPIs avec données réelles
  const kpis = [
    { label: 'Clients', value: totalCustomers.toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Livres', value: totalBooks.toString(), icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Prêts actifs', value: activeLoans.toString(), icon: Receipt, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  // Actions rapides (nav vers pages)
  const quickActions = [
    { label: 'Ajouter un livre', icon: BookOpen, path: '/books' },
    { label: 'Nouveau client', icon: Users, path: '/customers' },
    { label: 'Créer un prêt', icon: Receipt, path: '/loans' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Vue d'ensemble de votre bibliothèque</p>
      </motion.div>

      {/* KPIs Cards – Match image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`${kpi.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={kpi.color} size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions – Match image (grid buttons nav) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.path} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all duration-200">
                <Icon className="text-primary w-5 h-5" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Activité récente – Affichage des prêts récents */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-4">Activité récente</h2>
        {recentLoans.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto text-gray-400 mb-4 w-12 h-12" />
            <p className="text-gray-500 dark:text-gray-400">Aucune activité récente à afficher</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentLoans.slice(0, 5).map((loan, index) => (
              <motion.div
                key={`${loan.bookDTO.id}-${loan.customerDTO.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex-shrink-0">
                  {loan.loanEndDate ? (
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <FileText className="text-green-600 dark:text-green-400" size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Receipt className="text-blue-600 dark:text-blue-400" size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loan.loanEndDate ? 'Prêt clôturé' : 'Nouveau prêt'} - {loan.bookDTO.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {loan.customerDTO.firstName} {loan.customerDTO.lastName} • {formatDateForDisplay(loan.loanBeginDate)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    loan.loanEndDate
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {loan.loanEndDate ? 'Clôturé' : 'Actif'}
                  </span>
                </div>
              </motion.div>
            ))}
            {recentLoans.length > 5 && (
              <div className="text-center pt-2">
                <Link to="/loans" className="text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400">
                  Voir tous les prêts →
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}