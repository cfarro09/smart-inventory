const isProd = process.env.NODE_ENV === 'production'
// URLAPI=https://api2.qayarix.com
// URLAPI=http://144.217.253.15:5000
module.exports = {
    assetPrefix: '',
    publicRuntimeConfig: {
        staticFolder: ''
   },
    env: {
        urlapi: isProd ? process.env.URLAPI : "http://44.198.55.204:8080",
        endpoints: {
            transaction: "/api/main/transaction",
            selsimple: "/api/main/",
            selpaginated: "/api/main/paginated",
            login: '/api/auth/login',
            validatetoken: '/api/auth/validateToken'
        }
    }
}