import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

/**
 * Configuration du QueryClient pour React Query
 * - Cache des données API avec staleTime et cacheTime optimisés
 * - Retry automatique en cas d'erreur réseau
 * - Refetch automatique au focus de la fenêtre
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Point d'entrée principal de l'application Library-ui
 * 
 * Structure des providers :
 * - React.StrictMode : Mode strict pour détecter les problèmes
 * - QueryClientProvider : Cache et gestion des requêtes API
 * - BrowserRouter : Routing côté client
 * - Toaster : Notifications toast globales
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E3A8A',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

