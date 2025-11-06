import axios from 'axios';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

/**
 * Configuration de l'instance Axios pour Library-ui
 * Base URL : Backend Spring Boot sur localhost:8080
 * Headers : Content-Type JSON pour toutes les requêtes
 */
const api = axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL|| 'http://localhost:8080/rest/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes timeout
});

/**
 * Intercepteurs Axios pour gestion globale des erreurs
 * - 4xx : Erreurs client (400, 401, 403, 404, 409)
 * - 5xx : Erreurs serveur (500, 502, 503)
 * - 200/201 : Succès avec toast si applicable
 */
api.interceptors.response.use(
  (response) => {
    // Succès 200/201 avec toast de confirmation si nécessaire
    if (response.status === 201) {
      // Toast de succès pour création (POST)
      if (response.config.method === 'post') {
        toast.success('Opération réussie');
      }
    }
    return response;
  },
  (error) => {
    // Gestion des erreurs HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error('Données invalides');
          break;
        case 401:
          toast.error('Non autorisé');
          break;
        case 403:
          toast.error('Accès refusé');
          break;
        case 404:
          toast.error('Ressource non trouvée');
          break;
        case 409:
          toast.error('Conflit : Ressource déjà existante');
          break;
        case 304:
          toast.error('Aucune modification');
          break;
        case 500:
        case 502:
        case 503:
          toast.error('Serveur indisponible');
          break;
        default:
          toast.error(`Erreur ${status}`);
      }
    } else if (error.request) {
      // Erreur réseau
      toast.error('Erreur de connexion au serveur');
    } else {
      // Autre erreur
      toast.error('Erreur inattendue');
    }
    
    return Promise.reject(error);
  }
);

/**
 * ========================================
 * API CATEGORIES
 * ========================================
 */

/**
 * Récupère toutes les catégories de livres
 * @returns {Promise<Array<CategoryDTO>>} Liste des catégories
 */
export const getCategories = async () => {
  const response = await api.get('/category/api/allCategories');
  return response.data;
};

/**
 * ========================================
 * API CUSTOMERS
 * ========================================
 */

/**
 * Récupère la liste paginée des clients.
 * Si le backend retourne un tableau (List<CustomerDTO>), on l'adapte au format Page.
 * Si le backend retourne déjà un objet Page, on le retourne tel quel.
 */

/**
 * Récupère la liste paginée des clients.
 * Correction : Utilise le bon endpoint et params backend (paginatedSearch, beginPage/endPage).
 */
export const getCustomers = async (page = 0, size = 10) => {
  try {
    const { data } = await api.get('customer/api/paginatedSearch', { params: { beginPage: page, endPage: page + size } });
    console.log('getCustomers data:', data); // Debug
    return data || { content: [], totalElements: 0 }; // Handle 204/null
  } catch (error) {
    console.error('Error fetching customers:', error);
    if (error.response?.status === 204) return { content: [], totalElements: 0 };
    throw error;
  }
};

/**
 * Recherche un client par email
 * @param {string} email - Email du client
 * @returns {Promise<CustomerDTO|null>} Client trouvé ou null
 */
export const searchCustomersByEmail = async (email) => {
  try {
    const { data } = await api.get('/customer/api/searchByEmail', {
      params: { email },
    });
    return data;
  } catch (error) {
    if (error.response?.status === 204) return null;
    throw error;
  }
};

/**
 * Recherche des clients par nom de famille
 * @param {string} lastName - Nom de famille
 * @returns {Promise<Array<CustomerDTO>>} Liste des clients trouvés
 */
export const searchCustomersByLastName = async (lastName) => {
  const response = await api.get('/customer/api/searchByLastName', {
    params: { lastName },
  });
  return response.data;
};

/**
 * Ajoute un nouveau client
 * @param {Object} data - Données du client
 * @param {string} data.firstName - Prénom
 * @param {string} data.lastName - Nom
 * @param {string} data.job - Profession
 * @param {string} data.address - Adresse
 * @param {string} data.email - Email
 * @returns {Promise<CustomerDTO>} Client créé
 */
export const addCustomer = async (data) => {
  const response = await api.post('/customer/api/addCustomer', data);
  return response.data;
};

/**
 * Met à jour un client existant
 * @param {number} id - ID du client
 * @param {Object} data - Données du client (sans creationDate)
 * @returns {Promise<CustomerDTO>} Client mis à jour
 */
export const updateCustomer = async (id, data) => {
  const response = await api.put('/customer/api/updateCustomer', {
    id,
    ...data,
  });
  return response.data;
};

/**
 * Supprime un client
 * @param {number} id - ID du client
 * @returns {Promise<void>} Succès
 */
export const deleteCustomer = async (id) => {
  await api.delete(`/customer/api/deleteCustomer/${id}`);
};

/**
 * Envoie un email à un client
 * @param {number} customerId - ID du client
 * @param {string} subject - Sujet de l'email
 * @param {string} content - Contenu de l'email
 * @returns {Promise<boolean>} Succès de l'envoi
 */
