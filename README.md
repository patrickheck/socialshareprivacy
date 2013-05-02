# SocialSharePrivacy #

Version: 1.4.1

SocialSharePrivacy is a jQuery Plugin that allows you to add buttons of social networks in a privacy friendly way.

Initially all buttons are inactive and so no data is transferred to or from those websites. Only after a first click they are activated and the code is loaded from the remote source.

It is based on the original plugin by heise. It can be found at http://www.heise.de/extras/socialshareprivacy/
For a demo see: http://c5demo.patrickheck.de/

Iprovements in comparison to the original include:

- Usage of one single image sprite. This cuts down the number of assets from 9 to only 3. 
- Compatibility with jQuery >= 1.7 (including 1.9)
- Nicer code formatting

Supported Networks include:

- Facebook
- Twitter
- Google+

This is published under MIT License: http://www.opensource.org/licenses/mit-license.php

#Installation#

## Example ##

    <head>
      …
      <script type="text/javascript" src="jquery.js"></script> 
      <script type="text/javascript" src="jquery.socialshareprivacy.min.js"></script>
      <script type="text/javascript">
        jQuery(document).ready(function($){
          if($('#socialshareprivacy').length > 0){
            $('#socialshareprivacy').socialSharePrivacy(); 
          }
        });
      </script>
      …
    </head>
    <body>
      …
      <div id="socialshareprivacy"></div>
      …
    </body>

## Explanation ##

1. Copy the minified file "jquery.socialshareprivacy.min.js" to your web directory.
3. Add a placeholder where you want the buttons to go: `<div id="socialshareprivacy"></div>`
2. Include a link to jQuery and "jquery.socialshareprivacy.min.js".
3. Add a jQuery document-ready function that calls socialshareprivacy. 

