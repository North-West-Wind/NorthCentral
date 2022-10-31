const invite = document.createElement("a");
invite.href = "/tradew1nd/invite";
invite.target = "invite";
invite.setAttribute("top-component", 1);
invite.text = "Invite";

window.onresize = () => {
    var ratio = window.innerWidth / window.innerHeight;
    if (ratio < 1) disableStylesheet(document.getElementById("horizontal"));
    else disableStylesheet(document.getElementById("vertical"));
    if (document.getElementById("vertical").disabled) {
        document.getElementById("home-link").href = "/tradew1nd";
        const topbar = document.getElementById("topbar");
        topbar.append(invite);
    } else {
        document.getElementById("home-link").href = "#";
        document.querySelectorAll("[top-component=1]").forEach(e => e.remove());
    }
}

window.onresize();