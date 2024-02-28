import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { fabric } from 'fabric';
import { downloadFile, loadImage } from '@/utils';
import exifr from 'exifr';
import canonLogo from '@/assets/images/canon.png';
import fujifilmLogo from '@/assets/images/fujifilm.png'; // 富士
import nikonLogo from '@/assets/images/nikon.png';
import panasonicLogo from '@/assets/images/panasonic.png'; // 松下
import sonyLogo from '@/assets/images/sony.png';
import {
  initAligningGuidelines,
  initCenteringGuidelines,
} from '@/utils/fabricPlugins';

const LOGOHEIGHT = 60;
const MAXWIDTH = 1200;
const MAXHEIGHT = 800;

const logoMap: Record<string, string> = {
  canon: canonLogo,
  fujifilm: fujifilmLogo,
  nikon: nikonLogo,
  panasonic: panasonicLogo,
  sony: sonyLogo,
};

interface EditComponentProps {
  imgUrl: string;
  file: File | null;
  exifInfo: any;
}

export interface ForWardRefHandler {
  exportImageUrl: () => string;
}

const EditComponent = forwardRef<ForWardRefHandler, EditComponentProps>(
  (props, ref) => {
    const { file, exifInfo, imgUrl } = props;
    const mainCanvas = useRef<fabric.Canvas>();
    const logoCanvas = useRef<fabric.Canvas>();
    const downloadCanvas = useRef<fabric.Canvas>();

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
      mainCanvas.current?.clear();
      logoCanvas.current?.clear();

      const img = await loadImage(imgUrl);

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
      return;
    };

    useEffect(() => {
      if (!file) {
        return;
      }
      (async () => {
        await initCanvas();
        renderEditContent();
      })();
    }, [file, exifInfo]);

    const renderEditContent = async () => {
      console.log(111, exifInfo);
      if (
        !exifInfo?.Make ||
        !logoMap[(exifInfo?.Make || '').toLocaleLowerCase()]
      ) {
        return;
      }
      console.log('exifInfo', exifInfo);

      const modelText = new fabric.IText(exifInfo?.Model || '', {
        fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 20 : 16,
        fill: '#333',
        fontWeight: 'bold',
      });
      modelText.left = 0;
      modelText.top = 0;
      console.log(
        'mainCanvas.current?.width',
        mainCanvas.current?.width,
        MAXWIDTH
      );
      const LensModelText = new fabric.IText(exifInfo?.LensModel || '', {
        fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 12,
        fill: '#666',
        fontWeight: 'bold',
      });
      LensModelText.left = modelText.left;
      LensModelText.top = Math.floor(modelText.top + modelText.height! + 8);

      const leftGroup = new fabric.Group([modelText, LensModelText], {
        left: 12,
      });
      leftGroup.top = Math.floor((LOGOHEIGHT - leftGroup.height!) / 2);
      logoCanvas.current?.add(leftGroup);

      const logoImg = await loadImage(
        logoMap[(exifInfo?.Make || '').toLocaleLowerCase()]
      );
      logoImg.scale(0.15);
      console.log('logoImg', logoImg);
      logoImg.top = Math.floor(
        (LOGOHEIGHT - logoImg.height! * logoImg.scaleY!) / 2
      );
      logoImg.left = Math.floor(
        (logoCanvas.current?.width! - logoImg.width! * logoImg.scaleX!) / 2
      );
      logoCanvas.current?.add(logoImg);

      const rightGroupStyle: fabric.ITextOptions = {
        fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 14,
        fill: '#333',
        fontWeight: 'bold',
      };

      // 焦距
      const FocalLengthText = new fabric.IText(
        `${exifInfo?.FocalLength}mm | ` || '',
        rightGroupStyle
      );
      FocalLengthText.left = 0;

      // 光圈
      const FNumberText = new fabric.IText(
        `f/${exifInfo?.FNumber} | ` || '',
        rightGroupStyle
      );
      FNumberText.left = Math.floor(
        FocalLengthText.left! + FocalLengthText.width!
      );

      // 快门
      const ExposureTimeText = new fabric.IText(
        `1/${Math.floor(
          1 / (exifInfo?.ExposureTime! as number)
        ).toString()}s | ` || '',
        rightGroupStyle
      );
      ExposureTimeText.left = Math.floor(
        FNumberText.left! + FNumberText.width!
      );

      // ISO
      const ISOText = new fabric.IText(
        `ISO${exifInfo?.ISO}` || '',
        rightGroupStyle
      );
      ISOText.left = Math.floor(
        ExposureTimeText.left! + ExposureTimeText.width!
      );

      const rightGroup = new fabric.Group([
        ExposureTimeText,
        FNumberText,
        FocalLengthText,
        ISOText,
      ]);
      rightGroup.top = Math.floor((LOGOHEIGHT - rightGroup.height!) / 2);
      rightGroup.left = Math.floor(
        logoCanvas.current?.width! - rightGroup.width! - 12
      );
      rightGroup.selectable = true;
      logoCanvas.current?.add(rightGroup);
    };

    useImperativeHandle(ref, () => ({
      exportImageUrl,
    }));

    const exportImageUrl = () => {
      downloadCanvas.current?.clear();
      downloadCanvas.current!.backgroundColor! = '#fff';
      const mainCanvasObjects = mainCanvas.current?.getObjects()!;
      const logoCanvasObjects = logoCanvas.current?.getObjects()!;
      // const logoHeight = Math.floor(
      //   LOGOHEIGHT * (mainCanvasObjects[0].width! / MAXWIDTH)
      // );
      const width = mainCanvas.current?.width!;
      const height = mainCanvas.current?.height! + logoCanvas.current?.height!;
      // const width = mainCanvasObjects[0].width!;
      // const height = mainCanvasObjects[0].height! + logoHeight;
      downloadCanvas.current?.setDimensions({ width, height });

      // mainCanvasObjects[0].scale(1);
      // downloadCanvas.current?.add(mainCanvasObjects[0]);
      mainCanvasObjects.forEach((obj) => {
        downloadCanvas.current?.add(obj);
      });
      logoCanvasObjects.forEach((obj) => {
        obj.top! += mainCanvas.current?.height!;
        downloadCanvas.current?.add(obj);
      });
      downloadCanvas.current?.renderAll();
      console.log(11111);
      const imageData = downloadCanvas.current?.toDataURL({
        format: 'png',
        // 质量
        quality: 1,
        // 分辨率倍数
        multiplier: Math.max(mainCanvasObjects[0].width! / MAXWIDTH, 1),
      })!;
      return imageData;
    };

    return (
      <div className="bg-white">
        <canvas id="mainCanvas" width={MAXWIDTH} height={300}></canvas>
        <canvas id="logoCanvas" width={MAXWIDTH} height={LOGOHEIGHT}></canvas>
        <div className="hidden">
          <canvas id="downloadCanvas"></canvas>
        </div>
      </div>
    );
  }
);
export default EditComponent;
