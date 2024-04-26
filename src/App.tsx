import { useEffect, useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import logoSvg from '/vite.svg';
import { useHistory } from 'react-router-dom';
import { clearDbEditInfo } from './db/utils';
import { Icon } from '@iconify-icon/react';
import DefaultValue from './components/defaultValue/defaultValue';
import message from './components/message/message';

const VERSION = 1;

function App() {
  const history = useHistory();
  useEffect(() => {
    window.addEventListener('beforeunload', (event) => {
      event.returnValue = `由于照片存储占用磁盘内存较大，刷新或者关闭将清除照片在本网站的缓存。确定吗?`;
      history.push('/');
      clearDbEditInfo();
    });
    const versionStorage = localStorage.getItem('version');
    if (Number(versionStorage) !== VERSION) {
      message.info('系統更新，需要刷新一下').then(() => {
        localStorage.clear();
        location.reload();
      });
      return;
    }
  }, []);

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
        <Icon
          icon="mdi:github"
          className="text-4xl cursor-pointer text-gray-800 hover:!text-gray-500"
          onClick={() => {
            window.open('https://github.com/dearDreamWeb/camera-watermark');
          }}
        ></Icon>
      </div>
      {renderRoutes(routes)}
      <DefaultValue />
      <div
        id="message-wrapper"
        style={{ zIndex: 51 }}
        className="fixed flex flex-col h-screen w-screen items-center left-0 top-4 pointer-events-none"
      ></div>
    </div>
  );
}

export default App;
