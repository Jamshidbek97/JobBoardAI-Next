import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		const token = getJwtToken();
		return !token || token.length > 0;
	}, 
	fetchAccessToken: async () => {
		try {
			// Implement your token refresh logic here
			// This should make a request to your refresh endpoint
			const response = await fetch('/api/auth/refresh', {
				method: 'POST',
				credentials: 'include',
			});
			
			if (response.ok) {
				const data = await response.json();
				return data.accessToken;
			}
			return null;
		} catch (error) {
			console.error('Token refresh failed:', error);
			return null;
		}
	},
	handleFetch: (accessToken: string) => {
		// Store the new access token
		if (accessToken) {
			localStorage.setItem('accessToken', accessToken);
		}
	},
});

class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		// Don't add token to URL for security
		this.socket = new WebSocket(url);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connected successfully');
		};
		this.socket.onmessage = (msg) => {
			console.log('WebSocket message received:', msg.data);
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		this.socket.onclose = (event) => {
			console.log('WebSocket closed:', event.code, event.reason);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(data);
		} else {
			console.warn('WebSocket not ready, cannot send data');
		}
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		// Only create WebSocket link if we're in browser and have WS URL
		const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.REACT_APP_API_WS;
		let wsLink = null;
		
		if (wsUrl && typeof window !== 'undefined') {
			try {
				wsLink = new WebSocketLink({
					uri: wsUrl,
					options: {
						reconnect: true,
						reconnectionAttempts: 5,
						timeout: 30000,
						connectionParams: () => {
							return { 
								headers: getHeaders(),
								// Don't expose token in URL, send it in connection params
								authToken: getJwtToken()
							};
						},
					},
					webSocketImpl: LoggingWebSocket,
				});
			} catch (error) {
				console.warn('WebSocket connection failed:', error);
				wsLink = null;
			}
		}

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});

		// Create split link only if WebSocket is available
		let splitLink;
		if (wsLink) {
			splitLink = split(
				({ query }) => {
					const definition = getMainDefinition(query);
					return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
				},
				wsLink,
				authLink.concat(link),
			);
		} else {
			// If no WebSocket, just use HTTP link
			splitLink = authLink.concat(link);
		}

		// If WebSocket fails, fall back to HTTP-only
		if (!wsLink) {
			console.warn('WebSocket not available, using HTTP-only mode');
		}
		
		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
