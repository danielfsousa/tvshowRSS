/* eslint-disable no-unused-expressions */
/* eslint-disable arrow-body-style */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import xml2js from 'xml2js';
import RSS from 'rss';
import Feed from './rss';
import TvShow from '../api/show/model';
import { fargoXmlFeed } from '../util/fakes';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('rss.js', () => {
  const tvShow = new TvShow({ name: 'Mr. Robot' });
  let sandbox;
  let feed;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    feed = new Feed(tvShow);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor()', () => {
    it('should set tvShow property', () => {
      expect(feed.tvShow).to.be.an.instanceof(TvShow);
    });

    it('should set title property', () => {
      expect(feed.config.title).to.contain('Mr. Robot');
    });
  });

  describe('validateResolution()', () => {
    it('should return 1080p when given 1080p', () => {
      expect(Feed.validateResolution('1080p')).to.be.equals('_1080p');
    });

    it('should return 720p when given 720p', () => {
      expect(Feed.validateResolution('720p')).to.be.equals('_720p');
    });

    it('should return sd when given SD', () => {
      expect(Feed.validateResolution('SD')).to.be.equals('sd');
    });

    it('should return 720p when given an invalid resolution', () => {
      expect(Feed.validateResolution('not_a_resolution')).to.be.equals('_720p');
    });

    it('should return 720p when no arguments were passed', () => {
      expect(Feed.validateResolution()).to.be.equals('_720p');
    });
  });

  describe('create()', () => {
    it('should call validateResolution()', () => {
      const spy = sandbox.spy(Feed, 'validateResolution');

      feed.create('1080p');

      expect(spy).to.have.been.calledWith('1080p');
    });

    it('should return a RSS object', () => {
      const feedInstance = feed.create('720p');

      expect(feedInstance).to.be.an.instanceof(RSS);
    });
  });

  describe('parse()', () => {
    it('should return a parsed rss object', (done) => {
      Feed.parse(fargoXmlFeed)
        .then((feedObj) => {
          expect(feedObj).to.have.all.keys('title', 'description', 'items');
          expect(feedObj.title).to.contain('Fargo');
          expect(feedObj.items).to.not.be.empty;
          done();
        })
        .catch(done);
    });

    it('should throw when given an invalid rss string', () => {
      const invalidRSS = 'invalid_rss';

      sandbox.stub(xml2js, 'parseString').callsFake((str, callback) => {
        callback(new Error());
      });

      return expect(Feed.parse(invalidRSS)).to.be.rejectedWith('Invalid rss');
    });
  });
});
