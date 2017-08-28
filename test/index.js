'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var PassThrough = require('stream').PassThrough;
var test = require('tape');
var execa = require('execa');
var version = require('../package').version;
var stemmer = require('..');

var inputs = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split('\n');
var outputs = fs.readFileSync(path.join(__dirname, 'output.txt'), 'utf8').split('\n');

test('api', function (t) {
  t.doesNotThrow(function () {
    var length = inputs.length;
    var index = -1;
    while (++index < length) {
      assert.equal(stemmer(inputs[index]), outputs[index]);
    }
  }, 'should work for all fixtures');

  t.end();
});

test('cli', function (t) {
  var input = new PassThrough();

  t.plan(7);

  execa.stdout('./cli.js', ['considerations']).then(function (result) {
    t.equal(result, 'consider', 'argument');
  });

  execa.stdout('./cli.js', ['detestable', 'vileness']).then(function (result) {
    t.equal(result, 'detest vile', 'arguments');
  });

  execa.stdout('./cli.js', {input: input}).then(function (result) {
    t.equal(result, 'detest vile', 'stdin');
  });

  input.write('detestable');

  setImmediate(function () {
    input.end(' vileness');
  });

  ['-h', '--help'].forEach(function (flag) {
    execa.stdout('./cli.js', [flag]).then(function (result) {
      t.ok(/\s+Usage: stemmer/.test(result), flag);
    });
  });

  ['-v', '--version'].forEach(function (flag) {
    execa.stdout('./cli.js', [flag]).then(function (result) {
      t.equal(result, version, flag);
    });
  });
});
