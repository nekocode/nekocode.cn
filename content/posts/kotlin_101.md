---
title: Kotlin 101
date: '2018-12-16'
categories:
  - Blog
tags:
  - Markdown
---

## Kotlin 简介

2011 年，作为全球最先进 IDE 开发商之一的 JetBrains 揭露了一项正处于开发中的编程语言 —— Kotlin。它是一门跑在 JVM 上，和 Java 间具有高互操作性的全新语言。JetBrains 通过多年来和各种编程语言打交道的经验，为 Kotlin 整合了多项现代编程语言特性。

2017 年，Google 在 I/O 大会上宣布将 Kotlin 作为 Android 开发的官方支持语言。彼时，Kotlin 的开发者社区开始了爆炸性的增长，而 Netflix、Pinterest、Trello、Kickstarter 等知名公司也早已开始使用 Kotlin。

2018 年，目前 Kotlin 1.3 正式版本已经发布，更多的语言特性得到了支持。而随着官方提供了更多的编译后端，也让 Kotlin 摆脱了 JVM 的束缚，使用 Kotlin 编写的代码可以编译成机器码甚至 JavaScript 而跑在不同的运行环境中。另外，根据 Google 官方的调查，目前已有 40% 的 Android 开发者选择使用 Kotlin 进行编程工作，国内抖音、网易有道词典、大众点评、知乎等大量应用也开始引入 Kotlin。

## 使用 Kotlin 有什么好处？

既然 Google 已经宣布 Kotlin 成为 Android 开发的官方支持语言，也说明了至少在 Android 开发上使用 Kotlin 目前已经毫无障碍了。那么作为 Android 开发者，对比 Java 而言，使用 Kotlin 语言能获得什么好处呢？

第一点，使用 Kotlin 能够让我们的代码变得更简洁。我们都知道 Java 以它语法的严谨性而著名，它支撑起了世界上各种大型、复杂的计算机软件。然而 ，它的语法是有历史包袱而且略显啰嗦的，对比更灵活的现代语言，使用 Java 来实现同样的逻辑通常需要写更多的代码。而没有历史包袱的 Kotlin 则吸取了现代语言各种灵活简洁的语法，让开发者在 JVM 上也能写出简洁的代码：

```kotlin
// Java
final ArrayList<String> a = new ArrayList<>();
// Kotlin
val a = ArrayList<String>()

// Java
public String b(String c) {
    return "Test: " + c.substring(2);
}
// Kotlin
fun b(c: String) = "Test: ${c.substring(2)}";
```

除了语法上的各种简便，Kotlin 的标准库也提供了很多实用的方法来精简你的代码，例如针对开发中最常用的「集合」，Kotlin 提供了封装让你可以轻松创建集合类、使用和 Java Stream 相似但更丰富的接口来操作集合：

```kotlin
// 创建包含元素 1、3、5、7 的 ArrayList
arrayListOf(1, 3, 5, 7)
        // 过滤出集合中大于 3 的元素
        .filter { it > 3 }
        // 转换成字符串
        .map { "$it, " }
        // 循环输出
        .forEach { println(it) }
```

