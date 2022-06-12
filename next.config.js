const isProd = process.env.NODE_ENV === 'production'
// URLAPI=https://api2.qayarix.com
// URLAPI=http://144.217.253.15:5000
module.exports = {
    assetPrefix: '',
    publicRuntimeConfig: {
        staticFolder: ''
   },
    env: {
        urlapi: "http://149.56.22.124:5000",
        endpoints: {
            transaction: "/api/web/main/simpleTransaction",
            selsimple: "/api/web/main/",
            selpaginated: "/api/web/main/paginated",
            login: '/api/web/login',
            validatetoken: '/api/web/validateToken'
        }
    }
}