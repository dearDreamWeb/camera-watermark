import { createLocal } from '@/utils';
import { memo, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { BaseModal, openModal } from '@/utils/functionModal';

const visitCountLocal = createLocal<number>('visitCount');
const isStarLocal = createLocal<boolean>('isStar');

const EvaluateComponent = (props: BaseModal<null>) => {
  const { hidden } = props;
  const [visible, setVisible] = useState(true);

  const alreadyStar = () => {
    isStarLocal.set(true);
    setVisible(false);
  };

  const goToStar = () => {
    window.open('https://github.com/dearDreamWeb/camera-watermark');
    isStarLocal.set(true);
    setVisible(false);
  };

  const goToIdea = () => {
    window.open('https://github.com/dearDreamWeb/camera-watermark/issues');
    setVisible(false);
  };

  return (
    <Dialog
      open={visible}
      hidden={hidden}
      onOpenChange={(value) => !value && setVisible(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>提示</DialogTitle>
        </DialogHeader>
        <div>如果对该产品还满意的话，项目求个⭐</div>
        <div className="flex justify-end">
          <Button onClick={goToIdea} variant="link">
            给个建议
          </Button>
          <Button onClick={alreadyStar} variant="outline" className="mx-4">
            我已⭐
          </Button>
          <Button onClick={goToStar}>给个⭐</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const openEvaluateComponent = async () => {
  if (isStarLocal.get()) {
    return;
  }
  const value = visitCountLocal.get() || 0;
  visitCountLocal.set(value + 1);
  if (value > 0 && (value === 1 || value % 5 === 0)) {
    const res = await openModal.open(EvaluateComponent);
    console.log('closeModal', res);
  }
};

export default memo(EvaluateComponent);
