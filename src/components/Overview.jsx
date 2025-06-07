import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Overview = () => {
  const [stats, setStats] = useState({
    totalCodes: 0,
    usedCodes: 0,
    availableCodes: 0,
    profilesCreated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Récupérer le nombre total de codes
      const { count: totalCodes } = await supabase
        .from('user_codes')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre de codes utilisés
      const { count: usedCodes } = await supabase
        .from('user_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_used', true);

      // Récupérer le nombre de profils créés (avec prénom)
      const { count: profilesCreated } = await supabase
        .from('user_codes')
        .select('*', { count: 'exact', head: true })
        .not('prenom', 'is', null);

      setStats({
        totalCodes: totalCodes || 0,
        usedCodes: usedCodes || 0,
        availableCodes: (totalCodes || 0) - (usedCodes || 0),
        profilesCreated: profilesCreated || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Codes Générés',
      value: stats.totalCodes,
      icon: '📝',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Codes Utilisés',
      value: stats.usedCodes,
      icon: '✅',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Codes Disponibles',
      value: stats.availableCodes,
      icon: '🔓',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Profils Créés',
      value: stats.profilesCreated,
      icon: '👤',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Taux d\'Utilisation',
      value: `${stats.totalCodes > 0 ? Math.round((stats.usedCodes / stats.totalCodes) * 100) : 0}%`,
      icon: '📈',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Système',
      value: 'Actif',
      icon: '🟢',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Supervision</h1>
        <p className="text-gray-300">Vue d'ensemble du système Carbone</p>
      </div>

      {/* 6 Cards in 2 rows of 3 columns - No scrolling */}
      <div className="flex grid grid-rows-2 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-r ${card.color} rounded-full p-3 text-white text-2xl shadow-lg`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-300 mb-2 uppercase tracking-wide">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;