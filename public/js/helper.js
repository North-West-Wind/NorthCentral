/**
 * @param {string} cname 
 * @param {any} cvalue 
 */
function setVar(cname, cvalue) {
    console.log("setVar cookie check: ", window.sessionStorage.getItem("use_cookies"));
    console.trace();
    if (window.sessionStorage.getItem("use_cookies") || getVar("use_cookies", true)) document.cookie = cname + "=" + cvalue + ";SameSite=Strict;expires=Tue, 19 Jan 2038 04:14:07 GMT;path=/";
    else window.sessionStorage.setItem(cname, cvalue);
}

/**
 * @param {string} cname 
 * @param {boolean} forceCookie
 * @returns {string}
 */
function getVar(cname, forceCookie = false) {
    if (forceCookie || window.sessionStorage.getItem("use_cookies") || getVar("use_cookies", true)) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    } else return window.sessionStorage.getItem(cname);
}

function toggleMusic() {
    const cookie = getVar("no_music");
    if (!cookie || cookie == 0) {
        setVar("no_music", 1);
        document.getElementById("player").pause();
    } else {
        setVar("no_music", 0);
        document.getElementById("player").play();
    }
}

function gotoRoot() {
    document.location.href = "/";
}

function setInnerHTML(elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes)
        .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }