import React, { useMemo, useRef, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '../ui/button';
import {
  ExifBaseInfoListItem,
  ExifBaseType,
  FontFamilyList,
  exifBaseInfoList,
} from '@/pages/edit/edit';
import { getLogo, getLogoName, logoMap, logoNameMap } from '@/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input, InputNumber } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import message from '../message/message';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const exifInfoList: ExifBaseInfoListItem[] = [
  ...exifBaseInfoList,
  {
    name: '配置',
    children: [
      {
        name: 'Make',
        label: 'LOGO：',
        render: (value) =>
          logoNameMap[
            getLogoName(((value as string) || '').toLocaleLowerCase())
          ],
      },
      // {
      //   name: 'hiddenLeftInfo',
      //   label: '隐藏左边信息：',
      //   render: (value) => (value ? '是' : '否'),
      // },
      // {
      //   name: 'hiddenRightInfo',
      //   label: '隐藏右边信息：',
      //   render: (value) => (value ? '是' : '否'),
      // },
    ],
  },
];

function DefaultValue() {
  const [text, setText] = useState('默');
  const [params, setParams] = useState<{ info: any } | null>(null);
  const [open, setOpen] = useState(false);
  const preParamsRef = useRef<any>({});

  const mouseEnterHandler = () => {
    const locationParams = JSON.parse(
      localStorage.getItem('defaultParams') || '[]'
    );
    console.log(locationParams);
    setParams(locationParams[0]);
    preParamsRef.current = locationParams[0]?.info;
    setText('修改');
  };

  const logoList = useMemo(() => {
    return Object.keys(logoMap).map((item) => ({
      value: item,
      url: logoMap[item],
    }));
  }, [logoMap]);

  const saveParamsHandler = () => {
    localStorage.setItem(
      'defaultParams',
      JSON.stringify([{ ...params, info: preParamsRef.current }])
    );
    setOpen(false);
    message.success('保存成功');
    window.dispatchEvent(new CustomEvent('updateStorage'));
  };

  return (
    <div
      className="fixed right-4 bottom-4 flex justify-center items-center rounded-full shadow-md cursor-pointer"
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={() => {
        setText('默');
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-12 h-12 bg-green-500 text-white rounded-full"
              onClick={() => setOpen(true)}
            >
              {text}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {exifInfoList.map((groupItem, index) => (
              <div key={groupItem.name} className="mb-8">
                <div className="font-bold text-base mb-4">{groupItem.name}</div>
                {groupItem.children.map((item) => (
                  <div className="flex items-center mb-2" key={item.name}>
                    <div className="w-28">{item.label}</div>
                    <span>
                      {item.render
                        ? item.render(params?.info?.[item.name!])
                        : params?.info?.[item.name!]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改默认值</DialogTitle>
          </DialogHeader>
          <div>
            {exifInfoList.map((groupItem, index) => (
              <div key={groupItem.name} className="mb-8">
                <div className="font-bold text-base mb-4">{groupItem.name}</div>
                <div>
                  {groupItem.children.map((item) => (
                    <div className="flex items-center mb-2" key={item.name}>
                      <div className="w-28">{item.label}</div>
                      {index === 0 ? (
                        <InputNumber
                          placeholder="请输入数字"
                          defaultValue={
                            preParamsRef.current?.[item.name] || '0'
                          }
                          onChange={(e) => {
                            preParamsRef.current = {
                              ...preParamsRef.current,
                              [item.name]: e.target.value,
                            };
                          }}
                        />
                      ) : index === 2 && item.name === 'FontFamily' ? (
                        <Select
                          defaultValue={preParamsRef.current?.[item.name]}
                          onValueChange={(value) => {
                            preParamsRef.current = {
                              ...preParamsRef.current,
                              [item.name]: value,
                            };
                          }}
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
                      ) : index === 1 ? (
                        <Input
                          placeholder="请输入参数"
                          defaultValue={preParamsRef.current?.[item.name] || ''}
                          onChange={(e) => {
                            preParamsRef.current = {
                              ...preParamsRef.current,
                              [item.name]: e.target.value,
                            };
                          }}
                        />
                      ) : (
                        <RadioGroup
                          defaultValue={(
                            preParamsRef.current?.[item.name] || ''
                          ).toLocaleLowerCase()}
                          onValueChange={(value: string) => {
                            preParamsRef.current = {
                              ...preParamsRef.current,
                              [item.name]: value,
                            };
                          }}
                          className="flex"
                        >
                          {logoList.map((item) => (
                            <div
                              className="flex items-center space-x-2"
                              key={item.value}
                            >
                              <RadioGroupItem
                                value={item.value}
                                id={item.value}
                              />
                              <Label htmlFor={item.value}>
                                <img src={item.url} />
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={saveParamsHandler}>保存</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DefaultValue;
