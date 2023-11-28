import { BlockStore } from "./store.js";
import { Socket } from "./libs/socket.js";
import { PromptDetail } from "./promptdetail.js";
import { Prompts } from "./prompts.js";
import { Prompt } from "./prompt.js";
import { NewPrompt } from "./newprompt.js";
import { Signup } from "./signup.js";
import { Signin } from "./signin.js";
import { Session } from "./session.js";
import { GhostWebUser } from "./models/param.js";
import { UploadPrompt } from "./uploadprompt.js";
import { Diffusion } from "./diffusion.js";

const blockStore = new BlockStore();
const session = new Session();

interface IPage {
    Run(str: string): boolean; 
    Release(): void;
}

type FuncMap = { [key: string]: IPage };
type UrlMap = { [key: string]: string; };
declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        NavExpended: () => void;
        MasterAddr: string;
        MasterWsAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

const prompts = new Prompts(blockStore, session);
const funcMap: FuncMap = {
    "signin": new Signin(blockStore, session),
    "signup": new Signup(blockStore, session),
    "prompt": new Prompt(blockStore, session),
    "prompts": prompts,
    "main": prompts,
    "promptdetail": new PromptDetail(blockStore,session),
    "newprompt": new NewPrompt(blockStore, session),
    "uploadprompt": new UploadPrompt(blockStore, session),
    "diffusion": new Diffusion(blockStore, session, new Socket),
};

const urlToFileMap: UrlMap = {
    "signin": "views/signin.html",
    "signup": "views/signup.html",
    "prompts": "views/prompts.html",
    "main": "views/prompts.html",
    "prompt": "views/prompt.html",
    "promptdetail": "views/promptdetail.html",
    "newprompt": "views/newprompt.html",
    "uploadprompt": "views/uploadprompt.html",
    "diffusion": "views/diffusion.html",
};

const getPageIdParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "prompts" : pageid;
    if (beforPage == undefined) beforPage = key;
    return key;
}

let beforPage: string;
window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    //if (getPageIdParam() == key) return;
    session.DrawHtmlSessionInfo();

    const url = urlToFileMap[key];
    const state = { 
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
    };
    console.log(`page change : ${beforPage} ==> ${key}`)
    const backUpBeforPage = beforPage;
    beforPage = key;

    history.pushState(state, "login", "./?pageid=" + key + args);
    fetch(url)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(window.MasterAddr);
            }
        });
    if (fromEvent) {
        window.NavExpended();
    }
    console.log(fromEvent)
};
let expendFlag = false;
window.NavExpended = () => {
    let view = (expendFlag == false) ? "block" : "none";
    (document.querySelector("#navbarNav") as HTMLDivElement).style.display = view;
    (document.querySelector("#navbarNavRight") as HTMLDivElement).style.display = view;
    expendFlag = !expendFlag;
};

window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    includeContentHTML(window.MasterAddr);
};

const parseResponse = (nodes: GhostWebUser[]) => {
    let randIdx = Math.floor(Math.random() * nodes.length);
    window.NodeCount = nodes.length;
    console.log(nodes);
    return nodes[randIdx];
};

const loadNodesHtml = (node: GhostWebUser) => {
    window.MasterNode = node;
    window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
    window.MasterWsAddr = `ws://${node.User.ip.Ip}:${node.User.ip.Port}`;
    return window.MasterAddr;
};
const includeHTML = (id: string, filename: string) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector(id) as HTMLDivElement).innerHTML = data; }));
}

const includeContentHTML = (master: string) => {
    session.DrawHtmlSessionInfo();
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { (document.querySelector("contents") as HTMLDivElement).innerHTML = data; })
        .then(() => {
            const beforePageObj = funcMap[backUpBeforPage];
            if (beforePageObj != undefined) {
                beforePageObj.Release();
            }

            const pageObj = funcMap[key];
            if (pageObj != undefined) {
                pageObj.Run(master);
            }
        });
}

export { includeContentHTML, includeHTML, loadNodesHtml, parseResponse }