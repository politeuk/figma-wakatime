let lastAction = 0,
    APIKey: string | undefined = undefined,
    lastFile: string | undefined = undefined;

const enoughTimePassed = () => {
  return lastAction + 120000 > Date.now();
};

const sendHeartbeat = async (project: string, time: number, file: string, language: string) => {

  if (!APIKey) return;
  try {
    await fetch('https://wakatime.com/api/v1/heartbeats', {
      method: 'POST',
      body: JSON.stringify({
        time: time / 1000,
        entity: file,
        type: 'app',
        project,
        language,
        plugin: 'figma-wakatime/1.0',
      }),
      headers: {
        Authorization: 'Basic ' + APIKey,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log('[WakaTime] Error:', err);
  }

  lastAction = time;
  lastFile = file;
};

const handleAction = () => {
  const node = figma.root.name;
  let currentFile = figma.currentPage.selection[0] ? figma.currentPage.selection[0].type +'-'+ figma.currentPage.selection[0].id : 'Nothing';


  if (currentFile) {
    const time = Date.now();
    if (enoughTimePassed() || lastFile !== currentFile) {
      sendHeartbeat(node, time, currentFile, 'Figma');
    }
  }
};

(() => {
  console.log('[WakaTime] Initializing WakaTime plugin v1.0');
  handleAction();
  setInterval(async () => {
    handleAction();
  }, 5000);
})();

figma.closePlugin();