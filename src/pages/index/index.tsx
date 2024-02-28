import { useEffect, useRef, useState } from 'react';
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

const Index = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const mainCanvas = useRef<fabric.Canvas>();
  const logoCanvas = useRef<fabric.Canvas>();
  const downloadCanvas = useRef<fabric.Canvas>();
  const [imgInfo, setImgInfo] = useState<{ file: File | null; exifInfo: any }>({
    file: null,
    exifInfo: {},
  });

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas('mainCanvas');
    const fabricLogoCanvas = new fabric.Canvas('logoCanvas');
    const fabricDownloadCanvas = new fabric.Canvas('downloadCanvas');
    mainCanvas.current = fabricCanvas;
    logoCanvas.current = fabricLogoCanvas;
    downloadCanvas.current = fabricDownloadCanvas;
    initAligningGuidelines(fabricLogoCanvas);
    initCenteringGuidelines(fabricLogoCanvas);
    if (!fileRef.current) {
      return;
    }

    fileRef.current.addEventListener('change', imgChange);
    return () => {
      fileRef.current?.removeEventListener('change', imgChange);
    };
  }, []);

  const imgChange = async () => {
    mainCanvas.current?.clear();
    logoCanvas.current?.clear();
    const file = fileRef.current!.files![0];
    const reader = new FileReader();

    reader.onload = async function (e) {
      const img = await loadImage(e.target?.result as string);

      if (img.width! > MAXWIDTH || img.height! > MAXHEIGHT) {
        const scaleFactor = Math.min(
          MAXWIDTH / img.width!,
          MAXHEIGHT / img.height!
        );
        img.scale(scaleFactor);
      }
      const newWidth = img.width! * img.scaleX!;
      const newHeight = img.height! * img.scaleY!;
      mainCanvas.current!.setDimensions({ width: newWidth, height: newHeight });
      logoCanvas.current!.setDimensions({
        width: newWidth,
        height: LOGOHEIGHT,
      });
      console.log('img', file, img);
      img.selectable = false;
      mainCanvas.current!.add(img);

      let files = Array.from(fileRef.current!.files!);
      let exifs = await Promise.all(
        files.map((file) => exifr.parse(file, true))
      );
      // console.log('---exifs', exifs);
      setImgInfo({ file, exifInfo: exifs[0]! });
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imgInfo.file) {
      return;
    }
    renderEditContent();
  }, [imgInfo]);

  const renderEditContent = async () => {
    // console.log(111, imgInfo.exifInfo);
    if (
      !imgInfo.exifInfo?.Make ||
      !logoMap[(imgInfo.exifInfo?.Make || '').toLocaleLowerCase()]
    ) {
      return;
    }
    console.log('imgInfo.exifInfo', imgInfo.exifInfo);

    const modelText = new fabric.IText(imgInfo.exifInfo?.Model || '', {
      fontSize: mainCanvas.current?.width! >= 1200 ? 20 : 16,
      fill: '#333',
      fontWeight: 'bold',
    });
    modelText.left = 0;
    modelText.top = 0;

    const LensModelText = new fabric.IText(imgInfo.exifInfo?.LensModel || '', {
      fontSize: mainCanvas.current?.width! >= 1200 ? 16 : 14,
      fill: '#666',
      fontWeight: 'bold',
    });
    LensModelText.left = modelText.left;
    LensModelText.top = Math.floor(modelText.top + modelText.height! + 8);

    const leftGroup = new fabric.Group([modelText, LensModelText], {
      left: 20,
    });
    leftGroup.top = Math.floor((LOGOHEIGHT - leftGroup.height!) / 2);
    logoCanvas.current?.add(leftGroup);

    const logoImg = await loadImage(
      logoMap[(imgInfo.exifInfo?.Make || '').toLocaleLowerCase()]
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
      fontSize: mainCanvas.current?.width! >= 1200 ? 16 : 14,
      fill: '#333',
      fontWeight: 'bold',
    };
    // 快门
    const ExposureTimeText = new fabric.IText(
      `1/${Math.floor(
        1 / (imgInfo.exifInfo?.ExposureTime! as number)
      ).toString()}S | ` || '',
      rightGroupStyle
    );
    ExposureTimeText.left = 0;

    // 光圈
    const FNumberText = new fabric.IText(
      `f/${imgInfo.exifInfo?.FNumber} | ` || '',
      rightGroupStyle
    );
    FNumberText.left = Math.floor(
      ExposureTimeText.left! + ExposureTimeText.width!
    );

    // 焦距
    const FocalLengthText = new fabric.IText(
      `${imgInfo.exifInfo?.FocalLength}mm | ` || '',
      rightGroupStyle
    );
    // FocalLengthText
    FocalLengthText.left = Math.floor(FNumberText.left! + FNumberText.width!);

    // ISO
    const ISOText = new fabric.IText(
      `ISO ${imgInfo.exifInfo?.ISO}` || '',
      rightGroupStyle
    );
    ISOText.left = Math.floor(FocalLengthText.left! + FocalLengthText.width!);

    const rightGroup = new fabric.Group([
      ExposureTimeText,
      FNumberText,
      FocalLengthText,
      ISOText,
    ]);
    rightGroup.top = Math.floor((LOGOHEIGHT - rightGroup.height!) / 2);
    rightGroup.left = Math.floor(
      logoCanvas.current?.width! - rightGroup.width! - 20
    );
    rightGroup.selectable = true;
    logoCanvas.current?.add(rightGroup);
  };

  const uploadImg = () => {
    if (!fileRef.current) {
      return;
    }
    fileRef.current?.click();
  };

  const downloadHandler = () => {
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
    const downloadImageData = downloadCanvas.current?.toDataURL({
      format: 'png',
      // 质量
      quality: 1,
      // 分辨率倍数
      multiplier: Math.max(
        Math.ceil(mainCanvasObjects[0].width! / MAXWIDTH),
        1
      ),
    })!;
    // return;
    // const downloadLink = document.createElement('a');
    // downloadLink.href = downloadImageData;
    // downloadLink.download = `${imgInfo.file?.name}_${+new Date()}.png`;
    // downloadLink.click();
    console.log(222222);
    downloadFile(downloadImageData, `${imgInfo.file?.name}_${+new Date()}.png`);
  };

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" />
      <div className="flex items-center">
        <button className="btn btn-outline" onClick={uploadImg}>
          上传图片
        </button>
        <button
          className="ml-8 btn btn-outline btn-success"
          onClick={downloadHandler}
        >
          下载
        </button>
      </div>
      <div className="bg-white">
        <canvas id="mainCanvas" width={MAXWIDTH} height={300}></canvas>
        <canvas id="logoCanvas" width={MAXWIDTH} height={LOGOHEIGHT}></canvas>
        <div className="hidden">
          <canvas id="downloadCanvas"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Index;
