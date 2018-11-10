---
title: Docker, Serverless, GraphQL
date: '2018-09-10'
categories:
  - Blog
tags:
  - Markdown
---

最近被 Backend、DevOps 的一些新概念震撼到了。

## Docker

Docker 应该是目前 DevOps 界最火的工具了。

早在前几年，我就开始使用 Docker 了。通过 Docker 为公司搭建 Maven 和 Jenkins 服务，然后构建用于编译 Android 项目的 Docker Image 提供给 Jenkins 使用。

对于曾经尝试过 Deployment 地狱的人，Docker 的便捷让我对它的印象十分好。

而今年，借助 Docker Compose，我更在我的服务器上成功用几句命令就搭建了一系列工具。仅仅是写写 YAML 配置，就可以快速轻松地部署到任意服务器上，这得有多爽。甚至还包括以下一些自动化的事情：

- 通过 [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) 自动为其它 Docker 容器配置 Nginx 代理；
- 通过 [jrcs/letsencrypt-nginx-proxy-companion](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion) 自动创建 Let's Encrypt 证书并配置，轻松支持 Https。

如果是在远古时代，对一个非专业 DevOps 工程师而言，即使不考虑系统和软件之间的兼容问题，要手动完成上述的所有部署操作也是十分麻烦的。要是遇到要把所有服务迁移或复制到其他机器上这种事情，估计得抓狂。

来看看我的 Docker Compose YAML 吧：

```
Nginx-Proxy:
  image: daocloud.io/daocloud/nginx-proxy:latest
  privileged: false
  restart: always
  ports:
    - 80:80
    - 443:443
  volumes:
    - /root/nginx-proxy/certs:/etc/nginx/certs:ro
    - /root/nginx-proxy/vhost:/etc/nginx/vhost.d
    - /root/nginx-proxy/html:/usr/share/nginx/html
    - /var/run/docker.sock:/tmp/docker.sock:ro
  labels:
    com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy: 'true'
LetsEncrypt:
  image: jrcs/letsencrypt-nginx-proxy-companion
  restart: always
  volumes:
    - /root/nginx-proxy/certs:/etc/nginx/certs:rw
    - /root/nginx-proxy/vhost:/etc/nginx/vhost.d
    - /root/nginx-proxy/html:/usr/share/nginx/html
    - /var/run/docker.sock:/var/run/docker.sock:ro
Gitlab:
  image: gitlab/gitlab-ce:11.2.1-ce.0
  privileged: false
  restart: always
  ports:
    - 80
    - 443
    - 22
  volumes:
    - /root/gitlab/config:/etc/gitlab
    - /root/gitlab/logs:/var/log/gitlab
    - /root/gitlab/data:/var/opt/gitlab
  environment:
    VIRTUAL_HOST: git.nekocode.cn
    LETSENCRYPT_HOST: git.nekocode.cn
    LETSENCRYPT_EMAIL: nekocode.cn@gmail.com
    GITLAB_OMNIBUS_CONFIG: |
      gitlab_rails['smtp_enable'] = true
      gitlab_rails['smtp_address'] = "smtpdm.aliyun.com"
      gitlab_rails['smtp_port'] = 465
      gitlab_rails['smtp_user_name'] = "git@nekocode.cn"
      gitlab_rails['smtp_password'] = "xxxxxx"
      gitlab_rails['smtp_domain'] = "smtpdm.aliyun.com"
      gitlab_rails['smtp_authentication'] = "login"
      gitlab_rails['smtp_enable_starttls_auto'] = true
      gitlab_rails['smtp_tls'] = true
      gitlab_rails['gitlab_email_enabled'] = true
      gitlab_rails['gitlab_email_from'] = 'git@nekocode.cn'
      gitlab_rails['gitlab_email_display_name'] = 'noreply@nekocode.cn'
Gitlab-Runner:
  image: gitlab/gitlab-runner:latest
  container_name: gitlab-runner
  restart: always
  volumes:
    - /root/gitlab-runner/confg:/etc/gitlab-runner
    - /var/run/docker.sock:/var/run/docker.sock
Wiki:
  image: blacklabelops/confluence
  privileged: false
  restart: always
  ports:
    - 8090
    - 8091
  environment:
    VIRTUAL_HOST: wiki.nekocode.cn
    VIRTUAL_PORT: 8090
    CONFLUENCE_PROXY_NAME: wiki.nekocode.cn
    CONFLUENCE_PROXY_PORT: 443
    CONFLUENCE_PROXY_SCHEME: https
    LETSENCRYPT_HOST: wiki.nekocode.cn
    LETSENCRYPT_EMAIL: nekocode.cn@gmail.com
PostgresDB:
  image: blacklabelops/postgres
  restart: always
  ports:
    - 5432:5432
  environment:
    POSTGRES_DB: postgresdb
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: admin123
    POSTGRES_ENCODING: UTF8
```

感谢 Docker 和社区的发展，让快速轻松地部署软件成为可能。所以请不要再去手工部署或写兼容性差的 Deploy 脚本了。你需要拥抱 Docker / 容器技术。

## Serverless

Docker 的火热更是推动了一些其他技术的发展。

AWS 在 2014 年底发布了新服务 Lambda，它能借助 Docker 来执行函数，直接把云计算的最小单位缩小到了函数级别！从此，Serverless 的概念开始火热起来。

前几年刚接触 BaaS 已经让我有些小惊喜了，通过 BaaS，即使是前端开发，也可以低成本地自己去构造一个轻量级的后端服务。而今年刚接触到 Serverless 时更让我震撼，它让开发者能用比更低的成本来开发一个更 Scalable 的后端服务。

成本低、Scalable、NoOps 是 Lambda 的几个优点。开发者可以花更多精力去关注业务，而不必关心所有硬件、架构、部署相关的细节。你不用再思考使用什么框架、怎么组织代码能让你的服务 Scalability 更强，也不用关心怎么部署 / 负载均衡才能扛住新一轮的流量增长。

## GraphQL

GraphQL 是其中一个我认为会对目前 C/S 开发产生革命性作用的技术。

客户端通过服务端「预设」的 Api 来查询、修改服务端数据。这种设计实在是太死板了，即使遵循 Restful 风格设计，也会遇到很多需要前后端磨合 / 不断沟通的问题。而 Api 版本迭代、前后兼容的问题也会让人抓狂。

由于接口需要设计和维护，会消耗后端开发的很多时间。而 GraphQL 可以帮你释放这部分时间，你可以不用再面向接口开发了，可以花更多时间在业务模型、数据库设计上，需要查询或修改什么数据让前端自己去描述吧。

顺便推荐下 [Prisma](https://www.prisma.io/) ，它能帮你快速在已有数据库上搭建 GraphQL 服务。目前我在尝试把它同时搭在某个 MySQL 和 MongoDB 上面。

## 结语

记录的都是一些零碎、微小的经验。 PS，对于「精益创业」的中小型团队，这些技术好像都蛮适合的，短期来看开发快、成本低，长期来看 Scalable。
