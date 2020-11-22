const { initAppGet } = require("./internal/appInitializer");
const { either } = require("fp-ts");

describe("functionalResponsePlugin", () => {
  let app;
  afterEach(() => {
    return app.close();
  });

  it("correctly parses right part of Either", () => {
    expect.assertions(2);

    const route = (_req, _reply) => {
      const payload = either.right({
        user: {
          id: 1,
        },
      });

      return Promise.resolve(payload);
    };

    return initAppGet(route)
      .ready()
      .then((_app) => {
        app = _app;
        return app
          .inject()
          .get("/")
          .end()
          .then((response) => {
            expect(response.statusCode).toEqual(200);
            expect(response.json().user).toEqual({ id: 1 });
          });
      });
  });

  it("correctly parses left part of Either when resolved", () => {
    expect.assertions(3);

    const route = (_req, _reply) => {
      const payload = either.left(new Error("Invalid state"));
      return Promise.resolve(payload);
    };

    return initAppGet(route)
      .ready()
      .then((_app) => {
        app = _app;
        return app
          .inject()
          .get("/")
          .end()
          .then((response) => {
            expect(response.statusCode).toEqual(500);
            expect(response.json()).toEqual({
              ok: false,
            });
          });
      });
  });
});
