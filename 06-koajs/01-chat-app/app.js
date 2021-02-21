const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const waiters = [];

router.get('/subscribe', async (ctx, next) => {
    next(await new Promise((resolve) => {
        waiters.push({ resolve, ctx });
    }));
});


router.post('/publish', async (ctx, next) => {
    if (ctx.request.body.message) {
        while (waiters.length) {
            let waiter = waiters.pop();
            waiter.ctx.body = ctx.request.body.message;
            waiter.resolve();
        }
    }
    ctx.body = '';
    next();
});

app.use(router.routes());

module.exports = app;
