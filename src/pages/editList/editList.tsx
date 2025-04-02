/* eslint-disable no-async-promise-executor */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import EditComponent, {
  ForWardRefHandler,
} from '@/components/editComponent/editComponent';
import { Icon } from '@iconify-icon/react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import { Button } from '@/components/ui/button';
import Worker from '../../workers/index?worker';
import { saveFile } from '@/utils';
import { getDbEditInfo, getSomeDbEditInfo } from '@/db/utils';
import loadingSystem from '@/components/loadingSystem/loadingSystem';
import EditComponentBlur from '@/components/editComponentBlur/editComponentBlur';
import { TemplateMode, templateModeLocal } from '../edit/edit';
import { EditInfoTableItem } from '@/db/db';

function EditList() {
  const location = useLocation<any>();
  const history = useHistory();
  if (!location.state) {
    history.push('/');
    return null;
  }
  const { ids = [] } = location.state;
  const [list, setList] = useState<EditInfoTableItem[]>([]);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [templateMode, setTemplateMode] = useState<TemplateMode>(
    templateModeLocal.get() || 'classic'
  );
  const editRefs = new Array(ids.length)
    .fill(1)
    .map(() => useRef<ForWardRefHandler>(null));

  useEffect(() => {
    (async () => {
      loadingSystem(true);
      const list = await getSomeDbEditInfo(ids);
      setList(JSON.parse(JSON.stringify(list)));
      setPreviewList(new Array(list.length).fill(''));
    })();
  }, [ids]);

  const jumpToEdit = (index: number) => {
    history.push('/edit', { id: list[index].id });
  };

  const downloadHandler = (ref: any, info: any) => {
    return new Promise(async (resolve) => {
      const downloadImageData = await ref.current?.exportImageUrl({})!;

      const worker = new Worker();
      worker.postMessage({
        imageData: downloadImageData,
      });
      worker.onmessage = (event) => {
        const { blob } = event.data;
        saveFile(blob, `${info.filename}_${+new Date()}.png`);
        worker.terminate();
        resolve(null);
      };
    });
  };

  /**
   * 模板渲染
   */
  const templateRender = useCallback(
    (item: any, index: number) => {
      switch (templateMode) {
        case 'blur':
          return (
            <EditComponentBlur
              file={item.file}
              exifInfo={item.exifInfo}
              imgUrl={item.imgUrl}
              ref={editRefs[index]}
              onPreviewImg={(imgData) => {
                setPreviewList((previewImgList: any) => {
                  previewImgList[index] = imgData;
                  const isOver = previewImgList.every((item: any) => !!item);
                  if (isOver) {
                    loadingSystem(false);
                  }
                  return JSON.parse(JSON.stringify(previewImgList));
                });
              }}
            />
          );
        case 'classic':
        default:
          return (
            <EditComponent
              file={item.file}
              exifInfo={item.exifInfo}
              imgUrl={item.imgUrl}
              ref={editRefs[index]}
              onPreviewImg={(imgData) => {
                setPreviewList((previewImgList: any) => {
                  previewImgList[index] = imgData;
                  const isOver = previewImgList.every((item: any) => !!item);
                  if (isOver) {
                    loadingSystem(false);
                  }
                  return JSON.parse(JSON.stringify(previewImgList));
                });
              }}
            />
          );
      }
    },
    [templateMode, editRefs]
  );

  return (
    <div className="font-bold w-full min-h-screen px-8 pt-20 pb-16">
      <div className="flex justify-center items-center mb-12 relative">
        <div className="absolute left-0 top-0">
          <div>
            背景色为<span>白色</span>代表有exif信息；
          </div>
          <div>
            背景色为<span>黄色</span>代表无exif信息，采用默认值
          </div>
        </div>
        <Button
          onClick={async () => {
            for (let i = 0; i < editRefs.length; i++) {
              await downloadHandler(editRefs[i], list[i]);
            }
          }}
        >
          批量下载
        </Button>
      </div>
      <div className="flex flex-wrap">
        {list.map((item: any, index: number) => (
          <div
            key={index}
            className={`group w-80 h-80 p-1  relative flex justify-center items-center mr-8 mb-8 shadow-slate-300 ${
              item.exifInfo.noHasExif ? ' bg-yellow-200' : 'bg-white'
            }`}
          >
            <div className="hidden">{templateRender(item, index)}</div>
            {previewList[index] && (
              <img src={previewList[index]} className="max-w-full max-h-full" />
            )}

            <div className="hidden group-hover:flex w-full h-full justify-center items-center bg-black bg-opacity-50 absolute left-0 top-0">
              <Icon
                icon="mdi:eye-outline"
                className="text-3xl cursor-pointer hover:!text-gray-300 "
                style={{ color: '#fff' }}
                onClick={() => {
                  setPhotoIndex(index);
                  setIsOpen(true);
                }}
              />
              <Icon
                icon="mdi:square-edit-outline"
                className="text-3xl ml-8 cursor-pointer hover:!text-gray-300 "
                style={{ color: '#fff' }}
                onClick={() => jumpToEdit(index)}
              />
            </div>
          </div>
        ))}
      </div>
      {isOpen && (
        <Lightbox
          mainSrc={previewList[photoIndex]}
          nextSrc={previewList[(photoIndex + 1) % previewList.length]}
          prevSrc={
            previewList[
              (photoIndex + previewList.length - 1) % previewList.length
            ]
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + previewList.length - 1) % previewList.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % previewList.length)
          }
        />
      )}
    </div>
  );
}

export default EditList;
