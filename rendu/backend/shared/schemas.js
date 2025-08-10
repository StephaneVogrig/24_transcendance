import * as dataTypes from './dataTypes.js';

export const usernameBody = {
    body: {
        type: 'object',
        required: ['username'],
        properties: {
            username: dataTypes.username
        },
        additionalProperties: false
    }
}

export const usernameQuery = {
    querystring: {
        type: 'object',
        required: ['username'],
        properties: {
            username: dataTypes.username
        },
        additionalProperties: false
    }
}
