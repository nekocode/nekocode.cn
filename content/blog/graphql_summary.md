---
title: GraphQL 纪要
date: '2018-10-19'
categories:
  - Blog
tags:
  - Markdown
---

## Schema & GraphQL 语句
GraphQL 是一门查询语言，使用它可以描述你需要哪些数据。而 Schema 则是用于声明你能够查询什么样的数据。

举个例子，下面的是 Schema：

```
type Query {
  hello: String
}
```

通过以上 Schema 的声明，你可以写下这么一条 GraphQL 查询语句：

```
query {
  hello
}
```


## Schema
Schema 里主要有两个核心的概念，类型（Type）和字段（Field）。举个例子：

```
type User {
  name: String
}
```

上面定义了一个名为 User 的类型，并且这个类型里包含了一个叫做 name 的字段。
注意，字段必须声明类型，可以声明为 Int、String 这类基础类型，也可以声明为自定义的类型。另外，字段是可以包含参数的，这让它看起来有点像函数：

```
type User {
  name: String
  posts(count: Int): [Post]
}

type Post {
  title: String
}
```

例如这里 User 类型里的 posts 字段，它接受一个名为 count 的参数并返回一个 Post 类型的列表。


## Schema 里的 Query 和 Mutation 类型
在 Schema 里面有两个约定的类型：

```
type Query {
}

type Mutation {
}
```

我们假设，任何 GraphQL 语句都其实是在查询 Document 对象的子字段，而 Document 里面有且只有以下两个直接子字段：

```
type Document {
  query: Query
  mutation: Mutation
}
```

想要在 GraphQL 语句中查询其它字段，只能把要查询的字段放到 Query 和 Mutation 类型里面。例如我们想添加一个用来查询用户信息的字段，那我们可以在 Query 类型里添加一个 me 字段：

```
type Query {
  me: User
}

type User {
  name: String
}
```

那么用户就可以用下面的 GraphQL 语句来查询自己的名称了：

```
query {
  me {
    name
  }
}
```

需要注意的是，这里的 query 是字段名，返回的是一个 Query 类型。me 是 Query 类型里的字段，而 name 是 User 类型里的字段。


## Query & Mutation 的字段约定
虽然你可以在 Query 和 Mutation 类型里添加任意字段，但是根据语义，应当把不对数据造成修改的字段放在 Query 类型里，而把对数据造成修改的字段放在 Mutation 里。

可以这么理解，查询 Mutation 里的字段实际也是一次「查询」，但是这次查询会对数据造成修改。

以下是一个简单的例子：

```
type Query {
  me: User
}

type Mutation {
  changeMyName(name: String): User
}
```


## Resolver
Resolver 实际上是一个函数。当我们执行某条 GraphQL 语句时（当然，通常是在 Server 上），会通过执行对应的 Resolver 函数来获取查询的字段的。

拿第一节的例子，Schema 为：

```
type Query {
  hello: String
}
```

我们接下来实现一个用来「查询 Query 类型里字段 hello」的 Resolver。例如我们让这个字段返回 "Hello world!" 字符串：

```
export const resolverMap: IResolvers = {
  Query: {
    hello: {
      resolve: () => ("Hello world!"),
    },
  },
};
```

这里用了一个双层的 Map(/Object) 来装载所有 Resolver，实际上第一层用来索引类型，第二层用来索引类型中的字段。

而上面键 resolve 对应的函数就是 hello 这个字段的 Resolver 函数。依据 Schema 的声明它需要返回了一个字符串。

我们再来看下如果查询的字段是复杂类型的情况。假设 Schema 为：

```
type Query {
  me: User
}

type User {
  name: String
  friend: User
}
```

User 类型里的 friend 字段返回的是一个 User 类型，那么就可能出现下面这样循环嵌套的 GraphQL 语句：

```
query {
  me {
    name
    friend {
      name
      friend {
        name
      }
    }
  }
}
```

那我们怎样为这样的语句进行 Resolve 呢？

注意前面说到 Resolver 表。我们可以在表里添加 User 类型，然后为 friend 字段单独添加一个 Resolver：

```
export const resolverMap: IResolvers = {
  Query: {
    me: {
      resolve: () => ({ name: "Mark" }),
    },
  },
  User: {
    friend: {
      resolve: (parent) =>
        ({ name: (`${parent.name}'s friend`) }),
    },
  },
};
```

那么，前面的 GraphQL 语句里的三个 name 会分别返回：

```
Mark
Mark's friend
Mark's friend's friend
```

注意，这里的 Resolver 函数使用了 parent 参数，它实际上是父字段的返回值。完整的函数签名可以在 [官方文档](https://www.apollographql.com/docs/graphql-tools/resolvers#Resolver-function-signature) 这里看到。

执行整个 GraphQL 语句的逻辑就是：

* 访问到 Query 类型里的 me 字段，使用 `resolverMap["Query"]["me"]` 来获得 User 里的字段的值。
* 该次 Resolve 只返回了 name 字段的值，但是 GraphQL 语句中还查询了 friend 字段。
* friend 是 User 类型里的字段，所以继续使用 `resolverMap["User"]["friend"]` 来获取 friend 字段的返回值。
* ...

 留道思考题：如果在 `["Query"]["me"]` 这个 Resolver 里返回的是 `{ name: "Mark", friend: "Tony" }` 那最终查询结果会是什么呢？


## 总结
Schema：用于声明 GraphQL 语句能够查询什么样的数据。

GraphQL 语句：用于描述需要查询哪些数据。

Resolver：用于返回需要的数据。

