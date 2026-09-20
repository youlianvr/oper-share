// JAD-203:交付件浏览器运行时(imported-theme-runtime.js)的构建配置与构建器。
//
// 单一事实来源:client-runtime.jsx 经 `@dashi/theme-registry` 别名引入注册表。两条等价路径:
//   - 源路径(dev):别名指向「全主题签入注册表」或「按 deck 裁剪的源注册表」(引 themeNN/runtime.jsx + 源 context)。
//   - 模块路径(安装版):别名指向「引预构建 minified 模块(themeNN.module.mjs)的注册表」,
//     安装版无可读主题 *.jsx 源也能链接出与源路径等价的运行时(单一 React,水合行为一致)。
//
// 预构建产物(build-theme-runtime.mjs 产出,sync 随 skill 发):
//   <THEME_RUNTIME_DIR>/<themeKey>.module.mjs            —— 每主题 minified ESM 模块(react external)。
//   <THEME_RUNTIME_DIR>/bespoke.module.mjs                —— Agent 定制页 renderer(minified,react external)。
//   <THEME_RUNTIME_DIR>/imported-theme-runtime.<key>.js  —— 每主题自包含 IIFE(= 模块路径 [单主题]),单主题 deck 直接拷贝。
import fs from 'node:fs';
import path from 'node:path';
import { buildSync } from 'esbuild';
import {
  buildThemeModuleEntrySource,
  buildThemeRegistrySource,
} from './theme-registry-codegen.mjs';
import { buildThemeRuntimeOverrideRegistrySource } from './theme-overrides-registry-codegen.mjs';
import { buildBespokeThemeProfileRegistrySource } from '../bespoke/theme-profile-registry-codegen.mjs';

// 相对 ROOT(= 仓库根 / 安装版 project 根)。dist/ 在 .gitignore,但随 skill:sync 发到 project/。
export const THEME_RUNTIME_DIR = 'dist/theme-runtime';
export const BESPOKE_RUNTIME_MODULE = 'bespoke.module.mjs';
export const BESPOKE_PROFILE_RUNTIME_MODULE = 'bespoke-profiles.module.mjs';
export const THEME_OVERRIDE_RUNTIME_MODULE = 'theme-overrides.module.mjs';

// 主题模块对 react 全部 external —— 由外层 client-runtime 打包统一解析,确保单一 React 实例。
const REACT_EXTERNALS = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'];

// JAD-203 修复:把所有 react 子路径别名到 `<root>/node_modules` 下的单一绝对路径。
//
// 根因:模块路径是两段式 bundle —— client-runtime.jsx(在 ROOT/src)与预构建的 *.module.mjs
// (写到 outDir,sync 时即安装版 project/dist)由外层 esbuild 一起打包;后者对 react external,
// 其裸 `import "react"` 由 esbuild 相对「模块文件所在目录」解析。当 outDir 不在 ROOT 的
// node_modules 解析链上(安装版 sync:root=dev 仓、outDir=安装版),或 outDir 旁存在另一份
// react 时,两个 importer 各自解析到不同的 react 物理副本 → 打进两份 React → react-dom 的
// dispatcher 装在副本 A,组件经副本 B 调 hook 取到 null dispatcher → 浏览器水合
// `Cannot read properties of null (reading 'useMemo')`、整片空白。
// nodePaths 只是「找不到时」的回退锚点,挡不住「相对 importer 已能找到另一份 react」。
// 用绝对路径别名强制所有 react specifier 指向同一份,彻底去重(对源路径无影响:本就是同一份)。
function reactAliasMap(root) {
  const nm = path.join(root, 'node_modules');
  return {
    react: path.join(nm, 'react'),
    'react-dom': path.join(nm, 'react-dom'),
    'react-dom/client': path.join(nm, 'react-dom/client.js'),
    'react/jsx-runtime': path.join(nm, 'react/jsx-runtime.js'),
    'react/jsx-dev-runtime': path.join(nm, 'react/jsx-dev-runtime.js'),
  };
}

