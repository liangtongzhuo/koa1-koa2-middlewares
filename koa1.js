'use strict'

// 组装中间件
function compose(middleware) {
    return function* (next) {
        if (!next) next = noop();

        var i = middleware.length;
        while (i--) {
            next = middleware[i].call(this, next);//生成执行函数
        }

        return yield* next;
    }
}

function* noop() {

}



const middlewares = [];
const getTestMiddWare = (loggerA, loggerB) => {
    return function* (next) {
        console.log(loggerA);
        yield next;
        console.log(loggerB);
    }
};
const mid1 = getTestMiddWare(1, 4),
    mid2 = getTestMiddWare(2, 3);

const getData = new Promise((resolve, reject) => {
    setTimeout(() => resolve('数据已经取出'), 1000);
});

function* response(next) {

        yield next;
    yield next;

    // 模拟异步读取数据库数据
    const data = yield getData;


    console.log(data);
}

middlewares.push(mid1, mid2, response);




// co 函数, 接受一个Generator参数或执行函数,返回一个 promise
function co(gen) {
    const ctx = this,
        args = Array.prototype.slice.call(arguments, 1);
    return new Promise((reslove, reject) => {
        if (typeof gen === 'function') { gen = gen.apply(ctx, args); }//生成执行函数
        if (!gen || typeof gen.next !== 'function') return resolve(gen);

        const baseHandle = handle => res => {
            let ret;
            try {
                ret = gen[handle](res);//取出里面的执行函数
            } catch (e) {
                reject(e);
            }
            next(ret);
        };
        const onFulfilled = baseHandle('next'),
            onRejected = baseHandle('throw');

        onFulfilled();

        function next(ret) {
            if (ret.done) return reslove(ret.value);//结束了，值传回去

            let value = null;
            if (typeof ret.value.then !== 'function') { // 不是promise
                value = co(ret.value);
            } else {
                value = ret.value;
            }
            if (value) return value.then(onFulfilled, onRejected);
            return onRejected(new TypeError('yield type error'));
        }
    });
}


// 组装中间件
const gen = compose(middlewares);
// 执行中间件
co(gen);