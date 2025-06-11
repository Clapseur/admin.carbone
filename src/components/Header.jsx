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
        <header className=" border-b border-teal-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-teal-700 tracking-wider">Admin</span>
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
                        : 'text-teal hover:text-green-300'
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
            </div>
          </div>
        </header>
      </div>
    </>
  );
}

export default Header;