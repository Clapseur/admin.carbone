import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import qrBackground from '../assets/qr.png';
import html2canvas from 'html2canvas';

const Generation = () => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const qrContainerRef = useRef(null);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerate = async () => {
    const num = parseInt(quantity);
    if (!num || num < 1 || num > 500) {
      setMessage('Veuillez entrer un nombre entre 1 et 500');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const codes = [];
      const existingCodes = new Set();

      const { data: existing } = await supabase
        .from('user_codes')
        .select('code');
      
      existing?.forEach(item => existingCodes.add(item.code));

      while (codes.length < num) {
        const newCode = generateCode();
        if (!existingCodes.has(newCode)) {
          codes.push({ code: newCode });
          existingCodes.add(newCode);
        }
      }

      const { error } = await supabase
        .from('user_codes')
        .insert(codes);

      if (error) {
        setMessage('Erreur lors de la génération des codes');
        setMessageType('error');
      } else {
        setMessage(`${num} codes générés avec succès !`);
        setMessageType('success');
        setQuantity('');
        
        // Clear previous QR codes
        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = '';
        }
        
        // Generate QR codes display
        setTimeout(() => {
          codes.forEach(({ code }) => {
            const qrContainer = document.createElement('div');
            qrContainer.className = 'relative inline-block m-2';
            qrContainer.style.width = '200px';
            qrContainer.style.height = '200px';
            
            // Create React QR Code component container
            const qrWrapper = document.createElement('div');
            qrWrapper.className = 'absolute inset-0 flex items-center justify-center';
            qrWrapper.style.background = `url(${qrBackground}) center/cover`;
            
            // Create QR code container
            const qrCodeContainer = document.createElement('div');
            qrCodeContainer.style.background = '';
            qrCodeContainer.style.padding = '8px';
            qrCodeContainer.style.borderRadius = '4px';
            
            // Render React QR Code (we'll need to use ReactDOM.render for this)
            import('react-dom').then(({ createRoot }) => {
              const root = createRoot(qrCodeContainer);
              root.render(
                React.createElement(QRCode, {
                  value: `https://bond.carbonedev.com/${code}`,
                  size: 100,
                  bgColor: '#FFFFFF',
                  fgColor: '#000000',
                  level: 'H'
                })
              );
            });
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Télécharger';
            downloadBtn.className = 'absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700';
            downloadBtn.style.zIndex = '20';
            downloadBtn.onclick = () => downloadQRCode(code);
            
            qrWrapper.appendChild(qrCodeContainer);
            qrContainer.appendChild(qrWrapper);
            qrContainer.appendChild(downloadBtn);
            qrContainerRef.current.appendChild(qrContainer);
          });
        }, 100);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (code) => {
    // Create a temporary container for the QR code
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';  // Increased size
    tempContainer.style.height = '800px';
    document.body.appendChild(tempContainer);
    
    try {
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      
      await new Promise((resolve) => {
        root.render(
          React.createElement('div', {
            style: {
              width: '800px',
              height: '800px',
              backgroundImage: `url(${qrBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, [
            React.createElement('div', {
              key: 'qr-wrapper',
              style: {
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
              }
            }, [
              React.createElement(QRCode, {
                key: 'qrcode',
                value: `https://bond.carbonedev.com/${code}`,
                size: 600,              // Increased size
                bgColor: '#FFFFFF',
                fgColor: '#000000',
                level: 'H'
              })
            ])
          ])
        );
        
        setTimeout(resolve, 1500);
      });
      
      // Convert to canvas and download
      const canvas = await html2canvas(tempContainer, {
        width: 800,
        height: 800,
        scale: 3,                 // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000
      });
      
      const link = document.createElement('a');
      link.download = `qr-code-${code}-full-size.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Erreur lors du téléchargement du QR code');
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Générer des Codes</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de codes à générer (max 500)
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max="500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le nombre de codes"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Génération en cours...' : 'Générer les codes'}
          </button>
          
          {message && (
            <div className={`p-3 rounded-md ${
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
      
      <div ref={qrContainerRef} className="flex flex-wrap mt-8 gap-4"></div>
    </div>
  );
};

export default Generation;