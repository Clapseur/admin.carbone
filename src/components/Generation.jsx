import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Generation = () => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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
      }
    } catch (error) {
      setMessage('Erreur de connexion');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

export default Generation;