import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  X, 
  Edit, 
  Trash2, 
  Mail, 
  User,
  Calendar,
  Briefcase,
  MapPin
} from 'lucide-react';
import { 
  getCustomers, 
  searchCustomersByEmail, 
  searchCustomersByLastName,
  addCustomer, 
  updateCustomer, 
  deleteCustomer, 
  sendEmailToCustomer,
  formatDateTimeForDisplay 
} from '../utils/api.js';

/**
 * Schema de validation pour les formulaires client
 */
const customerSchema = yup.object({
  firstName: yup.string().required('Prénom requis').min(3, 'Minimum 3 caractères'),
  lastName: yup.string().required('Nom requis').min(3, 'Minimum 3 caractères'),
  job: yup.string().optional(),
  address: yup.string().optional(),
  email: yup.string().required('Email requis').email('Email invalide'),
});

const mailSchema = yup.object({
  subject: yup.string().required('Sujet requis'),
  content: yup.string().required('Contenu requis'),
});

/**
 * Customers - Page de gestion des clients
 * 
 * Fonctionnalités :
 * - Liste paginée des clients avec React Query
 * - Recherche par email et nom de famille
 * - Ajout/modification/suppression de clients
 * - Envoi d'emails aux clients
 * - Modales pour toutes les actions
 * - Design responsive avec animations
 */
export default function Customers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // États pour la pagination et la recherche
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // États pour les modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

