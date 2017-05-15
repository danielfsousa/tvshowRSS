# tv-show-rss-api

[![Greenkeeper badge](https://badges.greenkeeper.io/danielfsousa/tv-show-rss-api.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/danielfsousa/tv-show-rss-api.svg?branch=master)](https://travis-ci.org/danielfsousa/tv-show-rss-api) [![Coverage Status](https://coveralls.io/repos/github/danielfsousa/tv-show-rss-api/badge.svg?branch=master)](https://coveralls.io/github/danielfsousa/tv-show-rss-api?branch=master)

:tv: Track ongoing TV shows by subscribing to the generated RSS on your prefered torrent client

## How to use

#### Locally
1. Rename .env.example to .env and set your mongodb uri
2. Run ```npm run dev``` or ```yarn dev```
3. Choose your favorite torrent client and add this url as a feed RSS:
```
http://localhost:3000/shows/[NAME]/[RESOLUTION]
```

#### Already deployed
1. Choose your favorite torrent client and add this url as a feed RSS:
```
http://api.tvshowrss.tk/shows/[NAME]/[RESOLUTION]
```

## Example
```
http://api.tvshowrss.tk/shows/fargo/1080p
```

## Resolutions
* 1080p
* 720p
* SD
