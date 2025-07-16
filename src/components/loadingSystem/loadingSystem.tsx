import React from 'react';
import ReactDOM from 'react-dom/client';
import { Icon } from '@iconify-icon/react';

const loadingSystem = (visible = false, text?: React.ReactNode) => {
  const loadingFatherDom = document.querySelector('#loadingWrap');
  if (visible) {
    if (loadingFatherDom) {
      return;
    }
    const dom = document.createElement('div');
    dom.setAttribute('id', 'loadingWrap');
    document.body.appendChild(dom);
    const root = ReactDOM.createRoot(dom);
    root.render(
      <div className="fixed left-0 top-0 w-screen h-screen bg-opacity-50 bg-black z-50 flex flex-col justify-center items-center">
        <Icon
          icon="line-md:loading-twotone-loop"
          className=" text-3xl text-white"
        ></Icon>
        <div className="text-white mt-4">{text || '加载中'}</div>
      </div>
    );
  } else {
    if (!loadingFatherDom) {
      return;
    }
    loadingFatherDom.remove();
  }
};

export default loadingSystem;
