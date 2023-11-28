import { elapsedTime } from "./utils.js";
const HonsTxId = "Rx8HL0EM0cwQ+N2X/Ap914V1M5YRBq9QqhAXwu5UirA=";
const HonTxId = "hFzzKC6clglO878ATBE8JnfKhjUr5grmVkYigmGmVtw=";
export class Prompts {
    constructor(blockStore, session) {
        this.blockStore = blockStore;
        this.session = session;
        this.m_masterAddr = "";
        this.m_session = session;
        this.m_blockStore = blockStore;
    }
    warningMsg(msg) {
        console.log(msg);
        const info = document.getElementById("information");
        if (info == null)
            return;
        info.innerHTML = msg;
    }
    honsResult(ret) {
        console.log(ret);
        if ("json" in ret) {
            const keys = JSON.parse(ret.json);
            return keys;
        }
        else {
            this.warningMsg("Loading 실패");
        }
        return [];
    }
    drawHtmlHon(ret) {
        const uniqId = ret.Id + ret.Time.toString();
        const feeds = document.getElementById("feeds");
        if (feeds == null)
            return;
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
                    <div class="row m-3">Prompt: ${ret.prompt}</div>
                    <div class="row m-3">NPrompt: ${ret.nprompt}</div>
                </div>
            </div>
        `;
        fetch("data:image/jpg;base64," + ret.file)
            .then(res => res.blob())
            .then(img => {
            const imageUrl = URL.createObjectURL(img);
            const imageElement = new Image();
            imageElement.src = imageUrl;
            imageElement.setAttribute('class', 'img-fluid');
            imageElement.setAttribute('class', 'rounded');
            const container = document.getElementById(uniqId);
            container.appendChild(imageElement);
        });
    }
    RequestHon(keys, callback) {
        const addr = this.m_masterAddr + "/glambda?txid=" +
            encodeURIComponent(HonTxId) + "&Table=diffu&key=";
        keys.forEach((key) => {
            fetch(addr + atob(key))
                .then((response) => response.json())
                .then((result) => callback(result));
        });
    }
    drawHtmlConnectMaster() {
        const bodyTag = document.getElementById('connect');
        if (bodyTag == null)
            return;
        console.log(window.MasterNode);
        bodyTag.innerHTML = `<b>Connected Master</b> - 
        ${window.MasterNode.User.Nickname}, <b>Online Nodes </b>
        ${window.NodeCount}`;
    }
    RequestHons(n, callback) {
        this.m_masterAddr = window.MasterAddr;
        const masterAddr = this.m_masterAddr;
        const user = this.m_session.GetHonUser();
        const addr = `
        ${masterAddr}/glambda?txid=${encodeURIComponent(HonsTxId)}&Table=diffu&Start=0&Count=${n}`;
        fetch(addr)
            .then((response) => response.json())
            .then((result) => this.honsResult(result))
            .then((keys) => this.RequestHon(keys, callback))
            .catch(() => { this.warningMsg("Server에 문제가 생긴듯 합니다;;"); });
    }
    GetHons(n, callback) {
        this.RequestHons(n, callback);
    }
    Run(masterAddr) {
        this.m_masterAddr = masterAddr;
        this.drawHtmlConnectMaster();
        this.RequestHons(5, this.drawHtmlHon);
        return true;
    }
    Release() {
        const feeds = document.getElementById("feeds");
        if (feeds == null)
            return;
        feeds.innerHTML = ``;
    }
}
//# sourceMappingURL=prompts.js.map