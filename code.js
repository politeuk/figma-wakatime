"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let lastAction = 0, APIKey = undefined, lastFile = undefined;
const enoughTimePassed = () => {
    return lastAction + 120000 > Date.now();
};
const sendHeartbeat = (project, time, file, language) => __awaiter(void 0, void 0, void 0, function* () {
    if (!APIKey)
        return;
    try {
        yield fetch('https://wakatime.com/api/v1/heartbeats', {
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
    }
    catch (err) {
        console.log('[WakaTime] Error:', err);
    }
    lastAction = time;
    lastFile = file;
});
const handleAction = () => {
    const node = figma.root.name;
    let currentFile = figma.currentPage.selection[0] ? figma.currentPage.selection[0].type + '-' + figma.currentPage.selection[0].id : 'Nothing';
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
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        handleAction();
    }), 5000);
})();
figma.closePlugin();