export function themeModuleFileName(themeKey) {
  return `${themeKey}.module.mjs`;
}

export function themeBundleFileName(themeKey) {
  return `imported-theme-runtime.${themeKey}.js`;
}

export function themeProfileModuleFileName(themeKey) {
  return `${themeKey}.profile.mjs`;
}

export function themeOverrideModuleFileName(themeKey) {
  return `${themeKey}.overrides.mjs`;
}

export function prebuiltBundlePath(root, themeKey) {
  return path.join(root, THEME_RUNTIME_DIR, themeBundleFileName(themeKey));
}

export function prebuiltModulePath(root, themeKey) {
  return path.join(root, THEME_RUNTIME_DIR, themeModuleFileName(themeKey));
}

export function prebuiltBespokeModulePath(root) {
  return path.join(root, THEME_RUNTIME_DIR, BESPOKE_RUNTIME_MODULE);
}

export function prebuiltThemeProfileModulePath(root, themeKey) {
  return path.join(root, THEME_RUNTIME_DIR, themeProfileModuleFileName(themeKey));
}

export function prebuiltThemeOverrideModulePath(root, themeKey) {
  return path.join(root, THEME_RUNTIME_DIR, themeOverrideModuleFileName(themeKey));
}

// 共享的 client-runtime 打包配置。源路径与模块路径只在 registryPath(别名目标)上不同 ——
// 其余完全一致,保证两条路径产出等价(JAD-201 的源路径行为不变)。
function clientRuntimeBuildOptions({
  root,
  outFile,
  registryPath,
  bespokeRuntimePath = path.join(root, 'src/components/bespoke/BespokeSlide.jsx'),
  bespokeProfilesPath = path.join(root, 'src/components/bespoke/theme-profiles.mjs'),
  themeOverridesPath = path.join(root, 'src/components/themes/theme-overrides.mjs'),
}) {
  return {
    entryPoints: [path.join(root, 'src/components/themes/client-runtime.jsx')],
    outfile: outFile,
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'DeckJsxRuntime',
    platform: 'browser',
    jsx: 'automatic',
    alias: {
      '@dashi/theme-registry': registryPath,
      '@dashi/bespoke-runtime': bespokeRuntimePath,
      '#dashi-bespoke-theme-profiles': bespokeProfilesPath,
      '#dashi-theme-runtime-overrides': themeOverridesPath,
      // 强制 react 各子路径解析到 ROOT 的单一副本(去重根因,见 reactAliasMap)。
      ...reactAliasMap(root),
    },
    loader: {
      '.css': 'text',
    },
    inject: [path.join(root, 'src/react-shim.js')],
    // 链接到的预构建模块可能位于无 node_modules 的目录(如 sync 写入的 project/dist)。
    // nodePaths 是回退解析锚点;主题源路径正常解析时不会用到,故不改变 JAD-201 的源路径产出。
    nodePaths: [path.join(root, 'node_modules')],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    logLevel: 'silent',
  };
}

export function buildClientRuntime({
  root,
  outFile,
  registryPath,
  bespokeRuntimePath,
  bespokeProfilesPath,
  themeOverridesPath,
}) {
  buildSync(clientRuntimeBuildOptions({
    root,
    outFile,
    registryPath,
    bespokeRuntimePath,
    bespokeProfilesPath,
    themeOverridesPath,
  }));
}

