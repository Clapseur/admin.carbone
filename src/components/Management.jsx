import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import qrBackground from '../assets/qr.png';
import html2canvas from 'html2canvas';

const Management = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // 5x5 grid

  useEffect(() => {
    fetchCodes();
  }, [filter]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCodes = filteredCodes.slice(startIndex, startIndex + itemsPerPage);

  const deleteCode = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_codes')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
      
      // Update local state
      setCodes(codes.filter(code => code.id !== id));
      
      // Show success message
      alert('Code supprimé avec succès');
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Erreur lors de la suppression du code');
    }
  };

  const downloadQRCode = async (code) => {
    // Create a temporary container for the QR code with full background
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';  // Increased from 400px
    tempContainer.style.height = '800px'; // Increased from 400px
    tempContainer.style.backgroundImage = `url(${qrBackground})`;
    tempContainer.style.backgroundSize = 'cover';
    tempContainer.style.backgroundPosition = 'center';
    tempContainer.style.display = 'flex';
    tempContainer.style.alignItems = 'center';
    tempContainer.style.justifyContent = 'center';
    document.body.appendChild(tempContainer);
    
    try {
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      
      await new Promise((resolve) => {
        root.render(
          React.createElement('div', {
            style: {
              background: 'white',
              padding: '40px',        // Increased padding
              borderRadius: '24px',   // Increased border radius
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
            }
          }, [
            React.createElement(QRCode, {
              key: 'qrcode',
              value: `https://bond.carbonedev.com/${code.code}`,
              size: 600,              // Increased from 280 to 600
              bgColor: '#FFFFFF',
              fgColor: '#000000',
              level: 'H'
            })
          ])
        );
        
        // Wait for render to complete
        setTimeout(resolve, 1500);    // Increased timeout for larger render
      });
      
      // Convert to canvas and download with full quality
      const canvas = await html2canvas(tempContainer, {
        width: 800,               // Increased from 400
        height: 800,              // Increased from 400
        scale: 3,                 // Increased from 2 to 3 for even higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,           // Disable logging for cleaner output
        imageTimeout: 15000       // Increased timeout for large images
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `qr-code-${code.code}-full-size.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Full quality
      link.click();
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Erreur lors du téléchargement du QR code');
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white-900">Gérer les Codes</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="used">Utilisé</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      {/* Grid Layout for 5 columns on 1920x1080 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
        {currentCodes.map((code) => (
          <div key={code.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
              <img
                src={qrBackground}
                alt="QR Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ background: 'white', padding: '4px', borderRadius: '4px' }}>
                  <QRCode
                    value={`https://bond.carbonedev.com/${code.code}`}
                    size={80}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>
            </div>
            
            {/* Card Content - Compact for small cards */}
            <div className="p-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {code.code}
                </div>
                <div className="text-xs text-gray-600">
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    code.status === 'active' ? 'bg-green-100 text-green-800' :
                    code.status === 'used' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {code.status || (code.is_used ? 'Utilisé' : 'Actif')}
                  </span>
                </div>
                {code.prenom && (
                  <div className="text-xs text-gray-600 truncate">
                    {code.prenom} {code.nom}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(code.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              {/* Action Buttons - Compact */}
              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => downloadQRCode(code)}
                  className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  DL
                </button>
                <button
                  onClick={() => deleteCode(code.id)}
                  className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Aucun code trouvé</div>
        </div>
      )}
    </div>
  );
};

export default Management;