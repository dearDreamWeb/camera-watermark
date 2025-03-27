import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { fabric } from 'fabric';
import { createLocal, downloadFile, loadImage, saveFile } from '@/utils';
import exifr from 'exifr';
import EditComponent, {
  ForWardRefHandler,
} from '@/components/editComponent/editComponent';
import { getLogo, logoMap, threeLogoMap } from '@/constants';
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
import { useLocation, useHistory } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EditComponentBlur from '@/components/editComponentBlur/editComponentBlur';

export type ExifBaseType =
  | 'FocalLength'
  | 'FNumber'
  | 'ExposureTime'
  | 'ISO'
  | 'spaceX'
  | 'spaceY'
  | 'Model'
  | 'LensModel'
  | 'Make'
  | 'hiddenBottomInfo'
  | 'hiddenLeftInfo'
  | 'hiddenRightInfo'
  | 'BgBlur'
  | 'ShadowBlur'
  | 'FontFamily';

export const FontFamilyList = [
  'Times New Roman',
  'Arial',
  'Courier',
  'New Georgia',
  'Verdana',
];

interface ExifBaseInfoListChildrenItem {
  name: ExifBaseType;
  label: string;
  render?: (value: string | number) => React.ReactNode;
}

export interface ExifBaseInfoListItem {
  name: string;
  children: ExifBaseInfoListChildrenItem[];
}

