document.getElementById("home-image").onclick = () => {
    if (document.getElementById("vertical").disabled) return;
    const menu = document.getElementById("side-menu");
    if (menu.style.width) menu.style.width = "";
    else menu.style.width = "100vw";
}