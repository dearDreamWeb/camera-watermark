/* eslint-disable @typescript-eslint/no-this-alias */
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import ReactDOM from 'react-dom/client';

// export const openModal = (
//   Modal: React.FC<DialogPrimitive.DialogProps>,
//   props: any
// ) => {
//   const [visible, setVisible] = useState(true);
//   const modalId = useRef<string>(Math.random().toString(36).slice(2));

//   const onOpenChange = (value: boolean) => {
//     setVisible(value);
//   };

//   useEffect(() => {
//     if (visible) {
//       ReactDOM.createPortal(
//         <div id={modalId.current}>
//           <Modal visible={visible} onOpenChange={onOpenChange} {...props} />
//         </div>,
//         document.body
//       );
//     } else {
//       const modalWrapDom = document.getElementById(modalId.current);
//       modalWrapDom?.remove();
//     }
//   }, [visible]);
// };

export interface BaseModal<T> {
  visible: boolean;
  hidden: (value: T) => void;
}

class OpenModal {
  list: {
    id: string;
    afterClose: () => Promise<any>;
    hidden: (value: any) => void;
  }[];
  constructor() {
    this.list = [];
  }

  create(Modal: React.FC<DialogPrimitive.DialogProps>, props: any = {}) {
    const modalId = Math.random().toString(36).slice(2);
    const that = this;
    let resolve: (value?: any) => void;
    let future: Promise<any>;
    const item = {
      id: modalId,
      afterClose() {
        if (!future) {
          future = new Promise<any>((_resolve) => {
            resolve = _resolve;
          });
        }
        return future;
      },
      hidden(value: any) {
        const dom = document.getElementById(modalId);
        const index = that.list.findIndex((item) => item.id === modalId);
        if (index > -1) {
          that.list.splice(index, 1);
        }
        dom?.remove();
        if (resolve) {
          resolve(value);
          future = null as any;
        }
      },
    };
    this.list.push(item);
    const el = document.createElement('div');
    el.setAttribute('id', modalId);
    const root = ReactDOM.createRoot(el);
    const modalItem = () => <Modal hidden={item.hidden} {...props} />;
    root.render(modalItem());
    return item;
  }

  open(Modal: React.FC<any>, props: any = {}) {
    const item = this.create(Modal, {
      ...props,
    });
    return item.afterClose();
  }
}

export const openModal = new OpenModal();