const { 
  data: pageData = { content: [] },  // Ajoute default ici
  isLoading, 
  error,
  refetch 
} = useQuery({
  queryKey: ['customers', page, size],
  queryFn: () => getCustomers(page, size),
  keepPreviousData: true,
  onError: (err) => console.error('Query error:', err), // Debug
});

  // Ajout debug pour voir la structure de pageData
  console.log('pageData:', pageData);

  // Gestion des deux formats possibles : Page ou List
  // Si pageData est un objet avec .content, on prend .content, sinon on prend pageData (tableau), sinon []
  const customers = pageData?.content || (Array.isArray(pageData) ? pageData : []) || [];

  // Mutations pour les opérations CRUD
  const addMutation = useMutation({
    mutationFn: addCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      resetEditForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    },
  });

  const mailMutation = useMutation({
    mutationFn: ({ customerId, subject, content }) => 
      sendEmailToCustomer(customerId, subject, content),
    onSuccess: () => {
      setIsMailModalOpen(false);
      setSelectedCustomer(null);
      resetMailForm();
    },
  });

  // Formulaires avec React Hook Form
  const addForm = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      job: '',
      address: '',
      email: '',
    },
  });

  const editForm = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      job: '',
      address: '',
      email: '',
    },
  });

  const mailForm = useForm({
    resolver: yupResolver(mailSchema),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  // Fonctions de reset des formulaires
  const resetAddForm = () => addForm.reset();
  const resetEditForm = () => editForm.reset();
  const resetMailForm = () => mailForm.reset();

  // Handlers pour les modales
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    editForm.reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      job: customer.job || '',
      address: customer.address || '',
      email: customer.email,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleMailCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsMailModalOpen(true);
  };

  // Recherche par email
  const handleSearchByEmail = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchCustomersByEmail(searchEmail);
      setSearchResults(result ? [result] : []);
    } catch (error) {
      if (error.response?.status === 204) setSearchResults([]);
      else setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Recherche par nom de famille
  const handleSearchByLastName = async () => {
    if (!searchLastName.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchCustomersByLastName(searchLastName);
      setSearchResults(results || []);
    } catch (error) {
      if (error.response?.status === 204) setSearchResults([]);
      else setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Effacer les résultats de recherche
  const clearSearch = () => {
    setSearchEmail('');
    setSearchLastName('');
    setSearchResults([]);
  };

  // Soumission des formulaires
  const onSubmitAdd = (data) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data) => {
    updateMutation.mutate({ id: selectedCustomer.id, data });
  };

  const onSubmitMail = (data) => {
    mailMutation.mutate({ 
      customerId: selectedCustomer.id, 
      subject: data.subject, 
      content: data.content 
    });
  };

  // Données à afficher (recherche ou liste normale)
  const displayData = searchResults?.length > 0 ? searchResults : customers;

  // ...UI inchangée...
  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des clients
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gérez vos clients et emprunteurs
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Ajouter Client</span>
        </button>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recherche par email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                className="input flex-1"
                placeholder="email@exemple.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <button
                onClick={handleSearchByEmail}
                disabled={isSearching || !searchEmail.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recherche par nom
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Nom de famille"
                value={searchLastName}
                onChange={(e) => setSearchLastName(e.target.value)}
              />
              <button
                onClick={handleSearchByLastName}
                disabled={isSearching || !searchLastName.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {(searchEmail || searchLastName || searchResults.length > 0) && (
            <div className="flex items-end">
              <button
                onClick={clearSearch}
                className="btn-accent"
              >
                <X size={18} />
                <span>Effacer</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Liste des clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Erreur de chargement des clients</p>
            <button onClick={() => refetch()} className="btn-primary mt-4">
              Réessayer
            </button>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchResults.length > 0 
                ? 'Aucun résultat pour cette recherche'
                : 'Commencez par ajouter votre premier client'
              }
            </p>
            {searchResults.length === 0 && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Ajouter un client</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <User className="text-primary-600 dark:text-primary-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      {customer.job && (
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} />
                          <span>{customer.job}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{customer.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Créé le {formatDateTimeForDisplay(customer.creationDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Modifier"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleMailCustomer(customer)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Envoyer un email"
                    >
                      <Mail size={18} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchResults.length === 0 && displayData.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="btn-accent disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                disabled={displayData.length < size}
                onClick={() => setPage(p => p + 1)}
                className="btn-accent disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Ajouter Client */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal
            title="Ajouter un client"
            onClose={() => {
              setIsAddModalOpen(false);
              resetAddForm();
            }}
          >
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom *
                  </label>
                  <input
                    {...addForm.register('firstName')}
                    className="input"
                    placeholder="Prénom"
                  />
                  {addForm.formState.errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    {...addForm.register('lastName')}
                    className="input"
                    placeholder="Nom de famille"
                  />
                  {addForm.formState.errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...addForm.register('email')}
                    className="input"
                    placeholder="email@exemple.com"
                  />
                  {addForm.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profession
                  </label>
                  <input
                    {...addForm.register('job')}
                    className="input"
                    placeholder="Profession"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse
                  </label>
                  <input
                    {...addForm.register('address')}
                    className="input"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {addMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetAddForm();
                  }}
                  className="btn-accent"
                >
                  Annuler
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Modifier Client */}
      <AnimatePresence>
        {isEditModalOpen && selectedCustomer && (
          <Modal
            title="Modifier le client"
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCustomer(null);
              resetEditForm();
            }}
          >
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom *
                  </label>
                  <input
                    {...editForm.register('firstName')}
                    className="input"
                    placeholder="Prénom"
                  />
                  {editForm.formState.errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    {...editForm.register('lastName')}
                    className="input"
                    placeholder="Nom de famille"
                  />
                  {editForm.formState.errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...editForm.register('email')}
                    className="input"
                    placeholder="email@exemple.com"
                  />
                  {editForm.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profession
                  </label>
                  <input
                    {...editForm.register('job')}
                    className="input"
                    placeholder="Profession"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse
                  </label>
                  <input
                    {...editForm.register('address')}
                    className="input"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {updateMutation.isPending ? 'Modification...' : 'Modifier'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedCustomer(null);
                    resetEditForm();
                  }}
                  className="btn-accent"
                >
                  Annuler
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Supprimer Client */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedCustomer && (
          <Modal
            title="Supprimer le client"
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedCustomer(null);
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer le client{' '}
                <strong>{selectedCustomer.firstName} {selectedCustomer.lastName}</strong> ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cette action est irréversible.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => deleteMutation.mutate(selectedCustomer.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCustomer(null);
                  }}
                  className="btn-accent"
                >
                  Annuler
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Envoyer Email */}
      <AnimatePresence>
        {isMailModalOpen && selectedCustomer && (
          <Modal
            title={`Envoyer un email à ${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
            onClose={() => {
              setIsMailModalOpen(false);
              setSelectedCustomer(null);
              resetMailForm();
            }}
          >
            <form onSubmit={mailForm.handleSubmit(onSubmitMail)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sujet *
                </label>
                <input
                  {...mailForm.register('subject')}
                  className="input"
                  placeholder="Sujet de l'email"
                />
                {mailForm.formState.errors.subject && (
                  <p className="text-red-600 text-sm mt-1">
                    {mailForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenu *
                </label>
                <textarea
                  {...mailForm.register('content')}
                  className="input min-h-[120px] resize-none"
                  placeholder="Contenu de l'email"
                />
                {mailForm.formState.errors.content && (
                  <p className="text-red-600 text-sm mt-1">
                    {mailForm.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={mailMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {mailMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMailModalOpen(false);
                    setSelectedCustomer(null);
                    resetMailForm();
                  }}
                  className="btn-accent"
                >
                  Annuler
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Composant Modal réutilisable
 */
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}