export const sendEmailToCustomer = async (customerId, subject, content) => {
  const response = await api.put('/customer/api/sendEmailToCustomer', {
    customerId,
    emailSubject: subject,
    emailContent: content,
  });
  return response.data;
};

/**
 * ========================================
 * API BOOKS
 * ========================================
 */

/**
 * Récupère les livres par titre (tous si titre vide)
 * @param {string} title - Titre à rechercher (optionnel)
 * @returns {Promise<Array<BookDTO>>} Liste des livres

/**
 * Récupère les livres par titre (tous si titre vide).
 * Correction : Gère List ou Page, params backend (title pour searchByTitle).
 */
export const getBooks = async (title = '') => {
  try {
    const { data } = await api.get('book/api/searchByTitle', { params: { title } });
    console.log('getBooks raw data:', data); // Debug
    if (data === null) return { content: [], totalElements: 0 };
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    if (error.response?.status === 204) return { content: [], totalElements: 0 };
    throw error;
  }
};
/**
 * Recherche des livres par titre
 * @param {string} title - Titre à rechercher
 * @returns {Promise<Array<BookDTO>>} Liste des livres trouvés
 */
export const searchBooksByTitle = async (title) => {
  const response = await api.get('/rest/book/api/searchByTitle', {
    params: { title },
  });
  return response.data;
};

/**
 * Recherche un livre par ISBN
 * @param {string} isbn - ISBN du livre
 * @returns {Promise<BookDTO>} Livre trouvé
 */
export const searchBooksByIsbn = async (isbn) => {
  const response = await api.get('/book/api/searchByIsbn', {
    params: { isbn },
  });
  return response.data;
};

/**
 * Ajoute un nouveau livre
 * @param {Object} data - Données du livre
 * @param {string} data.title - Titre
 * @param {string} data.isbn - ISBN
 * @param {string} data.releaseDate - Date de sortie (YYYY-MM-DD)
 * @param {number} data.totalExamplaries - Nombre d'exemplaires
 * @param {string} data.author - Auteur
 * @param {Object} data.category - Catégorie {code}
 * @returns {Promise<BookDTO>} Livre créé
 */
export const addBook = async (data) => {
  const response = await api.post('/book/api/addBook', data);
  return response.data;
};

/**
 * Met à jour un livre existant
 * @param {number} id - ID du livre
 * @param {Object} data - Données du livre
 * @returns {Promise<BookDTO>} Livre mis à jour
 */
export const updateBook = async (id, data) => {
  const response = await api.put('/book/api/updateBook', {
    id,
    ...data,
  });
  return response.data;
};

/**
 * Supprime un livre
 * @param {number} id - ID du livre
 * @returns {Promise<void>} Succès
 */
export const deleteBook = async (id) => {
  await api.delete(`/book/api/deleteBook/${id}`);
};

/**
 * ========================================
 * API LOANS
 * ========================================
 */

/**
 * Récupère les prêts d'un client par email
 * @param {string} email - Email du client
 * @returns {Promise<Array<LoanDTO>>} Liste des prêts
 */
export const getLoansByCustomer = async (email) => {
  const response = await api.get('/loan/api/customerLoans', {
    params: { email },
  });
  return response.data;
};

/**
 * Récupère les prêts par date maximale
 * @param {string} maxDate - Date maximale (YYYY-MM-DD)
 * @returns {Promise<Array<LoanDTO>>} Liste des prêts
 */
export const getLoansByDate = async (maxDate) => {
  const response = await api.get('/loan/api/maxEndDate', {
    params: { date: maxDate },
  });
  return response.data;
};

/**
 * Crée un nouveau prêt
 * @param {Object} data - Données du prêt
 * @param {number} data.bookId - ID du livre
 * @param {number} data.customerId - ID du client
 * @param {string} data.beginDate - Date de début (YYYY-MM-DD)
 * @param {string} data.endDate - Date de fin (YYYY-MM-DD)
 * @returns {Promise<boolean>} Succès de la création
 */
export const addLoan = async (data) => {
  const response = await api.post('/loan/api/addLoan', data);
  return response.data;
};

/**
 * Clôture un prêt
 * @param {Object} data - Données du prêt
 * @param {number} data.bookId - ID du livre
 * @param {number} data.customerId - ID du client
 * @returns {Promise<boolean>} Succès de la clôture
 */
export const closeLoan = async (data) => {
  const response = await api.post('/loan/api/closeLoan', data);
  return response.data;
};

/**
 * ========================================
 * UTILITAIRES
 * ========================================
 */

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 * @param {Date|string|dayjs.Dayjs} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDateForAPI = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Formate une date pour l'affichage (DD/MM/YYYY)
 * @param {Date|string|dayjs.Dayjs} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDateForDisplay = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Formate une date et heure pour l'affichage (DD/MM/YYYY HH:mm)
 * @param {Date|string|dayjs.Dayjs} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTimeForDisplay = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

/**
 * ========================================
 * EXPORT DE L'INSTANCE API
 * ========================================
 */
export default api;