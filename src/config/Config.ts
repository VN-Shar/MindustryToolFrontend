let keys = require('./Export');

export const MAP_FILE_EXTENSION = 'msav';

export const ACCESS_TOKEN = 'accessToken';

export const USER_DATA = 'userData';

export const API_BASE_URL = keys.apiBaseUrl;

export const SCHEMATIC_FILE_EXTENSION = 'msch';

export const OAUTH2_REDIRECT_URL = keys.redirectUri;

export const PNG_IMAGE_PREFIX = 'data:image/png;base64,';

export const DISCORD_AUTH_URL = API_BASE_URL + 'oauth2/authorize/discord?redirect_uri=' + OAUTH2_REDIRECT_URL;

export enum LoaderState {
	LOADING,
	ERROR,
	MORE,
	NO_MORE
}

export const MAX_ITEM_PER_PAGE = 10;


