import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Icon } from '@iconify-icon/react';

type RenderReturn = (
  content: string | React.ReactNode,
  duration?: number
) => Promise<unknown>;

interface MessageProps {
  info: RenderReturn;
  success: RenderReturn;
  warning: RenderReturn;
  error: RenderReturn;
}
interface MessageComponentProps {
  type: string;
  content: string | React.ReactNode;
}

function MessageComponent(props: MessageComponentProps) {
  const { type, content } = props;

  const typeIconClassName = useMemo(() => {
    switch (type) {
      case 'info':
        return 'bg-secondary text-black';
      case 'success':
        return 'bg-primary text-white';
      case 'error':
        return 'bg-destructive text-white';
      default:
        return 'bg-primary text-white';
    }
  }, [type]);

  return (
    <div className="mb-4 shadow-slate-300 shadow-lg inline-block">
      <section
        className={`inline-flex items-center py-2 px-4 rounded-sm ${typeIconClassName}`}
      >
        {type === 'info' ? (
          <Icon
            icon="mdi:information-slab-circle"
            className="text-xl"
            style={{ color: '#333' }}
          />
        ) : type === 'success' ? (
          <Icon
            icon="mdi:success-circle"
            className="text-xl"
            style={{ color: '#52c41a' }}
          />
        ) : type === 'error' ? (
          <Icon
            icon="mdi:error"
            className="text-xl"
            style={{ color: '#fff' }}
          />
        ) : (
          <Icon
            icon="mdi:information-slab-circle"
            className="text-xl"
            style={{ color: '#333' }}
          />
        )}

        <span className="ml-2">{content}</span>
      </section>
    </div>
  );
}

const render = (type: string) => {
  function messageRender(
    content: string | React.ReactNode,
    duration = 3000,
    onClose?: () => void
  ) {
    return new Promise((resolve) => {
      const messageWrapperDom = document.getElementById('message-wrapper')!;
      if (!messageWrapperDom) {
        return;
      }

      const el = document.createElement('div');
      messageWrapperDom.append(el);
      el.setAttribute('class', 'messageBox');
      el.style.animationDuration = `${duration}ms`;
      const root = ReactDOM.createRoot(el);
      root.render(<MessageComponent type={type} content={content} />);
      setTimeout(() => {
        el.remove();
        resolve(null);
        onClose && onClose();
      }, duration);
    });
  }
  return messageRender;
};

const message: MessageProps = {
  success: render('success'),
  info: render('info'),
  warning: render('warning'),
  error: render('error'),
};

export default message;
