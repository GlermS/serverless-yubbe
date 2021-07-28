'use strict';
const mochaPlugin = require('serverless-mocha');
const expect = mochaPlugin.chai.expect;
let wrapped = mochaPlugin.getWrapper('Update User', '/user.js', 'update_user');

const fs = require('fs');
const path = require('path');

describe('Update User', () => {
  before((done) => {
    done();
  });

  it('Correct event data', async () => {
    let rawdata = fs.readFileSync(path.join(process.cwd(), 'test', 'users','samples','update_user', 'correct.json'));
    const event = JSON.parse(rawdata);
    const response = await wrapped.run(event);
    expect(response.statusCode).to.be.equal(200)
  });

  it('Empty event', async () => {
    const response = await wrapped.run({});
    expect(response.statusCode).to.be.equal(400)
  });

  it('Missing required parameter in event', async () => {
    let rawdata = fs.readFileSync(path.join(process.cwd(), 'test', 'users','samples','update_user', 'missing_required.json'));
    const event = JSON.parse(rawdata);
    const response = await wrapped.run(event);
    expect(response.statusCode).to.be.equal(400)
  });
});