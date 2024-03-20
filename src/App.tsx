import { useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import logoSvg from '/vite.svg';
import { useHistory } from 'react-router-dom';

function App() {
  const history = useHistory();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      <div className="w-full h-16 bg-white px-4 flex items-center justify-between fixed left-0 top-0 z-50">
        <div
          className="flex items-center font-bold cursor-pointer"
          onClick={() => {
            history.push('/');
          }}
        >
          <img src={logoSvg} className="w-8 mr-4" />
          无忧相机水印
        </div>
      </div>
      {renderRoutes(routes)}
      <div
        id="message-wrapper"
        className="fixed flex flex-col h-screen w-screen items-center left-0 top-8 pointer-events-none"
      ></div>
    </div>
  );
}

export default App;
