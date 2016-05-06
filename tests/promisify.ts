'use strict'

import * as assert from 'assert'
import * as sysfs from 'fs'
import { promisify, emitterPromisify, fs } from '../'
import resource from './resources/'
import { EventEmitter } from 'events'

describe('#promosify', () => {
  it('should promisify work', (done) => {
    function x(arg, callback) {
      setTimeout(() => {
        if (arg) {
          callback(null, arg)
        }
        else {
          callback('error')
        }

      }, 0)
    }
    const newX = promisify(x, null)

    newX(false)
    .catch((err) => {
      assert.equal(err, 'error')
      return newX(true)
    })
    .then((result) => assert.equal(result, true))
    .then(done, done)
  })
})

describe('#promosify.fs', () => {

  it('should fs.writeFile && fs.readFile success', (done) => {
    const file = resource('./plain/temp1.txt')
    const data = Math.random().toString()

    fs.writeFile(file, data)
    .then(() =>  fs.readFile(file))
    .then((buffer) => {
      assert.ok(buffer instanceof Buffer)
      assert.equal(buffer.toString(), data)
    })
    .then(() => fs.readFile(file, 'utf-8'))
    .then((text) => assert.equal(text, data))
    .then(done, done)
  })

  it('should fs.writeFile fail', (done) => {
    const file = resource('./plain/deep/not_exist.txt')

    fs.writeFile(file, '')
    .then((buffer) => assert.fail(), () => {})
    .then(done, done)
  })

  it('should fs.readFile fail', (done) => {
    const file = resource('./plain/not_exist.txt')

    fs.readFile(file)
    .then((buffer) => assert.fail(), () => {})
    .then(done, done)
  })

  it('should fs.exists existed', (done) => {
    fs.exists(resource('./plain/a.txt'))
    .then((exist) => assert.equal(exist, true))
    .then(done, done)
  })

  it('should fs.exists not existed', (done) => {
    fs.exists(resource('./plain/not_exist.txt'))
    .then((exist) => assert.equal(exist, false))
    .then(done, done)
  })

  it('should fs.unlink success', (done) => {
    const file = resource('./plain/temp.txt')
    sysfs.writeFileSync(file, '123')

    fs.unlink(file)
    .then(() => {
      assert.equal(sysfs.existsSync(file), false)
    })
    .then(done, done)
  })

  it('should fs.unlink fail', (done) => {
    const file = resource('./plain/temp.txt')

    fs.unlink(file)
    .then(() => {
      assert.fail()
    }, () => {})
    .then(done, done)
  })

})

describe('#emitterPromisify', function() {
  it('should transform EventEmitter to promise', (done) => {
    const event = new EventEmitter()
    const promise = emitterPromisify(event, 'success')
    setTimeout(() => event.emit('success', 123))

    promise.then((result) => assert.equal(result, 123))
    .then(done, done)
  })
})


describe('#emitterPromisify with catch', function() {
  it('should transform EventEmitter to promise', (done) => {
    const event = new EventEmitter()
    const promise = emitterPromisify(event, 'success')
    setTimeout(() => event.emit('error', 'ERROR'))
    setTimeout(() => event.emit('success', 123))

    promise.then(() => assert.fail(), (err) => assert.equal(err, 'ERROR'))
    .then(done, done)
  })
})