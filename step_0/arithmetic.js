
var MERCURY_ID	= 0;
var VENUS_ID 	= 1;
var EARTH_ID 	= 2;
var MARS_ID		= 3;
var JUPITER_ID	= 4;
var SATURN_ID	= 5;
var URANUS_ID	= 6;
var NEPTUNE_ID	= 7;
var PLUTO_ID 	= 8;

// Long of asc node (degrees)
var orbit_N = [
               [48.3313, 3.24587E-5],		// Mercury
               [76.6799, 2.46590E-5],		// Venus
               [348.73936, 0.0],					// Earth
               [49.5574, 2.11081E-5],		// Mars
               [100.4542, 2.76854E-5],		// Jupiter
               [113.6634, 2.38980E-5],		// Saturn
               [74.0005, 1.3978E-5],		// Uranus
               [131.7806, 3.0173E-5],		// Neptune
               [xxx, xxx]							// Pluto
               ];

// Inclination (degrees)
var orbit_i = [
          [7.0047, 5.00E-8],		// Mercury
          [3.3946, 2.75E-8],		// Venus
          [348.73936, 0.0],							// Earth
          [1.8497, -1.78E-8],		// Mars
          [1.3030, -1.557E-7],		// Jupiter
          [2.4886, -1.081E-7],		// Saturn
          [0.7733, 1.9E-8],			// Uranus
          [1.7700, -2.55E-7],		// Neptune
          [xxx, xxx]								// Pluto
          ];

// Argument of perihelion (degrees)
var orbit_w = [
        [29.1241, 1.01444E-5],		// Mercury
        [54.8910, 1.38374E-5],		// Venus
        [114.20783, 0.0],							// Earth
        [286.5016, 2.92961E-5],		// Mars
        [273.8777, 1.64505E-5],		// Jupiter
        [339.3939, 2.97661E-5],		// Saturn
        [96.6612, 3.0565E-5],		// Uranus
        [272.8461, -6.027E-6],		// Neptune
        [xxx, xxx]									// Pluto
        ];

// Semi-major axis (AU)
var orbit_a = [
      [0.387098, 0.0],				// Mercury
      [0.723330, 0.0],				// Venus
      [1.00000011, 0.0],							// Earth
      [1.523688, 0.0],				// Mars
      [5.20256, 0.0],				// Jupiter
      [9.55475, 0.0],				// Saturn
      [19.18171, -1.55E-8],			// Uranus
      [30.05826, 3.313E-8],			// Neptune
      [xxx, xxx]									// Pluto
      ];

// Eccentricity
var orbit_e = [
        [0.205635, 5.59E-10],		// Mercury
        [0.006773, -1.302E-9],		// Venus
        [0.01671022, 0.0],							// Earth
        [0.093405, 2.516E-9],		// Mars
        [0.048498, 4.469E-9],		// Jupiter
        [0.055546, -9.499E-9],		// Saturn
        [0.047318, 7.45E-9],		// Uranus
        [0.008606, 2.15E-9],		// Neptune
        [xxx, xxx]									// Pluto
        ];

// Mean anomaly (degrees)
var orbit_N = [
      [168.6562, 4.0923344368],		// Mercury
      [48.0052, 1.6021302244],		// Venus
      [xxx, 0.9856076686],	// Earth
      [xxx, xxx],		// Mars
      [xxx, xxx],		// Jupiter
      [xxx, xxx],		// Saturn
      [xxx, xxx],		// Uranus
      [xxx, xxx],		// Neptune
      [xxx, xxx]		// Pluto
      ];

