
// http://ssd.jpl.nasa.gov/?planet_pos
// http://ssd.jpl.nasa.gov/txt/p_elem_t2.txt

var SUN = {
		name:"Sun",									// planet name
		info:"The Sun (Star)" +
				"<br>Center of Earth's Solar System" +
				"<br>Radius: 696,000 km",
		radius:696000.0,							// volumetric mean radius (km)
		colorCode:100,
		o:7.25,
		r:14.1843971631,
		I:0.0
			};

var MERCURY = {
		name:"Mercury",								// planet name
		info:"Mercury (Planet)" +
				"<br>Closest planet to the Sun" +
				"<br>Radius: 2,439.7 km" +
				"<br>Distance from the Sun: 57.9 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 1,407.6 hours" +
				"<br>Orbital Period: 88.0 days",
		radius:2439.7,								// volumetric mean radius (km)
		colorCode:101,
		o:0.034,									// Obliquity to orbit (degrees)
		r:6.1381074169,									// axis rotation per day (degrees)  // (side-real day * 360) = 24/(rot period in hrs) * 360
		a:0.38709843,	aDelta:0.00000000,			// semi-major axis (AU, AU/century)
		e:0.20563661,	eDelta:0.00002123,			// eccentricity (, /century)
		I:7.00559432,	IDelta:-0.00590158,			// inclination (degrees, degrees/century)
		L:252.25166724,	LDelta:149472.67486623,		// mean longitude (degrees, degrees/century)
		p:77.45771895,	pDelta:0.15940013,			// longitude of perihelion (degrees, degrees/century)
		N:48.33961819,	NDelta:-0.12214182			// longitude of the ascending node (degrees, degrees/century)
			};

var VENUS = {
		name:"Venus",
		info:"Venus (Planet)" +
				"<br>2nd planet from the Sun" +
				"<br>Radius: 6,051.8 km" +
				"<br>Distance from the Sun: 108.2 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 5,832.5 hours" +
				"<br>Orbital Period: 224.7 days",
		radius:6051.8,
		colorCode:102,
		o:177.36,
		r:1.4813290814,
		a:0.72332102,	aDelta:-0.00000026,
		e:0.00676399,	eDelta:-0.00005107,
		I:3.39777545,	IDelta:0.00043494,
		L:181.97970850,	LDelta:58517.81560260,
		p:131.76755713,	pDelta:0.05679648,
		N:76.67261496,	NDelta:-0.27274174
			};

// TODO: This is actually the Earth-Moon Barycenter (the center of the Earth-Moon body) orbit
var EARTH = {
		name:"Earth",
		info:"Earth (Planet)" +
				"<br>3rd planet from the Sun" +
				"<br>Radius: 6,371.0 km" +
				"<br>Distance from the Sun: 149.6 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 23.9 hours" +
				"<br>Orbital Period: 365.2 days",
		radius:6371.0,
		colorCode:103,
		o:23.44,
		r:360.9851887443,		// 24.0/23.9345 * 360
		a:1.00000018,	aDelta:-0.00000003,
		e:0.01673163,	eDelta:-0.00003661,
		I:-0.00054346,	IDelta:-0.01337178,
		L:100.46691572,	LDelta:35999.37306329,
		p:102.93005885,	pDelta:0.31795260,
		N:-5.11260389,	NDelta:-0.24123856
			};

var EARTH_CLOUDS = {
		name:"Earth_clouds",
		radius:6521.0,
		colorCode:103,
		o:23.44,
		r:-90.9851887443,		// 24.0/23.9345 * 360
		a:1.00000018,	aDelta:-0.00000003,
		e:0.01673163,	eDelta:-0.00003661,
		I:-0.00054346,	IDelta:-0.01337178,
		L:100.46691572,	LDelta:35999.37306329,
		p:102.93005885,	pDelta:0.31795260,
		N:-5.11260389,	NDelta:-0.24123856
			};

var MARS = {
		name:"Mars",
		info:"Mars (Planet)" +
				"<br>4th planet from the Sun" +
				"<br>Radius: 3,389.5 km" +
				"<br>Distance from the Sun: 227.9 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 24.6 hours" +
				"<br>Orbital Period: 687.0 days",
		radius:3389.5,
		colorCode:104,
		o:25.19,
		r:1.4813290814,
		a:1.52371243,	aDelta:0.00000097,
		e:0.09336511,	eDelta:0.00009149,
		I:1.85181869,	IDelta:-0.00724757,
		L:-4.56813164,	LDelta:19140.29934243,
		p:-23.91744784,	pDelta:0.45223625,
		N:49.71320984,	NDelta:-0.26852431
			};

var JUPITER = {
		name:"Jupiter",
		info:"Jupiter (Planet)" +
				"<br>5th planet from the Sun" +
				"<br>Radius: 69,911 km" +
				"<br>Distance from the Sun: 778.6 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 9.9 hours" +
				"<br>Orbital Period: 4,331 days",
		radius:69911,
		colorCode:105,
		o:3.13,
		r:870.5289672544,
		a:5.20248019,	aDelta:-0.00002864,
		e:0.04853590,	eDelta:0.00018026,
		I:1.29861416,	IDelta:-0.00322699,
		L:34.33479152,	LDelta:3034.90371757,
		p:14.27495244,	pDelta:0.18199196,
		N:100.29282654,	NDelta:0.13024619,
		b:-0.00012452,
		c:0.06064060,
		s:-0.35635438,
		f:38.35125000
			};

