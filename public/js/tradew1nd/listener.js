new ResizeObserver(() => {
    document.getElementById("top-placeholder").style.height = document.getElementById("topbar").clientHeight + "px";
    document.getElementById("side-placeholder").style.height = document.getElementById("topbar").clientHeight + "px";
}).observe(document.getElementById("topbar"));

const invite = document.createElement("a");
invite.href = "/tradew1nd/invite";
invite.target = "invite";
invite.setAttribute("top-component", 1);
invite.text = "Invite";

const privacy = document.createElement("a");
privacy.href = "/tradew1nd/privacy";
privacy.setAttribute("top-component", 1);
privacy.text = "Privacy";

window.onresize = () => {
    var ratio = window.innerWidth / window.innerHeight;
    if (ratio < 1) {
        disableStylesheet(document.getElementById("horizontal"));
        enableStylesheet(document.getElementById("vertical"));
    } else {
        disableStylesheet(document.getElementById("vertical"));
        enableStylesheet(document.getElementById("horizontal"));
    }
    if (document.getElementById("vertical").disabled) {
        document.getElementById("home-link").href = "/tradew1nd";
        const topbar = document.getElementById("topbar");
        topbar.append(invite);
    } else {
        document.getElementById("home-link").href = "#";
        document.querySelectorAll("[top-component]").forEach(e => e.remove());
    }
}

window.onresize();

for (const element of document.getElementsByClassName("inline-code"))
    element.onclick = () => {
        navigator.clipboard.writeText(element.textContent);
        element.style.color = "#00aa00";
        setTimeout(() => element.style.color = "", 1500);
    }

