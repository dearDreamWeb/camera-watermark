import { createLocal } from '@/utils';
import { memo, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

const visitCountLocal = createLocal<number>('visitCount');
const isStarLocal = createLocal<boolean>('isStar');

const EvaluateComponent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStarLocal.get()) {
      return;
    }
    const value = visitCountLocal.get() || 0;
    console.log('visitCountLocal', value);
    if (value > 0 && (value === 1 || value % 5 === 0)) {
      setVisible(true);
    }
    visitCountLocal.set(value + 1);
  }, []);

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
    <div>
      <Dialog open={visible} onOpenChange={(value) => setVisible(value)}>
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
    </div>
  );
};

export default memo(EvaluateComponent);
