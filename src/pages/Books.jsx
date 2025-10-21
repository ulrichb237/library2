import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Search, 
  X, 
  Edit, 
  Trash2,
  Calendar
} from 'lucide-react';
import { 
  getBooks, 
  searchBooksByIsbn, 
  searchBooksByTitle,
  addBook, 
  updateBook, 
  deleteBook, 
  getCategories,
  formatDateForDisplay 
} from '../utils/api.js';

/**
 * Schema de validation pour les formulaires livre
 */
const bookSchema = yup.object({
  title: yup.string().required('Titre requis').min(3, 'Minimum 3 caractères'),
  isbn: yup.string().required('ISBN requis').min(10, 'Minimum 10 caractères'),
  releaseDate: yup.string().required('Date de sortie requise'),
  totalExamplaries: yup.number().required('Nombre d\'exemplaires requis').min(1, 'Au moins 1 exemplaire'),
  author: yup.string().required('Auteur requis').min(3, 'Minimum 3 caractères'),
  category: yup.string().required('Catégorie requise').min(2, 'Minimum 2 caractères'),
});

/**
 * Books - Page de gestion des livres
 * 
 * Fonctionnalités :
 * - Liste paginée des livres avec React Query
 * - Recherche par ISBN et titre
 * - Ajout/modification/suppression de livres
 * - Dropdown pour catégories
 * - Modales pour toutes les actions
 * - Design responsive avec animations
 */
