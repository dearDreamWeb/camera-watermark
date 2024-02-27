import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { loadImage } from '@/utils';
import exifr from 'exifr';

const Index = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [imgInfo, setImgInfo] = useState<{ file: File | null }>({ file: null });

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas('mainCanvas');
    setCanvas(fabricCanvas);
    fabricCanvas.setDimensions({ width: 800, height: 300 });

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
      let scaleFactor = 1;
      if (img.width! > 800) {
        scaleFactor = 800 / img.width!;
        img.scale(scaleFactor);
      }
      const newWidth = img.width! * scaleFactor;
      const newHeight = img.height! * scaleFactor + 30;
      canvas!.setDimensions({ width: newWidth, height: newHeight });
      setImgInfo({ file });
      console.log('img', file);
      canvas!.add(img);
    };

    let files = Array.from(fileRef.current!.files!);
    let exifs = await Promise.all(files.map((file) => exifr.parse(file, true)));
    console.log('---exifs', exifs);
    reader.readAsDataURL(file);
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
        <canvas id="mainCanvas"></canvas>
      </div>
    </div>
  );
};

export default Index;
