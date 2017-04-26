// handle errors
export function errorHandler(req, res) {
  return (err) => {
    if (!err) return;
    // Log error
    console.log(err);

    res.locals.message = err.message ||
      (err.error === 'No results found' ? 'No download links found' : '');

    res.locals.status = err.status ||
      (err.error === 'No results found' ? 404 : 500);

    // render the error page if headers were not sent
    if (!res.headersSent) {
      res.status(res.locals.status);
      res.send({ error: {
        code: res.locals.status,
        message: res.locals.message,
      } }).end();
    }
  };
}

// route not found
export function badRequest(req, res) {
  const host = `${req.get('host')}/shows/`;
  res.status(400).send({ error: {
    code: 400,
    message: `Api usage: ${host}<nameOrImdbID>/<resolution> or ${host}<nameOrImdbID>?resolution=<resolution>`,
  } });
}

