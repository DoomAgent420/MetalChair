// app.js
export default async function createModule() {
  await new Promise(r => setTimeout(r, 0));
  return {
    my_exported() { return 42; },
    process(workerData) {
      // Example: if Worker returns { payload: "<base64>" } decode for demo
      try {
        if (workerData && workerData.payload) {
          const decoded = decodeURIComponent(escape(atob(workerData.payload)));
          return { summary: 'decoded', raw: decoded.slice(0,100) };
        }
      } catch (e) { /* ignore decode errors */ }
      return { summary: 'raw', data: workerData };
    }
  };
}
