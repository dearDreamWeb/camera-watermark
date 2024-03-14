import { useEffect, useRef, useState, useMemo } from 'react';
import { fabric } from 'fabric';
import { downloadFile, loadImage, saveFile } from '@/utils';
import exifr from 'exifr';
import EditComponent, {
  ForWardRefHandler,
} from '@/components/editComponent/editComponent';
import { logoMap } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input, InputNumber } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Worker from '../../workers/index?worker';
import message from '@/components/message/message';
import { useHistory } from 'react-router-dom';

type ExifBaseType =
  | 'FocalLength'
  | 'FNumber'
  | 'ExposureTime'
  | 'ISO'
  | 'spaceX'
  | 'spaceY'
  | 'Model'
  | 'LensModel';

interface ExifBaseInfoListChildrenItem {
  name: ExifBaseType;
  label: string;
}

interface ExifBaseInfoListItem {
  name: string;
  children: ExifBaseInfoListChildrenItem[];
}

const Index = () => {
  const history = useHistory();
  const fileRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<ForWardRefHandler>(null);
  const [imgInfo, setImgInfo] = useState<{
    file: File | null;
    exifInfo: any;
    imgUrl: string;
  }>({
    file: null,
    exifInfo: {},
    imgUrl: '',
  });
  const [openLogo, setOpenLogo] = useState(false);
  const defaultParams = useRef<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('defaultParams');
    defaultParams.current = JSON.parse(data || '[]');
    if (!fileRef.current) {
      return;
    }
    fileRef.current.addEventListener('change', imgChange);
    return () => {
      fileRef.current?.removeEventListener('change', imgChange);
    };
  }, []);

  /**图片变化 */
  const imgChange = async () => {
    const filesList = fileRef.current!.files!;
    console.log('fileRef.current!.files', fileRef.current!.files);
    const list = [];
    for (let i = 0; i < filesList?.length; i++) {
      const info = await renderFile(filesList[i]);
      list.push(info);
    }
    history.push('/editList', { infoList: list });
  };

  const renderFile = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          let exifs = await exifr.parse(file, true);
          // console.log('---exifs', exifs);
          // console.log('file---', file);
          resolve({
            file,
            filename: file.name,
            exifInfo: exifs?.Make
              ? {
                  ...exifs!,
                  ExposureTime:
                    typeof exifs?.ExposureTime === 'number'
                      ? Math.floor(1 / exifs.ExposureTime)
                      : null,
                  hiddenLeftInfo: false,
                  hiddenRightInfo: false,
                }
              : { ...(defaultParams.current?.[0]?.info || {}) },
            imgUrl: e.target?.result as string,
          });
        } catch (error) {
          console.log('error:', error);
          resolve({
            file,
            exifInfo: null,
            imgUrl: e.target?.result as string,
            filename: file.name,
          });
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex">
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        multiple
      />
      <Button onClick={() => fileRef.current?.click()}>选择图片</Button>
    </div>
  );
};

export default Index;
