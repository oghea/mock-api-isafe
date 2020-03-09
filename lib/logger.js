/**
 * Module dependencies.
 */
'use strict'

const Counter = require('passthrough-counter')
const humanize = require('humanize-number')
const bytes = require('bytes')

/**
 * Expose logger.
 */

module.exports = dev

/**
 * Development logger.
 */

function dev (opts) {
  return async function logger (ctx, next) {
    // request
    const start = Date.now()
    PrintLogger.log({level: 'info', message: `request  ${ctx.method} ${ctx.originalUrl}`})

    try {
      await next()
    } catch (err) {
      // log uncaught downstream errors
      log(ctx, start, null, err)
      throw err
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    const length = ctx.response.length
    const body = ctx.body
    let counter
    if (length == null && body && body.readable) {
      ctx.body = body
        .pipe(counter = Counter())
        .on('error', ctx.onerror)
    }

    // log when the response is finished or closed,
    // whichever happens first.
    const res = ctx.res

    const onfinish = done.bind(null, 'finish')
    const onclose = done.bind(null, 'close')

    res.once('finish', onfinish)
    res.once('close', onclose)

    function done (event) {
      res.removeListener('finish', onfinish)
      res.removeListener('close', onclose)
      log(ctx, start, counter ? counter.length : length, null, event)
    }
  }
}

/**
 * Log helper.
 */

function log (ctx, start, len, err, event) {
  // get the status code of the response
  const status = err
    ? (err.isBoom ? err.output.statusCode : err.status || 500)
    : (ctx.status || 404)

  // get the human readable response length
  let length
  if (~[204, 205, 304].indexOf(status)) {
    length = ''
  } else if (len == null) {
    length = '-'
  } else {
    length = bytes(len).toLowerCase()
  }

  const upstream = err ? 'error   '
    : event === 'close' ? 'close   '
      : 'response'

  const level = err ? 'error'
    : event === 'close' ? 'warning'
      : 'info'

  PrintLogger.log({level: level, message: `${upstream} ${ctx.method} ${ctx.originalUrl} ${status} ${time(start)} ${length}`})
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time (start) {
  const delta = Date.now() - start
  return humanize(delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's')
}
