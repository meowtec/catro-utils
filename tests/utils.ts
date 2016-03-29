'use strict'

import * as assert from 'assert'
import * as fs from 'fs'
import { throttle, debounce, parseHost, readStreamAll } from '../'
import resource from './resources/'

describe('#utils', () => {

  it('debounce with const function', (done) => {
    let test = 0

    const fun = debounce(15, () => test++)

    setTimeout(fun, 0)
    setTimeout(fun, 10)
    setTimeout(fun, 20)
    setTimeout(fun, 30)

    setTimeout(() => assert.equal(test, 0), 30)
    setTimeout(() => assert.equal(test, 1), 50)
    setTimeout(done, 55)
  })

  it('debounce with variable function', (done) => {
    let test = [0, 0, 0, 0]

    const fun = debounce(15)

    setTimeout(() => fun(() => test[0]++), 0)
    setTimeout(() => fun(() => test[1]++), 10)
    setTimeout(() => fun(() => test[2]++), 20)
    setTimeout(() => fun(() => test[3]++), 30)

    setTimeout(() => assert.deepEqual(test, [0, 0, 0, 0]), 30)
    setTimeout(() => assert.deepEqual(test, [0, 0, 0, 1]), 50)
    setTimeout(done, 55)
  })

  it('throttle', (done) => {
    let test = [0, 0, 0, 0]

    const fun = throttle(15)

    setTimeout(() => fun(() => test[0]++), 0)
    setTimeout(() => fun(() => test[1]++), 10)
    setTimeout(() => fun(() => test[2]++), 20)
    setTimeout(() => fun(() => test[3]++), 30)

    setTimeout(() => assert.deepEqual(test, [1, 0, 1, 0]), 50)
    setTimeout(done, 55)
  })

  it('should parseHost parse host', () => {
    assert.deepEqual(parseHost('meowtec.com:1008'), {
      hostname: 'meowtec.com',
      port: 1008
    })

    assert.deepEqual(parseHost('meowtec.com'), {
      hostname: 'meowtec.com',
      port: 80
    })
  })

  it('test readStreamAll', (done) => {
    const readable = fs.createReadStream(resource('./plain/a.txt'))
    readStreamAll(readable).then((buffer) => {
      assert.equal(buffer.toString(), 'this is text.')
      done()
    }, done)
  })
})
