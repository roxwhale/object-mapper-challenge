'use strict';

/* eslint-disable prefer-arrow-callback, max-len */
require('chai').should();

const expect = require('chai').expect,
    objectMapper = require('../lib/object-mapper');

describe('Object Mapper library', function() {
    describe('Basic', function() {
        it('Number', function(done) {
            const mapper = objectMapper({
                prop: 'field',
            });
            const result = mapper.map({
                prop: 1,
            });
            result.should.eql({
                field: 1,
            });
            done();
        });
        it('Boolean', function(done) {
            const mapper = objectMapper({
                prop: 'field',
            });
            const result = mapper.map({
                prop: true,
            });
            result.should.eql({
                field: true,
            });
            done();
        });
        it('String', function(done) {
            const mapper = objectMapper({
                prop: 'field',
            });
            const result = mapper.map({
                prop: 'true',
            });
            result.should.eql({
                field: 'true',
            });
            done();
        });
        it('Array', function(done) {
            const mapper = objectMapper({
                prop: 'field',
            });
            const result = mapper.map({
                prop: ['1', '2', '3'],
            });
            result.should.eql({
                field: ['1', '2', '3'],
            });
            done();
        });
    });

    describe('Global options', function() {
        it('strictSource: false', function(done) {
            const saved = objectMapper.opts.strictSource;
            objectMapper.opts.strictSource = false;
            expect(() => objectMapper({ 'property[1].value[]': 'newProperty[].dest[]' })).to.not.throw();
            expect(() => objectMapper({ 'property[].value[]': 'newProperty[].dest' })).to.throw();
            objectMapper.opts.strictSource = saved;
            done();
        });
        it('strictSource: true', function(done) {
            const saved = objectMapper.opts.strictSource;
            objectMapper.opts.strictSource = true;
            expect(() => objectMapper({ 'property[1].value[]': 'newProperty[].dest[]' })).to.throw();
            expect(() => objectMapper({ 'property[].value[]': 'newProperty[].dest' })).to.throw();
            objectMapper.opts.strictSource = saved;
            done();
        });
    });

    describe('Mapping keys errors', function() {
        describe('Source', function() {
            it('Invalid array lookup', function(done) {
                expect(() => objectMapper({ 'property[[].value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
            it('Invalid isolated array lookup', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
            it('Invalid array index', function(done) {
                expect(() => objectMapper({ 'property[d].value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
            it('Invalid isolated array index', function(done) {
                expect(() => objectMapper({ 'property.[5].value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
            it('Invalid property key', function(done) {
                expect(() => objectMapper({ 'prop[]erty.value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
            it('Invalid property key', function(done) {
                expect(() => objectMapper({ 'prop[1]erty.value[]': 'newProperty[].dest[]' })).to.throw();
                done();
            });
        });
        describe('Destination', function() {
            it('Invalid array lookup', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'property[[].value[]' })).to.throw();
                done();
            });
            it('Invalid isolated array lookup', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'property.[].value[]' })).to.throw();
                done();
            });
            it('Invalid array index', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'property[d].value[]' })).to.throw();
                done();
            });
            it('Invalid isolated array index', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'property.[5].value[]' })).to.throw();
                done();
            });
            it('Invalid property key', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'prop[]erty.value[]' })).to.throw();
                done();
            });
            it('Invalid property key', function(done) {
                expect(() => objectMapper({ 'property.[].value[]': 'prop[1]erty.value[]' })).to.throw();
                done();
            });
            it('Invalid array lookup count', function(done) {
                expect(() => objectMapper({ 'property[].value[]': 'newProperty[].dest' })).to.throw();
                done();
            });
        });
    });

    describe('With array indexes and lookups', function() {
        describe('Lookup', function() {
            it('Basic lookup', function(done) {
                const mapper = objectMapper({
                    'array[].val': 'array[].value',
                });
                const result = mapper.map({
                    array: [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                });
                result.should.eql({
                    array: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
                });
                done();
            });
            it('Basic omitted lookup', function(done) {
                const mapper = objectMapper({
                    'array.val': 'array[].value',
                });
                const result = mapper.map({
                    array: [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                });
                result.should.eql({
                    array: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
                });
                done();
            });
            it('Basic lookup + filtered properties', function(done) {
                const mapper = objectMapper({
                    'array[].val': 'array[].value',
                });
                const result = mapper.map({
                    array: [{ val: 'a', other: 1 }, { val: 'b', other1: 'a', other2: true }, { val: 'c' }],
                });
                result.should.eql({
                    array: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
                });
                done();
            });
            it('Basic lookup + array creation', function(done) {
                const mapper = objectMapper({
                    'array[].val': '[]',
                });
                const result = mapper.map({
                    array: [{ val: 'a', other: 1 }, { val: 'b', other1: 'a', other2: true }, { val: 'c' }],
                });
                result.should.eql(['a', 'b', 'c']);
                done();
            });
            it('Single lookup for last field', function(done) {
                const mapper = objectMapper({
                    'field[]': 'test[].value',
                });
                const result = mapper.map({
                    field: ['a', 'b', 'c'],
                });
                result.should.eql({ test: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] });
                done();
            });
            it('Omitted single lookup for last field', function(done) {
                const mapper = objectMapper({
                    field: 'test[].value',
                });
                const result = mapper.map({
                    field: ['a', 'b', 'c'],
                });
                result.should.eql({ test: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] });
                done();
            });
            it('Multi (x2) lookup', function(done) {
                const mapper = objectMapper({
                    'Multi[][].val': 'Multi[].value[]',
                });
                const result = mapper.map({
                    Multi: [
                        [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                        [{ val: 'd' }, { val: 'e' }, { val: 'f' }],
                        [{ val: 'g' }, { val: 'h' }, { val: 'i' }],
                        [{ val: 'j' }, { val: 'k' }, { val: 'l' }],
                    ],
                });
                result.should.eql({
                    Multi: [{
                        value: ['a', 'b', 'c'],
                    }, {
                        value: ['d', 'e', 'f'],
                    }, {
                        value: ['g', 'h', 'i'],
                    }, {
                        value: ['j', 'k', 'l'],
                    }],
                });
                done();
            });
            it('Omitted Multi (x2) lookup', function(done) {
                const mapper = objectMapper({
                    'array.val': 'array[].value[]',
                });
                const result = mapper.map({
                    array: [
                        [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                        [{ val: 'd' }, { val: 'e' }, { val: 'f' }],
                        [{ val: 'g' }, { val: 'h' }, { val: 'i' }],
                        [{ val: 'j' }, { val: 'k' }, { val: 'l' }],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: ['a', 'b', 'c'],
                    }, {
                        value: ['d', 'e', 'f'],
                    }, {
                        value: ['g', 'h', 'i'],
                    }, {
                        value: ['j', 'k', 'l'],
                    }],
                });
                done();
            });
            it('Multi (x2) lookup for last', function(done) {
                const mapper = objectMapper({
                    'array[][]': 'array[].value[]',
                });
                const result = mapper.map({
                    array: [
                        [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                        [{ val: 'd' }, { val: 'e' }, { val: 'f' }],
                        [{ val: 'g' }, { val: 'h' }, { val: 'i' }],
                        [{ val: 'j' }, { val: 'k' }, { val: 'l' }],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [{ val: 'a' }, { val: 'b' }, { val: 'c' }],
                    }, {
                        value: [{ val: 'd' }, { val: 'e' }, { val: 'f' }],
                    }, {
                        value: [{ val: 'g' }, { val: 'h' }, { val: 'i' }],
                    }, {
                        value: [{ val: 'j' }, { val: 'k' }, { val: 'l' }],
                    }],
                });
                done();
            });
            it('Multi (x3) lookup', function(done) {
                const mapper = objectMapper({
                    'array[][][].val': 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [[{ val: 'a' }], [{ val: 'b' }], [{ val: 'c' }]],
                        [[{ val: 'd' }], [{ val: 'e' }], [{ val: 'f' }]],
                        [[{ val: 'g' }], [{ val: 'h' }], [{ val: 'i' }]],
                        [[{ val: 'j' }], [{ val: 'k' }], [{ val: 'l' }]],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Omitted multi (x3) lookup', function(done) {
                const mapper = objectMapper({
                    'array.val': 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [[{ val: 'a' }], [{ val: 'b' }], [{ val: 'c' }]],
                        [[{ val: 'd' }], [{ val: 'e' }], [{ val: 'f' }]],
                        [[{ val: 'g' }], [{ val: 'h' }], [{ val: 'i' }]],
                        [[{ val: 'j' }], [{ val: 'k' }], [{ val: 'l' }]],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Partially omitted multi (x3) lookup', function(done) {
                const mapper = objectMapper({
                    'array[].val': 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [[{ val: 'a' }], [{ val: 'b' }], [{ val: 'c' }]],
                        [[{ val: 'd' }], [{ val: 'e' }], [{ val: 'f' }]],
                        [[{ val: 'g' }], [{ val: 'h' }], [{ val: 'i' }]],
                        [[{ val: 'j' }], [{ val: 'k' }], [{ val: 'l' }]],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Multi (x3) lookup for last', function(done) {
                const mapper = objectMapper({
                    'array[][][]': 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Omitted multi (x3) lookup for last', function(done) {
                const mapper = objectMapper({
                    array: 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Partially omitted multi (x3) lookup for last', function(done) {
                const mapper = objectMapper({
                    'array[][]': 'array[].value[][]',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    array: [{
                        value: [['a'], ['b'], ['c']],
                    }, {
                        value: [['d'], ['e'], ['f']],
                    }, {
                        value: [['g'], ['h'], ['i']],
                    }, {
                        value: [['j'], ['k'], ['l']],
                    }],
                });
                done();
            });
            it('Rebuild full custom destination', function(done) {
                const mapper = objectMapper({
                    'array[][][]': 'values[].are[].now[].here',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    values: [{
                        are: [{ now: [{ here: 'a' }] }, { now: [{ here: 'b' }] }, { now: [{ here: 'c' }] }],
                    }, {
                        are: [{ now: [{ here: 'd' }] }, { now: [{ here: 'e' }] }, { now: [{ here: 'f' }] }],
                    }, {
                        are: [{ now: [{ here: 'g' }] }, { now: [{ here: 'h' }] }, { now: [{ here: 'i' }] }],
                    }, {
                        are: [{ now: [{ here: 'j' }] }, { now: [{ here: 'k' }] }, { now: [{ here: 'l' }] }],
                    }],
                });
                done();
            });
            it('Invalid destination array lookup count', function(done) {
                const mapper = objectMapper({
                    'Multi[].val': 'Multi[].value',
                });
                expect(() => mapper.map({
                    stuff: {
                        useless: true,
                    },
                    Multi: [
                        [{ p: { o: 1 }, val: 'a' }, { p: { o: 1 }, val: 'b' }, { p: { o: 1 }, val: 'c' }],
                        [{ p: { o: 1 }, val: 'd' }, { p: { o: 1 }, val: 'e' }, { p: { o: 1 }, val: 'f' }],
                        [{ p: { o: 1 }, val: 'g' }, { p: { o: 1 }, val: 'h' }, { p: { o: 1 }, val: 'i' }],
                        [{ p: { o: 1 }, val: 'j' }, { p: { o: 1 }, val: 'k' }, { p: { o: 1 }, val: 'l' }],
                    ],
                })).to.throw('Invalid destination array lookup count');
                done();
            });
        });

        describe('Index', function() {
            it('Basic index', function(done) {
                const mapper = objectMapper({
                    'array[0]': 'test.value0',
                });
                const result = mapper.map({
                    array: ['a', 'b', 'c'],
                });
                result.should.eql({
                    test: { value0: 'a' },
                });
                done();
            });
            it('Basic multi index', function(done) {
                const mapper = objectMapper({
                    'multiArray[1][2]': 'test.value12',
                });
                const result = mapper.map({
                    multiArray: [['a', 'b', 'c'], ['d', 'e', 'f']],
                });
                result.should.eql({
                    test: { value12: 'f' },
                });
                done();
            });
            it('Several multi index', function(done) {
                const mapper = objectMapper({
                    'multiArray[1][2]': 'test.value12',
                    'multiArray[0][1]': 'test.value01',
                    'multiArray[1][1]': 'other.value11',
                });
                const result = mapper.map({
                    multiArray: [['a', 'b', 'c'], ['d', 'e', 'f']],
                });
                result.should.eql({
                    test: { value12: 'f', value01: 'b' },
                    other: { value11: 'e' },
                });
                done();
            });
        });

        describe('Mixed Lookup & Index', function() {
            it('Basic lookup + filtered properties', function(done) {
                const mapper = objectMapper({
                    'Multi[2][].val': 'Multi[].value',
                });
                const result = mapper.map({
                    stuff: {
                        useless: true,
                    },
                    Multi: [
                        [{ p: { o: 1 }, val: 'a' }, { p: { o: 1 }, val: 'b' }, { p: { o: 1 }, val: 'c' }],
                        [{ p: { o: 1 }, val: 'd' }, { p: { o: 1 }, val: 'e' }, { p: { o: 1 }, val: 'f' }],
                        [{ p: { o: 1 }, val: 'g' }, { p: { o: 1 }, val: 'h' }, { p: { o: 1 }, val: 'i' }],
                        [{ p: { o: 1 }, val: 'j' }, { p: { o: 1 }, val: 'k' }, { p: { o: 1 }, val: 'l' }],
                    ],
                });
                result.should.eql({
                    Multi: [{ value: 'g' }, { value: 'h' }, { value: 'i' }],
                });
                done();
            });
            it('Complex omitted lookup + filtered properties', function(done) {
                const mapper = objectMapper({
                    'Multi[2].val': 'Multi[].value',
                });
                const result = mapper.map({
                    stuff: {
                        useless: true,
                    },
                    Multi: [
                        [{ p: { o: 1 }, val: 'a' }, { p: { o: 1 }, val: 'b' }, { p: { o: 1 }, val: 'c' }],
                        [{ p: { o: 1 }, val: 'd' }, { p: { o: 1 }, val: 'e' }, { p: { o: 1 }, val: 'f' }],
                        [{ p: { o: 1 }, val: 'g' }, { p: { o: 1 }, val: 'h' }, { p: { o: 1 }, val: 'i' }],
                        [{ p: { o: 1 }, val: 'j' }, { p: { o: 1 }, val: 'k' }, { p: { o: 1 }, val: 'l' }],
                    ],
                });
                result.should.eql({
                    Multi: [{ value: 'g' }, { value: 'h' }, { value: 'i' }],
                });
                done();
            });
            it('Basic lookup + array creation', function(done) {
                const mapper = objectMapper({
                    'Multi[2][].val': '[]',
                });
                const result = mapper.map({
                    stuff: {
                        useless: true,
                    },
                    Multi: [
                        [{ p: { o: 1 }, val: 'a' }, { p: { o: 1 }, val: 'b' }, { p: { o: 1 }, val: 'c' }],
                        [{ p: { o: 1 }, val: 'd' }, { p: { o: 1 }, val: 'e' }, { p: { o: 1 }, val: 'f' }],
                        [{ p: { o: 1 }, val: 'g' }, { p: { o: 1 }, val: 'h' }, { p: { o: 1 }, val: 'i' }],
                        [{ p: { o: 1 }, val: 'j' }, { p: { o: 1 }, val: 'k' }, { p: { o: 1 }, val: 'l' }],
                    ],
                });
                result.should.eql(['g', 'h', 'i']);
                done();
            });
            it('Single lookup for last field', function(done) {
                const mapper = objectMapper({
                    'list[2].field[]': 'test[].value',
                });
                const result = mapper.map({
                    list: [
                        { field: ['a', 'b', 'c'] },
                        { field: ['d', 'e', 'f'] },
                        { field: ['g', 'h', 'i'] },
                    ],
                });
                result.should.eql({ test: [{ value: 'g' }, { value: 'h' }, { value: 'i' }] });
                done();
            });
            it('Omitted single lookup for last field', function(done) {
                const mapper = objectMapper({
                    'list[2].field': 'test[].value',
                });
                const result = mapper.map({
                    list: [
                        { field: ['a', 'b', 'c'] },
                        { field: ['d', 'e', 'f'] },
                        { field: ['g', 'h', 'i'] },
                    ],
                });
                result.should.eql({ test: [{ value: 'g' }, { value: 'h' }, { value: 'i' }] });
                done();
            });
            it('Multi (x2) lookup', function(done) {
                const mapper = objectMapper({
                    'Multi[][1][].val': 'Multi[].value[]',
                });
                const result = mapper.map({
                    Multi: [
                        [[{ val: 'a' }], [{ val: 'b' }], [{ val: 'c' }]],
                        [[{ val: 'd' }], [{ val: 'e' }], [{ val: 'f' }]],
                        [[{ val: 'g' }], [{ val: 'h' }], [{ val: 'i' }]],
                        [[{ val: 'j' }], [{ val: 'k' }], [{ val: 'l' }]],
                    ],
                });
                result.should.eql({
                    Multi: [{
                        value: ['b'],
                    }, {
                        value: ['e'],
                    }, {
                        value: ['h'],
                    }, {
                        value: ['k'],
                    }],
                });
                done();
            });
            it('Omitted Multi (x2) lookup', function(done) {
                const mapper = objectMapper({
                    'Multi[][1].val': 'Multi[].value[]',
                });
                const result = mapper.map({
                    Multi: [
                        [[{ val: 'a' }], [{ val: 'b' }], [{ val: 'c' }]],
                        [[{ val: 'd' }], [{ val: 'e' }], [{ val: 'f' }]],
                        [[{ val: 'g' }], [{ val: 'h' }], [{ val: 'i' }]],
                        [[{ val: 'j' }], [{ val: 'k' }], [{ val: 'l' }]],
                    ],
                });
                result.should.eql({
                    Multi: [{
                        value: ['b'],
                    }, {
                        value: ['e'],
                    }, {
                        value: ['h'],
                    }, {
                        value: ['k'],
                    }],
                });
                done();
            });
            it('Multi (x2) lookup for last', function(done) {
                const mapper = objectMapper({
                    'array[][2][]': 'value[][]',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    value: [['c'], ['f'], ['i'], ['l']],
                });
                done();
            });
            it('Rebuild full custom destination', function(done) {
                const mapper = objectMapper({
                    'array[0][][]': 'values.are[].now[].here',
                });
                const result = mapper.map({
                    array: [
                        [['a'], ['b'], ['c']],
                        [['d'], ['e'], ['f']],
                        [['g'], ['h'], ['i']],
                        [['j'], ['k'], ['l']],
                    ],
                });
                result.should.eql({
                    values: {
                        are: [{ now: [{ here: 'a' }] }, { now: [{ here: 'b' }] }, { now: [{ here: 'c' }] }],
                    },
                });
                done();
            });
            it('Invalid destination array lookup count', function(done) {
                const mapper = objectMapper({
                    'Multi[1].val': 'Multi.value',
                });
                expect(() => mapper.map({
                    stuff: {
                        useless: true,
                    },
                    Multi: [
                        [{ p: { o: 1 }, val: 'a' }, { p: { o: 1 }, val: 'b' }, { p: { o: 1 }, val: 'c' }],
                        [{ p: { o: 1 }, val: 'd' }, { p: { o: 1 }, val: 'e' }, { p: { o: 1 }, val: 'f' }],
                        [{ p: { o: 1 }, val: 'g' }, { p: { o: 1 }, val: 'h' }, { p: { o: 1 }, val: 'i' }],
                        [{ p: { o: 1 }, val: 'j' }, { p: { o: 1 }, val: 'k' }, { p: { o: 1 }, val: 'l' }],
                    ],
                })).to.throw('Invalid destination array lookup count');
                done();
            });
        });
    });

    describe('Multi destinations', function() {
        it('should throw on array and object creation', function(done) {
            expect(() => objectMapper({ property: ['object', '[]'] })).to.throw();
            done();
        });
        it('should handle several destinations', function(done) {
            const mapper = objectMapper({
                a: ['d', 'e'],
                'c.t7': [{
                    key: 'd.p3',
                    overwrite: false,
                }, 'e.p3', {
                    key: 'a.p3',
                    clone: false,
                }],
            });
            const obj = {
                a: {
                    p1: 'true',
                    p2: 'test',
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: 9.0,
                    v6: 10,
                },
                c: {
                    t7: [1, 2, 3],
                    t8: false,
                    t9: 1009,
                },
            };
            const result = mapper.map(obj);
            result.should.eql({
                a: {
                    p3: [1, 2, 3],
                },
                d: {
                    p1: 'true',
                    p2: 'test',
                    p3: 10,
                },
                e: {
                    p1: 'true',
                    p2: 'test',
                    p3: [1, 2, 3],
                },
            });
            result.a.p3.should.equal(obj.c.t7);
            result.e.p3.should.not.equal(obj.c.t7);
            result.e.p3.should.eql(obj.c.t7);
            done();
        });
    });

    describe('transform', function() {
        it('transform value', function(done) {
            const mapper = objectMapper({
                'a.p1': [{
                    key: 'd.p4',
                    transform: v => !v,
                }, 'e'],
                'c.t7': [{
                    key: 'd.p3',
                    transform: v => v.map(a => a + 1),
                }],
                'a.p2': v => `pre_${v}`,
            });
            const obj = {
                a: {
                    p1: true,
                    p2: 'test',
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: 9.0,
                    v6: 10,
                },
                c: {
                    t7: [1, 2, 3],
                    t8: false,
                    t9: 1009,
                },
            };
            const result = mapper.map(obj);
            result.should.eql({
                a: {
                    p2: 'pre_test',
                },
                d: {
                    p3: [2, 3, 4],
                    p4: false,
                },
                e: true,
            });
            done();
        });
    });

    describe('overwrite', function() {
        it('local overwrite = false', function(done) {
            const mapper = objectMapper({
                a: true,
                'b.v4': {
                    key: 'a.p3',
                    overwrite: false,
                },
            });
            const result = mapper.map({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: false,
                    v6: 10,
                },
                c: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            result.should.eql({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
            });
            done();
        });
        it('local overwrite = true', function(done) {
            const mapper = objectMapper({
                a: true,
                'b.v4': {
                    key: 'a.p3',
                    overwrite: true,
                },
            });
            const result = mapper.map({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: false,
                    v6: 10,
                },
                c: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            result.should.eql({
                a: {
                    p1: true,
                    p2: false,
                    p3: true,
                },
            });
            done();
        });
    });

    describe('clone', function() {
        it('clone = false', function(done) {
            const mapper = objectMapper({
                a: true,
                other1: true,
            }, {
                clone: false,
            });
            const obj = {
                a: {
                    b: 'b',
                    c: {
                        d: 'd',
                    },
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 12,
                        },
                        other4: 'other4',
                    },
                },
            };
            const result = mapper.map(obj);
            result.should.eql({
                a: {
                    b: 'b',
                    c: {
                        d: 'd',
                    },
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 12,
                        },
                        other4: 'other4',
                    },
                },
            });
            obj.a.c = 'test';
            obj.other1.other2.other3.yo = 13;
            result.should.eql({
                a: {
                    b: 'b',
                    c: 'test',
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 13,
                        },
                        other4: 'other4',
                    },
                },
            });
            done();
        });
        it('clone = true', function(done) {
            const mapper = objectMapper({
                a: true,
                other1: true,
            }, {
                clone: true,
            });
            const obj = {
                a: {
                    b: 'b',
                    c: {
                        d: 'd',
                    },
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 12,
                        },
                        other4: 'other4',
                    },
                },
            };
            const result = mapper.map(obj);
            result.should.eql({
                a: {
                    b: 'b',
                    c: {
                        d: 'd',
                    },
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 12,
                        },
                        other4: 'other4',
                    },
                },
            });
            obj.a.c = 'test';
            obj.other1.other2.other3.yo = 13;
            result.should.eql({
                a: {
                    b: 'b',
                    c: {
                        d: 'd',
                    },
                },
                other1: {
                    other2: {
                        other3: {
                            yo: 12,
                        },
                        other4: 'other4',
                    },
                },
            });
            done();
        });
    });

    describe('filter', function() {
        it('should filter out unmapped properties', function(done) {
            const mapper = objectMapper({
                a: true,
                'b.v4': true,
                c: 'd',
            });
            const result = mapper.map({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: false,
                    v6: 10,
                },
                c: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            result.should.eql({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
                b: {
                    v4: true,
                },
                d: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            done();
        });
        it('should filter out specific properties', function(done) {
            const mapper = objectMapper({
                a: false,
                'b.v4': false,
                c: 'd',
            }, { filter: false });
            const result = mapper.map({
                a: {
                    p1: true,
                    p2: false,
                    p3: 10,
                },
                b: {
                    v4: true,
                    v5: false,
                    v6: 10,
                },
                c: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            result.should.eql({
                b: {
                    v5: false,
                    v6: 10,
                },
                d: {
                    t7: true,
                    t8: false,
                    t9: 10,
                },
            });
            done();
        });
    });

    describe('Object', function() {
        it('Simple properties', function(done) {
            const mapper = objectMapper({
                test: {
                    key: 'a.test',
                },
                'a.b.c': 'abc',
            });
            const obj = {
                test: 12,
                a: {
                    a: 'a.a',
                    b: {
                        a: {
                            val: 15,
                        },
                        b: 'a.b.b',
                        c: {
                            array: [1, 2, 3],
                        },
                    },
                    c: 'a.c',
                },
            };
            const result = mapper.map(obj);
            const expected = {
                a: {
                    test: 12,
                },
                abc: {
                    array: [1, 2, 3],
                },
            };
            result.should.eql(expected);
            done();
        });

        it('Use case (1)', function(done) {
            const mapper = objectMapper({
                modelName: 'name',
                'designer.schema.fields[].$_invalid': 'designer.schema.fields[]._invalid',
                'designer.schema.fields[].name': true,
                'designer.schema.fields[].type': true,
                'designer.schema.fields[].displayName': true,
                active: true,
                layout: true,
                description: true,
                tags: true,
            });
            const obj = {
                modelName: 'testTemplate',
                designer: {
                    schema: {
                        fields: [{
                            name: 'field1',
                            type: 'input',
                            displayName: 'Titre',
                            $_invalid: true, // eslint-disable-line camelcase
                        }, {
                            name: 'field2',
                            type: 'input',
                            displayName: 'Description',
                            $_invalid: false, // eslint-disable-line camelcase
                        }],
                    },
                },
                active: true,
                layout: 'layout',
                description: '',
                tags: ['Peinture', 'Renaissance'],
            };
            const expected = {
                name: 'testTemplate',
                designer: {
                    schema: {
                        fields: [{
                            name: 'field1',
                            type: 'input',
                            displayName: 'Titre',
                            _invalid: true,
                        }, {
                            name: 'field2',
                            type: 'input',
                            displayName: 'Description',
                            _invalid: false,
                        }],
                    },
                },
                active: true,
                layout: 'layout',
                description: '',
                tags: ['Peinture', 'Renaissance'],
            };
            const result = mapper.map(obj);
            result.should.eql(expected);
            done();
        });

        it('Use case (2)', function(done) {
            const mapper = objectMapper({
                modelName: 'name',
                'designer.schema.fields[].$_invalid': 'designer.schema.fields[]._invalid',
            }, { filter: false });
            const obj = {
                modelName: 'testTemplate',
                designer: {
                    schema: {
                        fields: [{
                            name: 'field1',
                            type: 'input',
                            displayName: 'Titre',
                            $_invalid: true, // eslint-disable-line camelcase
                        }, {
                            name: 'field2',
                            type: 'input',
                            displayName: 'Description',
                            $_invalid: false, // eslint-disable-line camelcase
                        }],
                    },
                },
                active: true,
                layout: 'layout',
                description: '',
                tags: ['Peinture', 'Renaissance'],
            };
            const expected = {
                name: 'testTemplate',
                designer: {
                    schema: {
                        fields: [{
                            name: 'field1',
                            type: 'input',
                            displayName: 'Titre',
                            _invalid: true,
                        }, {
                            name: 'field2',
                            type: 'input',
                            displayName: 'Description',
                            _invalid: false,
                        }],
                    },
                },
                active: true,
                layout: 'layout',
                description: '',
                tags: ['Peinture', 'Renaissance'],
            };
            const result = mapper.map(obj);
            result.should.eql(expected);
            done();
        });
    });
});
