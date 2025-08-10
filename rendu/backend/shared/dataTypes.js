export const username = {
    type: 'string',
    minLength: 3,
    maxLength: 25,
    pattern: '^[a-zA-Z0-9_-]+$',
    description: 'Username must be 3-25 characters, alphanumeric with _ and - allowed'
}