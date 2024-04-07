import React, { useMemo, useState } from 'react';
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
  exifBaseInfoList,
} from '@/pages/edit/edit';
import { getLogo, getLogoName, logoMap, logoNameMap } from '@/constants';

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

  const mouseEnterHandler = () => {
    const locationParams = JSON.parse(
      localStorage.getItem('defaultParams') || '[]'
    );
    console.log(locationParams);
    setParams(locationParams[0]);
    setText('修改');
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
            <Button className="w-12 h-12 bg-green-500 text-white rounded-full">
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
    </div>
  );
}

export default DefaultValue;
