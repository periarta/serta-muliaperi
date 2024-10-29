require("dotenv").config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const loadModel = require("../services/loadModel");
const InputError = require("../exceptions/InputError");

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;

    if (response instanceof InputError) {
      const newResponse = h.response({
        status: "fail",
        message: `${response.message} Silakan gunakan foto lain.`,
      });
      // newResponse.code(response.statusCode);
      newResponse.code(
        Number.isInteger(response.statusCode) ? response.statusCode : 400
      ); // Gunakan 400 jika statusCode tidak valid
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      // newResponse.code(response.statusCode);
      newResponse.code(
        Number.isInteger(response.statusCode) ? response.statusCode : 500
      ); // Gunakan 500 jika statusCode tidak valid
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
})();
