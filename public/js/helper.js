/**
 * @param {string} cname 
 * @param {any} cvalue 
 * @param {number} exdays 
 */
function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

/**
 * @param {string} cname 
 * @returns {string}
 */
function getCookie(cname) {
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
}

function toggleMusic() {
    const cookie = getCookie("no_music");
    if (!cookie || cookie == 0) {
        setCookie("no_music", 1);
        document.getElementById("player").pause();
    } else {
        setCookie("no_music", 0);
        document.getElementById("player").play();
    }
}

function gotoRoot() {
    document.location.href = "/";
}