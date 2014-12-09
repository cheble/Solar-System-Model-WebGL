

var PI = Math.PI;
var DEG_TO_RAD = PI/180.0;
var AU_TO_KM = 149597871.0;

function planetPosition(planet, T){
	
	// semi-major axis (AU, AU/century)
	var a = planet.a + planet.aDelta * T;
	// eccentricity (, /century)
	var e = planet.e + planet.eDelta * T;
	// inclination (degrees, degrees/century)
	var I = planet.I + planet.IDelta * T;
	I = normalizeDegree(I) * DEG_TO_RAD;
	// mean longitude (degrees, degrees/century)
	var L = planet.L + planet.LDelta * T;
	L = normalizeDegree(L) * DEG_TO_RAD;
	// longitude of perihelion (degrees, degrees/century)
	var p = planet.p + planet.pDelta * T;
	p = normalizeDegree(p) * DEG_TO_RAD;
	// longitude of the ascending node (degrees, degrees/century)
	var N = planet.N + planet.NDelta * T;
	N = normalizeDegree(N) * DEG_TO_RAD;
	
	// argument of perihelion
	var w = p - N;
	
	// mean anomaly
	var M = L - p;
	if(planet.b){
	//	M = M + planet.b*T*T;
	}
	if(planet.c){
	//	M = M + planet.c*Math.cos(planet.f*T);
	}
	if(planet.s){
	//	M = M + planet.s*Math.sin(planet.f*T);
	}
	M = normalizeRadians(M);
	
	
	
	// eccentricity anomaly
	var E 	= M + e * Math.sin(M);
	for(var count=0; count<=5; count++){
		// get better approximation
		var deltaM = M - (E - e * Math.sin(E));
		var deltaE = deltaM/(1 - e * Math.cos(E));
		E = E + deltaE;
	}
	
	//Compute rectangular (x,y) coordinates in the plane of the orbit:
    var x_orbit = a * (Math.cos(E) - e);
    var y_orbit = a * Math.sqrt(1 - e*e) * Math.sin(E);
	
	//Convert to distance and true anomaly:
    var r = Math.sqrt(x_orbit*x_orbit + y_orbit*y_orbit);
    //var v = Math.atan2( y_orbit, x_orbit );
    
    var xeclip = ( Math.cos(w)*Math.cos(N) - Math.sin(w)*Math.sin(N)*Math.cos(I) )*x_orbit 
    		   + (-Math.sin(w)*Math.cos(N) - Math.cos(w)*Math.sin(N)*Math.cos(I) )*y_orbit;
    
    var yeclip = ( Math.cos(w)*Math.sin(N) + Math.sin(w)*Math.cos(N)*Math.cos(I) )*x_orbit 
    		   + (-Math.sin(w)*Math.sin(N) + Math.cos(w)*Math.cos(N)*Math.cos(I) )*y_orbit;
    
    var zeclip = ( Math.sin(w)*Math.sin(I) )*x_orbit 
    		   + ( Math.cos(w)*Math.sin(I) )*y_orbit;
    
    return vec3(xeclip*AU_TO_KM, yeclip*AU_TO_KM, zeclip*AU_TO_KM);
	
}

