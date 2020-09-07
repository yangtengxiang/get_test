document.addEventListener("DOMContentLoaded", function () {
	console.log("DOMContentLoaded");
	
});
var imgIndex = 0;
var imgs = ["sea0.jpg", "sea1.jpg", "sea2.jpg", "sea3.jpg", "sea4.jpg", "sea5.jpg"];
window.onload = function () {
	console.log("load");
	loadImg()
	setInterval(loadImg,10000)
	// var bg = document.querySelector(".bg")
	// bg.style.opacity = "0"
};

function loadImg () {
	// console.warn("loadImg");
	var name = (document.createElement("img").src = "img/" + imgs[++imgIndex % 6]);
	setTimeout(function () {
		var bg = document.querySelector(".bg")
		var bg2 = document.querySelector(".bg-old")
		var oldName = bg.style.backgroundImage;
		// console.dir(bg);
		// console.log("name: "+name,"oldName:"+oldName);
		bg2.style.backgroundImage = `url(${name})`;
		bg2.style.opacity = "1";
		bg.style.backgroundImage = oldName;
		setTimeout(function () {
			bg.style.backgroundImage = `url(${name})`;
			bg2.style.opacity = "0";
			// console.warn("end");
		},2100)
	}, 10000);
	return name;
}
