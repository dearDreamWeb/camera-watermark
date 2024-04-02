# 📷 无忧相机水印

这是一款免费开源的相机水印应用（目前只应用于相机）。通过图片的 EXIF 信息，合成出来新的相机水印图片。

**做这个项目的初心？**
身为一个摄影爱好者，有时候出图之后想要有水印功能，感觉整体会好看一些。再找过几个可以使用添加水印的应用之后发现效果不满意而且基本上都要付费。于是就有了做这个项目的想法。

# 🌐 地址

国内地址：https://camera-watermark.blogwxb.cn  
国外 vercel 地址： https://camera-watermark.vercel.app/

# 📢 声明

- 本软件只处理通过单反/微单相机设备的镜头拍摄的 JPEG、TIFF 等格式照片的 EXIF 数据进行处理
- 请上传原始数字照片，如照片被软件编辑修改或用微信 QQ 转发过，EXIF 信息会变化或丢失

# 🚀 特点

- 安全：无服务，本地处理，确保用户数据安全。
- 高效：图片可批量处理，快速导出效果图。
- 自定义：可自定义设置图片的参数数据。
- 批量导图：支持批量导入导出多张图片。
- 免费：无付费功能

# 👀 示例效果预览

示例图片都是导出压缩过的，不能代表工具做出来的图片质量。

## 未添加水印

<img width='500px' src='https://raw.githubusercontent.com/dearDreamWeb/picture/main/pic/202404022139232.jpeg'/>

## 添加水印之后

<img width='500px' src='https://raw.githubusercontent.com/dearDreamWeb/picture/main/pic/202404022139230.png'/>

# 🧰 功能

**已实现功能**

- ✅ 批量导入
- ✅ 批量导出
- ✅ 批量预览
- ✅ 单个可编辑，对水印参数可自定义配置
- ✅ 可以保存默认值，对未有 exif 信息的图片进行默认值展示

**未来排期规划的功能**

- 🔘 可以选择字体
- 🔘 全局配置自定义
- 🔘 自适应

# 🔨 技术栈

- fabric
- react
- tailwindCss
- shadcn-ui
- exif
- vite
