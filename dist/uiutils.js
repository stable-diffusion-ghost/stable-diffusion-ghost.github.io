import { includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "./ghostweb.js";
includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");
const tag = document.getElementById("contents");
if (tag != null) {
    if (location.protocol != 'http:') {
        tag.innerHTML = errmsg(` https 를 지원하지 않습니다.`, `링크를 클릭해주세요. <a href="http://sd.ghostwebservice.com"> <strong class="me-auto">sd.ghostwebservice.com</strong> </a> `);
    }
    else {
        addEventListener("load", () => fetch("http://lb.ghostnetroot.com:58083/nodes")
            .then((response) => response.json())
            .then(parseResponse)
            .then(loadNodesHtml)
            .then((url) => includeContentHTML(url))
            .catch((err) => {
            tag.innerHTML = errmsg(` Network Down`, ` 사용가능한 Node가 존재하지 않습니다. ${err}`);
        }));
    }
}
function errmsg(title, content) {
    return `
<div class="container my-3">
    <div class="row division-line">
        <div class="col">
            <h4>Notics</h4>
        </div>
    </div>
    <div class="row">
        <div class="col text-center"> <br>
            <div class="card">
                <div class="card-header"> ${title} </div>
                <div class="card-body"> ${content} </div>
            </div>
</div>
    </div>
</div>
        `;
}
//# sourceMappingURL=uiutils.js.map