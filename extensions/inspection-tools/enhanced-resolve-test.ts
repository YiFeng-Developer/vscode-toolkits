import * as EnhancedResolve from 'enhanced-resolve';
import * as fse from 'fs-extra';
// const fs = require("fs");

const factory = EnhancedResolve.ResolverFactory;

const resolveModules = [
  'node_modules',
  'src/components',
  'src',
  'origin/src/components',
  'origin/src',
];

const resolver = factory.createResolver({
  modules: resolveModules,
  fileSystem: fse,
  mainFields: ["index"],
  extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.json']
});

resolver.resolve(
	{ environments: ["node+es3+es5+process+native"] },
	"/Users/zyf/terminus/h3c/gaia-mall/origin/src/design",
	"../../origin/src/design/components/image/index",
	{ log: console.log },
	(err: any, filepath) => {
		console.log("file >>>", filepath);
	}
);
