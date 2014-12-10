// Define system to find the correct path
// In near future, we can upload all the pictures online and use urls
var OSName="Unknown OS";
if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

var separator;
if(OSName == "Windows") {
    separator = "\\"
} else {
    separator = "/"
}

var SKYBOX_PATH = "resources" + separator + "skybox" + separator;

var PLANETS_PATH = "resources" + separator + "planets" + separator;
