const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = app => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://deriv-api.crypto.com",
      pathRewrite: {
        "^/api": "",
      },
      changeOrigin: true
    })
  );
};