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

    test("startable", function() {
        $('<div id="socialshareprivacy" />').appendTo('#qunit-fixture');
        ok($("#socialshareprivacy").socialSharePrivacy({'css_path':'../socialshareprivacy/socialshareprivacy.css',}), "can be started");
        ok($('#socialshareprivacy .social_share_privacy_area').length > 0, "Button Container was added");
    });

}(jQuery));
