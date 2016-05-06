'use strict'

import { Readable } from 'stream'
import { EventEmitter } from 'events'
import * as fileSystem from 'fs'

export function noop() {}

export function callif(fun) {
  fun && fun()
}

export function promisify<T>(callback: Function, context?, ifErr = true) {
  return (...args) => {
    return new Promise<T>((resolve, reject) => {
      args.push((...rest) => {
        let err
        if (ifErr) {
          err = rest.shift()
        }

        if (err && ifErr) {
          reject(err)
        }
        else {
          resolve.apply(null, rest)
        }
      })
      callback.apply(context, args)
    })
  }
}

export function emitterPromisify(emitter: EventEmitter, eventName: string, exception = true) {
  return new Promise((resolve, reject) => {
    emitter.on(eventName, resolve)
    exception && emitter.on('error', reject)
  })
}


export function debounce(wait: number, fun0?: Function) {
  let timer

  return (func1?: Function) => {
    clearTimeout(timer)
    const fun = func1 || fun0

    fun && (timer = setTimeout(fun, wait))
  }
}

export function throttle(wait: number, fun0?: Function) {
  let lastDate = 0

  return (func1?: Function) => {
    let nowDate = Date.now()
    if (nowDate - lastDate > wait) {
      lastDate = nowDate
      callif(func1 || fun0)
    }
  }
}

export function parseHost(host: string) {
  const [hostname, port] = host.split(':')
  return {
    hostname: hostname,
    port: parseInt(port || '80', 10)
  }
}

export function readStreamAll(stream: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const bucket: Buffer[] = []

    stream.on('data', (data: Buffer) => {
      bucket.push(data)
    })

    stream.on('end', () => {
      resolve(Buffer.concat(bucket))
    })

    stream.on('error', reject)
  })
}

export interface ReadFilePromise {
  (path: string): Promise<Buffer>
  (path: string, encoding: string): Promise<string>
}

export interface WriteFilePromise {
  (path: string, data): Promise<any>
}

export const fs = {
  readFile: <ReadFilePromise>promisify(fileSystem.readFile, fileSystem),
  writeFile: <WriteFilePromise>promisify(fileSystem.writeFile, fileSystem),
  unlink: promisify(fileSystem.unlink, fileSystem),
  exists: promisify<Boolean>(fileSystem.exists, fileSystem, false)
}
