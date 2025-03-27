import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { fabric } from 'fabric';
import { clonePromise, loadImage } from '@/utils';
import {
  initAligningGuidelines,
  initCenteringGuidelines,
} from '@/utils/fabricPlugins';
import { getLogo, logoMap, threeLogoMap } from '@/constants';
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

const EditComponentBlur = forwardRef<ForWardRefHandler, EditComponentProps>(
  (props, ref) => {
    const { file, exifInfo, imgUrl, onPreviewImg } = props;
    const mainCanvas = useRef<fabric.Canvas>();
    const logoCanvas = useRef<fabric.Canvas>();
    const downloadCanvas = useRef<fabric.Canvas>();
    const [exifData, setExifData] = useState(exifInfo);
    const cacheImgUrl = useRef('');
    const [previewImg, setPreviewImg] = useState('');

    useEffect(() => {
      setExifData({ ...exifInfo });
    }, [exifInfo]);

    useEffect(() => {
      const fabricCanvas = new fabric.Canvas('mainCanvas');
      const fabricLogoCanvas = new fabric.Canvas('logoCanvas');
      const fabricDownloadCanvas = new fabric.Canvas('downloadCanvas');
      mainCanvas.current = fabricCanvas;
      logoCanvas.current = fabricLogoCanvas;
      if (exifData?.hiddenBottomInfo) {
        // TO DO dom节点删不掉，要处理一下
        logoCanvas.current.dispose();
        initAligningGuidelines(fabricCanvas);
        initCenteringGuidelines(fabricCanvas);
      } else {
        initAligningGuidelines(fabricLogoCanvas);
        initCenteringGuidelines(fabricLogoCanvas);
      }
      downloadCanvas.current = fabricDownloadCanvas;
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
        const imgUpper = await loadImage(imgUrl);

        cacheImgUrl.current = imgUrl;

        if (img.width! > MAXWIDTH || img.height! > MAXHEIGHT) {
          const scaleFactor = Math.min(
            MAXWIDTH / img.width!,
            MAXHEIGHT / img.height!
          );
          img.scale(
            scaleFactor % 1 === 0 ? scaleFactor : Number(scaleFactor.toFixed(2))
          );
          imgUpper.scale(
            (scaleFactor % 1 === 0
              ? scaleFactor
              : Number(scaleFactor.toFixed(2))) * 0.9
          );
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
        imgUpper.selectable = false;
        fabric.textureSize = Math.max(img.width!, img.height!);
        img.objectCaching = true;
        img.filters = [
          new fabric.Image.filters.Blur({
            blur: (exifData?.BgBlur || 5) * 0.1,
          }),
        ];
        img.applyFilters();
        mainCanvas.current?.clear();
        mainCanvas.current!.add(img);

        // 定义阴影
        const shadow = new fabric.Shadow({
          color: 'rgba(0,0,0,0.8)',
          blur: (exifData?.ShadowBlur || 5) * 20,
          offsetX: 0,
          offsetY: 0,
        });
        imgUpper.left =
          (mainCanvas.current!.width! - imgUpper.width! * imgUpper.scaleX!) / 2;
        imgUpper.top = exifData?.hiddenBottomInfo
          ? mainCanvas.current!.height! -
            imgUpper.height! * imgUpper.scaleY! -
            LOGOHEIGHT
          : (mainCanvas.current!.height! -
              imgUpper.height! * imgUpper.scaleY!) /
            2;

        imgUpper.set({ shadow, objectCaching: true });
        mainCanvas.current!.add(imgUpper);
        mainCanvas.current?.renderAll();
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
      if (
        !exifData?.Make ||
        !getLogo((exifData?.Make || '').toLocaleLowerCase())
      ) {
        return;
      }
      // console.log('exifData', exifData);

      const fontColor = exifData?.hiddenBottomInfo ? '#fff' : '#333';
      const subFontColor = exifData?.hiddenBottomInfo ? '#fff' : '#666';

      if (!exifData?.hiddenLeftInfo) {
        // 相机
        const modelText = new fabric.IText(exifData?.Model || '', {
          fontFamily: exifInfo.FontFamily,
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 20 : 16,
          fill: fontColor,
          fontWeight: 'bold',
        });
        modelText.left = 0;
        modelText.top = 0;

        // 镜头
        const LensModelText = new fabric.IText(exifData?.LensModel || '', {
          fontFamily: exifInfo.FontFamily,
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 12,
          fill: subFontColor,
          fontWeight: 'bold',
        });
        LensModelText.left = modelText.left;
        LensModelText.top = Math.floor(modelText.top + modelText.height! + 8);

        const leftGroup = new fabric.Group([modelText, LensModelText], {
          left: 12,
          customType: 'leftGroup',
        } as any);
        leftGroup.set({
          lockRotation: true,
          top: Math.floor((LOGOHEIGHT - leftGroup.height!) / 2),
        });

        if (exifData?.hiddenBottomInfo) {
          leftGroup.set({
            left: Math.floor(mainCanvas.current?.width! * 0.1) + 12,
            top: Math.floor(
              mainCanvas.current?.height! -
                LOGOHEIGHT +
                (LOGOHEIGHT - leftGroup.height!) / 2
            ),
          });

          mainCanvas.current?.add(leftGroup);
        } else {
          logoCanvas.current?.add(leftGroup);
        }
      }

      const logoImg = await loadImage(
        { ...logoMap, ...threeLogoMap }[
          getLogo((exifData?.Make || '').toLocaleLowerCase())
        ]
      );

      (logoImg as any).customType = 'logoImg';

      logoImg.scale(0.15);
      // console.log('logoImg', logoImg);
      logoImg.set({
        selectable: true,
        lockRotation: true,
        top: Math.floor((LOGOHEIGHT - logoImg.height! * logoImg.scaleY!) / 2),
        left: Math.floor(
          (logoCanvas.current?.width! - logoImg.width! * logoImg.scaleX!) / 2
        ),
      });
      if (exifData?.hiddenBottomInfo) {
        logoImg.set({
          top: Math.floor(
            mainCanvas.current?.height! -
              LOGOHEIGHT +
              (LOGOHEIGHT - logoImg.height! * logoImg.scaleY!) / 2
          ),
          left: Math.floor(
            (mainCanvas.current?.width! - logoImg.width! * logoImg.scaleX!) / 2
          ),
        });
        mainCanvas.current?.add(logoImg);
      } else {
        logoCanvas.current?.add(logoImg);
      }

      if (!exifData?.hiddenRightInfo) {
        const rightGroupStyle: fabric.ITextOptions = {
          fontFamily: exifInfo.FontFamily,
          fontSize: mainCanvas.current?.width! >= MAXWIDTH ? 16 : 14,
          fill: fontColor,
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
        rightGroup.set({
          lockRotation: true,
          top: Math.floor((LOGOHEIGHT - rightGroup.height!) / 2),
          left: Math.floor(logoCanvas.current?.width! - rightGroup.width! - 12),
        });

        if (exifData?.hiddenBottomInfo) {
          rightGroup.set({
            top: Math.floor(
              mainCanvas.current?.height! -
                LOGOHEIGHT +
                (LOGOHEIGHT - rightGroup.height!) / 2
            ),
            left: Math.floor(
              mainCanvas.current?.width! * 0.9 - rightGroup.width! - 12
            ),
          });
          mainCanvas.current?.add(rightGroup);
        } else {
          logoCanvas.current?.add(rightGroup);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      exportImageUrl,
    }));

    const exportImageUrl = async (
      params: ExportImageUrlParams = {}
    ): Promise<string> => {
      downloadCanvas.current?.clear();
      downloadCanvas.current!.backgroundColor! = '#fff';
      const width = mainCanvas.current?.width!;
      const height =
        mainCanvas.current?.height! +
        (exifData?.hiddenBottomInfo ? 0 : logoCanvas.current?.height!);
      downloadCanvas.current?.setDimensions({ width, height });

      const mainCanvasObjects = await (Promise.all(
        mainCanvas.current!.getObjects()!.map((item) => clonePromise(item))
      ) as Promise<fabric.Object[]>);

      mainCanvasObjects.forEach((obj) => {
        downloadCanvas.current?.add(obj);
      });

      if (!exifData?.hiddenBottomInfo) {
        const logoCanvasObjects = await (Promise.all(
          logoCanvas.current!.getObjects()!.map((item) => clonePromise(item))
        ) as Promise<fabric.Object[]>);
        logoCanvasObjects.forEach((obj) => {
          obj.top! += mainCanvas.current?.height!;
          downloadCanvas.current?.add(obj);
        });
      }

      downloadCanvas.current?.renderAll();
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

          <canvas
            id="logoCanvas"
            className={exifData?.hiddenBottomInfo ? 'hidden' : ''}
            width={MAXWIDTH}
            height={LOGOHEIGHT}
          ></canvas>
          <div className="hidden">
            <canvas id="downloadCanvas"></canvas>
          </div>
        </div>
      </div>
    );
  }
);
export default memo(EditComponentBlur);
