import { BlockStore } from "./store.js";
import { elapsedTime} from "./utils.js";
import { Session } from "./session.js";

export type HonEntry = {
    Email: string,
    Id: string,
    prompt: string,
    nprompt: string,
    file: string,
    step: number,
    model: string,
    Time: number,
}

const HonsTxId = "Rx8HL0EM0cwQ+N2X/Ap914V1M5YRBq9QqhAXwu5UirA=";
const HonTxId = "hFzzKC6clglO878ATBE8JnfKhjUr5grmVkYigmGmVtw=";

export class Prompts {
    m_masterAddr: string;
    m_session: Session;
    m_blockStore: BlockStore
    public constructor(private blockStore: BlockStore
        , private session: Session) {
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_blockStore = blockStore;
    }

    warningMsg(msg: string) {
        console.log(msg);
        const info = document.getElementById("information");
        if (info == null) return;
        info.innerHTML = msg;
    }
    honsResult(ret: any) :string[]{
        console.log(ret)
        if ("json" in ret) {
            const keys = JSON.parse(ret.json);
            return keys;
        } else {
            this.warningMsg("Loading 실패");
        }
        return []
    }
    drawHtmlHon(ret: HonEntry) {
        const uniqId = ret.Id + ret.Time.toString()
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML += `
        <br>
            <div class="card">
                <div class="card-header"> 
                    <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', false, '&email=${ret.Email}')">
                    <strong class="me-auto">${ret.Id}</strong>
                    </a>
                    <small> ${elapsedTime(Number(ret.Time))}</small>
                </div>
                <div class="card-body">
                    <div class="row m-3 text-center" id="${uniqId}"></div>
                    <div class="row m-3">Prompt: ${ret.prompt} <br>
                        NPrompt: ${ret.nprompt}<br>
                        Step: ${ret.step || "?"}<br>
                        Model: ${ret.model || "?"}
                    </div>
                </div>
            </div>
        `;
        fetch("data:image/jpg;base64," + ret.file)
            .then(res => res.blob())
            .then(img => {
                const imageUrl = URL.createObjectURL(img)
                const imageElement = new Image()
                imageElement.src = imageUrl
                imageElement.setAttribute('class', 'img-fluid');
                imageElement.setAttribute('class', 'rounded');
                const container = document.getElementById(uniqId) as HTMLDivElement;
                container.appendChild(imageElement)
            })
    }
    public RequestHon(keys: string[], callback: (h: HonEntry) => void) {
        const addr = this.m_masterAddr + "/glambda?txid=" + 
            encodeURIComponent(HonTxId) + "&Table=diffu&key=";
        keys.forEach((key) => {
            fetch(addr + atob(key),/*{
                
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Table: "feeds",
                    key: atob(key),
                })
            }*/)
                .then((response) => response.json())
                .then((result) => callback(result))
        });
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null) return;
        console.log(window.MasterNode);
        bodyTag.innerHTML = `<b>Connected Master</b> - 
        ${window.MasterNode.User.Nickname}`;
    }

    public RequestHons(n: number, callback: (h: HonEntry) => void) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&Table=diffu&Start=0&Count=${n}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys)=> this.RequestHon(keys, callback))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;") });
    }
    public GetHons(n:number, callback: (hon: HonEntry) => void) {
        this.RequestHons(n, callback);
    }
    public Run(masterAddr: string): boolean {
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster()
        this.RequestHons(5, this.drawHtmlHon);
        return true;
    }

    public Release(): void { 
        const feeds = document.getElementById("feeds");
        if (feeds == null) return;
        feeds.innerHTML = ``;
    }
}
