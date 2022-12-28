document.addEventListener("DOMContentLoaded", () => {
	// Create the header
	const topbar = document.createElement("div");
	topbar.classList.add("topbar");
	topbar.id = "topbar";
	topbar.innerHTML = '<a id="home-link"><img src="/assets/images/tradew1nd.png" id="home-image" /></a>';
	const side = document.createElement("div");
	side.id = "side-menu";
	side.innerHTML = '<div id="side-placeholder"></div><a href="/tradew1nd/invite" target="invite">Invite</a><a href="/tradew1nd/privacy">Privacy</a>';
	document.body.prepend(topbar, side);

	// Create the footer
	const footer = document.createElement("div");
	footer.classList.add("footer");
	footer.innerHTML = "<p>Made by NorthWestWind</p>";
	document.body.append(footer);

	setupListener();
	setupVertical();
});