/*
Mercury:
    M = _deg + _deg * d    (Mean anonaly)
Venus:
    M =  _deg + _deg * d
Earth:
	Semimajor axis (AU)                  1.00000011  
	Orbital eccentricity                 0.01671022   
	Orbital inclination (deg)            0.00005  
	Longitude of ascending node (deg)  348.73936  
	Longitude of perihelion (deg)      102.94719  
	Mean Longitude (deg)               100.46435
    
Mars:
    M =  18.6021_deg + 0.5240207766_deg * d
Jupiter:
    M =  19.8950_deg + 0.0830853001_deg * d
Saturn:
    M = 316.9670_deg + 0.0334442282_deg * d
Uranus:
    M = 142.5905_deg + 0.011725806_deg  * d
Neptune:
    M = 260.2471_deg + 0.005995147_deg  * d
*/

var AU_TO_KM = 149597871.0;


function Mercury(date){

	var pi = Math.PI;
	var degreesToRadians = pi/180.0;
	
	// MERCURY ORBIT ATTRIBUTES  http://www.stjarnhimlen.se/comp/tutorial.html
	var N =  48.3313 + 3.24587e-5   * date;  	//  (Long of asc. node) IN DEGREES
//    console.log("N: " + N);
	N = normalizeDegree(N) * degreesToRadians;			// convert to radians
	
	var i =   7.0047 + 5.00e-8      * date;  	//  (Inclination) IN DEGREES
//    console.log("i: " + i);
	i = normalizeDegree(i) * degreesToRadians;			// convert to radians
	
	var w =  29.1241 + 1.01444e-5   * date;  	//  (Argument of perihelion) IN DEGREES
//    console.log("w: " + w);
	w = normalizeDegree(w) * degreesToRadians;			// convert to radians
	
	var a = 0.387098;							//  (Semi-major axis)
//    console.log("a: " + a);
    
	var e = 0.205635 + 5.59e-10     * date;		//  (Eccentricity)
//    console.log("e: " + e);
    
	var M = 168.6562 + 4.0923344368 * date;		//  (Mean anonaly) IN DEGREES
//    console.log("M: " + M);
	M = normalizeDegree(M) * degreesToRadians;			// convert to radians
	// ^^^^^^^^^^^^^^^^^^^^^^^^^		
	
	
	
	// eccentricity anomaly
	var E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
//	console.log("E (original):     "+(normalizeDegree(E * 180.0/pi)));
	for(var count=0; count<=5; count++){
		// get better approx.
		var Enew = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
		E = Enew;
//		console.log("E (iteration "+count+"): "+(normalizeDegree(E * 180.0/pi)));
	}
	
	
	
	//Compute rectangular (x,y) coordinates in the plane of the orbit:
    var x_orbit = a * (Math.cos(E) - e);
    var y_orbit = a * Math.sqrt(1 - e*e) * Math.sin(E);
	
	
	//Convert to distance and true anomaly:
    var r = Math.sqrt(x_orbit*x_orbit + y_orbit*y_orbit);
    var v = Math.atan2( y_orbit, x_orbit );
//    console.log("r: " + r);
//    console.log("v: " + v);
    
    var xeclip = r * ( Math.cos(N) * Math.cos(v+w) - Math.sin(N) * Math.sin(v+w) * Math.cos(i) );
    var yeclip = r * ( Math.sin(N) * Math.cos(v+w) + Math.cos(N) * Math.sin(v+w) * Math.cos(i) );
    var zeclip = r * Math.sin(v+w) * Math.sin(i);
    
//    console.log("xeclip: " + xeclip + " = "+xeclip*AU_TO_KM+" km");
//    console.log("yeclip: " + yeclip + " = "+yeclip*AU_TO_KM+" km");
//    console.log("zeclip: " + zeclip + " = "+zeclip*AU_TO_KM+" km");
    
    return vec3(xeclip*AU_TO_KM, yeclip*AU_TO_KM, zeclip*AU_TO_KM);
	
}

function normalizeDegree(degrees)
{
	if(degrees > 0){
		return degrees - Math.floor((degrees/360.0) + 0.1)*360.0;
	} else {
		return degrees + Math.ceil((-degrees/360.0) + 0.1)*360.0;
	}
}

