import { SigninTxId } from "./models/tx.js";

export type HonUser = {
    Email: string,
    Nickname: string,
    Password: string,
}

const emptyUser: HonUser = { Email: "", Nickname: "", Password: "" }
const jsSessionKey = "DiffusionUser"

export class Session {
    m_user: HonUser;
    m_signinFlag: boolean;

    public constructor() {
        this.m_user = { Email: "", Nickname: "", Password: "" };
        this.m_signinFlag = false;
    }
    public GetHonUser(): HonUser { return this.m_user; }
    public RequestSignIn(email: string, password: string, callback: Function) {
        const addr = window.MasterAddr + "/glambda?txid=" + encodeURIComponent(SigninTxId);
        const formData = new FormData()
        formData.append("key", email)
        formData.append("email", email)
        formData.append("password", password)
        console.log(JSON.stringify({ key: email, Email: email, password: password }))
        fetch(addr, {
            method: "POST",
            cache: "no-cache",
            headers: {},
            body: formData
        })
            .then((response) => response.json())
            .then((result) => callback(result))
    }
    drawHtmlLoginUi() {
        if (this.m_signinFlag) {
            const seInfo = document.getElementById("sessioninfo") as HTMLUListElement;
            seInfo.innerHTML = `
                <li class="nav-item ">
                <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', true, '&email=${this.m_user.Email}')"> ${this.m_user.Nickname} &nbsp; </a>  
                </li>
                <li class="nav-item ">
                <a href="javascript:void(0)" id="logout"> Logout </a> 
                </li>
            `;
            const logout = document.getElementById("logout") as HTMLAnchorElement
            logout.onclick =  () => {
                this.SignOut()
                // window.ClickLoadPage("hons", true)
                location.reload()

            }
        }
    }
    public DrawHtmlSessionInfo() {
        const str = sessionStorage.getItem(jsSessionKey)
        if (str != null && this.m_signinFlag == false) {
            const user: HonUser = JSON.parse(str)
                console.log(user)
            this.RequestSignIn(user.Email, user.Password, (ret: any) => {
                if ("email" in ret) {
                    this.SignIn({ Email: ret.email, Nickname: ret.id, Password: ret.password });
                    this.drawHtmlLoginUi()
                }
            })

            return
        }
        this.drawHtmlLoginUi()
    }

    public SignIn(user: HonUser) {
        this.m_user = user;
        this.m_signinFlag = true;
        sessionStorage.setItem(jsSessionKey, JSON.stringify(user))
    }
    public SignOut() {
        this.m_user = emptyUser;
        this.m_signinFlag = false;
        sessionStorage.removeItem(jsSessionKey)
    }

    public CheckLogin(): boolean {
        return this.m_signinFlag;
    }
}