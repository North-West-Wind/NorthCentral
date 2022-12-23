function setupVertical() {
    document.getElementById("home-link").onclick = (event) => {
        if (document.getElementById("vertical").disabled) return;
        event.stopPropagation();
        const menu = document.getElementById("side-menu");
        if (menu.style.width) menu.style.width = "";
        else menu.style.width = "100vw";
    }
}