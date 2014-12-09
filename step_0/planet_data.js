
// http://ssd.jpl.nasa.gov/?planet_pos
// http://ssd.jpl.nasa.gov/txt/p_elem_t2.txt

var SUN = {
		name:"Sun",									// planet name
		radius:696000.0,							// volumetric mean radius (km)
		colorCode:100
			};

var MERCURY = {
		name:"Mercury",								// planet name
		radius:2439.7,								// volumetric mean radius (km)
		colorCode:101,
		a:0.38709843,	aDelta:0.00000000,			// semi-major axis (AU, AU/century)
		e:0.20563661,	eDelta:0.00002123,			// eccentricity (, /century)
		I:7.00559432,	IDelta:-0.00590158,			// inclination (degrees, degrees/century)
		L:252.25166724,	LDelta:149472.67486623,		// mean longitude (degrees, degrees/century)
		p:77.45771895,	pDelta:0.15940013,			// longitude of perihelion (degrees, degrees/century)
		N:48.33961819,	NDelta:-0.12214182			// longitude of the ascending node (degrees, degrees/century)
			};

var VENUS = {
		name:"Venus",
		radius:6051.8,
		colorCode:102,
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
		radius:6371.0,
		colorCode:103,
		a:1.00000018,	aDelta:-0.00000003,
		e:0.01673163,	eDelta:-0.00003661,
		I:-0.00054346,	IDelta:-0.01337178,
		L:100.46691572,	LDelta:35999.37306329,
		p:102.93005885,	pDelta:0.31795260,
		N:-5.11260389,	NDelta:-0.24123856
			};

var MARS = {
		name:"Mars",
		radius:3389.5,
		colorCode:104,
		a:1.52371243,	aDelta:0.00000097,
		e:0.09336511,	eDelta:0.00009149,
		I:1.85181869,	IDelta:-0.00724757,
		L:-4.56813164,	LDelta:19140.29934243,
		p:-23.91744784,	pDelta:0.45223625,
		N:49.71320984,	NDelta:-0.26852431
			};

var JUPITER = {
		name:"Jupiter",
		radius:69911,
		colorCode:105,
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
		radius:58232,
		colorCode:106,
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
		radius:25362,
		colorCode:107,
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
		radius:24622,
		colorCode:108,
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
		radius:1195,
		colorCode:109,
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
		radius:1737.1,
		colorCode:110,
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


/* 

from http://www.stjarnhimlen.se/comp/tutorial.html
N = 125.1228_deg - 0.0529538083_deg  * d    (Long asc. node)
i =   5.1454_deg                            (Inclination)
w = 318.0634_deg + 0.1643573223_deg  * d    (Arg. of perigee)
a =  60.2666                                (Mean distance)
e = 0.054900                                (Eccentricity)
M = 115.3654_deg + 13.0649929509_deg * d    (Mean anomaly)
-------------------------------------------------

*/
var MOON_ALT = {
		name:"Moon",
		radius:1737.1,
		colorCode:110,
		a:0.00256954861,	aDelta:0.0,
		e:0.054900,			eDelta:0.0,
		I:5.1454,			IDelta:0.0,
		// L = M + w + N = 115.3654 + 318.0634 + 125.1228 = 558.5516_deg = 198.5516_deg
		// LDelta = (13.0649929509 + 0.1643573223 + -0.0529538083) * 36525.0 = 481267.88088_deg
		L:198.5516,			LDelta:481267.88088,
		// p = N + w = 125.1228 + 318.0634 = 83.1862_deg
		// pDelta = wDelta = 0.1643573223 * 36525.0 = 6003.15119701_deg
		p:83.1862,			pDelta:6003.15119701,
		// NDelta = -0.0529538083 * 36525.0 = -1934.13784816_deg
		N:125.1228,			NDelta:-1934.13784816
			};