// 把一组预构建主题模块链接成交付件运行时(安装版/模块路径)。registryPath 临时生成,引
// <moduleDir>/<themeKey>.module.mjs;外层 esbuild 把这些模块 + react 一起打包(单一 React)。
export function buildClientRuntimeFromModules({ root, outFile, themeKeys, moduleDir = path.join(root, THEME_RUNTIME_DIR), cacheDir }) {
  const importPrefix = `${moduleDir}${path.sep}`;
  const themeRegistrySource = buildThemeRegistrySource(themeKeys, { importPrefix, fromModules: true, generated: false });
  const profileRegistrySource = buildBespokeThemeProfileRegistrySource(themeKeys, {
    importPrefix,
    fromModules: true,
    generated: false,
  });
  const overrideRegistrySource = buildThemeRuntimeOverrideRegistrySource(themeKeys, {
    importPrefix,
    fromModules: true,
    generated: false,
  });
  const themeRegistry = writeTempRegistry(root, themeRegistrySource, cacheDir, 'theme-registry');
  const profileRegistry = writeTempRegistry(root, profileRegistrySource, cacheDir, 'bespoke-profile-registry');
  const overrideRegistry = writeTempRegistry(root, overrideRegistrySource, cacheDir, 'theme-override-registry');
  try {
    buildClientRuntime({
      root,
      outFile,
      registryPath: themeRegistry.registryPath,
      bespokeRuntimePath: path.join(moduleDir, BESPOKE_RUNTIME_MODULE),
      bespokeProfilesPath: profileRegistry.registryPath,
      themeOverridesPath: overrideRegistry.registryPath,
    });
  } finally {
    themeRegistry.cleanup();
    profileRegistry.cleanup();
    overrideRegistry.cleanup();
  }
}

// Bespoke renderer 会复用各主题真实 primitives/tokens,其中包含安装版会剔除的主题 JSX 源。
// 先把唯一浏览器入口收敛成 minified ESM,安装版多主题链接时只消费该模块,不再回读源码。
export function buildBespokeRuntimeModule({ root, outDir }) {
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  fs.mkdirSync(cacheDir, { recursive: true });
  const entryPath = path.join(cacheDir, `bespoke-entry-${process.pid}-${Date.now()}-${rand()}.jsx`);
  fs.writeFileSync(
    entryPath,
    [
      `export { BespokeSlideBody } from ${JSON.stringify(path.join(root, 'src/components/bespoke/BespokeSlide.jsx'))};`,
      '',
    ].join('\n'),
  );
  const outFile = path.join(outDir, BESPOKE_RUNTIME_MODULE);
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      external: [...REACT_EXTERNALS, '#dashi-bespoke-theme-profiles'],
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    try { fs.rmSync(entryPath, { force: true }); } catch {}
  }
  return outFile;
}

// 每个预构建 profile module 只包含一个主题的 bespoke adapter/profile registry。
// 安装版最终链接时按 usedThemeKeys 选择这些模块,避免未使用主题的素材字面量进入 deck bundle。
export function buildBespokeThemeProfileModule({ root, themeKey, outDir }) {
  const importPrefix = `${path.join(root, 'src/components/bespoke')}${path.sep}`;
  const source = buildBespokeThemeProfileRegistrySource([themeKey], {
    importPrefix,
    generated: false,
  });
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  const entry = writeTempRegistry(root, source, cacheDir, `bespoke-profile-${themeKey}`);
  const outFile = path.join(outDir, themeProfileModuleFileName(themeKey));
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entry.registryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      external: REACT_EXTERNALS,
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    entry.cleanup();
  }
  return outFile;
}

// 安装版 Node/SSR 仍需要一个全主题 profile registry。它只作为 package import 入口存在;
// deck 的 imported-theme-runtime.js 不消费它,而是由 buildClientRuntimeFromModules 按主题链接。
export function buildBespokeProfileRuntimeModule({ root, outDir, themeKeys }) {
  const importPrefix = `${outDir}${path.sep}`;
  const source = buildBespokeThemeProfileRegistrySource(themeKeys, {
    importPrefix,
    fromModules: true,
    generated: false,
  });
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  const entry = writeTempRegistry(root, source, cacheDir, 'bespoke-profiles-runtime');
  const outFile = path.join(outDir, BESPOKE_PROFILE_RUNTIME_MODULE);
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entry.registryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      external: REACT_EXTERNALS,
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    entry.cleanup();
  }
  return outFile;
}

