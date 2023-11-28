import { BlockStore } from "./store.js";
import { Channel } from "./models/com.js";
import { Session } from "./session.js";

const NewPromptTxId = "U9GynNvxotN2V+J1r8YbCl9VJTLhDu+OzLlFqDazI68="

export class Diffusion {
    m_blockStore: BlockStore;
    m_ipc: Channel;
    m_model: string;
    m_img: Blob;
    m_session: Session
    public constructor(private blockStore: BlockStore, private session: Session, ipc: Channel) {
        this.m_blockStore = blockStore;
        this.m_ipc = ipc;
        this.m_model = "UNetModel";
        this.m_img = new Blob()
        this.m_session = session;

        ipc.RegisterMsgHandler('generateLog', (log: string) => {
            const printTag = document.getElementById("log") as HTMLDivElement;
            printTag.innerHTML = `
                ${log}
            `;
        });

        ipc.RegisterMsgHandler('reply_generateImage', (filename: string) => {
            fetch(`${window.MasterAddr}/image?filename=${filename}`)
                .then(response => response.blob())
                .then(data => {
                    const img = new Blob([data], {type: 'image/bmp'})
                    const imageUrl = URL.createObjectURL(img)
                    const imageElement = new Image()
                    imageElement.src = imageUrl
                    const container = document.getElementById("printImg") as HTMLDivElement;
                    container.innerHTML = ""
                    container.appendChild(imageElement)
                    this.m_img = img
                })
        });
    }
    uploadImage() {
        const promptTag = document.getElementById("prompt") as HTMLInputElement;
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("nprompt") as HTMLInputElement;
        const nprompt = npromptTag.value.toLowerCase();
        const stepTag = document.getElementById("step") as HTMLInputElement;
        const step = stepTag.value;
        const user = this.m_session.GetHonUser();

        const formData = new FormData()
        formData.append("file", this.m_img)
        formData.append("prompt", prompt)
        formData.append("nprompt", nprompt)
        formData.append("step", step)
        formData.append("key", user.Email)
        formData.append("Email", user.Email)
        formData.append("Password", user.Password)
        formData.append("password", user.Password)
        formData.append("Id", user.Nickname)
        formData.append("Time", (new Date()).getTime().toString())
        formData.forEach(entry => console.log(entry))
        const addr = window.MasterAddr + "/glambda?txid=" + encodeURIComponent(NewPromptTxId);
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
    }
    generateImage() {
        const promptTag = document.getElementById("prompt") as HTMLInputElement;
        const prompt = promptTag.value.toLowerCase();
        const npromptTag = document.getElementById("nprompt") as HTMLInputElement;
        const nprompt = npromptTag.value.toLowerCase();
        const heightTag = document.getElementById("height") as HTMLInputElement;
        const height = heightTag.value;
        const widthTag = document.getElementById("width") as HTMLInputElement;
        const width = widthTag.value;
        const stepTag = document.getElementById("step") as HTMLInputElement;
        const step = stepTag.value;
        const seedTag = document.getElementById("seed") as HTMLInputElement;
        const seed = seedTag.value;
        const printTag = document.getElementById("printImg") as HTMLDivElement;
        printTag.innerHTML = `
            <div class="spinner-grow text-primary" role="status">
                <span class="visually-hidden"></span>
            </div>
        `;

        if (this.m_model == "UNetModel") {
            this.m_ipc.SendMsg("generateImage", prompt, nprompt, height, width, step, seed);
        } else {
            this.m_ipc.SendMsg("generateImage2", prompt, nprompt, height, width, step, seed, this.m_model);
        }
    }

    heightUpdate(heightTag: HTMLInputElement) {
        const valueTag = document.getElementById("heightvalue") as HTMLLabelElement
        valueTag.innerHTML = "Height: " + heightTag.value
    }
    widthUpdate(widthTag: HTMLInputElement) {
        const valueTag = document.getElementById("widthvalue") as HTMLLabelElement
        valueTag.innerHTML = "Width: " + widthTag.value
    }

    stepUpdate(stepTag: HTMLInputElement) {
        const valueTag = document.getElementById("stepvalue") as HTMLLabelElement
        valueTag.innerHTML = "Step: " + stepTag.value
    }

    updateEvent() {
        const heightTag = document.getElementById("height") as HTMLInputElement
        heightTag.onchange = () => { this.heightUpdate(heightTag) }
        const widthTag = document.getElementById("width") as HTMLInputElement
        widthTag.onchange = () => { this.widthUpdate(widthTag) }
        const stepTag = document.getElementById("step") as HTMLInputElement
        stepTag.onchange = () => { this.stepUpdate(stepTag) }

        this.heightUpdate(heightTag)
        this.widthUpdate(widthTag)
        this.stepUpdate(stepTag)
    }

    selectModel(key: string, model: string) {
        this.m_model = model
        const btn = document.getElementById("dropdownMenu2") as HTMLButtonElement
        btn.innerText = key
    }

    drawHtmlUpdateModelList() {
        const models = new Map()
        models.set("UNetModel", "UNetModel")
        models.set("SD-v1.4", "sd-v1-4-ggml-model-f16.bin")
        models.set("chiled-remix", "chilled_remix_v2-ggml-model-f16.bin")

        const tag = document.getElementById("modellist")
        if (tag == null) return;
        tag.innerHTML = "";
        models.forEach((model, key, map) => {
            const button = document.createElement('button');
            button.setAttribute('class', 'dropdown-item');
            button.onclick = () => this.selectModel(key, model)
            button.innerText = key;
            tag.appendChild(button);
        })
    }

    public Run(masterAddr: string): boolean {
        if (!this.m_ipc.IsOpen()) this.m_ipc.OpenChannel(window.MasterWsAddr + "/ws")
        const btn = document.getElementById("generateBtn") as HTMLButtonElement
        btn.onclick = () => this.generateImage();
        const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement
        uploadBtn.onclick = () => this.uploadImage();

        this.updateEvent()
        this.drawHtmlUpdateModelList()
        return true;
    }

    public Release(): void { }

}