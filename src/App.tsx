import { useEffect, useMemo, useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import logoSvg from '/vite.svg';
import { useHistory } from 'react-router-dom';
import { clearDbEditInfo } from './db/utils';
import { Icon } from '@iconify-icon/react';
import DefaultValue from './components/defaultValue/defaultValue';
import message from './components/message/message';
import { Skeleton } from './components/ui/skeleton';
import { Progress } from './components/ui/progress';
import { calcSizeHandler } from './utils';
import { openEvaluateComponent } from './components/evaluateComponent/evaluateComponent';
import { openRefreshModal } from './components/refreshModal/refreshModal';

const VERSION = 2;

function App() {
  const history = useHistory();
  const [sizeInfo, setSizeInfo] = useState({
    quota: 0,
    used: 0,
    isSupport: true,
    loading: false,
  });

  const calcIndexDbSize = async () => {
    setSizeInfo({ ...sizeInfo, loading: true });
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const {
          usage = 0,
          quota = 0,
          usageDetails,
        } = (await navigator.storage.estimate()) as StorageEstimate & {
          usageDetails: any;
        };
        setSizeInfo({
          ...sizeInfo,
          quota: Number(quota),
          used: Number(usageDetails?.indexedDB || usage || 0),
          loading: false,
          isSupport: true,
        });
      } else {
        setSizeInfo({ ...sizeInfo, loading: false, isSupport: false });
      }
    } catch (e) {
      setSizeInfo({ ...sizeInfo, loading: false, isSupport: false });
    }
  };

  const calcSize = useMemo(() => {
    if (!sizeInfo.isSupport) {
      return { used: 0, quota: 0, process: 0 };
    }

    return {
      used: calcSizeHandler(sizeInfo.used / Math.pow(1024, 2)),
      quota: calcSizeHandler(sizeInfo.quota / Math.pow(1024, 2)),
      process: calcSizeHandler((sizeInfo.used / sizeInfo.quota) * 100),
    };
  }, [sizeInfo]);

  useEffect(() => {
    (async () => {
      if (!(await openRefreshModal())) {
        return;
      }
      window.addEventListener('beforeunload', (event) => {
        event.returnValue = `由于照片存储占用磁盘内存较大，刷新或者关闭将清除照片在本网站的缓存。确定吗?`;
        history.push('/');
        clearDbEditInfo();
      });
      const versionStorage = localStorage.getItem('version');
      if (Number(versionStorage) !== VERSION) {
        if (versionStorage === null) {
          localStorage.setItem('version', VERSION.toString());
        } else {
          message.info('系統更新，需要刷新一下').then(async () => {
            localStorage.removeItem('defaultParams');
            localStorage.setItem('version', VERSION.toString());
            location.reload();
          });
        }
        return;
      }
      openEvaluateComponent();
      calcIndexDbSize();
      window.addEventListener('changeIndexDb', calcIndexDbSize);
    })();
    return () => {
      window.removeEventListener('changeIndexDb', calcIndexDbSize);
    };
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

        <div className="my-0 mx-auto">
          {!sizeInfo.isSupport ? null : sizeInfo.loading ? (
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          ) : (
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span>网站缓存占用：{calcSize.used}MB</span>
                <span className="inline-block ml-4">
                  占用率：{calcSize.process}%
                </span>
              </div>
              <Progress value={(sizeInfo.used / sizeInfo.quota) * 100} />
            </div>
          )}
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
