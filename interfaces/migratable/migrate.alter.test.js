/**
 * Module dependencies
 */

var bootstrapAndDescribe = require('../../lib/bootstrapAndDescribe'),
  bootstrap = require('../../lib/bootstrap'),
  assert = require('assert'),
  should = require('should');


describe('Migratable Interface', function() {
  describe('migrate: "alter"', function() {
    
    // Fixture (used below)
    // for `bootstrap` and `bootstrapAndDescribe`
    var SCHEMA = {
      collections: {
        pirate: {
          migrate: 'alter',
          connection: 'test',
          attributes: {
            name: 'string',
            age: 'integer'
          }
        }
      }
    };


    /**
     * Bootstrap Waterline.
     * (1st time)
     */
    bootstrapAndDescribe(SCHEMA, function testSuite (ontology) {
      testForExpectedSchema(ontology);
    });



    /**
     * Bootstrap waterline again and create some things.
     * Ensure that preconditions still hold.
     */
    describe('bootstrap waterline and create some data', function () {
      
      var waterline, ontology;

      before(function (done) {
        waterline = bootstrap(SCHEMA, function (err, _ontology) {
          if (err) return done(err);
          ontology = _ontology;
          return done();
        });
      });
      after(function (done) {
        waterline.teardown(done);
      });

      it('should be able to create blackbeard', function (done) {
        var Pirate = ontology.collections.pirate;
        Pirate.create({
          name: 'Blackbeard'
        }).exec(done);
      });

      it('should have created blackbeard', function (done) {
        var Pirate = ontology.collections.pirate;
        Pirate.findOneByName('blackbeard').exec(function (err, blackbeard) {
          if (err || !blackbeard) return done(err || 'Record was not created!!');
          return done();
        });
      });

      it('should have precisely one pirate', function (done) {
        var Pirate = ontology.collections.pirate;
        Pirate.count().exec(function (err, numPirates) {
          assert(numPirates === 1);
          return done(err);
        });
      });

    });


    /**
     * Bootstrap Waterline one more time
     * and make sure the data is still there.
     * (`alter` should NOT delete data)
     */
    bootstrapAndDescribe(SCHEMA, function (ontology) {
      testForExpectedSchema(ontology);

      it('should still have one pirate (i.e. data is still there)', function (done) {
        var Pirate = ontology.collections.pirate;
        Pirate.count().exec(function (err, numPirates) {
          assert(numPirates === 1);
          return done(err);
        });
      });

    });
  });
});



/**
 * This suite tests that initialized ontology has NO data,
 * but also has the expected schema.
 *
 * @param  {Object} ontology [description]
 */
function testForExpectedSchema (ontology) {

  it('sanity check first...', function () {
    ontology.should.be.an.Object;
    ontology.collections.should.be.an.Object;
    ontology.collections.pirate.should.be.an.Object;
    ontology.collections.pirate.migrate
      .should.equal('alter');
  });

  it('should have tables', function (done) {
    var conn = ontology.connections.test;
    conn._adapter.describe('test', 'pirate', function (err, schema) {
      should(schema).be.an.Object;
      done(err);
    });
  });
}