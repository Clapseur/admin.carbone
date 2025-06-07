import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Management = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'used', 'unused'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCodes();
  }, [filter]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      let query = supabase.from('user_codes').select('*').order('created_at', { ascending: false });
      
      if (filter === 'used') {
        query = query.eq('is_used', true);
      } else if (filter === 'unused') {
        query = query.eq('is_used', false);
      }

      const { data, error } = await query;
      
      if (!error) {
        setCodes(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (code.prenom && code.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (code.nom && code.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (code.email && code.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteCode = async (codeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) return;
    
    try {
      const { error } = await supabase
        .from('user_codes')
        .delete()
        .eq('id', codeId);
      
      if (!error) {
        setCodes(codes.filter(code => code.id !== codeId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Codes</h1>
        <p className="text-gray-600">Visualiser et gérer tous les codes d'accès</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par code, nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les codes</option>
            <option value="used">Codes utilisés</option>
            <option value="unused">Codes non utilisés</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.is_used 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {code.is_used ? 'Utilisé' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {code.prenom && code.nom ? `${code.prenom} ${code.nom}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {code.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(code.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun code trouvé
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;