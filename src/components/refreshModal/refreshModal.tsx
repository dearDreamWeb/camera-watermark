import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { useState } from 'react';
import { DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { db } from '@/db/db';
import { BaseModal, openModal } from '@/utils/functionModal';

const RefreshModal = (props: BaseModal<null>) => {
  const { hidden } = props;
  const [openRefresh, setOpenRefresh] = useState(true);

  const deleteDb = async () => {
    setOpenRefresh(false);
    await db.delete();
    location.reload();
  };

  const onOpenChange = async (value: boolean) => {
    if (!value) {
      await deleteDb();
      return;
    }
    setOpenRefresh(value);
  };

  return (
    <Dialog open={openRefresh} hidden={hidden} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>刷新页面</DialogTitle>
        </DialogHeader>
        <div>本地缓存启动失败，需要刷新页面自动清除缓存</div>
        <div className="flex justify-end">
          <Button onClick={deleteDb}>确定</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const openRefreshModal = async () => {
  try {
    await db.open();
    if (!db.isOpen()) {
      return openModal.open(RefreshModal);
    }
    return true;
  } catch (e) {
    console.error(e);
    return openModal.open(RefreshModal);
  }
};
