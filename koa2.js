'use strict'

function compose (middleware) {
  // 参数检验
  return function (context, next) {
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      // 最后一个中间件的调用
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}


const middlewares = [];
const getTestMiddWare = (loggerA, loggerB) => async (ctx, next) => {
    console.log(loggerA);
    await next();
    console.log(loggerB);
};

const mid1 = getTestMiddWare(1, 4),
    mid2 = getTestMiddWare(2, 3);
const response = async () => {
    // 模拟异步读取数据库数据
    const data = await getData();
    console.log(data);
};
const getData = () => new Promise((resolve, reject) => {
    setTimeout(() => resolve('数据已经取出'), 1000);
});
middlewares.push(mid1, mid2);

// 调用方式
compose(middlewares)(null, response);