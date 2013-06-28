//based on Farbtastic Color Picker 1.2

function getPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent)
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	return [curleft,curtop];
}
function toRange(a,x,b) {return x<a?a:x>b?b:x}

function ColorPicker(host) {
	var p = this;
	var s;
	
	s = host.style;
	s.position = "relative";
	s.display = "inline-block";
	//s.border = "1px solid";
	s.cursor = "crosshair";
	
	/*var hover = document.createElement("div");
	s = hover.style;
	s.position = "absolute";
	s.width = s.height = "100%";
	//s.background = "rgba(0,0,0,0.5)"
	s.zIndex = 4;
	host.appendChild(hover);*/
	
	var wheel = new Image();
	wheel.src = "wheel.png";
	s = wheel.style;
	s.position = "relative";
	wheel.width = wheel.height = 195;
	//s.zIndex = 1;
	host.appendChild(wheel);
	
	var color = document.createElement("div");
	s = color.style;
	s.position = "absolute";
	s.left = s.top = "24%";
	s.background = "#0F0";
	host.appendChild(color);
	
	var rect = new Image();
	rect.src = "rect.png";
	s = rect.style;
	s.position = "relative";
	rect.width = rect.height = 101;
	//s.zIndex = 2;
	color.appendChild(rect);
	
	function mm(parent) { //make marker
		var m = new Image();
		m.src = "marker.png";
		s = m.style;
		s.position = "absolute";
		s.margin = "-8px";
		//s.zIndex = 3;
		parent.appendChild(m);
		return m;
	}
	wheel_marker = mm(host);
	rect_marker = mm(color);
	
	
	var P3 = 0.33333333, P6 = 1-P3;
	function HSL2RGB(h, s, l) {
		var m1, m2;
		m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
		m1 = l * 2 - m2;
		return [hue2RGB(m1, m2, h<P6 ? h+P3 : h+P3-1),
		        hue2RGB(m1, m2, h),
		        hue2RGB(m1, m2, h>P3 ? h-P3 : h-P3+1)];
	}
	function hue2RGB(m1, m2, h) {
		//h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
		if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
		if (h * 2 < 1) return m2;
		if (h * 3 < 2) return m1 + (m2 - m1) * (P6 - h) * 6;
		return m1;
	}
	function RGB2HTML(r, g, b) {
		return "rgb("+((r*256+0.5)|0)+","+
		              ((g*256+0.5)|0)+","+
		              ((b*256+0.5)|0)+")";
	}
	function RGBa2HTML(c) {
		return "rgb("+((c[0]*256+0.5)|0)+","+
		              ((c[1]*256+0.5)|0)+","+
		              ((c[2]*256+0.5)|0)+")";
	}
	function RGB2HSL(r, g, b) {
		var min = Math.min(r, g, b);
		var max = Math.max(r, g, b);
		var delta = max - min;
		var l = (min + max) / 2;
		var s = 0;
		var h = 0;
		if (l > 0 && l < 1) {
			s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
		}
		if (delta > 0) {
			if (max == r && max != g) h += (g - b) / delta;
			if (max == g && max != b) h += (2 + (b - r) / delta);
			if (max == b && max != r) h += (4 + (r - g) / delta);
			h /= 6;
		}
		return [h, s, l];
	}
	
	this.setRGB = function(r, g, b) {
		var hsl = RGB2HSL(r, g, b);
		hue = hsl[0];
		sat = hsl[1];
		lum = hsl[2];
		updateAll();
		if (p.onfinalchange) p.onfinalchange();
	}
	this.getRGB = function() {
		return HSL2RGB(hue, sat, lum);
	}
	this.getHTML = function() {
		return RGBa2HTML(HSL2RGB(hue, sat, lum));
	}
	
	var wheel_x,wheel_y,wheel_r, wheel_w,wheel_w2;
	var rect_x,rect_y, rect_w,rect_w2;
	function updateMetrics() {
		wheel_w = wheel.offsetWidth;
		wheel_r = wheel_w*0.43;
		wheel_w2 = wheel_w*0.5;
		rect_w = rect.offsetWidth;
		rect_w2 = rect_w*0.5;
		var pos = getPos(wheel);
		wheel_x = pos[0];
		wheel_y = pos[1];
		rect_x = wheel_x+color.offsetTop;
		rect_y = wheel_y+color.offsetLeft;
	}
	
	function updateAll() {
		updateMetrics();
		var ang = hue*3.1415927*2;
		markerSetPos(wheel_marker, wheel_w2+Math.sin(ang)*wheel_r,
		                           wheel_w2-Math.cos(ang)*wheel_r);
		markerSetPos(rect_marker, (1-sat)*rect_w, (1-lum)*rect_w);
		if (p.onchange) p.onchange();
	}
	
	function markerSetPos(marker, dx, dy) {
		marker.style.left = (dx|0)+"px";
		marker.style.top  = (dy|0)+"px";
	}
	
	var hue=0, sat=0, lum=0;
	function wheel_process(pageX, pageY) {
		var dx = pageX-wheel_x-wheel_w2;
		var dy = pageY-wheel_y-wheel_w2;
		var len = Math.sqrt(dx*dx+dy*dy);
		if (len == 0) {dx = 1; len = 1;}
		dx *= wheel_r/len;
		dy *= wheel_r/len;
		hue = Math.atan2(dx, -dy) / 3.1415927/2;
		if (hue < 0) hue += 1;
		markerSetPos(wheel_marker, wheel_w2+dx, wheel_w2+dy);
		color.style.background = RGBa2HTML(HSL2RGB(hue,1,0.5));
		if (p.onchange) p.onchange();
	}
	function rect_process(pageX, pageY) {
		var dx = toRange(0, pageX-rect_x, rect_w);
		var dy = toRange(0, pageY-rect_y, rect_w);
		sat = 1-dx/rect_w;
		lum = 1-dy/rect_w;
		markerSetPos(rect_marker, dx, dy);
		if (p.onchange) p.onchange();
	}
	
	host.onmousedown = function(e) {
		updateMetrics();
		var dx = e.pageX - wheel_x - wheel_w2;
		var dy = e.pageY - wheel_y - wheel_w2;
		if (Math.abs(dx) < rect_w2 && Math.abs(dy) < rect_w2) {
			document.addEventListener("mousemove", rect_on_mouse_move, false);
			document.addEventListener("mouseup", rect_on_mouse_up, false);
			rect_process(e.pageX, e.pageY);
		} else {
			document.addEventListener("mousemove", wheel_on_mouse_move, false);
			document.addEventListener("mouseup", wheel_on_mouse_up, false);
			wheel_process(e.pageX, e.pageY);
		}
		e.preventDefault();
	}
	function wheel_on_mouse_move(e) {
		wheel_process(e.pageX, e.pageY);
		e.preventDefault();
	}
	function rect_on_mouse_move(e) {
		rect_process(e.pageX, e.pageY);
		e.preventDefault();
	}
	function wheel_on_mouse_up(e) {
		document.removeEventListener("mousemove", wheel_on_mouse_move, false);
		document.removeEventListener("mouseup", wheel_on_mouse_up, false);
		e.preventDefault();
		if (p.onfinalchange) p.onfinalchange();
	}
	function rect_on_mouse_up(e) {
		document.removeEventListener("mousemove", rect_on_mouse_move, false);
		document.removeEventListener("mouseup", rect_on_mouse_up, false);
		e.preventDefault();
		if (p.onfinalchange) p.onfinalchange();
	}
	
	this.setRGB(0,1,0);
}