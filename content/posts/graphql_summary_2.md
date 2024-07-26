---
title: GraphQL 纪要（二）
date: '2018-10-20'
categories:
  - Blog
tags:
  - Markdown
---

## Resolver 设计
我们可能会在 Resolver 里做一些耗时的操作（例如操作 Database）。为了保证我们尽可能快地响应用户的查询，我们必须保证只对那些用户需要的字段进行查询。

首先举个反例，我们定义了以下的 Schema：

```graphql
type Query {
  getPost: Post
}

type Post {
  title: String
  authorName: String
}
```

对应的 Resolver Map：

```typescript
export const resolverMap: IResolvers = {
  Query: {
    getPost: {
      resolve: () => {
        const post = queryPostDbTable();
        const author = queryUserDbTable(post.authorId);
        return {
          title: post.title,
          authorName: author.name;,
        };
      },
    },
  },
};
```

可以看到，在 getPost 字段的 Resolver 里会查询 Post 和 User 表。糟糕的是，即便用户并没有查询 authorName 字段，在获取 getPost 字段的时候也会查询 User 表。这造成了冗余的数据库操作。

为了解决这个问题，我们应当把 authorName 字段的获取放到另一个 Resolver 里。例如：

```typescript
export const resolverMap: IResolvers = {
  Query: {
    getPost: {
      resolve: () => {
        return queryPostDbTable();
      },
    },
  },
  Post: {
    authorName: {
      resolve: (post) => {
        return queryUserDbTable(post.authorId).name;
      },
    },
  },
};
```

这样可以只在用户查询到 authorName 字段时才去查询 User 表。

现在再假设一下，如果 Post 里还要返回用户头像路径的话，例如 Schema 为：

```graphql
type Post {
  title: String
  authorName: String
  authorAvatar: String
}
```

这种情况，Resolver 又不好设计了。

实际上，查询一次 User 表就可以同时获得 authorName 和 authorAvatar 字段了。但如果按照上面的设计，把这两个字段放在单独的 Resolver 里的话，那么如果用户同时查询这两个字段，会查询两次 User 表。

所以说这种扁平的 Schema 设计其实是不好，更好的设计应该是：

```graphql
type Post {
  title: String
  author: User
}

type User {
  name: String
  avatar: String
}
```

对应 Resolver Map：

```typescript
export const resolverMap: IResolvers = {
  Query: {
    getPost: {
      resolve: () => {
        return queryPostDbTable();
      },
    },
  },
  Post: {
    author: {
      resolve: (post) => {
        return queryUserDbTable(post.authorId);
      },
    },
  },
};
```

## GraphQL Over Prisma
Prisma 是基于 GraphQL 的最流行的 ORM 框架之一。我们可以使用 Prisma 提供的类似 GraphQL Schema 的语法来定义我们的所有 Model，然后 Prisma 会帮我们在数据库中建立对应的表和列，并生成一个包含增删查改这些 Model 功能的 GraphQL 服务。

简单来说，通过 Prisma，我们可以使用 GraphQL 语句来操作数据库。

而使用 Prisma 的好处是，我们可以 Prisma 上再搭建一层 GraphQL 服务来处理更高层的业务逻辑，这样很多操作 Model 的 GraphQL 请求可以直接转发给 Prisma 处理。在定义 Schema 时，很多 Type 甚至可以复用 Prisma 生成的。

有兴趣的可以看下我写的 [DEMO](https://github.com/nekocode/typescript-graphql-over-prisma)。它能帮助你快速搭建一个后端服务。

## 其它
实际上，无论在功能还是性能上，GraphQL 都是特别薄的一层，它所做的仅仅是把 GraphQL 语句解析成 AST，然后执行对应的 Resolver 而已。你甚至可以把它作为 Api Gateway，用它来包裹其它微服务的接口。

而对比过往 Rest 的接口设计，GraphQL 作为一门「语言」描述明显能力更强。你可以在一条 GraphQL 语句里按需查询你所有需要的数据，仅需要一次网络请求，而如果你的 Resolver 设计的足够好的话，不会像 Rest 接口那样可能造成冗余的查询。
