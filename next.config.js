const isProd = process.env.NODE_ENV === 'production'
// URLAPI=https://api2.qayarix.com
// URLAPI=http://144.217.253.15:5000
module.exports = {
    assetPrefix: '',
    publicRuntimeConfig: {
        staticFolder: ''
   },
    env: {
        urlapi: "http://51.161.115.63:8082",
        endpoints: {
            transaction: "/api/main/transaction",
            selsimple: "/api/main/",
            multi: "/api/main/multi",
            selpaginated: "/api/main/paginated",
            login: '/api/auth/login',
            validatetoken: '/api/auth/validateToken'
        }
    }
}