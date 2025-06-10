import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRef } from 'react';
import qrBackground from '../assets/qr.png'; // Add this import

const Generation = () => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
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

      // Récupérer les codes existants
      const { data: existing } = await supabase
        .from('user_codes')
        .select('code');
      
      existing?.forEach(item => existingCodes.add(item.code));

      // Générer des codes uniques
      while (codes.length < num) {
        const newCode = generateCode();
        if (!existingCodes.has(newCode)) {
          codes.push({ code: newCode });
          existingCodes.add(newCode);
        }
      }

      // Insérer les codes en batch
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
        
        // Generate QR codes for each new code with proper centering
        setTimeout(() => {
          codes.forEach(({ code }) => {
            const qrContainer = document.createElement('div');
            qrContainer.className = 'relative inline-block m-2';
            qrContainer.style.width = '200px';
            qrContainer.style.height = '200px';
            
            // Background image
            const img = document.createElement('img');
            img.src = require('../assets/qr.png');
            img.className = 'w-full h-full object-cover';
            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.left = '0';
            
            // QR code container - centered
            const qrDiv = document.createElement('div');
            qrDiv.id = `qr-${code}`;
            qrDiv.style.position = 'absolute';
            qrDiv.style.top = '50%';
            qrDiv.style.left = '50%';
            qrDiv.style.transform = 'translate(-50%, -50%)';
            qrDiv.style.zIndex = '10';
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Télécharger';
            downloadBtn.className = 'absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700';
            downloadBtn.style.zIndex = '20';
            downloadBtn.onclick = () => downloadQRCode(code, qrContainer);
            
            qrContainerRef.current.appendChild(qrContainer);
            qrContainer.appendChild(img);
            qrContainer.appendChild(qrDiv);
            qrContainer.appendChild(downloadBtn);
            
            // Generate QR code
            new window.QRCode(qrDiv, {
              text: `https://bond.carbonedev.com/${code}`,
              width: 100,
              height: 100,
              colorDark: '#000000',
              colorLight: 'transparent',
              correctLevel: window.QRCode.CorrectLevel.H
            });
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

  const downloadQRCode = (code, container) => {
    // Create canvas to combine background and QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    const img = new Image();
    img.onload = () => {
      // Draw background
      ctx.drawImage(img, 0, 0, 200, 200);
      
      // Get QR code image
      const qrImg = container.querySelector('img:last-child');
      if (qrImg) {
        // Draw QR code centered
        ctx.drawImage(qrImg, 50, 50, 100, 100);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `qr-code-${code}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = qrBackground; // Use the imported image instead of require
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Génération de Codes</h1>
        <p className="text-gray-600">Créer de nouveaux codes d'accès pour les utilisateurs</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
        <div className="mb-6">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de codes à générer
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 50"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Maximum: 500 codes</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !quantity}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Génération en cours...' : 'Générer les codes'}
        </button>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les codes générés sont uniques et font 5 caractères</li>
          <li>• Format: lettres majuscules et chiffres (ex: A1B2C)</li>
          <li>• Les codes sont immédiatement disponibles pour utilisation</li>
          <li>• Chaque code peut être utilisé une seule fois</li>
        </ul>
      </div>
      <div ref={qrContainerRef} className="flex flex-wrap mt-8 gap-4"></div>
    </div>
  );
};

export default Generation;