import React, { useState } from 'react';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {Object.keys(tabs).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
