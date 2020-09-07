function request(url, method, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			console.log("请求" + url + "结束--状态码" + xhr.status);
			//console.log("返回数据\n", xhr.responseText);
			callback(xhr.responseText);
			document.querySelector(".load").style.display = "none";
		}
	};
	xhr.timeout = 6000000;
	xhr.onerror = function (e) {
		console.error("请求出错", e);
	};
	xhr.ontimeout = function (e) {
		console.error("请求超时", e);
	};
	xhr.open(method || "GET", url);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.send(JSON.stringify(data));
}
/**
 *
 */
var data = {
	ip: [],
	name: {},
	names: [],
};
window.addEventListener("DOMContentLoaded", function () {
	request("data.txt", "get", null, function (e) {
		console.warn("加载数据完成");
		convert(e);
		console.warn("计算完成");
		// console.log(e);
	});
});
class IpItem {
	constructor(ipStart, ipEnd, location, name) {
		this.ip = {
			start: ipStart,
			end: ipEnd,
		};
		this.location = location;
		this.name = name;
	}
	isThis(ip) {
		// 直接将最后两位转换为16位整数,对比大小
		var ipValue = ip[2] * 256 + ip[3];
		return this.ip.start[2] * 256 + this.ip.start[3] <= ipValue && this.ip.end[2] * 256 + this.ip.end[3] >= ipValue;
	}
}
/*
ip 使用4个数组?
TODO: 内存占用过大!! 1800m  服务器放不了,用户页面也撑不住
有一部分原因是ip使用了字符串而不是数字
从p3放元素修改为p2放元素
p2也会重复,但是先不管
6.14版本 内存140m (浏览器中)

*/
var tArr = [];
function convert(e) {
	//52w行数据
	var arr = e.split("\n");
	arr.pop();
	arr.pop();
	arr.pop();
	arr.pop();
	console.time();
	var ip = data.ip;
	var row, ipStart, ipEnd, location, o;
	var p1, p2, p3, t;
	for (var i = 0; i < arr.length; i++) {
		row = arr[i].split(/ +/);
		ipStart = ipToNumber(row[0].split("."));
		ipEnd = ipToNumber(row[1].split("."));
		location = row[2];
		o = new IpItem(ipStart, ipEnd, location, row[3] + (row[4] === undefined ? "" : " " + row[4]));
		//向ip添加
		//第一个 [0].0.0.0
		for (p1 = ipStart[0]; p1 <= ipEnd[0]; p1++) {
			if (!ip[p1]) ip[p1] = [];
			//第二个 0.[0].0.0
			for (p2 = ipStart[1]; p2 <= ipEnd[1]; p2++) {
				if (!ip[p1][p2]) ip[p1][p2] = [];
				ip[p1][p2].push(o);
			}
		}
		//向name中添加
		if (!data.name[location]) {
			data.name[location] = [o];
			data.names.push(location);
		} else {
			data.name[location].push(o);
		}
	}
	console.timeEnd();
}
function ipToNumber(arr) {
	return [+arr[0], +arr[1], +arr[2], +arr[3]];
}

function query(ipStr) {
	// console.time();
	var arr = ipToNumber(ipStr.split("."));
	var tArr = data.ip[arr[0]][arr[1]];
	for (var i = 0; i < tArr.length; i++) {
		if (tArr[i].isThis(arr)) {
			// console.warn(tArr[i]);
			// console.timeEnd();
			return tArr[i];
		}
	}
	return null;
}
