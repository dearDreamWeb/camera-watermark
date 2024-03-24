import canonLogo from '@/assets/images/canon.png';
import fujifilmLogo from '@/assets/images/fujifilm.png'; // 富士
import nikonLogo from '@/assets/images/nikon.png';
import panasonicLogo from '@/assets/images/panasonic.png'; // 松下
import sonyLogo from '@/assets/images/sony.png';

export const logoMap: Record<string, string> = {
  canon: canonLogo,
  fujifilm: fujifilmLogo,
  nikon: nikonLogo,
  panasonic: panasonicLogo,
  sony: sonyLogo,
};

export const getLogo = (make: string) => {
  const list = Object.keys(logoMap);
  const key = list.find((item) => make.includes(item));
  return key || '';
};
