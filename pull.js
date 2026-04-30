// pull.js - minimal loader, local-first, sets loaded flag, no WASM attempts
window.__MODULE_LOADED__ = false;
window.pullDiagnostics = window.pullDiagnostics || { attempts: [], success: null };

function logOut(s){
  const e = document.getElementById('out');
  if (e) e.textContent = (e.textContent?e.textContent+"\n":"") + s;
  console.log(s);
  window.pullDiagnostics.attempts.push({ msg: s, ts: Date.now() });
}

async function tryImport(url) {
  const u = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  logOut('import-attempt -> ' + u);
  try {
    const mod = await import(u);
    logOut('import OK -> ' + u);
    window.pullDiagnostics.success = u;
    return mod;
  } catch (e) {
    logOut('import failed -> ' + u + ' : ' + e);
    return null;
  }
}

(async function(){
  logOut('Loader start');
  let mod = await tryImport('./app.js');
  if (!mod) mod = await tryImport('./app.mjs');
  if (!mod) mod = await tryImport('/app.js');
  if (!mod) mod = await tryImport('/app.mjs');

  if (!mod) {
    logOut('All module import attempts failed');
    return;
  }

  try {
    const factory = mod.default;
    if (factory && typeof factory === 'function') {
      const Module = await factory();
      window.AppModule = Module;
      window.__MODULE_LOADED__ = true;
      logOut('Module loaded my_exported -> ' + (Module.my_exported ? Module.my_exported() : 'no export'));
      logOut('JS module loaded — skipping any WASM attempts');
      return;
    } else {
      logOut('Module imported but no default factory; exports: ' + Object.keys(mod || {}).join(','));
    }
  } catch (err) {
    logOut('Module factory threw: ' + err);
  }
})();
