/* eslint-disable */
import chai from 'chai';
import chaiString from 'chai-string';
import chaiHttp from 'chai-http';
import server from '../../../bin/www';
import TvShow from './model';
import Feed from '../../services/rss';

chai.use(chaiString);
chai.use(chaiHttp);

const request = chai.request;
const expect = chai.expect;

describe('Show Routes', () => {
  describe('GET /shows/:imdbid', () => {
    // removes all documents from database
    before(() => TvShow.remove({}));

    it('should get 720p "Fargo" magnets when given a valid imdbID', () => {
      return request(server)
        .get('/shows/tt2802850/720p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should not get magnets when given a nonexistent imdbID', (done) => {
      request(server)
        .get('/shows/tt9999999')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body).to.have.a.property('error');
          expect(res.body.error).to.have.a.property('code').equals(404);
          expect(res.body.error).to.have.a.property('message').equals('Tv show not found');
          done();
        });
    });

    it('should not get magnets from an old show like "I, Claudius"', (done) => {
      request(server)
        .get('/shows/tt0074006')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('code').equals(404);
          expect(res.body.error).to.have.property('message').equals('No download links found');
          done();
        });
    });
  });

  describe('GET /shows/:imdbid/:resolution', () => {
    it('should get 1080p "Fargo" magnets', () => {
      return request(server)
        .get('/shows/tt2802850/1080p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('1080p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get 720p "Fargo" magnets', () => {
      return request(server)
        .get('/shows/tt2802850/720p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get SD "Fargo" magnets', () => {
      return request(server)
        .get('/shows/tt2802850/sd')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.not.contain('1080p');
          expect(feed.items[0].title).to.not.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get 720p "Fargo" magnets when given an invalid resolution', () => {
      return request(server)
        .get('/shows/tt2802850/2024p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });
  });

  describe('GET /shows/:name/:resolution', () => {
    it('should get 1080p "Fargo" magnets', () => {
      return request(server)
        .get('/shows/Fargo/1080p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('1080p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get 720p "Fargo" magnets', () => {
      return request(server)
        .get('/shows/Fargo/720p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get SD "Fargo" magnets', () => {
      return request(server)
        .get('/shows/Fargo/sd')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.not.contain('1080p');
          expect(feed.items[0].title).to.not.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get 720p "Fargo" magnets when given an invalid resolution', () => {
      return request(server)
        .get('/shows/Fargo/5000p')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });
  });

  describe('GET /shows/:name', () => {
    it('should get default resolution (720p) "Fargo" magnets', () => {
      return request(server)
        .get('/shows/Fargo')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Fargo');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should not get magnets when given an invalid name', (done) => {
      request(server)
        .get('/shows/GodLovesYou')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.property('code').equals(404);
          expect(res.body.error).to.have.property('message').equals('Tv show not found');
          done();
      });
    });

    it('should get default resolution (720p) "Mr. Robot" magnets', () => {
      return request(server)
        .get('/shows/Mr. Robot')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Mr. Robot');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });

    it('should get default resolution (720p) "Mr Robot" magnets', () => {
      return request(server)
        .get('/shows/Mr Robot')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/xml; charset=utf-8');
          return Feed.parse(res.text);
        })
        .then((feed) => {
          expect(feed).to.have.a.property('title').equals('TvShowRSS: Mr. Robot');
          expect(feed).to.have.a.property('items').that.is.an('array');
          expect(feed.items[0].title).to.contain('720p');
          expect(feed.items[0].enclosure).to.have.a.property('url').that.startsWith('magnet:?');
          expect(feed.items[0].enclosure).to.have.a.property('type').equals('application/x-bittorrent');
        });
    });
  });
});
