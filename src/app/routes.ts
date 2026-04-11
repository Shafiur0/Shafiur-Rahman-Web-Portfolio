import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

type Tree = {
	path: string;
	children: Tree[];
	pageFile: string | null;
	routeFile: string | null;
	isParam: boolean;
	paramName: string;
	isCatchAll: boolean;
};

function buildRouteTree(dir: string, basePath = ''): Tree {
	const files = readdirSync(dir);
	const node: Tree = {
		path: basePath,
		children: [],
		pageFile: null,
		routeFile: null,
		isParam: false,
		isCatchAll: false,
		paramName: '',
	};

	// Check if the current directory name indicates a parameter
	const dirName = basePath.split('/').pop();
	if (dirName?.startsWith('[') && dirName.endsWith(']')) {
		node.isParam = true;
		const paramName = dirName.slice(1, -1);

		// Check if it's a catch-all parameter (e.g., [...ids])
		if (paramName.startsWith('...')) {
			node.isCatchAll = true;
			node.paramName = paramName.slice(3); // Remove the '...' prefix
		} else {
			node.paramName = paramName;
		}
	}

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			const childPath = basePath ? `${basePath}/${file}` : file;
			const childNode = buildRouteTree(filePath, childPath);
			node.children.push(childNode);
		} else if (/^page\.(js|jsx|ts|tsx)$/.test(file)) {
			node.pageFile = file;
		} else if (/^route\.(js|jsx|ts|tsx)$/.test(file)) {
			node.routeFile = file;
    }
	}

	return node;
}

function toRoutePath(path: string): string {
	const segments = path.split('/');
	const processedSegments = segments.map((segment) => {
		if (segment.startsWith('[') && segment.endsWith(']')) {
			const paramName = segment.slice(1, -1);

			if (paramName.startsWith('...')) {
				return '*';
			}
			if (paramName.startsWith('[') && paramName.endsWith(']')) {
				return `:${paramName.slice(1, -1)}?`;
			}
			return `:${paramName}`;
		}
		return segment;
	});

	return processedSegments.join('/');
}

function generateRoutes(node: Tree): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	if (node.pageFile) {
		const componentPath = node.path === '' ? `./${node.pageFile}` : `./${node.path}/${node.pageFile}`;

		if (node.path === '') {
			routes.push(index(componentPath));
		} else {
			routes.push(route(toRoutePath(node.path), componentPath));
		}
	}

	if (node.routeFile && node.path !== '' && !node.path.startsWith('api/__create')) {
		const routeModulePath = `./${node.path}/${node.routeFile}`;
		routes.push(route(toRoutePath(node.path), routeModulePath));
	}

	for (const child of node.children) {
		routes.push(...generateRoutes(child));
	}

	return routes;
}
if (import.meta.env.DEV) {
	import.meta.glob('./**/page.{js,jsx,ts,tsx}', {});
	import.meta.glob('./**/route.{js,jsx,ts,tsx}', {});
	if (import.meta.hot) {
		import.meta.hot.accept(() => {
			import.meta.hot?.invalidate();
		});
	}
}
const tree = buildRouteTree(__dirname);
const notFound = route('*', './__create/not-found.tsx');
const routes = [...generateRoutes(tree), notFound];

export default routes;
