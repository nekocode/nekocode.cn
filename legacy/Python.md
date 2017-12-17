## Python

### 教程
- [廖雪峰的官方博客](http://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000)
- [简明 Python 教程](http://itlab.idcquan.com/linux/manual/Python_chinese/)
- [iPython 的一些用法](http://blog.sina.com.cn/s/blog_6fb8aa0d0101r5o1.html)


### GUI
- [Python GUI编程（Tkinter）](http://www.yiibai.com/python/python_gui_programming.html)
- [pygame](http://eyehere.net/2011/python-pygame-novice-professional-index/)

### Note
- Python 没有规定缩进是几个空格还是Tab。按照约定俗成的管理，应该始终坚持使用 4 个空格的缩进。  
- Python 程序是大小写敏感的，如果写错了大小写，程序会报错。 

- 以下几个值转换成布尔值为 `False`  
```python
bool(None)
bool('')
bool(0)
```

- 从 raw_input() 读取的内容永远以字符串的形式返回，把字符串和整数比较就不会得到期待的结果，必须先用 int()把字符串转换为我们想要的整型：  
```java
birth = int(raw_input('birth: '))
```

- 函数多重返回值默认用 tuple 来构造  
```python
def fuc();
    return 123,456
print fuc2()[0]
```  


- 定义默认参数要牢记一点：默认参数必须指向不变对象！  
```python
 #bad
def add_end(L=[]):
    L.append('END')
    return L

 #right
def add_end(L=None):
    if L is None:
        L = []
    L.append('END')
    return L
```  

- 为什么要设计 str、None 这样的不变对象呢？因为不变对象一旦创建，对象内部的数据就不能修改，这样就减少了由于修改数据导致的错误。此外，由于对象不变，多任务环境下同时读取对象不需要加锁，同时读一点问题都没有。我们在编写程序时，如果可以设计一个不变对象，那就尽量设计成不变对象。

- Python 允许你在 list 或 tuple 前面加一个 * 号，把 list 或 tuple 的元素变成可变参数传进去  
```python
 #函数内 numbers 接收到的是一个 tuple，可以使用 calc(1,2,3) 的写法
def calc(*numbers):
    sum = 0
    for n in numbers:
        sum = sum + n * n
    return sum
nums = [1, 2, 3]
calc(*nums)
```  


-  
```python
def person(name, age, **kw):
    print 'name:', name, 'age:', age, 'other:', kw
person('Adam', 45, gender='M', job='Engineer')
 #同样可以采用上一条的简化做法，但是是两个**
kw = {'city': 'Beijing', 'job': 'Engineer'}
>>> person('Jack', 24, **kw)
```

-  
```python
def func(a, b, c=0, *args, **kw):
    print 'a =', a, 'b =', b, 'c =', c, 'args =', args, 'kw =', kw
args = (1, 2, 3, 4)
kw = {'x': 99}
func(*args, **kw)
 #输出：a = 1 b = 2 c = 3 args = (4,) kw = {'x': 99}
```
- \*args 是可变参数，args 接收的是一个 tuple；  
\*\*kw 是关键字参数，kw 接收的是一个 dict。  
以及调用函数时如何传入可变参数和关键字参数的语法：  
可变参数既可以直接传入：func(1, 2, 3)，又可以先组装 list 或 tuple，再通过 \*args 传入：func(\*(1, 2, 3))；  
关键字参数既可以直接传入：func(a=1, b=2)，又可以先组装 dict，再通过 \*\*kw 传入：func(\*\*{'a': 1, 'b': 2})。  
使用 **`*args`** 和 *`**kw`* 是 Python 的习惯写法，当然也可以用其他参数名，但最好使用习惯用法。


- **列表生成式**
```python
>>> [m + n for m in 'ABC' for n in 'XYZ']
['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
```

- 遍历字典的键，值
```python
d = {'a':0, 'b':1, 'c':2}
for k,v in d.iteritems():
    print k,':',v
```
- abs 函数实际上是定义在 __builtin__ 模块中的，所以要让修改 abs 变量的指向在其它模块也生效，要用  
```python
__builtin__.abs = my_abs
```

- **map/reduce** & `lambda`
```python
def fn(x, y):
    return x * 10 + y
def char2num(s):
    return {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}[s]
reduce(fn, map(char2num, '13579'))
 #输出(int)：13579
 #下面可以用lambda函数进行代码缩减
def str2int(s):
    return reduce(lambda x,y:x*10+y, map(lambda x:{'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}[x], s))
```
- **Python 内建的 `filter()` 函数用于过滤序列。**  
和 map() 类似，filter() 也接收一个函数和一个序列。和 map() 不同的时，filter() 把传入的函数依次作用于每个元素，然后根据返回值是 True 还是 False 决定保留还是丢弃该元素。

- **闭包（Closure）**：内部函数可以 `访问` 外部函数的参数和局部变量 (**可读不可写**)  
```python
def fuc1(num):
    def fuc2():
        num2 = num + 1
        return num2
    return fuc2
f = fuc1(10)
f()
 #输出 11
```

- **装饰器（Decorator）**：增强函数的功能  
`wrapper() 函数的参数定义是 (*args, **kw)，因此， wrapper() 函数可以接受任意参数的调用！！`  
[三层嵌套 Decorator](http://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000/001386819879946007bbf6ad052463ab18034f0254bf355000)  
```python
import functools
def mylog(func):
    @functools.wraps(func)
    def wrapper(*args, **kw):
        print 'call %s:'%func.__name__
        return func(*args,**kw)
    return wrapper
@mylog
def now():
    print '2015'
now()
 #输出 2015
```  
这里的 functools 是为了将 wrapper 的 `__name__` 变为 func 的 `__name__`

- **偏函数**：当函数的参数个数太多，需要简化时，使用 functools.partial 可以创建一个新的函数，这个新函数可以固定住原函数的部分参数，从而在调用时更简单。  
```java
import functools
int2 = functools.partial(int, base=2)
int2('1000000')
#输出64
```

- 每一个包目录下面都会有一个 `__init__.py` 的文件，这个文件是必须存在的，否则，Python 就把这个目录当成普通目录，而不是一个包。`__init__.py` 可以是空文件，也可以有 Python 代码，因为 `__init__.py` 本身就是一个模块，而它的模块名就是包目录命名
- **如果要获得一个对象的所有属性和方法，可以使用 dir() 函数，它返回一个包含字符串的 list**
- 类的静态变量里面，使用 `类名.` 访问的是单例的类静态变量，使用 `self.` 访问的是类实例化时深度复制（**值传递**）的变量

- **Python yield 使用浅析**：https://www.ibm.com/developerworks/cn/opensource/os-cn-python-yield/
```py
def fab(max): 
    n, a, b = 0, 0, 1 
    while n < max: 
        # 当 fab(5) 执行到该句时将 返回/return 一个迭代值（当前 b 的值）并在该句中断等待下次迭代，当执行下次迭代时会从该句重新开始执行
        yield b 
        a, b = b, a + b 
        n = n + 1

for n in fab(5):
    print n 
```

- **circular-dependency-between-python-classes**：http://stackoverflow.com/questions/23026530/circular-dependency-between-python-classes


### tornado
- tornado 只实现了 post 格式为 `formdata` 以及 `urlencode` 两种方式的 post 数据的自动解析。针对post json 格式数据没有自动解析，需要自己从 body 里面拿出来解析。


## Other
- 字体文件子集化
```sh
pip install Fonttools
pyftsubset wawa.otf --text="汉字" --output-file=wawa-sub.otf
pyftsubset wawa.otf --text-file=剧本.txt --output-file=wawa-sub.otf
```
