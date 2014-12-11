

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
    
    // eclip coordinates are set so up is z and y is into the screen
    //return vec3(xeclip*AU_TO_KM, yeclip*AU_TO_KM, zeclip*AU_TO_KM);
    return vec3(-xeclip*AU_TO_KM, zeclip*AU_TO_KM, yeclip*AU_TO_KM);
	
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

function applyAxisTilt( invMV, body, T )
{
	if(! (body.o && body.r)){
		return invMV;
	}
	
	// TODO: this tilt is not in the correct direction for the date
	var tilt = rotate(body.o + body.I, vec4(0.0, 0.0, 1.0, 0.0));
	
	if(!theOrbits.showRotations){
		return mult(tilt, invMV);
	}
	var rotAngle = - body.r * T;
	rotAngle = normalizeDegree(rotAngle);
	var rot = rotate(rotAngle, vec4(0.0, 1.0, 0.0, 0.0));
	
	var change = mult(rot, tilt);

	return mult(change, invMV);
}

function calToDate(Y, M, D){
	// days since 2000 Jan 0.0 TDT
	var d = 367*Y - (7*(Y + ((M+9)/12)))/4 + (275*M)/9 + D - 730530;
	return d;
}