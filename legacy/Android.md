## <a name="toc"></a>Index

- [Android](#android)
- [Java](#java)
- [Kotlin](#kotlin)
- [Articles/Others](#articlesothers)

## Android


### Context

ApplicationContext 与 ActivityContext 的区别在于：**ApplicationContext 没有 theme 信息、且不能用于 layout inflate。**

在不需要用到 ActivityContext 特性的地方（例如 Util、AsyncTask 类），应当使用 `Context.getApplicationContext()` 来将传入的 Context 转换为 ApplicationContext，以避免发生内存泄漏。


### Activity

Activity 的生命周期：`onCreate()` -> `onStart()`[可见] -> `onResume()`[获得焦点、可编辑] -> `onPause()`[失去焦点、不可编辑] -> `onStop()`[不可见] -> `onDestroy()`

只有在 *打开一个透明的 Activity* 时才会只调用 `onPause()`，因为后面的 Activity 仍然处于可见状态。打开一个 Dialog 并不会调用当前 Activity 的 `onPause()`。  
```
[打开页面]
onCreate()  -> onStart()  ->  onResume()

[当前页面按下 BACK 键]
onPause()　->　onStop()　->　onDestroy()

[当前页面按下 HOME 键]
Home 键退出：onPause()　->　onStop()
Home 键回来：onRestart() ->  onStart()　->　onResume()

[当前休眠(锁屏)/恢复]
休眠：onPause() -> onStop()
恢复：onRestart() -> onStart() -> onResume()

[旋转屏幕]
普通情况：onPause()  ->  onStop()  ->  onDestory()  ->  onCreate()  -> onStart()  ->  onResume()
设置了 android:configChanges="orientation|keyboardHidden"：只触发 onConfigurationChanged()

[来电]
来电，显示来电界面：onPause()  ->  onStop()
关闭电话界面，重新回到当前 Activity：onRestart() ->  onStart()　->　onResume()

[打开其他 Activity]
进入下一个 Activity：onPause()  ->  onStop()
从其他 Activity 返回至当前 Acitivity：onRestart() ->  onStart()　->　onResume()
```


### 保存状态

除非用户主动将 Activity 推出栈（按下回退键），否者 Activity 都会在被被系统回收前执行状态保存。

Activity 的优先级：前台 Activity > 可见但非前台 Activity > 后台 Activity。当 Activity 为 paused/stopped 时就意味着可能被系统回收。在非前台 Task 中的 Activity 更容易被回收。

要使自定义 View 能够自动保存恢复视图状态，需要在 View 初始化时调用 `setSaveEnabled(true)`，并覆写 `onSaveInstanceState()` 和 `onRestoreInstanceState()` 方法。此外要注意的是，只有当 View 具有 Id 时系统才会保存和恢复该 View 的状态。

Fragment 在发生屏幕旋转等状况后，系统会持久化它的一些视图以及数据状态。旋转后 `FragmentManager` 会反系列化旋转前持久化的信息，新建实例，并在新实例的 `onCreate()` 中返回之前储存的各种 State（`Fragment.onSaveInstanceState()` 中保存的）。而 View State 会自动传递到各个 View 的 `View.onRestoreInstanceState()` 函数中。

如果在 Fragment 中使用了 `setRetainInstance(true)`，则 Fragment 的实例会被保留下来，不重新创建，这意味着实例内的所有属性也会被保存下来（不会被重置），但是依然会重新触发 Fragment 的生命周期事件。所以通常这种状况仅适用于进行持续性后台任务的 Fragment（例如没有视图的单纯进行下载操作的 Fragment），在屏幕旋转后也不会打断正在进行的任务。要注意的是，这种情况下如果有视图的话，视图会被重新创建。

要注意的是无法对 NestedFragment 使用 `setRetainInstance(true)`，会报错。对 NestedFragment 的 `findFragmentByTag()` **必需在 ParentFragment 的 `onViewCreated()`（视图创建后）中进行，否则将返回空。** [Check about this.](https://www.google.com/?gws_rd=ssl#safe=off&q=getChildFragmentManager()+findFragmentByTag)

设置了 `setRetainInstance(true)` 后，当 Activity 重建时 Fragment 会跳过 `onCreate()` 和 `onDestory()` ：http://stackoverflow.com/questions/12640316/further-understanding-setretaininstancetrue

### Task and Back Stack

**[Google 官方文档介绍](https://developer.android.com/guide/components/tasks-and-back-stack.html)**。Task 是一个存在于 Framework 层的概念，要理解它是 **是执行特定作业时与用户交互的一系列 Activity**。它和 Application 或者 Process 不是同一样东西。Back Stack 只能进行 Push 或 Pop 操作，不能直接改变栈内元素的顺序。

查看任务栈情况可以执行命令 `adb shell dumpsys activity`。

**Activity 的 launchMode 包括：** [详情](http://droidyue.com/blog/2015/08/16/dive-into-android-activity-launchmode/)
- **standard：** 默认值。调用 startActivity() 时，不管 Activity 是否已存在都将新建实例并放到栈顶。
- **singleTop：** 栈顶复用模式。如果 Activity 已经在栈顶则只调用 `onNewIntent()` 方法传递新的 Intent，若不在栈顶的话则也会新建实例，和 standard 模式表现一致。适合搜索、外部网页浏览等场景页面（已在栈顶则不新开页面，否则新开页面）。
- **singleTask：** 栈内复用模式。栈内如果已有该 Activity 的话，则清除在它上面的所有其它 Activity（clearTop），将它变为栈顶，并只调用 `onNewIntent()` 方法。若栈内不存在的话，则新建实例。（注意栈内只能存在一个实例）
- **singleInstance：** 单实例模式。Activity 只能位于一个任务的栈内，且该 Task 始终只有该一个 Activity。

Android 5.0 之前跨应用启动 Activity 的话不会新建一个 Task(/Activity 回退栈) 来放启动的 Activity，而是把它放到当前 Task（发送 Intent 方）的栈顶。5.0 之后会 **新建一个 Task 来放新启动的 Activity**（不管是否已有旧的 Task）。

而 singleTask 模式会更复杂一些。跨应用启动 singleTask 模式的 Activity，会依据 singleTask 的模式在旧的 Task 内新建 Activity 或将已有 Activity 置顶（clearTop）。已有 Task 的情况下它是不会新建 Task 的，除非 Activity 定义了 taskAffinity 属性。
- 默认情况下，一个应用中的所有 Activity 具有相同的 taskAffinity，即应用程序的包名。
- taskAffinity 为空字符串的情况下，标明这个 Activity 不属于任何 Task。
- taskAffinity 的优先级大于 `FLAG_ACTIVITY_NEW_TASK` 标记，优先将 Activity 压入到 taskAffinity 对应的 Task，其次才是打开一个新的 Task。

*要注意，启动一个其它应用 singleTask 模式的 Activity，可能会销毁（clearTop）目标应用已有 Task 上的 Activity。*

**singleTask 和 singleInstance 的 Activity 在系统中只能存在单个实例。**

设置启动模式既可以使用 xml 属性 `android:launchMode`，也可以使用代码 `intent.addFlags()`。**区别在于限定条件不同，前者无法直接为 Activity 设置 FLAG_ACTIVITY_CLEAR_TOP 标识，而后者无法为 Activity 指定 singleInstance 模式。**

Activity 的标记位有 `FLAG_ACTIVITY_NEW_TASK`、`FLAG_ACTIVITY_SINGLE_TOP`、`FLAG_ACTIVITY_CLEAR_TOP` 等等。
`FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS`：具有这个标记的 Activity 不会出现在最近启动的 Activity 列表中，当某些情况下我们不希望用户通过历史列表回到我们的 Activity 的时候这个标记比较有用，它等同于属性设置 `android:excludeFromRecents="true"`。

从非 Activity 类型的 Context（例如 ApplicationContext、Service 等）中以 standard 模式启动新的 Activity 是不行的，因为这类 context 并没有任务栈，所以需要为待启动 Activity 指定 `FLAG_ACTIVITY_NEW_TASK` 标志位。

[Notification 中使用 TaskStackBuilder 来为实现 Activity 回退到 ParentActivity 而非 Home 页。](http://blog.csdn.net/alone_slfly/article/details/41744323)


### Note

- ViewStub 用于 **延迟解析布局**（通过 `ViewStub.inflate()` 或者 `ViewStub.setVisibility()` 控制解析时机）。Merge 用于 **减少布局层次**（不创建根容器直接 include 进某布局中）。[详情](http://droidyue.com/blog/2016/09/11/using-viewstub-in-android-to-improve-layout-performance/)
 - ViewStub 不能 include 进 Merge 布局。
 - ViewStub 内部保存了要 inflate 的 View 的弱引用，当执行 inflate 后，会在视图层级中将自身替换为要 inflate 的 View，然后释放自身。
 - Merge 只能作为根布局使用。
 - 当手动 inflate Merge 布局时，必须指定一个父 ViewGroup，并且必须设定 attachToRoot 为 true。


- `Spannable.SPAN_EXCLUSIVE_EXCLUSIVE` 表示的是 **在该 Span 前后新输入的字符** 不会继承该 Span。

- 可以创建自定义的 Span 来在文本中储存一些数据，例如：

```java
inner class CompanySpan(val company: Company) : MetricAffectingSpan() {
    override fun updateDrawState(tp: TextPaint?) {}

    override fun updateMeasureState(p: TextPaint?) {}
}
```

- 拼接 SpannableString

```java
TextUtils.concat(spanStr1, " " , spanStr2)
```

- 将 Spanned 转换为 SpannableString 使用 `TextUtils.stringOrSpannedString(text)`

- `Matrix.setRectToRect()`

```java
//TODO 放缩处理、显示操作层
eyeAdjustView.setVisibility(View.VISIBLE);
btnViewAdjust.setTag(true);

Matrix matrix = new Matrix();
float minY = Math.min(eyesInfo.p[0].y, eyesInfo.p[5].y);
float maxY = Math.max(eyesInfo.p[0].y, eyesInfo.p[5].y);
float w = eyesInfo.p[5].x - eyesInfo.p[0].x;
float minX = eyesInfo.p[0].x - w * 0.25f;
float maxX = eyesInfo.p[0].x + w * 1.25f;

//rect 范围空间不能为 0
if(minY == maxY) maxY++;
if(minX == maxX) maxX++;

RectF mTempSrc = new RectF(minX, minY, maxX, maxY);
RectF mTempDst = new RectF(0, 0, imageView.getWidth(), imageView.getHeight());
matrix.setRectToRect(mTempSrc, mTempDst, Matrix.ScaleToFit.CENTER);
imageView.setImageMatrix(matrix);
imageView.invalidate();

eyeAdjustView.setFeatures(matrix, eyesInfo, imageView);
```

- 设置 ITALIC 需要将字体的 Typeface 设置为 MONOSPACE 
- 非 GUI 的地方需要用到 Context 的地方尽量使用 ApplicationContext ，而不是传 Activity:Context，因为有可能会导致 activity 无法被回收（内存泄露）。另外要用 LayoutInflation 和 Dialog 的地方必须使用 Activity:Context。
```
// 在开发第三方工具时要用到 ApplicationContext 最好这样做
public void init(Context context) {
    context = context.getApplicationContext()
    
    // ...
}
```


- **ViewPager 不应该使用 getScrollX() 获取当前滑动的 X 坐标**，因为在 ViewPager 所在 Fragment 进行 Resume/Recreate 的时候（例如屏幕旋转），无论 currentItem 为多少，scrollX 都会被置零，所以应该通过 **OnPageChangeListener** 来计算出真实的 scrollX：
```
// ...
@Override
public void onPageScrolled(int position, float positionOffset,
        int positionOffsetPixels) {
    scrollX = position * mViewpager.getWidth() + positionOffsetPixels;
    invalidate();

    Log.e("TAG", String.format("onPageScrolled: %d, %f, %d", position, positionOffset, positionOffsetPixels));
        
    if (mViewPagerOnPageChangeListener != null) {
        mViewPagerOnPageChangeListener.onPageScrolled(position, positionOffset,
                positionOffsetPixels);
    }
}
// ...
```

- 使用 selectable（可长按复制） 的 TextView 时需要注意，它有一定几率会消耗触摸事件，如果父控件需要响应相关事件的话（例如父控件是个按钮），请把 TextView 的 **textIsSelectable** 属性设置为 false

- ~~一个令我疑惑的事情是，设置 View 的 visibility 为 INVISIBLE 的时候，View 的 Alpha 会变为 1f? 我在做 Alpha 动画的时候出现了在 alpha 变为 0，设置 View 为 INVISIBLE 时闪烁的情况。把动画顺序改为先设置 View 为 INVISIBLE 再对 View 的 alpha 值进行递减就成功避免了闪缩。~~ **[已找到解决方法](https://stackoverflow.com/questions/10756198/android-alpha-animation-alpha-value-jumps-back-to-old-value-after-animation-end)**

- **对于在列表中每个 ItemView 中都有大量 SpannableString 需要显示的情况，最好直接把 SpannableString 当成数据储存，而不是在需要显示的时候再从 String 构造为 SpannableString。**

- 可以使用 Support 库中 [`DiffUtil`](https://developer.android.com/reference/android/support/v7/util/DiffUtil.html) 来计算 Collection 的变动，并分发给 Adapter。

- 想要不使用继承在某个 View 上进行 Draw 操作的话，一个可选的方法是注入该 View 的 backgroudDrawable 或 foregroundDrawable。(理解一个概念：`Drawable` 并不是绘制结果，它是一系列的绘制过程)
```java
Drawable originalBackground = view.getBackground();

Drawable layers[];
if (originalBackground == null) {
    layers = new Drawable[] {injectedDrawable};
} else {
    layers = new Drawable[] {originalBackground, injectedDrawable};
}
LayerDrawable newBackground = new LayerDrawable(layers);

if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
    view.setBackground(newBackground);
} else {
    view.setBackgroundDrawable(newBackground);
}
```

- [改变作为 xml drawable 的 rounded rectangle 的背景色的话](http://stackoverflow.com/questions/18391830/how-to-programmatically-round-corners-and-set-random-background-colors)

- `Space` 和 `Layout Margin` 的选择在于，如果 View 的 Margin 是非恒定的情况下应该选择 `Space`，`Layout Margin` 应当是 View 的恒定属性。

- 可以给 `Merge` 标签添加 `tools:parentTag="LinearLayout" tools:orientation="vertical"` 此类的属性，以更好地预览布局。

- setTargetFragment/putFragment 和 getTargetFragment/getFragment 必须是针对同一个 FragmentManager。因为 [Fragment 不一定有 tag，所以 FragmentManager 内部是用 index 来保存指定 Fragment 的](https://stackoverflow.com/questions/25482742/android-after-orrientation-change-target-fragment-changes-in-dialog-fragment)。

- 组件间传递 Parcelable 是传递 Copy，但是 Fragment（组件内） 在传递 Parcelable 的时候是直接传递引用！当需要序列化时（例如被回收）才会序列化对应的引用。


### 视图事件传递

用户点击屏幕后调用 `Activity.dispatchTouchEvent()` 将事件分发给在点击位置子视图。

**[事件分发](http://blog.csdn.net/guolin_blog/article/details/9097463)：**
- 首先你需要知道一点，只要你触摸到了任何一个控件，就一定会调用该控件的dispatchTouchEvent方法。
- dispatchTouchEvent()`（来自父控件调用）` -> onTouchEvent() -> onClick()
- 父控件的 onInterceptTouchEvent 返回 true 的话，直接拦截该事件，不尝试分发给子控件。
- 子控件中如果将传递的事件消费掉，父控件将无法在 onTouchEvent() 接收到任何事件。
- 父控件分发事件中，如果调用点击所在子控件的 dispatchTouchEvent() 返回 false 则说明子控件不消费该事件，则事件最终还是会回流到父控件的 onTouchEvent() 中。

**[ViewGroup](http://blog.csdn.net/guolin_blog/article/details/12921889)**

### 其它

- 使用 Robolectric 等测试框架测试使用 https 协议的 API 时，可能需要为你本机的 JRE 导入你服务器的安全证书。具体可参考这个 [SO 回答](http://stackoverflow.com/a/32074827)。

[⬆︎返回目录](#toc)


## Java

- [Grails：约定优于配置](http://www.infoq.com/cn/articles/case-study-grails-partii/)   
举个简单的例子。在 Django 1.3 之后引入了「Class-based view」，有「ListView」和「DetailView」。Django 的「ListView.as_view(model=Publisher,)」不需要指定去 render 哪个template，而是自动去使用了「/path/to/project/books/templates/books/publisher_list.html」这个模板。这即是 **convention over configuration** 的一个典型示范。优先使用默认的约定，而不是非要明确的指定要 render 的 template。


- kotlin：**`限制优于约定`**   
nullable 和 notnullable、var 和 val 等。语法上限制比口头约定更不易造成潜在 bug。


- Java 线程锁：http://blog.csdn.net/ghsau/article/details/7461369/
- [Java 内部类会隐式持有外部类实例的引用](http://droidyue.com/blog/2014/10/02/the-private-modifier-in-java/)

- Java 实现泛型的方法是 **类型擦除**。使用这种实现最主要的原因是为了向前兼容，这种实现方式有很多缺陷。与 C# 中的泛型相比，Java 的泛型可以算是 **"伪泛型"** 了。在 C# 中，不论是在程序源码中、在编译后的中间语言，还是在运行期泛型都是真实存在的。**Java则不同，Java的泛型只在源代码存在** ，只供编辑器检查使用，编译后的字节码文件已擦除了泛型类型，同时在必要的地方插入了强制转型的代码。   

```java
//泛型代码：
public static void main(String[] args) {  
    List<String> stringList = new ArrayList<String>();  
    stringList.add("oliver");  
    System.out.println(stringList.get(0));  
}  

//将上面的代码的字节码反编译后：
public static void main(String args[])  
{  
    List stringList = new ArrayList();  
    stringList.add("oliver");  
    System.out.println((String)stringList.get(0));  
}
```

- 推荐用于处理二进制数据：https://github.com/square/okio
- 单例模式探索：http://www.tekbroaden.com/singleton-java.html?hmsr=toutiao.io&utm_medium=toutiao.io&utm_source=toutiao.io
- 使用 `String.charAt()` 遍历字符比起 `String.toCharArray()` 更为高效

```java
public enum Singleton {
    INSTANCE;
    private String name;
    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name = name;
    }
}
```

- [父类的构造函数一定会执行，且要早于子类的实例变量初始化。](https://www.zhihu.com/question/49182651)类似这样：
```java
class a extends b {
    int a = 0;
    void a() {
        super();
    }
}
```

`super();` 是隐藏的代码，它比 `a = 0;` 还要更早执行。

- [线程安全的自增主键实现](http://blog.csdn.net/kongqz/article/details/8948847)，例子：
```java
private static class ItemInfo {
    private static AtomicInteger ID_COUNTER = new AtomicInteger(0);

    public int typeId;

    public ItemInfo() {
        this.typeId = ID_COUNTER.getAndIncrement();
    }
}
```

- [Thread 的中断机制](http://www.cnblogs.com/onlywujun/p/3565082.html)。中断一个线程只是为了引起该线程的注意，被中断线程可以决定如何应对中断。一个比较恰当的线程循环模板：
```java
public void run() {
    System.out.println("Thread running...");
    while (!Thread.currentThread().isInterrupted()) {
        try {
            /*
             * 如果线程阻塞，将不会去检查中断信号量stop变量，所 以thread.interrupt()
             * 会使阻塞线程从阻塞的地方抛出异常，让阻塞线程从阻塞状态逃离出来，并
             * 进行异常块进行 相应的处理
             */
            Thread.sleep(1000);// 线程阻塞，如果线程收到中断操作信号将抛出异常
        } catch (InterruptedException e) {
            System.out.println("Thread interrupted...");
            /*
             * 如果线程在调用 Object.wait()方法，或者该类的 join() 、sleep()方法
             * 过程中受阻，则其中断状态将被清除
             */
            System.out.println(this.isInterrupted());// false

            //中不中断由自己决定，如果需要真真中断线程，则需要重新设置中断位，如果
            //不需要，则不用调用
            Thread.currentThread().interrupt();
        }
    }
    System.out.println("Thread exiting under request...");
}
```

- 函数中需要用到范型类型参数的，尽量使用前置声明：
```java
private static <ItemToCreate extends Item> ItemToCreate newItem(Class<ItemToCreate> itemClass) { }
```

- 某个类被定义为 `final` 后，其成员方法无需再定义为 `final`。

[⬆︎返回目录](#toc)


## Kotlin

### 入门
- [Kotlin 在线编译器](http://try.kotlinlang.org/#/Examples)
- [Getting started with Android and Kotlin](http://kotlinlang.org/docs/tutorials/kotlin-android.html)
- [Working with Kotlin in Android Studio](http://blog.jetbrains.com/kotlin/2013/08/working-with-kotlin-in-android-studio/)
- [Kotlin 中文博客教程](http://my.oschina.net/yuanhonglong/blog?catalog=3333352)
- https://docs.google.com/document/d/1ReS3ep-hjxWA8kZi0YqDbEhCqTt29hG8P44aA9W0DM8/preview?hl=en&forcehl=1&sle=true

### Note

```kotlin
val a: Int = 10000
print(a === a) // Prints 'true'
val boxedA: Int? = a
val anotherBoxedA: Int? = a
print(boxedA === anotherBoxedA) // !!!Prints 'false'!!!

// ====

val a: Int = 10000
print(a == a) // Prints 'true'
val boxedA: Int? = a
val anotherBoxedA: Int? = a
print(boxedA == anotherBoxedA) // Prints 'true'

// ====

val a: Int = 10000
val boxedA: Int = a
val anotherBoxedA: Int = a
print(boxedA === anotherBoxedA) // Prints 'true'
```

- [kotlin_android_base_framework](https://github.com/nekocode/kotlin_android_base_framework)
- [github.com/JetBrains/anko](https://github.com/JetBrains/anko)
- [kotlinAndroidLib (android studio plugin)](https://github.com/vladlichonos/kotlinAndroidLib)


```kotlin
public var heightScale: Float = 0.8f
    set(value) {
        $heightScale = value
        this.requestLayout()
    }
// backing filed syntax is deprecated, user 'field' instead
public var heightScale: Float = 0.8f
    set(value) {
        field = value
        this.requestLayout()
    }
```

- lateinit 是 Kotlin 语法级的，它比 Delegates.notNull() 更轻量（编译后不产生 Stub 代码）
- Kotlin 中封装的 Int、Float 等基础类型真实实现依然为 Java 中的原子类型（int、float），所以在传参和赋值中依然是值传递（复制）。但是也可以看看这篇 **[Java 有 Value Type 吗？](http://www.yinwang.org/blog-cn/2016/06/08/java-value-type?hmsr=toutiao.io&utm_medium=toutiao.io&utm_source=toutiao.io)**
- Data Class 的 copy() 只对基础类型 or Data Class 进行深复制，Collection／非基础类型（List, Map...）是浅复制，需要自己处理

- 慎用 Lazy 代理／慎用 `kotterknife`，在 Fragment Detach 导致 View 被销毁时（Fragment 实例并未被回收），当 Fragment 重新 Attach 时不会重新执行 FindView。

[⬆︎返回目录](#toc)


## Articles/Others
- [Android Gradle Tasks](http://tools.android.com/tech-docs/new-build-system/user-guide#TOC-Android-tasks)
- [Gradle 指引中文篇](https://avatarqing.gitbooks.io/gradlepluginuserguidechineseverision/content/introduction/README.html)
- [Fragment 的一些讲解](http://blog.csdn.net/lmj623565791/article/details/42628537)
- [Android 3.0 版本后 `AsyncTask` 改为默认串行执行](http://droidyue.com/blog/2014/11/08/bad-smell-of-asynctask-in-android/)
- [避免 Android 中 Context 引起的内存泄露](http://droidyue.com/blog/2015/04/12/avoid-memory-leaks-on-context-in-android/)
- [AndroidDevTools](http://www.androiddevtools.cn/)
- [RxJava 操作符动态图解](http://rxmarbles.com/#debounceWithSelector) 
- Activity 生命周期相关：
 - [Activity 生命周期详解一](http://stormzhang.com/android/2014/09/14/activity-lifecycle1)
 - [Activity 生命周期详解二](http://stormzhang.com/android/2014/09/17/android-lifecycle2/)
 - [onSaveInstanceState & onRestoreInstanceState](http://stormzhang.com/android/2014/09/22/onsaveinstancestate-and-onrestoreinstancestate/)
 - [Android Activity/Fragment Lifecycle](http://stormzhang.com/android/2014/08/08/activity-fragment-lifecycle/)
- [Android Studio 的一些使用技巧](http://qiita.com/takahirom/items/a211b1fcc4304c487c4b#_reference-b274ebea0a18ddb1e0dc)
- [创建一个 RecyclerView LayoutManager](https://github.com/hehonghui/android-tech-frontier/blob/master/issue-9/%E5%88%9B%E5%BB%BA-RecyclerView-LayoutManager-Part-1.md)
- [与 so 有关的一个常年大坑](https://zhuanlan.zhihu.com/p/21359984)
- [Android Dex 分包之旅](http://yydcdut.com/2016/03/20/split-dex/)
- [IoC 的通俗解释](http://www.jianshu.com/p/3968ffabdf9d)
- [ButterKnife VS AndroidAnnotations](http://stackoverflow.com/questions/24351817/dagger-and-butter-knife-vs-android-annotations)
- [APT:Compile-Time Annotation Processing with Java](http://www.javalobby.org/java/forums/t17876.html)：在 compile-time 处理 Annotation

### ReactiveX
- [Reddit 上关于 Rx 的一些建议](https://www.reddit.com/r/androiddev/comments/4kqzot/starting_a_new_rx_library_remember_to_respect_the/)
 - 所有 Observable 的创建类操作符得到的 Observable 都是 Cold Observable。想要得到 Hot Observable 需要通过 `publish()` 函数将 Observable 转化为 ConnectableObservable，然后再调用 `connect()` 函数就可以在没有观察者的情况下执行异步任务（／发射数据）了。
 - [`Observable.deffer()` 的用处。](http://www.jianshu.com/p/c83996149f5b)
 - 只返回一个结果的话可以使用 `Single`，结果只用于标志是否完成的话可以使用 `Completable`。
 - 在任何时候（创建或者流传递途中）都应该记得进行 `isDisposed()` 判断该 Observable 是否已被终止。
- RxJava 中的 `.repeatWhen()` 和 `.retryWhen()` 应用
 - [对 RxJava 中 .repeatWhen() 和 .retryWhen() 操作符的思考](http://www.qingpingshan.com/rjbc/java/49285.html)
 - [缓存 Token，失效时使用 Retry 进行再授权](https://github.com/rengwuxian/RxJavaSamples/blob/master/app%2Fsrc%2Fmain%2Fjava%2Fcom%2Frengwuxian%2Frxjavasamples%2Fmodule%2Ftoken_advanced_5%2FTokenAdvancedFragment.java)
- 一个 ObservableSource 中只有第一个 `subscribeOn()` 会生效，但是在流中间切换的 ObservableSource 的调度需要额外再 `subscribeOn()`。
- 使用 create() 创建的 Observable 在被 dispose() 之后禁止调用 emitter 的 onNext()、onComplete()、onError() 函数。实际上 onNext() 和 onComplete() 内部已经做了 isDisposed() 的判断，如果被已被 dispose() 的话会拦截调用不通知下游，所以即使调用也没问题。但是绝不能在 dispose() 后还调用 emitter 的 onError() ，因为 dispose() 后异步任务产生的 Error 没法传到 Observer 中处理。所以 Rx 就直接将错误抛出了。
```java
Observable.create(e -> {
    if (!e.isDisposed()) {
        e.onError(new RuntimeException());
    }
});
```
如果需要在 Observable 被 dispose() 之后还能和下游建立联系的话，可以使用 unsafeCreate()。使用 unsafeCreate() 创建的 Observable 在被 dispose() 之后依然可以调用 emitter 的 onNext()、onComplete()、onError() 函数，且能通知到下游。

- 如果 Observable 所在的任务在被调度到某个子线程上，在对 Observable 进行 Dispose 之后，Rx 会自动 Interrupt 该子线程。
- **takeUtil 等操作符是通过 Dispose 上游的 Observable 来实现的。**
- 在使用 create 等操作符创建 Observable 的时候，最好在一些关键点上加上 `isDisposed()` 来判断是否需要继续往下执行。
```java
Observable<String> ob = Observable.create(emitter -> {
    try {
        String text = doReadFile(0);
        emitter.onNext(text);

        if (emitter.isDisposed()) return;
        text = doReadFile(1);
        emitter.onNext(text);

    } catch (Exception e) {
        if (!emitter.isDisposed()) {
            emitter.onError(e);
        }
    }
});
```

[⬆︎返回目录](#toc)