var SATURN = {
		name:"Saturn",
		info:"Saturn (Planet)" +
				"<br>6th planet from the Sun" +
				"<br>Radius: 58,232 km" +
				"<br>Distance from the Sun: 1,433.5 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 10.7 hours" +
				"<br>Orbital Period: 10,747 days",
		radius:58232,
		colorCode:106,
		o:26.73,
		r:810.8108108108,
		a:9.54149883,	aDelta:-0.00003065,
		e:0.05550825,	eDelta:-0.00032044,
		I:2.49424102,	IDelta:0.00451969,
		L:50.07571329,	LDelta:1222.11494724,
		p:92.86136063,	pDelta:0.54179478,
		N:113.63998702,	NDelta:-0.25015002,
		b:0.00025899,
		c:-0.13434469,
		s:0.87320147,
		f:38.35125000
			};

var URANUS = {
		name:"Uranus",
		info:"Uranus (Planet)" +
				"<br>7th planet from the Sun" +
				"<br>Radius: 25,362 km" +
				"<br>Distance from the Sun: 2,872.5 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 17.2 hours" +
				"<br>Orbital Period: 30,589 days",
		radius:25362,
		colorCode:107,
		o:97.77,
		r:501.1600928074,
		a:19.18797948,	aDelta:-0.00020455,
		e:0.04685740,	eDelta:-0.00001550,
		I:0.77298127,	IDelta:-0.00180155,
		L:314.20276625,	LDelta:428.49512595,
		p:172.43404441,	pDelta:0.09266985,
		N:73.96250215,	NDelta:0.05739699,
		b:0.00058331,
		c:-0.97731848,
		s:0.17689245,
		f:7.67025000
			};

var NEPTUNE = {
		name:"Neptune",
		info:"Neptune (Planet)" +
				"<br>8th planet from the Sun" +
				"<br>Radius: 24,622 km" +
				"<br>Distance from the Sun: 4,495.1 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 16.1 hours" +
				"<br>Orbital Period: 59,800 days",
		radius:24622,
		colorCode:108,
		o:28.32,
		r:536.3128491620,
		a:30.06952752,	aDelta:0.00006447,
		e:0.00895439,	eDelta:0.00000818,
		I:1.77005520,	IDelta:0.00022400,
		L:304.22289287,	LDelta:218.46515314,
		p:46.68158724,	pDelta:0.01009938,
		N:131.78635853,	NDelta:-0.00606302,
		b:-0.00041348,
		c:0.68346318,
		s:-0.10162547,
		f:7.67025000
			};

var PLUTO = {
		name:"Pluto",
		info:"Pluto (Dwarf Planet)" +
				"<br>9th major body from the Sun" +
				"<br>Radius: 1,195 km" +
				"<br>Distance from the Sun: 5,870.0 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 153.3 hours" +
				"<br>Orbital Period: 90,588 days",
		radius:1195,
		colorCode:109,
		o:122.53,
		r:56.3627254509,
		a:39.48686035,	aDelta:0.00449751,
		e:0.24885238,	eDelta:0.00006016,
		I:17.14104260,	IDelta:0.00000501,
		L:238.96535011,	LDelta:145.18042903,
		p:224.09702598,	pDelta:-0.00968827,
		N:110.30167986,	NDelta:-0.00809981,
		b:-0.01262724
			};

/*

from http://ssd.jpl.nasa.gov/?sat_elem#ref1
a = 0.00256955529	(semi-major axis)
e = 0.0554			(eccentricity)
w = 318.15			(argument of periapsis)
M = 135.27			(mean anomaly)
i = 5.16			(inclination)
node = 125.08		(longitude of the ascending node)
n = 13.176358		(longitude rate in deg/day)
P = 27.322			(Sidereal period)
Pw = 5.997			(argument of periapsis precession period)
Pnode = 18.600		(longitude of the ascending node precession period)
--------------------------------------------

*/

var MOON = {
		name:"Moon",
		info:"Moon (Natural Satellite)" +
				"<br>Earth's only moon" +
				"<br>Radius: 1,737.1 km" +
				"<br>Distance from Earth: 0.384 &times; 10<sup>6</sup> km" +
				"<br>Rotational Period: 655.7 hours" +
				"<br>Orbital Period: 27.3 days",
		radius:1737.1,
		colorCode:110,
		o:6.68,
		r:13.1761950077,
		a:0.00256955529,	aDelta:0.0,
		e:0.0554,			eDelta:0.0,
		I:5.16,				IDelta:0.0,
		// L = M + w + N = 135.27 + 318.15 + 125.08 = 218.5
		// LDelta = 13.176358 * 36525.0 = 481266.47595
		L:218.5,			LDelta:481266.47595,
		// p = N + w = 125.08 + 318.15 = 83.23
		p:83.23,			pDelta:0.0,
		N:125.08,			NDelta:0.0
			};


