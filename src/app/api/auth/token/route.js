import { getToken } from '@auth/core/jwt';
import { createRouteHandlers } from '@/app/api/utils/react-router-method-adapter';
export async function GET(request) {
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: (process.env.AUTH_URL ?? '').startsWith('https'),
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: (process.env.AUTH_URL ?? '').startsWith('https'),
		}),
	]);

	if (!jwt) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	return new Response(
		JSON.stringify({
			jwt: token,
			user: {
				id: jwt.sub,
				email: jwt.email,
				name: jwt.name,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

const routeHandlers = createRouteHandlers({ GET });

export async function loader(args) {
	return routeHandlers.loader(args);
}

export async function action(args) {
	return routeHandlers.action(args);
}
