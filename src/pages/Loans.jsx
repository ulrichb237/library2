import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Receipt, 
  Plus, 
  Search, 
  X, 
  Calendar,
  CheckCircle, 
  XCircle,
  Mail,
  User,
  BookOpen
} from 'lucide-react';
import { 
  getLoansByCustomer, 
  getLoansByDate,
  addLoan, 
  closeLoan,
  getCustomers, 
  getBooks,
  sendEmailToCustomer,
  formatDateForDisplay 
} from '../utils/api.js';

/**
 * Schema de validation pour le formulaire de prêt
 */
const loanSchema = yup.object({
  customerId: yup.number().required('Client requis'),
  bookId: yup.number().required('Livre requis'),
  beginDate: yup.string().required('Date de début requise'),
  endDate: yup.string().required('Date de fin requise').test('is-after-begin', 'Date de fin doit être après la date de début', function(value) {
    const { beginDate } = this.parent;
    return !beginDate || !value || new Date(value) > new Date(beginDate);
  }),
});

/**
 * Loans - Page de gestion des prêts
 * 
 * Fonctionnalités :
 * - Liste des prêts avec recherche par client/date
 * - Création de nouveaux prêts avec contraintes (exemplaires, prêts en cours)
 * - Clôture des prêts existants
 * - Envoi d'emails aux emprunteurs
 * - Modales pour toutes les actions
 * - Design responsive avec animations
 */
