(async () => {
  const {
    DateTime
  } = require(`luxon`);

  DateTime.localJSDate = () => {
    return DateTime
    .local()
    .setZone(config.timezone)
    .toJSDate();
  };

  const isProduction = config.isProduction;

  const Koa = require(`koa`);
  const fs = require('fs');
  const path = require('path');
  const Router = require(`koa-router`);
  const bodyParser = require(`koa-body`);
  const cors = require(`@koa/cors`);
  const koaLogger = require(`lib/logger`)

  const app = new Koa();
  app.proxy = true;

  const { createLogger, format, transports } = require(`winston`);
  const colorizer = format.colorize();
  const logger = createLogger({
    exitOnError: false,
    format: format.combine(
      format.label({ label: 'mock_app' }),
      format.timestamp(),
      format.printf(msg =>
        colorizer.colorize(msg.level, `${msg.timestamp} - ${msg.level}: ${msg.message}`)
      )
    ),
    transports: [
      new transports.Console()
    ]
  })

  global.PrintLogger = logger

  const router = new Router();

  // try {
  //   await require(`db`);
  // } catch (err) {
  //   process.emit(`uncaughtException`, err);
  //   process.exit();
  // }

  app.on(`error`, err => {
    logger.log({ level: 'error', message: err });
    process.emit(`uncaughtException`, err);
  });

  app.use(cors());
  app.use(bodyParser({ multipart: true }));
  app.use(koaLogger());
  app.use(async (ctx, next) => {
    const token = ctx.request.headers.adx
    if(token == config.serviceAuth){
      await next()
    }
    else {
      ctx.throw(401, 'Service Auth')
    }
  })

  app.useRouter = (router) => {
    // Load all router from router folder
    fs.readdirSync(`./router`).filter(file => fs.statSync(path.join(`./router`, file)).isFile()).forEach((route) => {
        app.use(require(`router/${route}`).routes());
    });
    app.use(router.allowedMethods());
  };

  app.useRouter(router);

  const server = require(`http`).Server(app.callback());

  server.listen(
    config.server.port,
    config.server.host,
    () => println(`Server is started\nisProduction: ${isProduction}.\nPort: ${config.server.port}\nHost: ${config.server.host}`)
  );
})()
