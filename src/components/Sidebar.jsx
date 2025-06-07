import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'supervision', label: 'Supervision', icon: '📊' },
    { id: 'generation', label: 'Génération', icon: '⚡' },
    { id: 'gestion', label: 'Gérer', icon: '⚙️' }
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-80 backdrop-blur-md border-r border-white/10 z-40" style={{background: 'rgba(0, 0, 0, 0.3)'}}>
      <div className="pt-8 px-6 h-full flex flex-col">
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-white/20">
          <h1 className="text-2xl font-black text-white tracking-wider mb-2">Carbone™</h1>
          <p className="text-sm text-gray-300 font-thunder">
            Panneau d'administration
          </p>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-6 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`block w-full text-left text-xl font-semibold transition-colors duration-300 ${
                activeTab === item.id 
                  ? 'text-green-300' 
                  : 'text-white hover:text-green-300'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Logout Button at Bottom */}
        <div className="mt-auto pt-6 border-t border-white/20">
          <button
            onClick={onLogout}
            className="block w-full text-left text-xl font-semibold text-red-400 hover:text-red-300 transition-colors duration-300"
          >
            <span className="mr-3 text-lg">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;