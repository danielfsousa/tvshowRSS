/* eslint-disable no-unused-expressions */
/* eslint-disable arrow-body-style */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import omdb from 'omdb';
import omdbWrapper from './omdb';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('omdb.js', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('get()', () => {
    it('should call omdb when imdbid was given', () => {
      const show = { imdbID: 'tt0000000' };
      const callback = () => Promise.resolve();

      const stub = sandbox.stub(omdb, 'get')
        .withArgs({ imdb: show.imdbID }, sinon.match.any)
        .callsFake(null, callback);

      omdbWrapper.get('imdb', show);

      expect(stub).to.be.called;
    });

    it('should call omdb when name was given', () => {
      const show = { name: 'Mr. Robot' };
      const callback = () => Promise.resolve();

      const stub = sandbox.stub(omdb, 'get')
        .withArgs({ title: show.name, type: 'series' }, sinon.match.any)
        .callsFake(null, callback);

      omdbWrapper.get('name', show);

      expect(stub).to.be.called;
    });

    it('should reject when tvShow was not passed', () => {
      return expect(omdbWrapper.get('name'))
        .to.be.rejectedWith('Parameter show was not passed');
    });

    it('should reject when type was not passed', () => {
      return expect(omdbWrapper.get('', { name: 'Mr. Robot' }))
        .to.be.rejectedWith('type must be "imdb" or "name"');
    });

    it('should reject when no arguments were passsed', () => {
      return expect(omdbWrapper.get())
        .to.be.rejectedWith('Parameter show was not passed');
    });

    it('should reject when tv show was not found', () => {
      const show = { name: 'Nonexistent TvShow' };

      const fake = (options, done) => {
        done(null, null);
      };

      sandbox.stub(omdb, 'get').callsFake(fake);

      return expect(omdbWrapper.get('name', show))
        .to.be.rejectedWith('Tv show not found');
    });
  });
});
