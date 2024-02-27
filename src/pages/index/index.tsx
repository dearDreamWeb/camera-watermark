import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { loadImage } from '@/utils';
import exifr from 'exifr';
import canonLogo from '@/assets/images/canon.png';
import fujifilmLogo from '@/assets/images/fujifilm.png'; // 富士
import nikonLogo from '@/assets/images/nikon.png';
import panasonicLogo from '@/assets/images/panasonic.png'; // 松下
import sonyLogo from '@/assets/images/sony.png';

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
  const canvas = useRef<fabric.Canvas>();
  const logoCanvas = useRef<fabric.Canvas>();
  const [imgInfo, setImgInfo] = useState<{ file: File | null; exifInfo: any }>({
    file: null,
    exifInfo: {},
  });

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas('mainCanvas');
    const fabricLogoCanvas = new fabric.Canvas('logoCanvas');
    canvas.current = fabricCanvas;
    logoCanvas.current = fabricLogoCanvas;
    if (!fileRef.current) {
      return;
    }

    fileRef.current.addEventListener('change', imgChange);
    return () => {
      fileRef.current?.removeEventListener('change', imgChange);
    };
  }, []);

  const imgChange = async () => {
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
      canvas.current!.setDimensions({ width: newWidth, height: newHeight });
      logoCanvas.current!.setDimensions({
        width: newWidth,
        height: LOGOHEIGHT,
      });
      console.log('img', file, img);
      img.selectable = false;
      canvas.current!.add(img);

      let files = Array.from(fileRef.current!.files!);
      let exifs = await Promise.all(
        files.map((file) => exifr.parse(file, true))
      );
      console.log('---exifs', exifs);
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
    console.log(111, imgInfo.exifInfo);
    if (
      !imgInfo.exifInfo?.Make ||
      !logoMap[(imgInfo.exifInfo?.Make || '').toLocaleLowerCase()]
    ) {
      return;
    }
    console.log('imgInfo.exifInfo', imgInfo.exifInfo);
    // const logoImg = await loadImage(
    //   logoMap[(imgInfo.exifInfo?.Make || '').toLocaleLowerCase()]
    // );
    // logoImg.originX = 'center';
    // logoImg.originY = 'center';
    // logoImg.scale(0.2);
    // logoImg.top = LOGOHEIGHT / 2;
    // logoImg.left = Math.floor((logoImg.width! * logoImg.scaleX!) / 2);
    // logoCanvas.current?.add(logoImg);

    const modelText = new fabric.Text(imgInfo.exifInfo?.Model || '', {
      fontSize: 20,
      fill: '#333',
      fontWeight: 'bold',
    });
    modelText.left = 0;
    modelText.top = 0;

    // logoCanvas.current?.add(modelText);

    const LensModelText = new fabric.Text(imgInfo.exifInfo?.LensModel || '', {
      fontSize: 16,
      fill: '#666',
      fontWeight: 'bold',
    });
    LensModelText.left = modelText.left;
    LensModelText.top = modelText.top + modelText.height! + 8;
    // logoCanvas.current?.add(LensModelText);
    const leftGroup = new fabric.Group([modelText, LensModelText], {
      left: 20,
    });
    leftGroup.top = (LOGOHEIGHT - leftGroup.height!) / 2;
    logoCanvas.current?.add(leftGroup);
  };

  const uploadImg = () => {
    if (!fileRef.current) {
      return;
    }
    fileRef.current?.click();
  };

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" />
      <div className="flex items-center">
        <button className="btn btn-outline" onClick={uploadImg}>
          上传图片
        </button>
      </div>
      <div className="bg-white">
        <canvas id="mainCanvas" width={MAXWIDTH} height={300}></canvas>
        <canvas id="logoCanvas" width={MAXWIDTH} height={LOGOHEIGHT}></canvas>
      </div>
    </div>
  );
};

export default Index;