export const exifBaseInfoList: ExifBaseInfoListItem[] = [
  {
    name: '镜头参数',
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
  {
    name: '相机参数',
    children: [
      {
        name: 'Model',
        label: '相机：',
      },
      {
        name: 'LensModel',
        label: '镜头：',
      },
    ],
  },
  {
    name: '样式',
    children: [
      {
        name: 'FontFamily',
        label: '字体：',
      },
      {
        name: 'BgBlur',
        label: '背景模糊度：',
      },
      {
        name: 'ShadowBlur',
        label: '阴影半径：',
      },
    ],
  },
];

export type TemplateMode = 'classic' | 'blur';

export const templateModeLocal = createLocal<TemplateMode>('templateMode');

interface TemplateModeListItem {
  value: TemplateMode;
  label: string;
}

const templateModeList: TemplateModeListItem[] = [
  {
    value: 'classic',
    label: '经典',
  },
  {
    value: 'blur',
    label: '背景模糊',
  },
];

const Edit = () => {
  const location = useLocation<any>();
  const history = useHistory();
  if (!location.state) {
    history.push('/');
    return null;
  }
  const { editState = {} } = location.state;
  const fileRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<ForWardRefHandler>(null);
  const [imgInfo, setImgInfo] = useState<{
    file: File | null;
    exifInfo: any;
    imgUrl: string;
    filename: string;
  }>({
    file: null,
    exifInfo: {},
    imgUrl: '',
    filename: '',
  });
  const [openLogo, setOpenLogo] = useState(false);
  const defaultParams = useRef<any[]>([]);
  const [templateMode, setTemplateMode] = useState<TemplateMode>(
    templateModeLocal.get() || 'classic'
  );

  console.log('editState-----', editState);
  useEffect(() => {
    if (!editState.file) {
      return;
    }
    setImgInfo(editState);
  }, [editState]);

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
    const file = fileRef.current!.files![0];
    const reader = new FileReader();
    reader.onload = async function (e) {
      let files = Array.from(fileRef.current!.files!);
      let exifs = await Promise.all(
        files.map((file) => exifr.parse(file, true))
      );
      console.log('exifs----', exifs, defaultParams.current?.[0]?.info);
      setImgInfo({
        file,
        filename: file.name,
        exifInfo: exifs[0]?.Make
          ? {
              ...(defaultParams.current?.[0]?.info || {}),
              ...exifs[0]!,
              ExposureTime:
                typeof exifs[0]?.ExposureTime === 'number'
                  ? Math.floor(1 / exifs[0].ExposureTime)
                  : null,
              hiddenLeftInfo: false,
              hiddenBottomInfo: false,
              hiddenRightInfo: false,
              BgBlur: 5,
              ShadowBlur: 5,
            }
          : { ...(defaultParams.current?.[0]?.info || {}) },
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
    const downloadImageData = await editRef.current?.exportImageUrl({})!;

    const worker = new Worker();
    worker.postMessage({
      imageData: downloadImageData,
    });
    worker.onmessage = (event) => {
      const { blob } = event.data;
      saveFile(blob, `${imgInfo.filename}_${+new Date()}.png`);
      worker.terminate();
    };
  };

  const changeExif = (type: ExifBaseType, value: string) => {
    setImgInfo((info) => {
      info.exifInfo[type] = value;
      return JSON.parse(JSON.stringify(info));
    });
  };

  // const exifBaseInfoList: ExifBaseInfoListItem[] = useMemo(() => {
  //   return [
  //     {
  //       name: '镜头参数',
  //       children: [
  //         {
  //           name: 'FocalLength',
  //           label: '焦距：',
  //         },
  //         {
  //           name: 'FNumber',
  //           label: '光圈：',
  //         },
  //         {
  //           name: 'ExposureTime',
  //           label: '快门：',
  //         },
  //         {
  //           name: 'ISO',
  //           label: 'ISO：',
  //         },
  //       ],
  //     },
  //     {
  //       name: '相机参数',
  //       children: [
  //         {
  //           name: 'Model',
  //           label: '相机：',
  //         },
  //         {
  //           name: 'LensModel',
  //           label: '镜头：',
  //         },
  //       ],
  //     },
  //   ];
  // }, []);

  const logoList = useMemo(() => {
    return Object.entries({ ...logoMap, ...threeLogoMap }).map(
      ([key, value]) => ({
        value: key,
        url: value,
      })
    );
  }, [logoMap, threeLogoMap]);

  const saveDefaultParams = () => {
    message.success('保存成功');
    localStorage.setItem(
      'defaultParams',
      JSON.stringify([{ key: +new Date(), info: imgInfo?.exifInfo }])
    );
  };

  /**
   * 模板渲染
   */
  const templateRender = useCallback(() => {
    switch (templateMode) {
      case 'blur':
        return (
          <EditComponentBlur
            ref={editRef}
            file={imgInfo.file}
            exifInfo={imgInfo.exifInfo}
            imgUrl={imgInfo.imgUrl}
          />
        );
      case 'classic':
      default:
        return (
          <EditComponent
            ref={editRef}
            file={imgInfo.file}
            exifInfo={imgInfo.exifInfo}
            imgUrl={imgInfo.imgUrl}
          />
        );
    }
  }, [templateMode, editRef, imgInfo]);

  const changeTemplateMode = async (value: TemplateMode) => {
    setTemplateMode(value);
    templateModeLocal.set(value);
  };

  const rightOptionsRender = useCallback(
    (item: ExifBaseInfoListChildrenItem, index: number) => {
      if (index === 0) {
        return (
          <>
            <div className="w-20">{item.label}</div>
            <InputNumber
              placeholder="请输入数字"
              value={imgInfo?.exifInfo?.[item.name] || '0'}
              onChange={(e) => changeExif(item.name, e.target.value)}
            />
          </>
        );
      } else if (index === 2 && item.name === 'FontFamily') {
        return (
          <>
            <div className="w-20">{item.label}</div>
            <Select
              defaultValue={imgInfo?.exifInfo?.FontFamily || FontFamilyList[0]}
              onValueChange={(value: string) => changeExif(item.name, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {FontFamilyList.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        );
      } else if (index === 2 && ['BgBlur', 'ShadowBlur'].includes(item.name)) {
        if (templateMode === 'blur') {
          return (
            <>
              <div className="w-20">{item.label}</div>
              <InputNumber
                placeholder="请输入参数"
                max={10}
                min={0}
                value={imgInfo?.exifInfo?.[item.name] || 0}
                onChange={(e) => changeExif(item.name, e.target.value)}
              />
            </>
          );
        }
      } else {
        return (
          <>
            <div className="w-20">{item.label}</div>
            <Input
              placeholder="请输入参数"
              value={imgInfo?.exifInfo?.[item.name] || ''}
              onChange={(e) => changeExif(item.name, e.target.value)}
            />
          </>
        );
      }
    },
    [imgInfo, templateMode, changeExif, FontFamilyList]
  );

  return (
    <div className="flex min-h-screen pt-24 pb-16 w-full overflow-x-auto px-4 justify-center">
      <div className="flex flex-col justify-center mr-8">
        <div className="mb-8">
          <div className="mb-2">选择模板：</div>
          <Select
            defaultValue={templateMode}
            onValueChange={changeTemplateMode}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择模板" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {templateModeList.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <input type="file" ref={fileRef} accept="image/*" className="hidden" />
        <Button onClick={uploadImg}>更换图片</Button>
        <Button variant="outline" className="mt-8 " onClick={downloadHandler}>
          下载
        </Button>
      </div>
      {/* <EditComponent
        ref={editRef}
        file={imgInfo.file}
        exifInfo={imgInfo.exifInfo}
        imgUrl={imgInfo.imgUrl}
      /> */}
      {/* <EditComponentBlur
        ref={editRef}
        file={imgInfo.file}
        exifInfo={imgInfo.exifInfo}
        imgUrl={imgInfo.imgUrl}
      /> */}
      {templateRender()}
      <div className="w-48 bg-white p-4 ml-8">
        <div className="mb-8">
          <div className="font-bold text-base flex items-center">
            相机LOGO
            {imgInfo?.exifInfo?.Make && (
              <span
                className="text-xs text-green-400 link link-accent ml-4 cursor-pointer hover:text-green-600"
                onClick={() => setOpenLogo(true)}
              >
                更改logo
              </span>
            )}
          </div>
          <img
            className="h-12 m-auto"
            src={
              { ...logoMap, ...threeLogoMap }[
                getLogo((imgInfo?.exifInfo?.Make || '').toLocaleLowerCase())
              ]
            }
          />
        </div>
        {exifBaseInfoList.map((groupItem, index) => (
          <div key={groupItem.name} className="mb-8">
            <div className="font-bold text-base mb-4">{groupItem.name}</div>
            {groupItem.children.map((item) => (
              <div className="flex items-center mb-2" key={item.name}>
                {rightOptionsRender(item, index)}
                {/* {index === 0 ? (
                  <InputNumber
                    placeholder="请输入数字"
                    value={imgInfo?.exifInfo?.[item.name] || '0'}
                    onChange={(e) => changeExif(item.name, e.target.value)}
                  />
                ) : index === 2 && item.name === 'FontFamily' ? (
                  <Select
                    defaultValue={
                      imgInfo?.exifInfo?.FontFamily || FontFamilyList[0]
                    }
                    onValueChange={(value: string) =>
                      changeExif(item.name, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FontFamilyList.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : index === 2 &&
                  ['BgBlur', 'ShadowBlur'].includes(item.name) ? (
                  <InputNumber
                    placeholder="请输入参数"
                    max={10}
                    min={0}
                    value={imgInfo?.exifInfo?.[item.name] || 0}
                    onChange={(e) => changeExif(item.name, e.target.value)}
                  />
                ) : (
                  <Input
                    placeholder="请输入参数"
                    value={imgInfo?.exifInfo?.[item.name] || ''}
                    onChange={(e) => changeExif(item.name, e.target.value)}
                  />
                )} */}
              </div>
            ))}
          </div>
        ))}
        <div className="mb-8">
          {templateMode === 'blur' && (
            <div>
              <div>取消底部相机信息</div>
              <Switch
                className="my-2"
                checked={imgInfo?.exifInfo?.hiddenBottomInfo}
                onCheckedChange={(value: boolean) => {
                  setImgInfo((info) => {
                    info.exifInfo.hiddenBottomInfo = value;
                    return JSON.parse(JSON.stringify(info));
                  });
                }}
              />
            </div>
          )}
          <div>
            <div>隐藏左边信息</div>
            <Switch
              className="my-2"
              checked={imgInfo?.exifInfo?.hiddenLeftInfo}
              onCheckedChange={(value: boolean) => {
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
              className="my-2"
              checked={imgInfo?.exifInfo?.hiddenRightInfo}
              onCheckedChange={(value: boolean) => {
                setImgInfo((info) => {
                  info.exifInfo.hiddenRightInfo = value;
                  return JSON.parse(JSON.stringify(info));
                });
              }}
            />
          </div>
        </div>
        {imgInfo?.exifInfo?.Make && (
          <div className="flex justify-center items-center">
            <Button variant="ghost" onClick={saveDefaultParams}>
              设置为默认参数
            </Button>
          </div>
        )}
      </div>

      <Dialog open={openLogo} onOpenChange={(value) => setOpenLogo(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更换LOGO</DialogTitle>
          </DialogHeader>
          <div>
            <RadioGroup
              value={(imgInfo?.exifInfo?.Make || '').toLocaleLowerCase()}
              onValueChange={(value: string) =>
                setImgInfo({
                  ...imgInfo,
                  exifInfo: { ...imgInfo.exifInfo, Make: value },
                })
              }
              className="grid grid-cols-5"
            >
              {logoList.map((item) => (
                <div className="flex items-center space-x-2" key={item.value}>
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value}>
                    <img src={item.url} style={{ height: '27px' }} />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Edit;