更多 Kotlin 比 Java 语法更精简的例子可以查看 [From Java to Kotlin](https://fabiomsr.github.io/from-java-to-kotlin/index.html) 。

第二点，使用 Kotlin 能让你的程序更安全。Java 工程师最常见陷阱之一就是访问了空的引用而导致空指针异常，而 Java 在语法上无法描述某个引用是否可空，所以开发者要背负起更多的心智负担而不得不经常进行判空操作。虽然目前可以通过 Annotation + IDE 提示的方式来一定程度上减轻这个负担，但这并不是一个强约束，在 IDE 上的提示是可被忽略的。

而 Kotlin 在语法上对此进行了强约束。在 Kotlin 中定义某个引用时必须描述其是否为可空类型，对于可空类型引用的不安全访问会在编译期报错：

```kotlin
// 不可空类型，可以直接访问
val a: String = ""
a.substring(2)

// 可空类型
val b: String? = null
b.substring(2) // 不安全访问，编译报错
```

这有利于在运行前察觉并处理可能的空指针异常。而且 Kotlin 还提供了 `?.`、`?:`、类型自动转换等便捷的语法来辅助处理可空类型：

```kotlin
val b: String? = null
b?.substring(2) // 当 b 不为空时才调用 substring()
if (b is String) {
    b.substring(2) // 自动把 b 转换成不可空类型
}
val c = b ?: "" // 如果 b 为空的话，则返回 ?: 操作符右边的值
```

以上两点是 Kotlin 能给大多数 Java 开发者带来的直接好处。但 Kotlin 能给开发者带来的也不仅仅只有这些，它有着完美的 IDE 支持（这也正是 JetBrains 的强处），它与 Java 之间的高互操作性让你可以轻松使用 Java 生态中丰富的库，而它对各种现代语言新特性（例如协程、函数式编程）的支持，能让你在面对不同的计算机问题时有更多不同的思考和解决方式。

## 必须知道的一些缺点

我们要知道，任何编程语言在设计时都需要做各种取舍。Kotlin 在提供高灵活性的背后也需要开发者付出一定的代价：

* 语法糖过多，加重开发者心智负担；
* 部分语法糖，例如 Extensions，会破坏代码的可阅读性；
* 灵活性过高，不同的开发者容易产生不同的表达偏好；
* 过度依赖 IDE，脱离 IDE 可能让代码难以阅读和维护。

实际上这也是大多数语法灵活、语法糖多的语言的共同问题。但我们不必过于担心，通过使用强大的 IDE 和建立代码规范这些问题都能被解决。作为开发者，我们应该把精力放在用更少的代码、更快、更方便地描述出我们想要的「逻辑」上，其他的负担都交给编译器或 IDE 吧，这也正是高阶编程语言诞生的初衷。

## 作为 Android 开发者是否应该学习 Kotlin？

总所周知，由于 Google 和 Oracle 之间的各种政治斗争，导致 Android 开发者一直以来只能用上阉割版的 Java。大部分开发者甚至是最近几年才开始用上、甚至开始知道 Lambda 表达式，而像 Stream 之类的工具更是无人知晓。虽然期间有传闻过要支持 Go 和 Dart 语言，但很快也都音讯全无了。

而 Kotlin 的出现正好弥补了 Android 开发生态中一块巨大的短板 —— 落后的开发语言。而且，Kotlin 和 Java 十分相似（甚至很多人把它认为是 Java 的增强版），所以从 Java 过渡到 Kotlin 的门槛比起其他语言来说相对更低。而基于 JVM 又让 Kotlin 的代码可以很轻松地运行在 Android 平台上。这么看来，Kotlin 确实比起 Google 自己的 Go 和 Dart 来说更适合作为 Android 平台的开发语言，也难怪 Google 最终敲定 Kotlin。

纵观未来，随着 Google 和 JetBrains 深度的合作，Kotlin 也肯定会成为 Android 开发生态中最先进的工具之一。目前通过 Kotlin Android Extensions 已经可以很方便地在 Activity 中直接通过 Id 名来直接访问对应的 View：

```kotlin
import kotlinx.android.synthetic.main.activity_main.*

// 设置 id 为 helloTextView 的 TextView 的文本
helloTextView.text = "Hello World!"
```

而 Google 官方推出的 [KTX 库](https://developer.android.com/kotlin/ktx) 更是让开发者能够更方便地使用 Kotlin 来开发 Android 应用：

```kotlin
// 使用 KTX 前
view.viewTreeObserver.addOnPreDrawListener(
    object : ViewTreeObserver.OnPreDrawListener {
        override fun onPreDraw(): Boolean {
            viewTreeObserver.removeOnPreDrawListener(this)
            actionToBeTriggered()
            return true
        }
    }
)

// 使用 KTX 后
view.doOnPreDraw {
     actionToBeTriggered()
}
```

另外一个好消息是，今年 11 月刚发布的 Gradle 5.0 也宣布支持了 Kotlin DSL，这意味着我们甚至可以用 Kotlin 来写我们的构建脚本了：

```gradle
android {
    compileSdkVersion(27)
    defaultConfig {
        applicationId = "com.test.app"
        minSdkVersion(15)
        targetSdkVersion(27)
        versionCode = 1
        versionName = "1.0"
    }
}
```

所以从各种迹象来看，答案其实已经很明显了。Kotlin 的诞生以及被 Google 的钦点，对一直以来被语言限制生产力的 Android 开发者们而言意义非凡。而就 Google 和 JetBrains 的影响力来看，未来几年 Kotlin Android 开发者的数量将呈爆炸式增长，市场对于 Kotlin 工程师的需求也将会不断增加。所以，学习 Kotlin 不但能让你接触到更先进的工具、思想，也肯定能让你在人才市场上更具竞争力。

事实上，根据 Github 今年发表的 [Octoverse 报告](https://octoverse.github.com/projects#languages) ，Kotlin 已经成为增长速度最快的语言。

## 先尝试一下吧

如果你已经对 Kotlin 产生兴趣，可以先通过官方的 [Playground](https://play.kotlinlang.org/) 来在线尝试下 Kotlin 的语法。它还包括一些列用于演示各种语法的实例，以及一个完整的语法课程。

如果你想在本地创建一个全新的使用 Kotlin 编写的 Android 应用项目，参照官方文档中的 [Getting started with Android and Kotlin](https://kotlinlang.org/docs/tutorials/kotlin-android.html) 来进行即可，目前 Android Studio 已经完全支持 Kotlin 语言。

而如果你想在一个使用 Java 的 Android 应用项目中同时使用 Kotlin，也是完全没问题的。通过上一个链接的教程引入 Kotlin Gradle Plugin，即可在你的源码目录下通过 Android Studio 菜单直接创建 Kt 源码文件。

有人可能会担心使用过程中遇到各种坑 。实际上，笔者在 2015 年就开始使用 Kotlin 了，期间在语法、IDE 支持、Kotlin 注解处理器上都遇到官方不少的坑，但由于官方的迭代速度足够快，很多问题很快就被修复了。另外，Kotlin 的社区也十分活跃，如果遇到坑或者问题也基本都能在上面找到回答。

而自从 16 年 Kotlin 1.0 发布之后的版本就更加稳定了，工具链、IDE 支持也都十分完善。所以大可不必担心会遇到无法解决的坑。

## 最后说点什么

有科学家表明，使用不同的自然语言会影响人的思考方式。而编程，亦是如此。激进的 Kotlin 和保守的 Java 之间的差异，肯定会给我们带来不一样的思考问题的方式。而这些不一样，也肯定会影响未来 Android 开发的新风向。

在笔者看来，Android 开发界随着 Kotlin 的出现实际上已经到了一个新的纪元，浪潮已来，为了不被浪潮所击退，请用力拥抱 Kotlin 吧！
