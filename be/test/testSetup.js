import app from '../index.js';

let server;

export const startServer = (port) => {
  server = app.listen(port);
  return server;
};

export const closeServer = (done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
};
