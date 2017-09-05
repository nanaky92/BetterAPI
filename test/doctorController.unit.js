'use strict'

const mocha = require('mocha')
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon)
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

describe('doctorController', function() {
    let doctorController;
    const searchStub = sinon.stub().returnsPromise().rejects()
    const createStub = sinon.stub().returnsPromise().resolves()
    const pingStub = sinon.stub().returnsPromise().resolves()

    var stubs = {
      '../models/elasticConnector.js': function() {
            return {
                search: () => { return searchStub() },
                create: () => { return createStub() },
                ping: () => { return pingStub() }
            }
        },
      'request': (url, cb) => {
            return cb(null, '', '{}');
        }
    };

    before(function(done) {
        doctorController = proxyquire('../api/controllers/doctorController.js', stubs)
        return done()
    })

    it('Should call API When Doctor is not found in ES', function(done){
        doctorController.search({query:{name:"John"}},{},() => {})
        .then((v) => {
            expect(searchStub.calledOnce).to.be.true
            expect(createStub.calledOnce).to.be.true
            expect(pingStub.calledOnce).to.be.true
            return done()
        })
        .catch((e) => { console.dir(e); return done(e)})
    })
})
