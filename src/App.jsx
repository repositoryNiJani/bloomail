import React, { useEffect, useState } from 'react';
import DesignSidebar from './components/DesignSidebar.jsx';
import FlowerStage from './components/FlowerStage.jsx';
import WriteSidebar from './components/WriteSidebar.jsx';
import ShareDialog from './components/ShareDialog.jsx';
import Photobooth from './components/Photobooth.jsx';

export default function App() {
  const [engineError, setEngineError] = useState('');

  useEffect(() => {
    let active = true;

    import('../flower.js').catch(error => {
      console.error('Failed to initialize the flower app.', error);
      if (active) setEngineError('The flower app could not start. Refresh the page to try again.');
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="welcome" role="status" aria-label="Welcome to bloomail">
        <div className="welcome-card">
          <span className="welcome-flower" aria-hidden="true">✿</span>
          <strong>bloomail</strong>
          <small>Send a flower, say it softer.</small>
        </div>
      </div>

      <div className="app" id="app" data-tab="design">
        <DesignSidebar />
        <FlowerStage />
        <WriteSidebar />
      </div>

      <ShareDialog />
      <Photobooth />
      <div className="toast" id="toast" role="status"></div>
      <canvas id="fx"></canvas>
      {engineError && <p className="engine-error" role="alert">{engineError}</p>}
    </>
  );
}
