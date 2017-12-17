# Unity

- 使用 `VSCode` 替代 `MonoDevelop` 编辑器需先安装 `mono` 库
```sh
# 需要安装 mono 后才能启动 Intellisense
brew install mono
brew tap aspnet/dnx
brew install dnvm
```

- [移植 `Intellij` 的快捷键给 `VSCode`](https://github.com/k--kato/vscode-intellij-idea-keybindings)

- [Exclude .meta files in folder view](http://stackoverflow.com/questions/30140112/how-do-i-hide-certain-files-from-the-sidebar-in-visual-studio-code)
```json
{
     "files.exclude": {
         "**/*.meta": true
     }
}
```

- Unity Editor 的 Android、iOS Support 安装失败的话，可以尝试手动使用 install 命令进行安装：
```sh
sudo installer -pkg UnitySetup-Android-Support-for-Editor-5.4.0f3.pkg -target /
sudo installer -pkg UnitySetup-iOS-Support-for-Editor-5.4.0f3.pkg -target /
```

## C# Script 注意事项
- 类名必须与文件名完全相同，这一点和传统的 C# 保持一致。

- 所有新建的 C# 脚本必须全部继承自 `MonoBehaviour`。

- 协同程序一定是 `Ienumerator` 的返回类型,并且 `yield` 用 `yield return` 替代。

- 避免使用面向对象编程语言里面惯用的构造函数，初始化放在 `Awake()` 或 `Start ()` 函数中。

- C# 定义的私有的和受保护的变量或对象不会作为接口出现在 Inspector 面板中，那怕你将它放置到该脚本的开始处。

- [为你的 Component 在 Inspector 中添加事件监控选项。](http://answers.unity3d.com/questions/892053/button-onclick-inspector-how-do-i-do-this.html)

- [转换 Rect Transform 到屏幕坐标](http://answers.unity3d.com/questions/826851/how-to-get-screen-position-of-a-recttransform-when.html)

- 可以使用 [Transform.SetAsLastSibling()](https://docs.unity3d.com/ScriptReference/Transform.SetAsLastSibling.html) 等方法来改变 UI 组件在 Canvas 中的 Hierarchy。

#### 架构相关
- [Unity框架搭建](http://liangxiegame.com/tag/unity_framework/)

- [炉石代码研究](http://zhihu.com/question/36928590/answer/69843137)

## Other
- Camera Size 值对应屏幕**'高度'**的一半：http://blog.csdn.net/n5/article/details/50083205

- 按住 `option` 键可以快速拖动当前画布

- 决定Unity渲染关系的层级顺序是 `sorting order < sorting layer < Camera `

- [UGUI 系列文章](http://k79k06k02k.com/blog/%E7%B3%BB%E5%88%97%E6%96%87%E7%AB%A0%E7%9B%AE%E9%8C%84)

- [一种Unity2D多分辨率屏幕适配方案](http://www.cnblogs.com/flyFreeZn/p/4073655.html)

- [Unity学习笔记（一） UGUI](http://www.jianshu.com/p/96676667cfe6)
```
ScreenSpace - Overlay
Canvas自动适配屏幕大小，不经过投影空间，直接在屏幕上绘制，即使场景中没有任何Camera也可以呈现出Canvas中的内容。
(Ps.这种方式可以单纯的制作纯2D游戏。)

ScreenSpace - Camera 
Canvas自动适配屏幕大小，UI由特定的Camera负责渲染，Camera投影方式可设定为Perspective（透视）或者Orthographic（正交）。
(Ps.这种RenderMode可以制作复杂的UI系统，例如在UI中显示3D模型。)

WorldSpace
Canvas不自动适配屏幕大小，UI将以平面物体对待，可以放在场景中其他物体的后面，UI在屏幕中显示的大小由它和Camera之间的距离所决定。
(Ps.这种RenderMode可以制作复杂的UI系统，例如角色头上的血条。)
```

