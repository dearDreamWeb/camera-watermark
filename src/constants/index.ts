import canonLogo from '@/assets/images/canon.png';
import fujifilmLogo from '@/assets/images/fujifilm.png'; // 富士
import nikonLogo from '@/assets/images/nikon.png';
import panasonicLogo from '@/assets/images/panasonic.png'; // 松下
import sonyLogo from '@/assets/images/sony.png';
import xiaomiLogo from '@/assets/images/xiaomi.png';
import huaweiLogo from '@/assets/images/huawei.png';
import iphoneLogo from '@/assets/images/iphone.png';
import redmiLogo from '@/assets/images/redmi.png';
import oppoLogo from '@/assets/images/oppo.png';
import vivoLogo from '@/assets/images/vivo.png';
import honorLogo from '@/assets/images/honor.png';
import oneplusLogo from '@/assets/images/oneplus.png';
// import vivoLogo from '@/assets/images/vivo.png';

export const logoMap: Record<string, string> = {
  canon: canonLogo,
  fujifilm: fujifilmLogo,
  nikon: nikonLogo,
  panasonic: panasonicLogo,
  sony: sonyLogo,
};

export const threeLogoMap: Record<string, string> = {
  xiaomi: xiaomiLogo,
  huawei: huaweiLogo,
  iphone: iphoneLogo,
  redmi: redmiLogo,
  oppo: oppoLogo,
  vivo: vivoLogo,
  honor: honorLogo,
  oneplus: oneplusLogo,
};

export const logoNameMap: Record<string, string> = {
  canon: '佳能',
  fujifilm: '富士',
  nikon: '尼康',
  panasonic: '哈苏',
  sony: '索尼',
  xiaomi: '小米',
  huawei: '华为',
  iphone: '苹果',
  redmi: '红米',
  oppo: 'OPPO',
  vivo: 'VIVO',
  honor: '荣耀',
  oneplus: '一加',
};

export const getLogoName = (make: string) => {
  const list = Object.keys({ ...logoNameMap, ...threeLogoMap });
  const key = list.find((item) => make.includes(item));
  return key || '';
};

export const getLogo = (make: string) => {
  const list = Object.keys({ ...logoMap, ...threeLogoMap });
  const key = list.find((item) => make.includes(item));
  return key || '';
};
