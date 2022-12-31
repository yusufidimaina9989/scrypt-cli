const fs = require('fs-extra');
const path = require('path');
const sh = require('shelljs');
const json5 = require('json5');
const { green, red } = require('chalk');
const { stepCmd, readdirRecursive } = require('./helpers');
const { resolve } = require('path');
const { readdir } = require('fs').promises;


async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

async function compile() {
  
  // Check TS config
  const tsConfig = json5.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  let scryptTransFound = false;
  if (tsConfig.hasOwnProperty('compilerOptions')) {
    if (tsConfig.compilerOptions.hasOwnProperty('plugins')) {
      tsConfig.compilerOptions.plugins.map((obj) => {
        if (obj.hasOwnProperty("transform")) {
          scryptTransFound = obj.transform == 'scrypt-ts/dist/transformer';
          return;
        }
      });
    }
  }
  if (!scryptTransFound) {
    console.error(red(`TS config missing sCrypt transformer plugin.\n` +
    `Check out a working example of tsconfig.json:\n` +
    `https://github.com/sCrypt-Inc/scryptTS-examples/blob/master/tsconfig.json`));
  }
  
  await stepCmd(
    'NPM install',
    'npm i'
  );

  // Run tsc which in turn also transpiles to sCrypt
  await stepCmd(
    'Building TS',
    'npx tsc'
  );
  
  // Recursively iterate over dist/ dir and find all classes extending 
  // SmartContract class. For each found class, all it's compile() function.
  // This will generate the artifact file of the contract.
  // TODO: This is a hacky approach but works for now. Is there a more elegant solution?
  const distFiles = await readdirRecursive('./dist/src');
  for (const f of distFiles) {
    fAbs = path.resolve(f);
    if (path.extname(fAbs) == '.js') {
      console.log(fAbs.toString())
      try {
        const module = require(fAbs.toString());
        for (const key of Object.keys(module)) {
          const found = module[key].prototype.constructor.toString().match('^class .* extends .*\.SmartContract.*');
          if (found.length == 1) {
            await module[key].compile();
          }
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  const resStr = `\nProject was successfully compiled!\n`;
  console.log(green(resStr));
  process.exit(0);
}


module.exports = {
  compile,
};