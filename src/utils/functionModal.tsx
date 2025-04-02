/* eslint-disable @typescript-eslint/no-this-alias */
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import ReactDOM from 'react-dom/client';

export interface BaseModal<T> {
  visible: boolean;
  hidden: (value?: T) => void;
}

class OpenModal {
  list: {
    id: string;
    afterClose: () => Promise<any>;
    hidden: (value: any) => void;
    Modal: React.FC<DialogPrimitive.DialogProps>;
    props: any;
  }[];
  openResolve: ((value?: any) => void) | null;
  openFuture: Promise<any> | null;
  running: boolean;
  constructor() {
    this.list = [];
    this.openFuture = null;
    this.openResolve = null;
    this.running = false;
  }

  _open() {
    console.debug(
      '[modal list open]',
      this.running,
      this.list,
      this.running || !this.list.length
    );
    if (this.running || !this.list.length) {
      return;
    }
    this.running = true;
    const item = this.list[0];
    const el = document.createElement('div');
    el.setAttribute('id', item.id);
    const modalItem = () => (
      <item.Modal hidden={item.hidden} {...(item.props || {})} />
    );
    const root = ReactDOM.createRoot(el);
    root.render(modalItem());
  }

  create(Modal: React.FC<DialogPrimitive.DialogProps>, props: any = {}) {
    const modalId = Math.random().toString(36).slice(2);
    const that = this;
    let resolve: (value?: any) => void;
    let future: Promise<any>;
    const item = {
      id: modalId,
      Modal,
      props,
      afterClose() {
        if (!future) {
          future = new Promise<any>((_resolve) => {
            resolve = _resolve;
          });
        }
        return future;
      },
      hidden(value?: any) {
        const index = that.list.findIndex((item) => item.id === modalId);
        if (index > -1) {
          that.list.splice(index, 1);
        }
        if (resolve) {
          resolve(value);
          future = null as any;
        }
        console.debug('[modal list close]', that.list);
        that.running = false;
        that._open();
      },
    };
    this.list.push(item);
    console.debug('[modal list push]', this.list);
    this._open();
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