function satellitePosition(satellite, T){

	// MERCURY ORBIT ATTRIBUTES  http://www.stjarnhimlen.se/comp/tutorial.html
	var N =  48.3313 + 3.24587e-5   * date;  	//  (Long of asc. node) IN DEGREES
//    console.log("N: " + N);
	N = normalizeDegree(N) * degreesToRadians;			// convert to radians
	
	var i =   7.0047 + 5.00e-8      * date;  	//  (Inclination) IN DEGREES
//  console.log("i: " + i);
	i = normalizeDegree(i) * degreesToRadians;			// convert to radians
	
	var w =  29.1241 + 1.01444e-5   * date;  	//  (Argument of perihelion) IN DEGREES
//  console.log("w: " + w);
	w = normalizeDegree(w) * degreesToRadians;			// convert to radians
	
	var a = 0.387098;							//  (Semi-major axis)
//  console.log("a: " + a);
  
	var e = 0.205635 + 5.59e-10     * date;		//  (Eccentricity)
//  console.log("e: " + e);
  
	var M = 168.6562 + 4.0923344368 * date;		//  (Mean anonaly) IN DEGREES
//  console.log("M: " + M);
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
//  console.log("r: " + r);
//  console.log("v: " + v);
  
  var xeclip = r * ( Math.cos(n) * Math.cos(v+w) - Math.sin(n) * Math.sin(v+w) * Math.cos(i) );
  var yeclip = r * ( Math.sin(n) * Math.cos(v+w) + Math.cos(n) * Math.sin(v+w) * Math.cos(i) );
  var zeclip = r * Math.sin(v+w) * Math.sin(i);
  
//  console.log("xeclip: " + xeclip + " = "+xeclip*AU_TO_KM+" km");
//  console.log("yeclip: " + yeclip + " = "+yeclip*AU_TO_KM+" km");
//  console.log("zeclip: " + zeclip + " = "+zeclip*AU_TO_KM+" km");
  
  return vec3(xeclip*AU_TO_KM, yeclip*AU_TO_KM, zeclip*AU_TO_KM);
	
	
	// semi-major axis (AU, AU/century)
	var a = planet.a + planet.aDelta * T;
	// eccentricity (, /century)
	var e = planet.e + planet.eDelta * T;
	// inclination (degrees, degrees/century)
	var I = planet.I + planet.IDelta * T;
	I = normalizeDegree(I) * DEG_TO_RAD;
	// mean longitude (degrees, degrees/century)
	var L = planet.L + planet.LDelta * T;
	L = normalizeDegree(L) * DEG_TO_RAD;
	// longitude of perihelion (degrees, degrees/century)
	var p = planet.p + planet.pDelta * T;
	p = normalizeDegree(p) * DEG_TO_RAD;
	// longitude of the ascending node (degrees, degrees/century)
	var n = planet.n + planet.nDelta * T;
	n = normalizeDegree(n) * DEG_TO_RAD;
	
	// argument of perihelion
	var w = p - n;
	
	// mean anomaly
	var M = L - p;
	if(planet.b){
		M = M + planet.b*T*T;
	}
	if(planet.c){
		M = M + planet.c*Math.cos(planet.f*T);
	}
	if(planet.s){
		M = M + planet.s*Math.sin(planet.f*T);
	}
	M = normalizeRadians(M);
	
	
	
	// eccentricity anomaly
	var E 	= M + e * Math.sin(M);
	for(var count=0; count<=5; count++){
		// get better approximation
		var deltaM = M - (E - e * Math.sin(E));
		var deltaE = deltaM/(1 - e * Math.cos(E));
		E = E + deltaE;
	}
	
	//Compute rectangular (x,y) coordinates in the plane of the orbit:
    var x_orbit = a * (Math.cos(E) - e);
    var y_orbit = a * Math.sqrt(1 - e*e) * Math.sin(E);
	
	//Convert to distance and true anomaly:
    //var r = Math.sqrt(x_orbit*x_orbit + y_orbit*y_orbit);
    //var v = Math.atan2( y_orbit, x_orbit );
    
    var xeclip = ( Math.cos(w)*Math.cos(n) - Math.sin(w)*Math.sin(n)*Math.cos(I) )*x_orbit 
    		   + (-Math.sin(w)*Math.cos(n) - Math.cos(w)*Math.sin(n)*Math.cos(I) )*y_orbit;
    
    var yeclip = ( Math.cos(w)*Math.sin(n) + Math.sin(w)*Math.cos(n)*Math.cos(I) )*x_orbit 
    		   + (-Math.sin(w)*Math.sin(n) + Math.cos(w)*Math.cos(n)*Math.cos(I) )*y_orbit;
    
    var zeclip = ( Math.sin(w)*Math.sin(I) )*x_orbit 
    		   + ( Math.cos(w)*Math.sin(I) )*y_orbit;
    
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

function normalizeRadians(radians)
{
	if(radians > 0){
		return radians - Math.floor((radians/(2*PI)) + 0.1)*(2*PI);
	} else {
		return radians + Math.ceil((-radians/(2*PI)) + 0.1)*(2*PI);
	}
}