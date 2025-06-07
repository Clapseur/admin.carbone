import React, { useState } from 'react';
import Header from './Header';
import Overview from './Overview';
import Generation from './Generation';
import Management from './Management';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('supervision');

  const renderContent = () => {
    switch (activeTab) {
      case 'supervision':
        return <Overview />;
      case 'generation':
        return <Generation />;
      case 'gestion':
        return <Management />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />
      <main className="pt-20 px-8 h-screen overflow-hidden">
        <div className="h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;