import { useEffect, useRef, useState, useMemo } from 'react';
import { fabric } from 'fabric';
import { downloadFile, loadImage } from '@/utils';
import exifr from 'exifr';
import EditComponent, {
  ForWardRefHandler,
} from '@/components/editComponent/editComponent';
import { logoMap } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input, InputNumber } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

type ExifBaseType =
  | 'FocalLength'
  | 'FNumber'
  | 'ExposureTime'
  | 'ISO'
  | 'spaceX'
  | 'spaceY';

interface ExifBaseInfoListChildrenItem {
  name: ExifBaseType;
  label: string;
}

interface ExifBaseInfoListItem {
  name: string;
  children: ExifBaseInfoListChildrenItem[];
}

const Index = () => {
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

  useEffect(() => {
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
    const file = fileRef.current!.files![0];
    const reader = new FileReader();

    reader.onload = async function (e) {
      let files = Array.from(fileRef.current!.files!);
      let exifs = await Promise.all(
        files.map((file) => exifr.parse(file, true))
      );
      // console.log('---exifs', exifs);
      setImgInfo({
        file,
        exifInfo: {
          ...exifs[0]!,
          ExposureTime:
            typeof exifs[0]?.ExposureTime === 'number'
              ? Math.floor(1 / exifs[0].ExposureTime)
              : null,
          hiddenLeftInfo: false,
          hiddenRightInfo: false,
        },
        imgUrl: e.target?.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  const uploadImg = () => {
    if (!fileRef.current) {
      return;
    }
    fileRef.current?.click();
  };

  const downloadHandler = async () => {
    const downloadImageData = await editRef.current?.exportImageUrl()!;
    // return;
    // const downloadLink = document.createElement('a');
    // downloadLink.href = downloadImageData;
    // downloadLink.download = `${imgInfo.file?.name}_${+new Date()}.png`;
    // downloadLink.click();
    // console.log(222222);
    downloadFile(downloadImageData, `${imgInfo.file?.name}_${+new Date()}.png`);
  };

  const changeExif = (type: ExifBaseType, value: string) => {
    setImgInfo((info) => {
      info.exifInfo[type] = value;
      return JSON.parse(JSON.stringify(info));
    });
  };

  const exifBaseInfoList: ExifBaseInfoListItem[] = useMemo(() => {
    return [
      {
        name: 'Exif参数',
        children: [
          {
            name: 'FocalLength',
            label: '焦距：',
          },
          {
            name: 'FNumber',
            label: '光圈：',
          },
          {
            name: 'ExposureTime',
            label: '快门：',
          },
          {
            name: 'ISO',
            label: 'ISO：',
          },
        ],
      },
    ];
  }, []);

  return (
    <div className="flex">
      <div className="flex flex-col justify-center mr-8">
        <input type="file" ref={fileRef} accept="image/*" className="hidden" />
        <Button onClick={uploadImg}>上传图片</Button>
        <Button variant="outline" className="mt-8 " onClick={downloadHandler}>
          下载
        </Button>
      </div>
      <EditComponent
        ref={editRef}
        file={imgInfo.file}
        exifInfo={imgInfo.exifInfo}
        imgUrl={imgInfo.imgUrl}
      />
      <div className="w-48 bg-white p-4 ml-8">
        <div className="mb-8">
          <div className="font-bold text-base flex items-center">
            相机LOGO
            {imgInfo?.exifInfo?.Make && (
              <span className="text-xs link link-accent ml-4">更改logo</span>
            )}
          </div>
          <img
            className="h-12 m-auto"
            src={logoMap[(imgInfo?.exifInfo?.Make || '').toLocaleLowerCase()]}
          />
        </div>
        {exifBaseInfoList.map((groupItem) => (
          <div key={groupItem.name} className="mb-8">
            <div className="font-bold text-base mb-4">Exif参数</div>
            {groupItem.children.map((item) => (
              <div className="flex items-center mb-2" key={item.name}>
                <div className="w-16">{item.label}</div>
                <InputNumber
                  placeholder="请输入数字"
                  value={imgInfo?.exifInfo?.[item.name] || '0'}
                  onChange={(e) => changeExif(item.name, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
        <div>
          <div>
            <div>隐藏左边信息</div>
            <Switch
              checked={imgInfo?.exifInfo?.hiddenLeftInfo}
              onCheckedChange={(value: boolean) => {
                console.log('onCheckedChange', value);
                setImgInfo((info) => {
                  info.exifInfo.hiddenLeftInfo = value;
                  return JSON.parse(JSON.stringify(info));
                });
              }}
            />
          </div>
          <div>
            <div>隐藏右边信息</div>
            <Switch
              checked={imgInfo?.exifInfo?.hiddenRightInfo}
              onCheckedChange={(value: boolean) => {
                console.log('onCheckedChange', value);
                setImgInfo((info) => {
                  info.exifInfo.hiddenRightInfo = value;
                  return JSON.parse(JSON.stringify(info));
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
