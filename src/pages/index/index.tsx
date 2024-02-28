import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { downloadFile, loadImage } from '@/utils';
import exifr from 'exifr';
import EditComponent, {
  ForWardRefHandler,
} from '@/components/editComponent/editComponent';

const Index = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<ForWardRefHandler>(null);
  const [imgInfo, setImgInfo] = useState<{
    file: File | null;
    exifInfo: any;
    imgUrl: string;
  }>({
    file: null,
    exifInfo: {},
    imgUrl: '',
  });

  useEffect(() => {
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
      // console.log('---exifs', exifs);
      setImgInfo({
        file,
        exifInfo: { ...exifs[0]! },
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

  const downloadHandler = () => {
    const downloadImageData = editRef.current?.exportImageUrl()!;
    // return;
    // const downloadLink = document.createElement('a');
    // downloadLink.href = downloadImageData;
    // downloadLink.download = `${imgInfo.file?.name}_${+new Date()}.png`;
    // downloadLink.click();
    // console.log(222222);
    downloadFile(downloadImageData, `${imgInfo.file?.name}_${+new Date()}.png`);
  };

  return (
    <div className="flex">
      <div className="flex flex-col justify-center mr-8">
        <input type="file" ref={fileRef} accept="image/*" className="hidden" />
        <button className="btn btn-outline" onClick={uploadImg}>
          上传图片
        </button>
        <button
          className="mt-8 btn btn-outline btn-success"
          onClick={downloadHandler}
        >
          下载
        </button>
      </div>
      <EditComponent
        ref={editRef}
        file={imgInfo.file}
        exifInfo={imgInfo.exifInfo}
        imgUrl={imgInfo.imgUrl}
      />
    </div>
  );
};

export default Index;
