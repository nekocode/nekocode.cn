---
title: 被滥用的 GUI 设计模式
date: '2018-12-02'
categories:
  - Blog
tags:
  - Markdown
---

随便侃些个人对 GUI 设计模式的看法。

近些年来，随着 Fronted 技术的火热和推进，古老的（至少有几十年历史）用来解决 GUI 应用中代码组织问题的「GUI 设计模式」现在也成为了 Frontend 工程师的热门话题，MVC、MVP、MVVN 等设计模式在网路上被议论不绝。有很多工程师开始通过写博文来介绍它们、阐述自己对它们的理解，甚至在 Github 上开源了各种 GUI 设计模式的实现。

顺着这种趋势，很多 Frontend 工程师甚至把 GUI 设计模式当成一种「规范」乃至「教条」。然而糟糕的现实是，大多数人并没有正确地、细致地理解和运用 GUI 设计模式，反而因为 Tradeoff 导致它的缺点被放大。结果就是你用了大量精力、模板代码去设计它，反而让它更复杂、更难维护了。

例如，当你打开 Github 上大多数试图实现 GUI 模式的仓库时会发现，整个应用大概也就两三个页面、四五个网络接口，就可能已经创建了几十个类和接口来承载那单薄的逻辑了。举个更具体的例子，我个人曾经接触过几个用 MVP 模式设计的大型 Android 工程，在进行维护或者迭代的时候，各种带有问题的设计反而让 MVP 模式成为了累赘。

首先，工程中大多数 View 都是粒度大耦合度高的 Activity 类，而且很多 View 里为了方便，会提供 `fun updateView(user: UserModel)` 这样的方法，导致 View 和领域/业务模型直接耦合了。再者，View 和 Model 中还会包含了跳转页面、发送全局消息等各种带有「副作用」的命令，这也让面向接口编程成为了形式主义。

所以与其「舍本逐末」、「知其然而不知其所以然」，倒还不如理解问题的本质。于 GUI 设计模式而言，实际上最重要的思想是「分而治之」，通过把之前都写在一处的代码按照职能分到不同的类，来让它们实现「低耦合高内聚」。所以，我们更应该把 GUI 设计模式当成一思想而不是具体的手段，更也没必要用各种所谓的模板来解决问题，只要你能把热点、关键代码设计得足够低耦合高内聚，那么你完全可以无视所有 GUI 设计模式。

例如上面提到的 `fun updateView(user: UserModel)` 问题，实际有两种方式来让 View 和业务模型 UserModel 解耦：

```kotlin
// 方法一
interface ViewA {
    fun updateText1(text: String)
    fun updateText2(text: String)
    // ...
}
class PresenterA {
    fun onSomeEvent() {
        val userModel = Apis.requestUser()
        viewA.updateText1(userModel.name)
        viewA.updateText2(userModel.age.toString())
    }
}

// 方法二
interface ViewA {
    data class ViewAttributes(
        text1: String,
        text2: String,
        // ...
    )
    fun updateView(view: ViewAttributes)
}
class PresenterA {
    fun onSomeEvent() {
        val viewAttributes = Apis.requestUser().mapTo ViewAttributes()
        viewA.updateView(viewAttributes)
    }
}
```

方法一更倾向于用「指令」来描述 View，方法二则更倾向于用「数据」。而我个人更喜欢方法二，因为数据是运行时可处理、可持久化的，甚至可以跨进程、跨语言、乃至跨机器共享的。讲个题外话，Web Fronted 里 Redux 等状态管理工具捧起了一个很火的词「时间旅行」。在我看来核心思想其实也是把指令下沉，用数据（/状态）来描述上层逻辑，这样就可以在运行时实现逻辑可记录、可回放。

这里还有一点需要注意的，`ViewAttributes` 必须是 View 的领域模型，字段名称应当仅和 View 本身相关，而不应该和其他领域有关系。

再回到之前提到过的另外一个问题：View 和 Model 里的副作用。这个其实更容易解决，只需要把所有副作用移到外部（/调用方）就好了。例如：

```kotlin
// 有副作用
class ViewA {
    fun onTitleClick() {
        sendBroadcast("x")
    }
}

// 无副作用
class ViewA {
    fun onTitleClick() {
        caller.onTitleClick()
    }
}
class PresenterA {
    fun onTitleClick() {
        sendBroadcast("x")
    }
}
```

实际上，只懂得 OOP（面向对象编程）的工程师很容易造成前面提到的问题，因为他们习惯了依赖「外部状态」来解决问题（类的实例本身也是一个状态），但是在状态数量不断增加的情况下，状态的管理反而会成为一个新的大难题。而 OOP 提倡类的「低耦合高内聚」实际上可以看成是在解决状态管理的问题。

所以在文章的最后，我强烈推荐工程师们可以学习下 FP（函数式编程）。相对于 OOP 而言，FP 的思想则是摒弃外部状态，它实现的是粒度更小的函数级别的「低耦合高内聚」，你只需要保证你的函数是无副作用的然后管理好函数内部的状态就可以了。而维持这种编程思想，能让你轻松驾驭巨型、复杂的项目，甚至能让你的代码更容易被调试，更容易被并行执行。

对于 Android 工程师们来说，Kotlin 目前的火热正是让大家有了更了解 FP 的机会。之后我也会写些和 Kotlin、FP 有关的文章。
