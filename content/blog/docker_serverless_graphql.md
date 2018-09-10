---
title: Docker, Serverless, GraphQL
date: '2018-09-10'
categories:
  - Blog
tags:
  - Markdown
---

最近被 Backend、DevOps 的一些新技术 / 概念完全震撼到了。

## Docker

早在前几年，我就开始使用 Docker 了。通过 Docker 为公司搭建 Maven 和 Jenkins 服务，然后构建用于编译 Android 项目的 Docker Image 给 Jenkins 用。

对于曾经尝试过 Deployment 地狱的人，Docker 的便捷让我当初对它的印象十分好。

而今年，借助 Docker Compose，我更是很轻松地在我的服务器上成功尝试搭建了一系列工具。仅仅是写写 YAML 配置，就可以轻松部署到任意服务器上，这得有多爽。甚至还包括以下一些自动化的事情：

- 通过 [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) 自动为其它 Docker 服务配置 Nginx 代理；
- 通过 [jrcs/letsencrypt-nginx-proxy-companion](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion) 自动创建 Let's Encrypt 证书并配置，轻松支持 Https。

如果是在远古时代，对一个非专业 DevOps 工程师而言，即使不考虑系统和软件之间的兼容问题，要手动完成上述的所有部署操作也是十分麻烦的。要是遇到要把所有服务迁移或复制到其他机器上这种事情，估计得抓狂。

一起来看看我的 Docker Compose YAML：

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

这简直是一个 NoOps 的时代，请不要再去手工部署或写兼容性差的 Deploy 脚本了。你应该拥抱 Docker / 容器技术。

## Serverless

Docker 的火热更是推动了一些其他技术的发展。

AWS 在 2014 年底发布了新服务 Lambda，利用 Docker 来执行函数，直接把云计算的最小单位缩小到了函数级别上！从此开始 Serverless 的概念开始火热起来。

前几年刚接触 BaaS 已经让我有些小惊喜了，通过 BaaS，Frontend 开发已经可以自己低成本地去构造轻量级的后端服务。而今年刚接触到 Serverless 更让我震撼，它让开发者能用比以前购买服务器低很多倍的成本来开发一个 Scalable 的后端服务。

成本低、Scalable、NoOps。开发者可以花更多精力关注业务，所有硬件、架构、部署相关的细节都被隐藏了，你不用关心怎么组织代码能让你的服务伸缩性更好，也不用关心怎么部署怎么负载均衡才能扛住新一轮的流量增长。

Serverless 这套东西我目前还在尝试，希望之后能把更多的经验记录下来。

## GraphQL

另外一个我想讲的是 GraphQL。这是一个我认为会对传统 C/S 开发产生变革性作用的技术。

使用 Http 协议，通过 Http Method 加上 URL Path 来构造查询、修改数据的请求，然后响应到服务器。也就是所谓的 Http Api。

这种通讯设计实在太操蛋了，即使遵循 Restful 风格设计，也会遇到很多需要前后端磨合 / 不断沟通的问题。而 Api 版本迭代、兼容的问题也会让人抓狂。

在后端开发中，会有很大一部分时间花在接口设计和维护上。而 GraphQL 可以帮你释放这部分时间，你可以不用再面向接口开发了，可以更关注业务模型、数据库设计，需要查询或修改什么数据让前端自己去描述吧。

顺便推荐下 [Prisma](https://www.prisma.io/) ，它能帮你快速在已有数据库上搭建 GraphQL 服务。目前我在尝试把它同时搭在某个 MySQL 和 MongoDB 上面。

## 结语

都是一些零碎、微小的经验。对于「精益创业」的中小型团队，其实可以考虑下这些新兴的技术。
