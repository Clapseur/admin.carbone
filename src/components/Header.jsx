import React, { useRef } from 'react';
import { gsap } from 'gsap';

function Header({ activeTab, setActiveTab, onLogout }) {
  const headerRef = useRef(null);
  const logoRef = useRef(null);

  const menuItems = [
    { id: 'supervision', label: 'Supervision', icon: '📊' },
    { id: 'generation', label: 'Génération', icon: '⚡' },
    { id: 'gestion', label: 'Gérer', icon: '⚙️' }
  ];

  return (
    <>
      <div ref={headerRef} className="header fixed top-0 w-full z-50 backdrop-blur-md border-b glass-header">
        <header className="font-hk-grotesk flex items-center justify-between px-6 py-4">
          <div ref={logoRef} className="flex gap-3 items-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-wider">Carbone™</h1>
            <span className="text-sm sm:text-lg md:text-xl" style={{color: '#A3F7BF'}}>×</span>
            <span className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-wider">Admin</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xl font-semibold transition-colors ${
                  activeTab === item.id 
                    ? 'text-green-300' 
                    : 'text-white hover:text-green-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="text-xl font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Déconnexion
          </button>
        </header>
      </div>
    </>
  );
}

export default Header;