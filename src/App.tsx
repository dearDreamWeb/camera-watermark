import { useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {renderRoutes(routes)}
      <div
        id="message-wrapper"
        className="fixed flex flex-col h-screen w-screen items-center left-0 top-8 pointer-events-none"
      ></div>
    </div>
  );
}

export default App;
