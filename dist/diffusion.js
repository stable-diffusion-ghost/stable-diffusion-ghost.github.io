export class Diffusion {
    constructor(blockStore, ipc) {
        this.blockStore = blockStore;
        this.m_blockStore = blockStore;
        this.m_ipc = ipc;
        ipc.RegisterMsgHandler('generateLog', (log) => {
            const printTag = document.getElementById("log");
            printTag.innerHTML = `
                ${log}
            `;
        });
        ipc.RegisterMsgHandler('reply_generateImage', (filename) => {
            const printTag = document.getElementById("printImg");
            printTag.innerHTML = `
                <img src="${window.MasterAddr}/image?filename=${filename}">
            `;
        });
    }
    generateImage() {
        const promptTag = document.getElementById("prompt");
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("nprompt");
        const nprompt = npromptTag.value.toLowerCase();
        const heightTag = document.getElementById("height");
        const height = heightTag.value;
        const widthTag = document.getElementById("width");
        const width = widthTag.value;
        const stepTag = document.getElementById("step");
        const step = stepTag.value;
        const seedTag = document.getElementById("seed");
        const seed = seedTag.value;
        const printTag = document.getElementById("printImg");
        printTag.innerHTML = `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
        `;
        this.m_ipc.SendMsg("generateImage", prompt, nprompt, height, width, step, seed);
    }
    Run(masterAddr) {
        if (!this.m_ipc.IsOpen())
            this.m_ipc.OpenChannel(window.MasterWsAddr + "/ws");
        const btn = document.getElementById("generateBtn");
        btn.onclick = () => this.generateImage();
        return true;
    }
    Release() { }
}
//# sourceMappingURL=diffusion.js.map