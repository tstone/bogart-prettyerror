bogart-prettyerror
==================



What is it?
-----------
An upgraded version of ```bogart.middleware.error```


What does it look like?
-----------------------
v0.0.1: http://www.flickr.com/photos/wastingtape/6738206705/in/photosstream/lightbox/


Intallation
-----------
 1.  Check out prettyerror.js from the repo
 2.  Copy prettyerror.js into your project somewhere (like ./lib)
 3.  Require the file...
 ```
 var prettyerror = require('./lib/prettyerror');  // Or wherever you copied the file to
 ```

 4.  Use it with the bogart app...
 ```
 app.use(prettyerror.middleware.error);
 ```

Why isn't there an NPM module?
------------------------------
I'll make one when it's more stabalized.
