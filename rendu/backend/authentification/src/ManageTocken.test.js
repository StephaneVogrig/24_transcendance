const { ManageTockenGetName, ManageTockenGetEmail, ManageTockenGetUserInfo } = require('./ManageTocken');

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('ManageTocken', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ManageTockenGetName', () => {
        it('should return user name for valid token', async () => {
            const mockToken = 'valid_google_oauth_token';
            const mockUserData = { name: 'John Doe' };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserData
            });
            
            const result = await ManageTockenGetName(mockToken);
            
            expect(result).toBe('John Doe');
            expect(fetch).toHaveBeenCalledWith('https://www.googleapis.com/oauth2/v2/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${mockToken}`,
                    'Accept': 'application/json'
                }
            });
        });

        it('should throw error for invalid token', async () => {
            const mockToken = 'invalid_token';
            
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });
            
            await expect(ManageTockenGetName(mockToken)).rejects.toThrow('Failed to retrieve user name: Google API error: 401 Unauthorized');
        });

        it('should handle empty token', async () => {
            const mockToken = '';
            
            await expect(ManageTockenGetName(mockToken)).rejects.toThrow('Token cannot be empty');
        });

        it('should handle non-string token', async () => {
            const mockToken = 123;
            
            await expect(ManageTockenGetName(mockToken)).rejects.toThrow('Token must be a string');
        });
    });

    describe('ManageTockenGetEmail', () => {
        it('should return user email for valid token', async () => {
            const mockToken = 'valid_google_oauth_token';
            const mockUserData = { email: 'john.doe@example.com' };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserData
            });
            
            const result = await ManageTockenGetEmail(mockToken);
            
            expect(result).toBe('john.doe@example.com');
            expect(fetch).toHaveBeenCalledWith('https://www.googleapis.com/oauth2/v2/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${mockToken}`,
                    'Accept': 'application/json'
                }
            });
        });

        it('should throw error for null token', async () => {
            const mockToken = null;
            
            await expect(ManageTockenGetEmail(mockToken)).rejects.toThrow('Token cannot be null');
        });

        it('should throw error for undefined token', async () => {
            const mockToken = undefined;
            
            await expect(ManageTockenGetEmail(mockToken)).rejects.toThrow('Token cannot be null');
        });
    });

    describe('ManageTockenGetUserInfo', () => {
        it('should return complete user info for valid token', async () => {
            const mockToken = 'valid_google_oauth_token';
            const mockUserData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                id: '123456789',
                picture: 'https://example.com/picture.jpg'
            };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserData
            });
            
            const result = await ManageTockenGetUserInfo(mockToken);
            
            expect(result).toEqual({
                name: 'John Doe',
                email: 'john.doe@example.com',
                id: '123456789',
                picture: 'https://example.com/picture.jpg'
            });
        });

        it('should handle missing fields with default values', async () => {
            const mockToken = 'valid_google_oauth_token';
            const mockUserData = {}; // Données vides
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUserData
            });
            
            const result = await ManageTockenGetUserInfo(mockToken);
            
            expect(result).toEqual({
                name: 'Unknown',
                email: 'Unknown',
                id: null,
                picture: null
            });
        });
    });
});
