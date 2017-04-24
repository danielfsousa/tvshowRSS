// catch 404 and forward to error handler
export function error404(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}

// handle errors
export function errorHandler(err, req, res) {
  // set locals, only providing error in development
  if (req.app.get('env') !== 'production') {
    res.locals.error = err;
    res.locals.message = err.message || err.error;
    res.locals.status = err.status;
    console.log(err);
  }

  // render the error page
  res.status(res.locals.status || 500);
  res.send({ error: {
    code: res.locals.status || 500,
    info: res.locals.message,
  } });
}

export function error(req, res) {
  return (err) => {
    errorHandler(err, req, res);
  };
}

