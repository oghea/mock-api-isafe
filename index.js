global.Promise = require(`bluebird`);
global.print = console.log;
global.println = function() { print(...arguments); print(); };
global.delay = setTimeout;
global.later = setImmediate;
global.repeat = setInterval;
require('dotenv').config();

process.on(`uncaughtException`, (error) => {
  println(error);
});

{
  const path = require(`path`);
  global.appRoot = path.resolve(__dirname);

  const aliases = {
    app: path.resolve(__dirname, `app`),
    lib: path.resolve(__dirname, `lib`),
    router: path.resolve(__dirname, `router`),
    controller: path.resolve(__dirname, `controller`),
  };

  const Module = require(`module`);
  const $require = Module.prototype.require;
  Module.prototype.require = function() {
    const target = path.parse(arguments[0]);
    if (!target.root) {
      if (target.dir) {
        const dirs = target.dir.split(`/`);
        if (dirs[0] !== `.` && dirs[0] !== `..`) {
          const resolved = aliases[dirs[0]];
          if (resolved) {
            target.dir = path.join(resolved, dirs.slice(1).join(path.sep));
            arguments[0] = path.format(target);
          }
        }
      } else {
        const resolved = aliases[target.name];
        if (resolved) {
          arguments[0] = resolved;
        }
      }
    }
    return $require.apply(this, arguments);
  };
};


global.config = {
  isProduction: process.env[`NODE_ENV`] === `production`,
  server: {
    host: process.env[`APP_SERVER_HOST`],
    port: process.env[`APP_SERVER_PORT`],
  },
};



require(`app`);
