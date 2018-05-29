import Constants from '../Constants'


class AuthStore {
    constructor(){
        this.listeners = []
        this.currentUser = null
    }

    start() {
        fetch(`${Constants.BASE_URL}/github/login`)
            .then((res)=>res.json())
            .then((res)=>{
                this.win = window.open(res.url,'_blank')
                window.addEventListener('message',this.authCallback)
                this.win.focus()
            })
    }

    fireChange = () => setTimeout(()=>this.listeners.forEach((cb)=>cb()))
    listenToLogin = (cb) => this.listeners.push(cb)
    unlistenToLogin = (cb) => this.listeners = this.listeners.filter(l => l !== cb)
    getCurrentUser = () => this.currentUser
    isLoggedIn = () => this.currentUser !== null
    isAdmin = () => {
        if(!this.currentUser) return false
        return this.currentUser.admin
    }
    logout = () => {
        localStorage.clear()
        this.currentUser = null
        this.fireChange()
    }

    authCallback = (msg) => {
        console.log("got an event from the external window",msg)
        console.log("origin = ", msg.origin)
        if(!msg.origin === 'http://localhost:39176') {
            console.log("message is not from the expected origin. what do we do?")
        }
        console.log("data is",msg.data.payload)
        console.log("hello user", msg.data.payload.id)
        console.log("your access token is",msg.data.payload.accessToken)
        this.setUserData(msg.data.payload)
        //close the window
        this.win.close()
        window.removeEventListener('message',this.authCallback)
    }

    checkAuth() {
        let accesstoken = ""
        if(localStorage.getItem('access-token')) {
            accesstoken = localStorage.getItem('access-token')
        }
        // console.log("fetching with the access token",accesstoken)
        return fetch(`${Constants.BASE_URL}/userinfo?accesstoken=${accesstoken}`)
            .then((res)=>res.json())
            .then((res)=>{
                this.currentUser = res.user
                if(!this.currentUser) this.currentUser = null
                return res.user
            })
    }
    setUserData(data) {
        localStorage.setItem('access-token',data.accessToken)
        this.fireChange()
    }
    getAccessToken() {
        return localStorage.getItem('access-token')
    }
}


export default new AuthStore()