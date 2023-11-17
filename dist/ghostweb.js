import { BlockStore } from "./store.js";
import { Socket } from "./libs/socket.js";
import { PromptDetail } from "./promptdetail.js";
import { Prompts } from "./prompts.js";
import { Prompt } from "./prompt.js";
import { NewPrompt } from "./newprompt.js";
import { Signup } from "./signup.js";
import { Signin } from "./signin.js";
import { Session } from "./session.js";
import { UploadPrompt } from "./uploadprompt.js";
import { Diffusion } from "./diffusion.js";
const blockStore = new BlockStore();
const session = new Session();
const prompts = new Prompts(blockStore, session);
const funcMap = {
    "signin": new Signin(blockStore, session),
    "signup": new Signup(blockStore, session),
    "prompt": new Prompt(blockStore, session),
    "prompts": prompts,
    "promptdetail": new PromptDetail(blockStore, session),
    "newprompt": new NewPrompt(blockStore, session),
    "uploadprompt": new UploadPrompt(blockStore, session),
    "diffusion": new Diffusion(blockStore, new Socket),
};
const urlToFileMap = {
    "signin": "views/signin.html",
    "signup": "views/signup.html",
    "prompts": "views/prompts.html",
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
    if (beforPage == undefined)
        beforPage = key;
    return key;
};
let beforPage;
window.ClickLoadPage = (key, fromEvent, ...args) => {
    //if (getPageIdParam() == key) return;
    session.DrawHtmlSessionInfo();
    const url = urlToFileMap[key];
    const state = {
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
    };
    console.log(`page change : ${beforPage} ==> ${key}`);
    const backUpBeforPage = beforPage;
    beforPage = key;
    history.pushState(state, "login", "./?pageid=" + key + args);
    fetch(url)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector("contents").innerHTML = data; })
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
    console.log(fromEvent);
};
let expendFlag = false;
window.NavExpended = () => {
    let view = (expendFlag == false) ? "block" : "none";
    document.querySelector("#navbarNav").style.display = view;
    document.querySelector("#navbarNavRight").style.display = view;
    expendFlag = !expendFlag;
};
window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    includeContentHTML(window.MasterAddr);
};
const parseResponse = (nodes) => {
    let randIdx = Math.floor(Math.random() * nodes.length);
    window.NodeCount = nodes.length;
    console.log(nodes);
    return nodes[randIdx];
};
const loadNodesHtml = (node) => {
    window.MasterNode = node;
    window.MasterAddr = `http://${node.User.ip.Ip}:${node.User.ip.Port}`;
    window.MasterWsAddr = `ws://${node.User.ip.Ip}:${node.User.ip.Port}`;
    return window.MasterAddr;
};
const includeHTML = (id, filename) => {
    window.addEventListener('load', () => fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector(id).innerHTML = data; }));
};
const includeContentHTML = (master) => {
    session.DrawHtmlSessionInfo();
    const key = getPageIdParam();
    const filename = urlToFileMap[key];
    const backUpBeforPage = beforPage;
    beforPage = key;
    fetch(filename)
        .then(response => { return response.text(); })
        .then(data => { document.querySelector("contents").innerHTML = data; })
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
};
export { includeContentHTML, includeHTML, loadNodesHtml, parseResponse };
//# sourceMappingURL=ghostweb.js.map