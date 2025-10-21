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
  Trash2 
} from 'lucide-react';
import { 
  getCategories
} from '../utils/api.js'; // Assume add/update/delete if backend supports

/**
 * Schema de validation pour les formulaires catégorie
 */
const categorySchema = yup.object({
  code: yup.string().required('Code requis').min(2, 'Minimum 2 caractères'),
  label: yup.string().required('Label requis').min(3, 'Minimum 3 caractères'),
});

/**
 * Categories - Page de gestion des catégories
 * 
 * Fonctionnalités :
 * - Liste des catégories avec useQuery
 * - Ajout/modification/suppression (assume endpoints backend)
 * - Modales pour toutes les actions
 * - Design responsive avec animations
 * - Pas de pagination (liste petite)
 */
export default function Categories() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // États pour les modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Query liste catégories
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = Array.isArray(data) 
    ? data 
    : (data && Array.isArray(data.categories) ? data.categories : []);

  // Mutations pour CRUD (assume endpoints /rest/category/api/addCategory etc.)
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/rest/category/api/addCategory', data), // Assume backend
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, data }) => api.put(`/rest/category/api/updateCategory/${code}`, data), // Assume
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      resetEditForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (code) => api.delete(`/rest/category/api/deleteCategory/${code}`), // Assume
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    },
  });

  // Formulaires
  const addForm = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      code: '',
      label: '',
    },
  });

  const editForm = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      code: '',
      label: '',
    },
  });

  // Reset forms
  const resetAddForm = () => addForm.reset();
  const resetEditForm = () => editForm.reset();

  // Handlers modales
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    editForm.reset({
      code: category.code,
      label: category.label,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Submit forms
  const onSubmitAdd = (data) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data) => {
    updateMutation.mutate({ code: selectedCategory.code, data });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Retour">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Gestion des catégories</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez les catégories de livres</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Ajouter Catégorie</span>
        </button>
      </motion.div>

      {/* Liste des catégories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Erreur de chargement des catégories</p>
            <button onClick={() => refetch()} className="btn-primary mt-4">Réessayer</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune catégorie trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez par ajouter votre première catégorie</p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
              <Plus size={18} /> <span>Ajouter une catégorie</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category, index) => (
                  <motion.tr
                    key={category.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.label}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Responsive mobile stack */}
        <div className="lg:hidden space-y-4 mt-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Code: {category.code}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditCategory(category)} className="p-2 text-blue-600 hover:text-blue-900">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteCategory(category)} className="p-2 text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal Ajouter Catégorie */}
      <AnimatePresence>
        {isAddModalOpen && (
          <Modal title="Ajouter une catégorie" onClose={() => { setIsAddModalOpen(false); resetAddForm(); }}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                <input {...addForm.register('code')} className="input" placeholder="Code (ex: ROMAN)" />
                {addForm.formState.errors.code && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label *</label>
                <input {...addForm.register('label')} className="input" placeholder="Label (ex: Roman)" />
                {addForm.formState.errors.label && <p className="text-red-600 text-sm mt-1">{addForm.formState.errors.label.message}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1">
                  {addMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="btn-accent">Annuler</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Modifier Catégorie */}
      <AnimatePresence>
        {isEditModalOpen && selectedCategory && (
          <Modal title="Modifier la catégorie" onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); resetEditForm(); }}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                <input {...editForm.register('code')} className="input" placeholder="Code" />
                {editForm.formState.errors.code && <p className="text-red-600 text-sm mt-1">{editForm.formState.errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label *</label>
                <input {...editForm.register('label')} className="input" placeholder="Label" />
                {editForm.formState.errors.label && <p className="text-red-600 text-sm mt-1">{editForm.formState.errors.label.message}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
                  {updateMutation.isPending ? 'Modification...' : 'Modifier'}
                </button>
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedCategory(null); resetEditForm(); }} className="btn-accent">Annuler</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Supprimer Catégorie */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedCategory && (
          <Modal title="Supprimer la catégorie" onClose={() => { setIsDeleteModalOpen(false); setSelectedCategory(null); }}>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer la catégorie{' '}
                <strong>{selectedCategory.label}</strong> (code: {selectedCategory.code}) ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">Cette action est irréversible et affectera les livres.</p>
              <div className="flex gap-3 pt-4">
                <button onClick={() => deleteMutation.mutate(selectedCategory.code)} disabled={deleteMutation.isPending} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">
                  {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
                <button onClick={() => { setIsDeleteModalOpen(false); setSelectedCategory(null); }} className="btn-accent">Annuler</button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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