// canonical-metadata 的 per-theme 控件 override 也必须按 usedThemeKeys 链接。
// theme03 override 会引用 3d presets/icons;若把全主题 registry 静态带进 Theme02 bundle,
// 资源复制仍按 provenance 正确裁剪时就会产生不存在的 Theme03 本地资源引用。
export function buildThemeRuntimeOverrideModule({ root, themeKey, outDir }) {
  const importPrefix = `${path.join(root, 'src/components/themes')}${path.sep}`;
  const source = buildThemeRuntimeOverrideRegistrySource([themeKey], {
    importPrefix,
    generated: false,
  });
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  const entry = writeTempRegistry(root, source, cacheDir, `theme-overrides-${themeKey}`);
  const outFile = path.join(outDir, themeOverrideModuleFileName(themeKey));
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entry.registryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      external: REACT_EXTERNALS,
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    entry.cleanup();
  }
  return outFile;
}

// 安装版 Node/SSR 的全主题 override package import。Deck 浏览器 bundle 不消费它;
// buildClientRuntimeFromModules 会按 usedThemeKeys 只链接对应的 *.overrides.mjs。
export function buildThemeOverrideRuntimeModule({ root, outDir, themeKeys }) {
  const importPrefix = `${outDir}${path.sep}`;
  const source = buildThemeRuntimeOverrideRegistrySource(themeKeys, {
    importPrefix,
    fromModules: true,
    generated: false,
  });
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  const entry = writeTempRegistry(root, source, cacheDir, 'theme-overrides-runtime');
  const outFile = path.join(outDir, THEME_OVERRIDE_RUNTIME_MODULE);
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entry.registryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      external: REACT_EXTERNALS,
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    entry.cleanup();
  }
  return outFile;
}

// 从主题源码(themeNN/runtime.jsx + 源 context)预构建该主题的 minified ESM 模块。
// react external,供模块路径链接;.jsx/.css 在此一次性内联+minify,产物不含可读组件源。
export function buildThemeModule({ root, themeKey, outDir }) {
  const themesDir = path.join(root, 'src/components/themes');
  const entrySource = buildThemeModuleEntrySource(themeKey, { importPrefix: `${themesDir}${path.sep}` });
  const cacheDir = path.join(root, 'node_modules/.cache/dashi-theme-runtime-build');
  fs.mkdirSync(cacheDir, { recursive: true });
  const entryPath = path.join(cacheDir, `module-entry-${themeKey}-${process.pid}-${Date.now()}-${rand()}.jsx`);
  fs.writeFileSync(entryPath, entrySource);
  const outFile = path.join(outDir, themeModuleFileName(themeKey));
  fs.mkdirSync(outDir, { recursive: true });
  try {
    buildSync({
      entryPoints: [entryPath],
      outfile: outFile,
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      external: REACT_EXTERNALS,
      loader: {
        '.css': 'text',
      },
      inject: [path.join(root, 'src/react-shim.js')],
      nodePaths: [path.join(root, 'node_modules')],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });
  } finally {
    try { fs.rmSync(entryPath, { force: true }); } catch {}
  }
  return outFile;
}

function writeTempRegistry(root, source, cacheDirOverride, label = 'registry') {
  const cacheDir = cacheDirOverride || path.join(root, 'node_modules/.cache/dashi-theme-registry');
  fs.mkdirSync(cacheDir, { recursive: true });
  const registryPath = path.join(cacheDir, `${label}-${process.pid}-${Date.now()}-${rand()}.jsx`);
  fs.writeFileSync(registryPath, source);
  return {
    registryPath,
    cleanup: () => { try { fs.rmSync(registryPath, { force: true }); } catch {} },
  };
}

function rand() {
  return Math.random().toString(36).slice(2);
}
