import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { fabric } from 'fabric';
import { loadImage } from '@/utils';
import {
  initAligningGuidelines,
  initCenteringGuidelines,
} from '@/utils/fabricPlugins';
import { getLogo, logoMap } from '@/constants';
import message from '../message/message';

const LOGOHEIGHT = 60;
const MAXWIDTH = 1200;
const MAXHEIGHT = 800;

interface EditComponentProps {
  imgUrl: string;
  file: File | null;
  exifInfo: any;
  onPreviewImg?: (imgData: string) => void;
}

interface ExportImageUrlParams {
  multiplier?: number;
}

export interface ForWardRefHandler {
  exportImageUrl: (props: { multiplier?: number }) => Promise<string>;
}

const EditComponent = forwardRef<ForWardRefHandler, EditComponentProps>(
  (props, ref) => {
    const { file, exifInfo, imgUrl, onPreviewImg } = props;
    const mainCanvas = useRef<fabric.Canvas>();
    const logoCanvas = useRef<fabric.Canvas>();
    const downloadCanvas = useRef<fabric.Canvas>();
    const [exifData, setExifData] = useState(exifInfo);
    const cacheImgUrl = useRef('');
    const [previewImg, setPreviewImg] = useState('');

    useEffect(() => {
      setExifData(exifInfo);
    }, [exifInfo]);

    useEffect(() => {
      const fabricCanvas = new fabric.Canvas('mainCanvas');
      const fabricLogoCanvas = new fabric.Canvas('logoCanvas');
      const fabricDownloadCanvas = new fabric.Canvas('downloadCanvas');
      mainCanvas.current = fabricCanvas;
      logoCanvas.current = fabricLogoCanvas;
      downloadCanvas.current = fabricDownloadCanvas;
      initAligningGuidelines(fabricLogoCanvas);
      initCenteringGuidelines(fabricLogoCanvas);
    }, []);

    const initCanvas = async () => {
      if (cacheImgUrl.current !== imgUrl) {
        mainCanvas.current?.clear();
      }
      logoCanvas.current?.clear();

      // if (!exifData.hiddenLeftInfo) {
      //   logoCanvas.current?.getActiveObjects()!.forEach((obj) => {
      //     if ((obj as any).customType === 'leftGroup') {
      //       logoCanvas.current?.remove(obj)
      //     }
      //   });
      // }

      try {
        const img = await loadImage(imgUrl);
        cacheImgUrl.current = imgUrl;

        if (img.width! > MAXWIDTH || img.height! > MAXHEIGHT) {
          const scaleFactor = Math.min(
            MAXWIDTH / img.width!,
            MAXHEIGHT / img.height!
          );
          img.scale(scaleFactor);
        }
        const newWidth = img.width! * img.scaleX!;
        const newHeight = img.height! * img.scaleY!;
        mainCanvas.current!.setDimensions({
          width: newWidth,
          height: newHeight,
        });
        logoCanvas.current!.setDimensions({
          width: newWidth,
          height: LOGOHEIGHT,
        });

        img.selectable = false;
        mainCanvas.current!.add(img);
      } catch (error) {
        message.error('图片加载失败');
      }

      return;
    };

    useEffect(() => {
      if (!file) {
        return;
      }
      (async () => {
        await initCanvas();
        await renderEditContent();
        const imgData = await exportImageUrl({ multiplier: 1 });
        setPreviewImg(imgData);
        onPreviewImg?.(imgData);
      })();
    }, [exifData]);

    const renderEditContent = async () => {
      logoCanvas.current!.backgroundColor! = '#fff';
      console.log(111, exifData);
      if (
        !exifData?.Make ||
        !getLogo((exifData?.Make || '').toLocaleLowerCase())
      ) {
        return;
      }
      console.log('exifData', exifData);

      if (!exifData?.hiddenLeftInfo) {
        // 相机
        const modelText = new fabric.IText(exifData?.Model || '', {
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 20 : 16,
          fill: '#333',
          fontWeight: 'bold',
        });
        modelText.left = 0;
        modelText.top = 0;

        // 镜头
        const LensModelText = new fabric.IText(exifData?.LensModel || '', {
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 12,
          fill: '#666',
          fontWeight: 'bold',
        });
        LensModelText.left = modelText.left;
        LensModelText.top = Math.floor(modelText.top + modelText.height! + 8);

        const leftGroup = new fabric.Group([modelText, LensModelText], {
          left: 12,
          customType: 'leftGroup',
        } as any);
        leftGroup.top = Math.floor((LOGOHEIGHT - leftGroup.height!) / 2);
        logoCanvas.current?.add(leftGroup);
      }

      const logoImg = await loadImage(
        logoMap[getLogo((exifData?.Make || '').toLocaleLowerCase())]
      );
      (logoImg as any).customType = 'logoImg';
      logoImg.scale(0.15);
      console.log('logoImg', logoImg);
      logoImg.top = Math.floor(
        (LOGOHEIGHT - logoImg.height! * logoImg.scaleY!) / 2
      );
      logoImg.left = Math.floor(
        (logoCanvas.current?.width! - logoImg.width! * logoImg.scaleX!) / 2
      );
      logoCanvas.current?.add(logoImg);

      if (!exifData?.hiddenRightInfo) {
        const rightGroupStyle: fabric.ITextOptions = {
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 14,
          fill: '#333',
          fontWeight: 'bold',
        };

        // 焦距
        const FocalLengthText = new fabric.IText(
          `${exifData?.FocalLength}mm | ` || '',
          rightGroupStyle
        );
        FocalLengthText.left = 0;

        // 光圈
        const FNumberText = new fabric.IText(
          `f/${exifData?.FNumber} | ` || '',
          rightGroupStyle
        );
        FNumberText.left = Math.floor(
          FocalLengthText.left! + FocalLengthText.width!
        );

        // 快门
        const ExposureTimeText = new fabric.IText(
          `1/${exifData?.ExposureTime}s | ` || '',
          rightGroupStyle
        );
        ExposureTimeText.left = Math.floor(
          FNumberText.left! + FNumberText.width!
        );

        // ISO
        const ISOText = new fabric.IText(
          `ISO${exifData?.ISO}` || '',
          rightGroupStyle
        );
        ISOText.left = Math.floor(
          ExposureTimeText.left! + ExposureTimeText.width!
        );

        const rightGroup = new fabric.Group(
          [ExposureTimeText, FNumberText, FocalLengthText, ISOText],
          {
            customType: 'leftGroup',
          } as any
        );
        rightGroup.top = Math.floor((LOGOHEIGHT - rightGroup.height!) / 2);
        rightGroup.left = Math.floor(
          logoCanvas.current?.width! - rightGroup.width! - 12
        );
        logoCanvas.current?.add(rightGroup);
      }

      logoCanvas.current?.getObjects()!.forEach((obj) => {
        obj.selectable = false;
      });
    };

    useImperativeHandle(ref, () => ({
      exportImageUrl,
    }));

    const exportImageUrl = async (
      params: ExportImageUrlParams = {}
    ): Promise<string> => {
      downloadCanvas.current?.clear();
      downloadCanvas.current!.backgroundColor! = '#fff';
      const mainCanvasObjects = mainCanvas.current?.getObjects()!;
      const logoCanvasObjects = logoCanvas.current?.getObjects()!;
      const width = mainCanvas.current?.width!;
      const height = mainCanvas.current?.height! + logoCanvas.current?.height!;
      downloadCanvas.current?.setDimensions({ width, height });

      mainCanvasObjects.forEach((obj) => {
        downloadCanvas.current?.add(obj);
      });
      logoCanvasObjects.forEach((obj) => {
        obj.top! += mainCanvas.current?.height!;
        downloadCanvas.current?.add(obj);
      });

      downloadCanvas.current?.renderAll();
      console.log('----logoCanvasObjects', logoCanvasObjects);
      // debugger;
      const imageData = downloadCanvas.current?.toDataURL({
        format: 'png',
        // 质量
        quality: 1,
        // 分辨率倍数
        multiplier: params.multiplier
          ? params.multiplier
          : Math.max(mainCanvasObjects[0].width! / MAXWIDTH, 1),
      })!;

      logoCanvasObjects.forEach((obj) => {
        obj.top! -= mainCanvas.current?.height!;
      });
      logoCanvas.current?.renderAll();

      return imageData;
    };

    return (
      <div
        className="bg-gray-50 flex justify-center items-center"
        style={{
          width: `${MAXWIDTH}px`,
          height: `${LOGOHEIGHT + MAXHEIGHT}px`,
        }}
      >
        <div>
          <canvas id="mainCanvas" width={MAXWIDTH} height={300}></canvas>
          <canvas id="logoCanvas" width={MAXWIDTH} height={LOGOHEIGHT}></canvas>
          <div className="hidden">
            <canvas id="downloadCanvas"></canvas>
          </div>
        </div>
      </div>
    );
  }
);
export default EditComponent;