export default function Loans() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // États pour la recherche
  const [searchEmail, setSearchEmail] = useState('');
  const [searchMaxDate, setSearchMaxDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  
  // États pour les modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Query clients et livres pour dropdowns
  const { data: customersData = { content: [] } } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers(0, 1000), // Plus pour dropdown
  });

  const { data: booksData = { content: [] } } = useQuery({
    queryKey: ['books'],
    queryFn: () => getBooks(''), // Tous les livres
  });

  // Extraction des données depuis l'objet Page
  const customers = customersData.content || customersData || [];
  const books = booksData.content || booksData || [];

  // Query prêts par client (défaut tous si email vide)
  const {
    data: loansData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['loans', searchEmail],
    queryFn: () => searchEmail ? getLoansByCustomer(searchEmail) : getLoansByDate('3000-01-01'), // Tous si vide
    keepPreviousData: true,
  });

  // Extraction des données depuis l'objet Page ou List
  const loans = loansData.content || loansData || [];

  // Mutation pour ajouter prêt
  const addMutation = useMutation({
    mutationFn: addLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
  });

  // Mutation pour clôturer prêt
  const closeMutation = useMutation({
    mutationFn: ({ bookId, customerId }) => closeLoan({ bookId, customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setIsCloseModalOpen(false);
      setSelectedLoan(null);
    },
  });

  // Mutation pour mail
  const mailMutation = useMutation({
    mutationFn: ({ customerId, subject, content }) => sendEmailToCustomer(customerId, subject, content),
    onSuccess: () => {
      setIsMailModalOpen(false);
      setSelectedLoan(null);
      resetMailForm();
    },
  });

  // Formulaires
  const addForm = useForm({
    resolver: yupResolver(loanSchema),
    defaultValues: {
      customerId: '',
      bookId: '',
      beginDate: '',
      endDate: '',
    },
  });

  const mailForm = useForm({
    resolver: yupResolver(yup.object({
      subject: yup.string().required('Sujet requis'),
      content: yup.string().required('Contenu requis'),
    })),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  // Reset forms
  const resetAddForm = () => addForm.reset();
  const resetMailForm = () => mailForm.reset();

  // Check contraintes pour dropdown book
  const getAvailableBooks = () => {
    if (!addForm.watch('customerId')) return books;
    return books.filter(book => 
      book.totalExamplaries > 0 && 
      !loans.some(loan => loan.customerDTO.id === parseInt(addForm.watch('customerId')) && 
        loan.bookDTO.id === book.id && 
        loan.loanEndDate === null) // Prêt ouvert si endDate null
    );
  };

  // Handlers recherche
  const handleSearchByEmail = async () => {
    if (!searchEmail.trim()) return;
    setIsSearching(true);
    try {
      const results = await getLoansByCustomer(searchEmail);
      const loans = results.content || results || [];
      setSearchResults(loans);
    } catch (error) {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSearchByDate = async () => {
    if (!searchMaxDate.trim()) return;
    setIsSearching(true);
    try {
      const results = await getLoansByDate(searchMaxDate);
      const loans = results.content || results || [];
      setSearchResults(loans);
    } catch (error) {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchEmail('');
    setSearchMaxDate('');
    setSearchResults([]);
  };

  // Handlers modales
  const handleCloseLoan = (loan) => {
    setSelectedLoan(loan);
    setIsCloseModalOpen(true);
  };

  const handleMailLoan = (loan) => {
    setSelectedLoan(loan);
    setIsMailModalOpen(true);
  };

  // Submit forms
  const onSubmitAdd = (data) => {
    addMutation.mutate(data);
  };

  const onSubmitMail = (data) => {
    mailMutation.mutate({ 
      customerId: selectedLoan.customerDTO.id, 
      subject: data.subject, 
      content: data.content 
    });
  };

  // Données display
  const displayData = searchResults.length > 0 ? searchResults : loans;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Retour">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Gestion des prêts</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez les prêts et emprunts de livres</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Nouveau Prêt</span>
        </button>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche par client (email)</label>
            <div className="flex gap-2">
              <input type="email" className="input flex-1" placeholder="email@exemple.com" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
              <button onClick={handleSearchByEmail} disabled={isSearching || !searchEmail.trim()} className="btn-primary disabled:opacity-50">
                <Search size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche par date max (YYYY-MM-DD)</label>
            <div className="flex gap-2">
              <input type="date" className="input flex-1" value={searchMaxDate} onChange={(e) => setSearchMaxDate(e.target.value)} />
              <button onClick={handleSearchByDate} disabled={isSearching || !searchMaxDate} className="btn-primary disabled:opacity-50">
                <Search size={18} />
              </button>
            </div>
          </div>
          {(searchEmail || searchMaxDate || searchResults.length > 0) && (
            <div className="flex items-end">
              <button onClick={clearSearch} className="btn-accent">
                <X size={18} />
                <span>Effacer</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Liste des prêts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="card">
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
            <p className="text-red-600 dark:text-red-400">Erreur de chargement des prêts</p>
            <button onClick={() => refetch()} className="btn-primary mt-4">Réessayer</button>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun prêt trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchResults.length > 0 ? 'Aucun résultat pour cette recherche' : 'Commencez par créer votre premier prêt'}
            </p>
            {searchResults.length === 0 && (
              <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                <Plus size={18} /> <span>Nouveau Prêt</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((loan, index) => (
              <motion.div
                key={`${loan.bookDTO.id}-${loan.customerDTO.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/20 rounded-full flex items-center justify-center">
                        <Receipt className="text-accent-600 dark:text-accent-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{loan.bookDTO.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{loan.customerDTO.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Client :</span>
                        <span>{loan.customerDTO.firstName} {loan.customerDTO.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Auteur :</span>
                        <span>{loan.bookDTO.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Catégorie :</span>
                        <span>{loan.bookDTO.category?.label || loan.bookDTO.category || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Début : {formatDateForDisplay(loan.loanBeginDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Fin : {formatDateForDisplay(loan.loanEndDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          loan.loanEndDate ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {loan.loanEndDate ? 'Clôturé' : 'Actif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!loan.loanEndDate && (
                      <button onClick={() => handleCloseLoan(loan)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Clôturer">
                        <CheckCircle size={18} className="text-green-600" />
                      </button>
                    )}
                    <button onClick={() => handleMailLoan(loan)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Envoyer email">
                      <Mail size={18} className="text-blue-600" />
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
            <div className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1}</div>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-accent disabled:opacity-50">Précédent</button>
              <button disabled={displayData.length < size} onClick={() => setPage(p => p + 1)} className="btn-accent disabled:opacity-50">Suivant</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Nouveau Prêt */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal title="Nouveau Prêt" onClose={() => { setIsAddModalOpen(false); resetAddForm(); }}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
                  <select {...addForm.register('customerId', { valueAsNumber: true })} className="input">
                    <option value="">Sélectionner un client</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                  </select>
                  {addForm.formState.errors.customerId && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.customerId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Livre *</label>
                  <select {...addForm.register('bookId', { valueAsNumber: true })} className="input">
                    <option value="">Sélectionner un livre</option>
                    {getAvailableBooks().map(b => (
                      <option key={b.id} value={b.id} disabled={b.totalExamplaries <= 0}>
                        {b.title} par {b.author} ({b.totalExamplaries} ex.)
                      </option>
                    ))}
                  </select>
                  {addForm.formState.errors.bookId && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.bookId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début *</label>
                  <input type="date" {...addForm.register('beginDate')} className="input" />
                  {addForm.formState.errors.beginDate && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.beginDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin *</label>
                  <input type="date" {...addForm.register('endDate')} className="input" />
                  {addForm.formState.errors.endDate && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.endDate.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1">
                  {addMutation.isPending ? 'Création...' : 'Créer Prêt'}
                </button>
                <button type="button" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="btn-accent">Annuler</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Clôturer Prêt */}
      <AnimatePresence>
        {isCloseModalOpen && selectedLoan && (
          <Modal title="Clôturer le prêt" onClose={() => { setIsCloseModalOpen(false); setSelectedLoan(null); }}>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir clôturer le prêt de{' '}
                <strong>{selectedLoan.bookDTO.title}</strong> pour{' '}
                <strong>{selectedLoan.customerDTO.firstName} {selectedLoan.customerDTO.lastName}</strong> ?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Date de clôture : {formatDateForDisplay(new Date())}
              </p>
              <div className="flex gap-3 pt-4">
                <button onClick={() => closeMutation.mutate({ bookId: selectedLoan.bookDTO.id, customerId: selectedLoan.customerDTO.id })} disabled={closeMutation.isPending} className="btn-primary flex-1 bg-green-600 hover:bg-green-700">
                  {closeMutation.isPending ? 'Clôture...' : 'Clôturer'}
                </button>
                <button onClick={() => { setIsCloseModalOpen(false); setSelectedLoan(null); }} className="btn-accent">Annuler</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Envoyer Email */}
      <AnimatePresence>
        {isMailModalOpen && selectedLoan && (
          <Modal title={`Email pour ${selectedLoan.customerDTO.firstName} ${selectedLoan.customerDTO.lastName}`} onClose={() => { setIsMailModalOpen(false); setSelectedLoan(null); resetMailForm(); }}>
            <form onSubmit={mailForm.handleSubmit(onSubmitMail)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
                <input {...mailForm.register('subject')} className="input" placeholder="Sujet de l'email" />
                {mailForm.formState.errors.subject && <p className="text-red-600 text-sm mt-1">{mailForm.formState.errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu *</label>
                <textarea {...mailForm.register('content')} className="input min-h-[120px] resize-none" placeholder="Contenu de l'email" />
                {mailForm.formState.errors.content && <p className="text-red-600 text-sm mt-1">{mailForm.formState.errors.content.message}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={mailMutation.isPending} className="btn-primary flex-1">
                  {mailMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
                <button type="button" onClick={() => { setIsMailModalOpen(false); setSelectedLoan(null); resetMailForm(); }} className="btn-accent">Annuler</button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Fermer">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}