export default function Books() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // États pour la pagination et la recherche
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchIsbn, setSearchIsbn] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // États pour les modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Query catégories pour dropdown
  let { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  // Si aucune catégorie n'est récupérée, injecter des exemples réels pour la démo/dev
  if (!categories || categories.length === 0) {
    categories = [
      { code: 'ROM', label: 'Roman' },
      { code: 'SCI', label: 'Science' },
      { code: 'HIST', label: 'Histoire' },
      { code: 'BIO', label: 'Biographie' },
      { code: 'JEU', label: 'Jeunesse' },
      { code: 'BD', label: 'Bande dessinée' },
      { code: 'POE', label: 'Poésie' },
      { code: 'FANT', label: 'Fantastique' },
      { code: 'ESS', label: 'Essai' },
      { code: 'THR', label: 'Thriller' },
      { code: 'ART', label: 'Art' },
      { code: 'PHILO', label: 'Philosophie' },
      { code: 'CUIS', label: 'Cuisine' },
      { code: 'VOY', label: 'Voyage' },
    ];
  }

  // Query liste livres
  // const { 
  //   data: pageData = { content: [] }, 
  //   isLoading, 
  //   error,
  //   refetch 
  // } = useQuery({
  //   queryKey: ['books', page, size],
  //   queryFn: () => getBooks(''), // Titre vide pour tous
  //   keepPreviousData: true,
  // });
  
  // const books = pageData.content;
  // Query liste livres
const { 
  data: pageData = { content: [] }, 
  isLoading, 
  error,
  refetch 
} = useQuery({
  queryKey: ['books', page, size],
  queryFn: () => getBooks(''), // Titre vide pour tous
  keepPreviousData: true,
  onError: (err) => console.error('Query books error:', err), // Debug
});

// Mapping sûr
const books = pageData?.content || pageData || [];

// Debug
console.log('pageData:', pageData, 'books:', books);

  // Mutations pour les opérations CRUD
  const addMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsEditModalOpen(false);
      setSelectedBook(null);
      resetEditForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
    },
  });

  // Formulaires avec React Hook Form
  const addForm = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      title: '',
      isbn: '',
      releaseDate: '',
      totalExamplaries: 1,
      author: '',
      category: '',
    },
  });

  const editForm = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      title: '',
      isbn: '',
      releaseDate: '',
      totalExamplaries: 1,
      author: '',
      category: '',
    },
  });

  // Fonctions de reset des formulaires
  const resetAddForm = () => addForm.reset();
  const resetEditForm = () => editForm.reset();

  // Handlers pour les modales
  const handleEditBook = (book) => {
    setSelectedBook(book);
    editForm.reset({
      title: book.title,
      isbn: book.isbn,
      releaseDate: formatDateForDisplay(book.releaseDate),
      totalExamplaries: book.totalExamplaries,
      author: book.author,
      category: book.category.label || book.category,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  // Recherche par ISBN
  const handleSearchByIsbn = async () => {
    if (!searchIsbn.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchBooksByIsbn(searchIsbn);
      setSearchResults(result ? [result] : []);
    } catch (error) {
      if (error.response?.status === 204) setSearchResults([]);
      else setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Recherche par titre
  const handleSearchByTitle = async () => {
    if (!searchTitle.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchBooksByTitle(searchTitle);
      setSearchResults(results || []);
    } catch (error) {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Effacer les résultats de recherche
  const clearSearch = () => {
    setSearchIsbn('');
    setSearchTitle('');
    setSearchResults([]);
  };

  // Soumission des formulaires
  const onSubmitAdd = (data) => {
    // Transformer la catégorie saisie en objet {code, label}
    const categoryLabel = data.category;
    const categoryCode = categoryLabel.substring(0, 3).toUpperCase();
    const transformedData = {
      ...data,
      category: {
        code: categoryCode,
        label: categoryLabel
      }
    };
    addMutation.mutate(transformedData);
  };

  const onSubmitEdit = (data) => {
    // Transformer la catégorie saisie en objet {code, label}
    const categoryLabel = data.category;
    const categoryCode = categoryLabel.substring(0, 3).toUpperCase();
    const transformedData = {
      ...data,
      category: {
        code: categoryCode,
        label: categoryLabel
      }
    };
    updateMutation.mutate({ id: selectedBook.id, data: transformedData });
  };

  // Données à afficher (recherche ou liste normale)
  // Après (corrigé)
  const displayData = searchResults?.length > 0 ? searchResults : (books || []);

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
            Gestion des livres
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gérez votre catalogue de livres
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Ajouter Livre</span>
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
              Recherche par ISBN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="ISBN..."
                value={searchIsbn}
                onChange={(e) => setSearchIsbn(e.target.value)}
              />
              <button
                onClick={handleSearchByIsbn}
                disabled={isSearching || !searchIsbn.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recherche par titre
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Titre..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              <button
                onClick={handleSearchByTitle}
                disabled={isSearching || !searchTitle.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {(searchIsbn || searchTitle || searchResults.length > 0) && (
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

      {/* Liste des livres */}
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
            <p className="text-red-600 dark:text-red-400">Erreur de chargement des livres</p>
            <button onClick={() => refetch()} className="btn-primary mt-4">
              Réessayer
            </button>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchResults.length > 0 
                ? 'Aucun résultat pour cette recherche'
                : 'Commencez par ajouter votre premier livre'
              }
            </p>
            {searchResults.length === 0 && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Ajouter un livre</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((book, index) => (
              <motion.div
                key={book.id}
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
                        <BookOpen className="text-primary-600 dark:text-primary-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{book.isbn}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Auteur :</span>
                        <span>{book.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Catégorie :</span>
                        <span>{book.category.label || book.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Exemplaires :</span>
                        <span className="font-semibold">{book.totalExamplaries}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Sortie : {formatDateForDisplay(book.releaseDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Enregistré : {formatDateForDisplay(book.registerDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Modifier"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book)}
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

      {/* Modal Ajouter Livre */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal
            title="Ajouter un livre"
            onClose={() => {
              setIsAddModalOpen(false);
              resetAddForm();
            }}
          >
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre *
                  </label>
                  <input
                    {...addForm.register('title')}
                    className="input"
                    placeholder="Titre du livre"
                  />
                  {addForm.formState.errors.title && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ISBN *
                  </label>
                  <input
                    {...addForm.register('isbn')}
                    className="input"
                    placeholder="ISBN"
                  />
                  {addForm.formState.errors.isbn && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.isbn.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Auteur *
                  </label>
                  <input
                    {...addForm.register('author')}
                    className="input"
                    placeholder="Auteur"
                  />
                  {addForm.formState.errors.author && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.author.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exemplaires *
                  </label>
                  <input
                    type="number"
                    {...addForm.register('totalExamplaries', { valueAsNumber: true })}
                    className="input"
                    placeholder="Nombre"
                    min="1"
                  />
                  {addForm.formState.errors.totalExamplaries && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.totalExamplaries.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de sortie *
                  </label>
                  <input
                    type="date"
                    {...addForm.register('releaseDate')}
                    className="input"
                  />
                  {addForm.formState.errors.releaseDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.releaseDate.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie *
                  </label>
                  <input
                    {...addForm.register('category')}
                    className="input"
                    placeholder="Entrez la catégorie du livre"
                  />
                  {addForm.formState.errors.category && (
                    <p className="text-red-600 text-sm mt-1">
                      {addForm.formState.errors.category.message}
                    </p>
                  )}
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

      {/* Modal Modifier Livre */}
      <AnimatePresence>
        {isEditModalOpen && selectedBook && (
          <Modal
            title="Modifier le livre"
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBook(null);
              resetEditForm();
            }}
          >
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre *
                  </label>
                  <input
                    {...editForm.register('title')}
                    className="input"
                    placeholder="Titre du livre"
                  />
                  {editForm.formState.errors.title && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ISBN *
                  </label>
                  <input
                    {...editForm.register('isbn')}
                    className="input"
                    placeholder="ISBN"
                  />
                  {editForm.formState.errors.isbn && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.isbn.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Auteur *
                  </label>
                  <input
                    {...editForm.register('author')}
                    className="input"
                    placeholder="Auteur"
                  />
                  {editForm.formState.errors.author && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.author.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exemplaires *
                  </label>
                  <input
                    type="number"
                    {...editForm.register('totalExamplaries', { valueAsNumber: true })}
                    className="input"
                    placeholder="Nombre"
                    min="1"
                  />
                  {editForm.formState.errors.totalExamplaries && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.totalExamplaries.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de sortie *
                  </label>
                  <input
                    type="date"
                    {...editForm.register('releaseDate')}
                    className="input"
                  />
                  {editForm.formState.errors.releaseDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.releaseDate.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie *
                  </label>
                  <input
                    {...editForm.register('category')}
                    className="input"
                    placeholder="Entrez la catégorie du livre"
                  />
                  {editForm.formState.errors.category && (
                    <p className="text-red-600 text-sm mt-1">
                      {editForm.formState.errors.category.message}
                    </p>
                  )}
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
                    setSelectedBook(null);
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

      {/* Modal Supprimer Livre */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedBook && (
          <Modal
            title="Supprimer le livre"
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedBook(null);
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer le livre{' '}
                <strong>{selectedBook.title}</strong> ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cette action est irréversible.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => deleteMutation.mutate(selectedBook.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedBook(null);
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