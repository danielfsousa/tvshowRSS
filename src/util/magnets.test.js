/* eslint-disable no-unused-expressions */
/* eslint-disable arrow-body-style */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import rarbg from 'rarbg';
import { padStart, omit } from 'lodash';
import sinonStubPromise from 'sinon-stub-promise';
import TvShow from '../api/show/model';
import { filter, magnets, retry, save } from './magnets';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);
sinonStubPromise(sinon);

const rarbgData = [
  {
    filename: 'Mr. Robot S02E01 1080p HDTV',
    download: 'magnet:?xt=urn:btih...',
  },
  {
    filename: 'Mr. Robot S02E01 1080p WebRip',
    download: 'magnet:?xt=urn:btih...',
  },
  {
    filename: 'Mr. Robot S02E01 720p HDTV',
    download: 'magnet:?xt=urn:btih...',
  },
  {
    filename: 'Mr. Robot S02E01 720p WebRip',
    download: 'magnet:?xt=urn:btih...',
  },
  {
    filename: 'Mr. Robot S02E01 HDTV',
    download: 'magnet:?xt=urn:btih...',
  },
  {
    filename: 'Mr. Robot S02E02 HDTV',
    download: 'magnet:?xt=urn:btih...',
  },
];

const filteredData = [
  {
    sd: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
    _720p: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
    _1080p: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
  },
  {
    sd: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
    _720p: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
    _1080p: { title: 'abc', link: 'magnet:?xt=urn:btih...' },
  },
];

describe('magnets.js', () => {
  let sandbox;
  let tvShow;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    tvShow = new TvShow({ name: 'Mr. Robot', imdbID: 'tt9999999', current_season: 2 });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('filter()', () => {
    it('should not have more than one object per episode', () => {
      return expect(filter(rarbgData)).to.eventually.have.lengthOf(2);
    });

    it('should contain SD links', (done) => {
      filter(rarbgData).then((filtered) => {
        expect(filtered[0]).to.have.a.property('sd');
        expect(filtered[0].sd).to.have.keys(['title', 'link']);
        done();
      }).catch(done);
    });

    it('should contain 720p links', (done) => {
      filter(rarbgData).then((filtered) => {
        expect(filtered[0]).to.have.a.property('_720p');
        expect(filtered[0]._720p).to.have.keys(['title', 'link']);
        done();
      }).catch(done);
    });

    it('should contain 1080p links', (done) => {
      filter(rarbgData).then((filtered) => {
        expect(filtered[0]).to.have.a.property('_1080p');
        expect(filtered[0]._1080p).to.have.keys(['title', 'link']);
        done();
      }).catch(done);
    });

    it('should return empty object when there are no 1080p links', (done) => {
      filter(rarbgData).then((filtered) => {
        expect(filtered[1]).to.have.a.property('_1080p').that.is.empty;
        done();
      }).catch(done);
    });
  });

  describe('magnets()', () => {
    it('should call rarbg.search with imdbid and season formated', (done) => {
      const stub = sandbox.stub(rarbg, 'search').returnsPromise().resolves();
      const fmtSeason = `S${padStart(tvShow.current_season, 2, 0)}`;

      magnets(tvShow).then(() => {
        expect(stub).to.be.calledWithMatch({
          search_imdb: tvShow.imdbID,
          search_string: fmtSeason,
        });
        done();
      });
    });

    it('should call rarbg.search with name and season formated', (done) => {
      const stub = sandbox.stub(rarbg, 'search').returnsPromise().resolves();
      const fmtSeason = `S${padStart(tvShow.current_season, 2, 0)}`;
      const showWithoutImdbID = omit(tvShow, 'imdbID');

      magnets(showWithoutImdbID).then(() => {
        expect(stub).to.be.calledWithMatch({ search_string: `${tvShow.name} ${fmtSeason}` });
        done();
      });
    });

    it('should set current season to 1 when current season is undefined', (done) => {
      const stub = sandbox.stub(rarbg, 'search').returnsPromise().resolves();
      const fmtSeason = `S${padStart(1, 2, 0)}`;
      tvShow.current_season = undefined;

      magnets(tvShow).then(() => {
        expect(stub).to.be.calledWithMatch({ search_string: fmtSeason });
        done();
      });
    });

    it('should format search string by (current season - n) when parameter "previousSeasons" was passed', (done) => {
      const previousSeasons = 2;
      const season = (tvShow.current_season || 1) - previousSeasons;
      const fmtSeason = `S${padStart(season, 2, 0)}`;

      const stub = sandbox.stub(rarbg, 'search').returnsPromise().resolves();

      magnets(tvShow, previousSeasons).then(() => {
        expect(stub).to.be.calledWithMatch({ search_string: fmtSeason });
        done();
      });
    });

    it('should reject when parameter "show" was not passed', () => {
      return expect(magnets())
        .to.be.rejectedWith('Parameter "show" is obrigatory');
    });

    it('should reject when previousSeasons parameter is not a number', () => {
      return expect(magnets(tvShow, 'what'))
        .to.be.rejectedWith('Parameter "previousSeasons" is not a number');
    });
  });

  describe('retry()', () => {
    it('should call magnets', (done) => {
      const stub = sandbox.stub(rarbg, 'search').returnsPromise().resolves();

      retry(tvShow)().then(() => {
        expect(stub).to.be.calledOnce;
        done();
      }).catch(done);
    });

    it('should call magnets twice when magnets were not found on the first try', (done) => {
      const stub = sandbox.stub(rarbg, 'search');
      stub.onCall(0).returns(Promise.reject());
      stub.onCall(1).returns(Promise.resolve());

      retry(tvShow)().then(() => {
        expect(stub).to.be.calledTwice;
        done();
      }).catch(done);
    });

    it('should reject when show have not a name and imdbid', () => {
      const show = omit(tvShow, ['name', 'imdbID']);
      return expect(retry(show)())
        .to.be.rejectedWith('Tv show not found');
    });

    it('should reject when current season is 1 or less', () => {
      tvShow.current_season = 1;

      return expect(retry(tvShow)())
        .to.be.rejectedWith('No download links found');
    });
  });

  describe('save()', () => {
    it('should update magnets array', (done) => {
      function checkMagnets() {
        return Promise.resolve(this);
      }

      sandbox.stub(TvShow.prototype, 'save').callsFake(checkMagnets);

      save(tvShow)(filteredData)
        .then((show) => {
          expect(show.magnets[0].sd.link).to.be.equals(filteredData[0].sd.link);
          expect(show.magnets[0]._720p.link).to.be.equals(filteredData[0]._720p.link);
          expect(show.magnets[0]._1080p.title).to.be.equals(filteredData[0]._1080p.title);
          done();
        })
        .catch(done);
    });

    it('should call TvShow.save', () => {
      const stub = sandbox.stub(TvShow.prototype, 'save').returnsPromise().resolves();

      return save(tvShow)(filteredData).then(() => {
        expect(stub).to.have.been.calledOnce;
      });
    });

    it('should update magnets even when a model with the same imdbid already exists on database', (done) => {
      const saveStub = sandbox.stub(TvShow.prototype, 'save').returnsPromise().rejects();
      const updateStub = sandbox.stub(TvShow, 'update');

      save(tvShow)(filteredData).then(() => {
        expect(saveStub).to.be.calledOnce;
        expect(updateStub).to.be.calledOnce;
        done();
      }).catch(done);
    });

    it('should reject when show is not as instance of TvShow', () => {
      return expect(save({})(filteredData)).to.be.rejectedWith('Parameter show is not a TvShow instance');
    });
  });
});
