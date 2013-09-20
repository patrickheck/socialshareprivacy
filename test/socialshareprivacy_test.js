(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

    module( "main" , {
        // This will run before each test in this module.
        setup: function() {
          $('<div id="socialshareprivacy" />').appendTo('#qunit-fixture');
          this.ssp = $('#socialshareprivacy').socialSharePrivacy({'css_path':'../socialshareprivacy/socialshareprivacy.css',});
        }
    });
  
    test("startable", function() {
        ok($(this.ssp).find(".social_share_privacy_area").length > 0, "Button Container was added");
        ok($(this.ssp).find('.facebook').length > 0, "Facebook Container was added");
        ok($(this.ssp).find('.twitter').length > 0, "Twitter Container was added");
        ok($(this.ssp).find('.gplus').length > 0, "Google+ Container was added");
        ok($(this.ssp).find('.settings_info').length > 0, "Info Container was added");
    });
    
    // test if buttons appear
    
    // test if web site code is loaded once clicked
    test("external-code", function() {
        // click facebook button
        $(this.ssp).find('.fb_like_privacy_dummy').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.facebook iframe').length > 0, "External Facebook Code was loaded");
        // disable using switch
        $(this.ssp).find('.facebook .switch').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.facebook .fb_like_privacy_dummy').length > 0, "External Facebook Code unloaded");
        
        // click twitter button
        $(this.ssp).find('.tweet_this_dummy').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.twitter iframe').length > 0, "External Twitter Code was loaded");
        // disable using switch
        $(this.ssp).find('.twitter .switch').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.twitter .tweet_this_dummy').length > 0, "External Twitter Code unloaded");
        
        // click google+ button
        $(this.ssp).find('.gplus_one_dummy').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.gplus .g-plusone').length > 0, "External Google+ Code was loaded");
        // disable using switch
        $(this.ssp).find('.gplus .switch').trigger( $.Event( "click" ) );
        ok($(this.ssp).find('.gplus .gplus_one_dummy').length > 0, "External Google+ Code unloaded");
    });
    
    
    // test if popups appear
    
    // test if cookies are set

}(jQuery));
