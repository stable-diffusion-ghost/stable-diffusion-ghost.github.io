export class Session {
    constructor() {
        this.m_user = { Email: "", Nickname: "", Password: "" };
        this.m_signinFlag = false;
    }
    GetHonUser() { return this.m_user; }
    DrawHtmlSessionInfo() {
        const seInfo = document.getElementById("sessioninfo");
        if (this.m_signinFlag) {
            seInfo.innerHTML = `
                <li class="nav-item ">
                <a href="javascript:void(0)" onclick="ClickLoadPage('hondetail', true, '&email=${this.m_user.Email}')"> ${this.m_user.Nickname} &nbsp; </a>  
                </li>
                <li class="nav-item ">
                <a href="javascript:void(0)" onclick="ClickLoadPage('logout', true)"> Logout </a> 
                </li>
            `;
        }
    }
    SignIn(user) {
        this.m_user = user;
        this.m_signinFlag = true;
    }
    CheckLogin() {
        return this.m_signinFlag;
    }
}
//# sourceMappingURL=session.js.map