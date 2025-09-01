export const allowedRoutes = [
    '/api/authentification/health',
    // '/api/authentification/debug/oauth',
    //'/api/authentification/userAuthRegistering',
    // '/api/authentification/getAllUserInfo', //debug
    // '/api/authentification/getActiveAuthUserInfo',
    // '/api/authentification/getUserInfo',
    '/api/authentification/LogStatus',
    '/api/authentification/oauth/googleCodeToTockenUser', // previously '/api/authentification/oauth/google',
    '/api/authentification/userInfoJWT', // previously '/api/authentification/user'
    '/api/authentification/logout',
    '/api/authentification/refresh',
    '/api/authentification/getAuthUserInfo',

    '/api/blockchain/health',

    '/api/database/health',

    '/api/game/health',
    '/api/game/start',

    '/api/matchmaking/health',
    '/api/matchmaking/join',

    '/api/tournament/health',
    '/api/tournament/join',
    '/api/tournament/getAllTournaments',

    '/api/websocket/health',
    '/api/websocket/my-websocket',

    '/api/ai/health',
    '/api/ai/create',

    '/api/gateway/health',

];
