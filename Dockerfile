# 第一阶段：构建阶段
FROM node:18.16.0-alpine AS builder

# 设置PNPM环境变量和国内镜像源
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm config set store-dir /root/.pnpm-store && \
    mkdir -p /root/.pnpm-store && chmod -R 777 /root/.pnpm-store

WORKDIR /app

# 利用缓存层安装依赖
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm,target=/root/.pnpm-store \
    pnpm fetch --prod && \
    pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN pnpm run build

# 第二阶段：Nginx准备阶段
FROM nginx:1.25.1-alpine AS nginx-base

# 删除默认配置和静态文件
RUN rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/*

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 第三阶段：生产镜像
FROM nginx-base

# 从构建阶段复制静态文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 8088

# 使用基础镜像默认CMD启动Nginx