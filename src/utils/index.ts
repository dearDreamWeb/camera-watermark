import { fabric } from 'fabric';

/**图片加载 */
export const loadImage = async (url: string): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(url, (img) => {
      if (!img.width) {
        reject('load fail');
        return;
      }
      resolve(img);
    });
  });
};

/**
 * 画布为适配预览会缩小图片；导出时用该倍数可把整幅导出画布放大到接近原图像素。
 * 旧逻辑用 width/MAXWIDTH 会在竖图（宽高比小于 1）时明显偏小，因为此时限高而非限宽。
 */
export const getCanvasExportMultiplier = (objects: fabric.Object[]): number => {
  let mult = 1;
  for (const obj of objects) {
    if (obj.type !== 'image') continue;
    const img = obj as fabric.Image;
    const dw = img.getScaledWidth() || 1;
    const dh = img.getScaledHeight() || 1;
    const iw = img.width || 1;
    const ih = img.height || 1;
    mult = Math.max(mult, iw / dw, ih / dh);
  }
  return mult;
};

/**克隆 */
export const clonePromise = (fabricObject: fabric.Object) => {
  return new Promise((resolve) => {
    fabricObject.clone((cloned: fabric.Object) => resolve(cloned));
  });
};

/**
 * 将url文件下载到本地
 * @param fileUrl {String} 文件链接
 * @param fileName {String} 文件名字
 * @return void
 */
export async function downloadFile(fileUrl: string, fileName: string) {
  let blob = await getBlob(fileUrl);
  saveFile(blob, fileName);
}

export function getBlob(fileUrl: string) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    //监听进度事件
    xhr.addEventListener(
      'progress',
      function (evt) {
        if (evt.lengthComputable) {
          let percentComplete = evt.loaded / evt.total;
          // percentage是当前下载进度，可根据自己的需求自行处理
          let percentage = percentComplete * 100;
          console.log('percentage', percentage);
        }
      },
      false
    );
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
}

export function saveFile(blob: any, fileName: string) {
  // 非ie的下载
  const link = document.createElement('a');
  const body = document.querySelector('body')!;

  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;

  // fix Firefox
  link.style.display = 'none';
  body.appendChild(link);

  link.click();
  body.removeChild(link);

  window.URL.revokeObjectURL(link.href);
}

interface CreateLocalBase<T> {
  value: T;
}

export const createLocal = <T>(name: string) => {
  return {
    get() {
      const res = localStorage.getItem(`${name}`);
      try {
        let local = JSON.parse(res as string) as CreateLocalBase<T>;
        return local.value;
      } catch (e) {
        return null;
      }
    },
    set(value: T) {
      return localStorage.setItem(`${name}`, JSON.stringify({ value }));
    },
    remove() {
      return localStorage.removeItem(`${name}`);
    },
  };
};

/**数字计算保留小数点后两位 */
export const calcSizeHandler = (num: number) => {
  if (typeof num !== 'number') {
    return 0;
  }
  if (num % 1 !== 0) {
    return Number(num.toFixed(2));
  }
  return num;
};
