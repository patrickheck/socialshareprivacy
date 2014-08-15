/*
 * jquery.socialshareprivacy.js | 2 Klicks fuer mehr Datenschutz
 *
 *
 * https://github.com/patrickheck/socialshareprivacy
 * http://www.heise.de/ct/artikel/2-Klicks-fuer-mehr-Datenschutz-1333879.html
 *
 * Copyright (c) 2011 Hilko Holweg, Sebastian Hilbig, Nicolas Heiringhoff, Juergen Schmidt
 * Heise Zeitschriften Verlag GmbH & Co. KG, http://www.heise.de,
 *
 * Copyright (c) 2011 Tilmann Kuhn
 * object-zoo, http://www.object-zoo.net
 *
 * is released under the MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * Spread the word, link to us if you can.
 */
(function ($) {

    "use strict";

    /*
     * helper functions
     */

    // abbreviate at last blank before length and add "\u2026" (horizontal ellipsis)
    function abbreviateText(text, length) {
        var abbreviated = decodeURIComponent(text);
        if (abbreviated.length <= length) {
            return text;
        }

        var lastWhitespaceIndex = abbreviated.substring(0, length - 1).lastIndexOf(' ');
        abbreviated = encodeURIComponent(abbreviated.substring(0, lastWhitespaceIndex)) + "\u2026";

        return abbreviated;
    }

    // returns content of <meta name="" content=""> tags or '' if empty/non existant
    function getMeta(name) {
        var metaContent = $('meta[name="' + name + '"]').attr('content');
        return metaContent || '';
    }

    // create tweet text from content of <meta name="DC.title"> and <meta name="DC.creator">
    // fallback to content of <title> tag
    function getTweetText() {
        var title = getMeta('DC.title');
        var creator = getMeta('DC.creator');

        if (title.length > 0 && creator.length > 0) {
            title += ' - ' + creator;
        } else {
            title = $('title').text();
        }

        return encodeURIComponent(title);
    }

    // build URI from rel="canonical" or document.location
    function getURI() {
        var uri = document.location.href;
        var canonical = $("link[rel=canonical]").attr("href");

        if (canonical && canonical.length > 0) {
            if (canonical.indexOf("http") < 0) {
                canonical = document.location.protocol + "//" + document.location.host + canonical;
            }
            uri = canonical;
        }

        return uri;
    }

    function cookieSet(name, value, days, path, domain) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie =
            name + '=' + value + '; expires=' + expires.toUTCString() + '; path=' + path + '; domain=' + domain;
    }

    function cookieDel(name, value, path, domain) {
        var expires = new Date();
        expires.setTime(expires.getTime() - 100);
        document.cookie =
            name + '=' + value + '; expires=' + expires.toUTCString() + '; path=' + path + '; domain=' + domain;
    }

    // adapted from https://github.com/defunctzombie/node-cookie
    function parseCookies (str) {
        var obj = {};
        var pairs = str.split(/[;,] */);

        pairs.forEach(function(pair) {
            var eq_idx = pair.indexOf('=');

            // skip things that don't look like key=value
            if (eq_idx < 0) {
                return;
            }

            var key = pair.substr(0, eq_idx).trim();
            var val = pair.substr(++eq_idx, pair.length).trim();

            // quoted values
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }

            // only assign once
            if (undefined === obj[key]) {
                try {
                    obj[key] = decodeURIComponent(val);
                } catch (e) {
                    obj[key] = val;
                }
            }
        });
        return obj;
    }


    // extend jquery with our plugin function
    $.fn.socialSharePrivacy = function (settings) {
        var defaults = {
            'services':       {
                'facebook': {
                    'status':         'on',
                    'dummy_img':      '',
                    'txt_info':       '2 Klicks f&uuml;r mehr Datenschutz: Erst wenn Sie hier klicken, wird der Button aktiv und Sie k&ouml;nnen Ihre Empfehlung an Facebook senden. Schon beim Aktivieren werden Daten an Dritte &uuml;bertragen &ndash; siehe <em>i</em>.',
                    'txt_fb_off':     'nicht mit Facebook verbunden',
                    'txt_fb_on':      'mit Facebook verbunden',
                    'perma_option':   'on',
                    'display_name':   'Facebook',
                    'referrer_track': '',
                    'language':       'de_DE',
                    'action':         'recommend',
                    'dummy_caption':  'Empfehlen'
                },
                'twitter':  {
                    'status':          'on',
                    'dummy_img':       '',
                    'txt_info':        '2 Klicks f&uuml;r mehr Datenschutz: Erst wenn Sie hier klicken, wird der Button aktiv und Sie k&ouml;nnen Ihre Empfehlung an Twitter senden. Schon beim Aktivieren werden Daten an Dritte &uuml;bertragen &ndash; siehe <em>i</em>.',
                    'txt_twitter_off': 'nicht mit Twitter verbunden',
                    'txt_twitter_on':  'mit Twitter verbunden',
                    'perma_option':    'on',
                    'display_name':    'Twitter',
                    'referrer_track':  '',
                    'tweet_text':      getTweetText,
                    'language':        'en',
                    'dummy_caption':   'Tweet',
                    'tweet_via':        ''
                },
                'gplus':    {
                    'status':         'on',
                    'dummy_img':      '',
                    'txt_info':       '2 Klicks f&uuml;r mehr Datenschutz: Erst wenn Sie hier klicken, wird der Button aktiv und Sie k&ouml;nnen Ihre Empfehlung an Google+ senden. Schon beim Aktivieren werden Daten an Dritte &uuml;bertragen &ndash; siehe <em>i</em>.',
                    'txt_gplus_off':  'nicht mit Google+ verbunden',
                    'txt_gplus_on':   'mit Google+ verbunden',
                    'perma_option':   'on',
                    'display_name':   'Google+',
                    'referrer_track': '',
                    'language':       'de'
                }
            },
            'info_link':      '',
            'txt_help':       'Wenn Sie diese Felder durch einen Klick aktivieren, werden Informationen an Facebook, Twitter oder Google in die USA &uuml;bertragen und unter Umst&auml;nden auch dort gespeichert.',
            'settings_perma': 'Dauerhaft aktivieren und Daten&uuml;ber&shy;tragung zustimmen:',
            'cookie_path':    '/',
            'cookie_domain':  document.location.host,
            'cookie_expires': '365',
            'css_path':       'socialshareprivacy/socialshareprivacy.css',
            'uri':            getURI
        };

        // Standardwerte des Plug-Ings mit den vom User angegebenen Optionen ueberschreiben
        var options = $.extend(true, defaults, settings);

        var facebook_on = (options.services.facebook.status === 'on');
        var twitter_on = (options.services.twitter.status === 'on');
        var gplus_on = (options.services.gplus.status === 'on');

        // check if at least one service is "on"
        if (!facebook_on && !twitter_on && !gplus_on) {
            return;
        }

        // insert stylesheet into document and prepend target element
        if (options.css_path.length > 0) {
            // IE fix (noetig fuer IE < 9 - wird hier aber fuer alle IE gemacht)
            if (document.createStyleSheet) {
                document.createStyleSheet(options.css_path);
            } else {
                $('head').append('<link rel="stylesheet" type="text/css" href="' + options.css_path + '" />');
            }
        }

        return this.each(function () {
            $(this).prepend('<ul class="social_share_privacy_area"></ul>');
            var context = $('.social_share_privacy_area', this);

            // canonical uri that will be shared
            var uri = options.uri;
            if (typeof uri === 'function') {
                uri = uri(context);
            }

            //
            // Facebook
            //
            if (facebook_on) {
                var fb_enc_uri = encodeURIComponent(uri + options.services.facebook.referrer_track);
                var fb_code = '<iframe src="http://www.facebook.com/plugins/like.php?locale=' +
                    options.services.facebook.language + '&amp;href=' + fb_enc_uri +
                    '&amp;send=false&amp;layout=button_count&amp;width=120&amp;show_faces=false&amp;action=' +
                    options.services.facebook.action +
                    '&amp;colorscheme=light&amp;font&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:145px; height:21px;" allowTransparency="true"></iframe>';
                var fb_dummy_btn;
                if (options.services.facebook.dummy_img) {
                    fb_dummy_btn =
                        '<img class="fb_like_privacy_dummy" src="' + options.services.facebook.dummy_img + '" alt="' +
                            options.services.facebook.dummy_caption + '" />';
                }
                else {
                    fb_dummy_btn =
                        '<div class="fb_like_privacy_dummy"><span>' + options.services.facebook.dummy_caption +
                            '</span></div>';
                }
                context.append('<li class="facebook help_info"><span class="info">' +
                    options.services.facebook.txt_info + '</span><span class="switch off">' +
                    options.services.facebook.txt_fb_off + '</span><div class="fb_like dummy_btn">' + fb_dummy_btn +
                    '</div></li>');

                var $container_fb = $('li.facebook', context);

                context.on('click', 'li.facebook div.fb_like .fb_like_privacy_dummy,li.facebook span.switch',
                    function () {
                        if ($container_fb.find('span.switch').hasClass('off')) {
                            $container_fb.addClass('info_off');
                            $container_fb.find('span.switch').addClass('on').removeClass('off').html(options.services.facebook.txt_fb_on);
                            $container_fb.find('.fb_like_privacy_dummy').replaceWith(fb_code);
                        } else {
                            $container_fb.removeClass('info_off');
                            $container_fb.find('span.switch').addClass('off').removeClass('on').html(options.services.facebook.txt_fb_off);
                            $container_fb.find('.fb_like').html(fb_dummy_btn);
                        }
                    }
                );
            }

            //
            // Twitter
            //
            if (twitter_on) {
                var text = options.services.twitter.tweet_text;
                if (typeof text === 'function') {
                    text = text();
                }
                // 120 is the max character count left after twitters automatic url shortening with t.co
                text = abbreviateText(text, '120');

                var twitter_enc_uri = encodeURIComponent(uri + options.services.twitter.referrer_track);
                var twitter_count_url = encodeURIComponent(uri);
                var twitter_iframe_url = 'http://platform.twitter.com/widgets/tweet_button.html?url=' +
                    twitter_enc_uri + '&amp;counturl=' + twitter_count_url + '&amp;text=' + text + '&amp;count=horizontal&amp;lang=' + options.services.twitter.language;

                if (options.services.twitter.tweet_via !== '') {
                    twitter_iframe_url = twitter_iframe_url + '&amp;via=' + options.services.twitter.tweet_via;
                }

                var twitter_code = '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="' + twitter_iframe_url + '" style="width:130px; height:25px;"></iframe>';
                var twitter_dummy_btn;
                if (options.services.twitter.dummy_img) {
                    twitter_dummy_btn =
                        '<img class="tweet_this_dummy" src="' + options.services.twitter.dummy_img + '" alt="' +
                            options.services.twitter.dummy_caption + '" />';
                }
                else {
                    twitter_dummy_btn =
                        '<div class="tweet_this_dummy"><span>' + options.services.twitter.dummy_caption +
                            '</span></div>';
                }

                context.append('<li class="twitter help_info"><span class="info">' + options.services.twitter.txt_info +
                    '</span><span class="switch off">' + options.services.twitter.txt_twitter_off +
                    '</span><div class="tweet dummy_btn">' + twitter_dummy_btn + '</div></li>');

                var $container_tw = $('li.twitter', context);

                context.on('click', 'li.twitter .tweet_this_dummy,li.twitter span.switch',
                    function () {
                        if ($container_tw.find('span.switch').hasClass('off')) {
                            $container_tw.addClass('info_off');
                            $container_tw.find('span.switch').addClass('on').removeClass('off').html(options.services.twitter.txt_twitter_on);
                            $container_tw.find('.tweet_this_dummy').replaceWith(twitter_code);
                        } else {
                            $container_tw.removeClass('info_off');
                            $container_tw.find('span.switch').addClass('off').removeClass('on').html(options.services.twitter.txt_twitter_off);
                            $container_tw.find('.tweet').html(twitter_dummy_btn);
                        }
                    }
                );
            }

            //
            // Google+
            //
            if (gplus_on) {
                // fuer G+ wird die URL nicht encoded, da das zu einem Fehler fuehrt
                var gplus_uri = uri + options.services.gplus.referrer_track;

                // we use the Google+ "asynchronous" code, standard code is flaky if inserted into dom after load
                var gplus_code = '<div class="g-plusone" data-size="medium" data-href="' + gplus_uri +
                    '"></div><script type="text/javascript">window.___gcfg = {lang: "' +
                    options.services.gplus.language +
                    '"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/plusone.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>';
                var gplus_dummy_btn;
                if (options.services.gplus.dummy_img) {
                    gplus_dummy_btn =
                        '<img src="' + options.services.gplus.dummy_img + '" alt="+1" class="gplus_one_dummy" />';
                } else {
                    gplus_dummy_btn = '<div class="gplus_one_dummy">+1</div>';
                }
                context.append('<li class="gplus help_info"><span class="info">' + options.services.gplus.txt_info +
                    '</span><span class="switch off">' + options.services.gplus.txt_gplus_off +
                    '</span><div class="gplusone dummy_btn">' + gplus_dummy_btn + '</div></li>');

                var $container_gplus = $('li.gplus', context);

                context.on('click', 'li.gplus div.gplusone .gplus_one_dummy,li.gplus span.switch',
                    function () {
                        if ($container_gplus.find('span.switch').hasClass('off')) {
                            $container_gplus.addClass('info_off');
                            $container_gplus.find('span.switch').addClass('on').removeClass('off').html(options.services.gplus.txt_gplus_on);
                            $container_gplus.find('.gplus_one_dummy').replaceWith(gplus_code);
                        } else {
                            $container_gplus.removeClass('info_off');
                            $container_gplus.find('span.switch').addClass('off').removeClass('on').html(options.services.gplus.txt_gplus_off);
                            $container_gplus.find('.gplusone').html(gplus_dummy_btn);
                        }
                    }
                );
            }

            //
            // Der Info/Settings-Bereich wird eingebunden
            //
            if (options.info_link !== "") {
            context.append('<li class="settings_info"><div class="settings_info_menu off perma_option_off"><a href="' +
                options.info_link + '"><span class="help_info icon"><span class="info">' + options.txt_help +
                '</span></span></a></div></li>');
            } else {
            context.append('<li class="settings_info"><div class="settings_info_menu off perma_option_off">' +
                '<span class="help_info icon"><span class="info">' + options.txt_help +
                '</span></span></div></li>');
            }

            // Info-Overlays mit leichter Verzoegerung einblenden
			context.on('mouseenter', '.help_info:not(.info_off)', function () {
                var $info_wrapper = $(this);
                var timeout_id = window.setTimeout(function () {
                    $($info_wrapper).addClass('display');
                }, 500);
                $(this).data('timeout_id', timeout_id);
            });
            context.on('mouseleave', '.help_info', function () {
                var timeout_id = $(this).data('timeout_id');
                window.clearTimeout(timeout_id);
                if ($(this).hasClass('display')) {
                    $(this).removeClass('display');
                }
            });

            var facebook_perma = (options.services.facebook.perma_option === 'on');
            var twitter_perma = (options.services.twitter.perma_option === 'on');
            var gplus_perma = (options.services.gplus.perma_option === 'on');

            // Menue zum dauerhaften Einblenden der aktiven Dienste via Cookie einbinden
            // Wird nur aktiviert, wenn der browser JSON unterstuetzt
            if (((facebook_on && facebook_perma) ||
                (twitter_on && twitter_perma) ||
                (gplus_on && gplus_perma)) &&
                (!!JSON && !!JSON.parse)) {

                // Cookies abrufen
                var cookies = parseCookies(document.cookie);

                // Container definieren
                var $container_settings_info = $('li.settings_info', context);

                // Klasse entfernen, die das i-Icon alleine formatiert, da Perma-Optionen eingeblendet werden
                $container_settings_info.find('.settings_info_menu').removeClass('perma_option_off');

                // Perma-Optionen-Icon (.settings) und Formular (noch versteckt) einbinden
                $container_settings_info.find('.settings_info_menu').append('<span class="settings">Einstellungen</span><form><fieldset><legend>' +
                    options.settings_perma + '</legend></fieldset></form>');

                // Die Dienste mit <input> und <label>, sowie checked-Status laut Cookie, schreiben
                var checked = ' checked="checked"';
                if (facebook_on && facebook_perma) {
                    var perma_status_facebook = cookies.socialSharePrivacy_facebook === 'perma_on' ? checked : '';
                    $container_settings_info.find('form fieldset').append(
                        '<input type="checkbox" name="perma_status_facebook" id="perma_status_facebook"' +
                            perma_status_facebook + ' /><label for="perma_status_facebook">' +
                            options.services.facebook.display_name + '</label>'
                    );
                }

                if (twitter_on && twitter_perma) {
                    var perma_status_twitter = cookies.socialSharePrivacy_twitter === 'perma_on' ? checked : '';
                    $container_settings_info.find('form fieldset').append(
                        '<input type="checkbox" name="perma_status_twitter" id="perma_status_twitter"' +
                            perma_status_twitter + ' /><label for="perma_status_twitter">' +
                            options.services.twitter.display_name + '</label>'
                    );
                }

                if (gplus_on && gplus_perma) {
                    var perma_status_gplus = cookies.socialSharePrivacy_gplus === 'perma_on' ? checked : '';
                    $container_settings_info.find('form fieldset').append(
                        '<input type="checkbox" name="perma_status_gplus" id="perma_status_gplus"' +
                            perma_status_gplus + ' /><label for="perma_status_gplus">' +
                            options.services.gplus.display_name + '</label>'
                    );
                }

                // Cursor auf Pointer setzen fuer das Zahnrad
                $container_settings_info.find('span.settings').css('cursor', 'pointer');

                // Einstellungs-Menue bei mouseover ein-/ausblenden
                $container_settings_info.on('mouseenter', 'span.settings', function () {
                    var timeout_id = window.setTimeout(function () {
                        $container_settings_info.find('.settings_info_menu').removeClass('off').addClass('on');
                    }, 500);
                    $(this).data('timeout_id', timeout_id);
                });
                $container_settings_info.on('mouseleave', function () {
                    var timeout_id = $(this).data('timeout_id');
                    window.clearTimeout(timeout_id);
                    $container_settings_info.find('.settings_info_menu').removeClass('on').addClass('off');
                });

                // Klick-Interaktion auf <input> um Dienste dauerhaft ein- oder auszuschalten (Cookie wird gesetzt oder geloescht)
                $container_settings_info.on('click', 'fieldset input', function (event) {
                    var click = event.target.id;

					var service = click.substr(click.lastIndexOf('_') + 1, click.length);
                    var cookie_name = 'socialSharePrivacy_' + service;

                    if ($(this).is(':checked')) {
                        cookieSet(cookie_name, 'perma_on', options.cookie_expires, options.cookie_path,
                            options.cookie_domain);
                        $('.social_share_privacy_area [id="' + click + '"]').prop('checked', true);
                        $('.social_share_privacy_area label[for=' + click + ']').addClass('checked');
                    } else {
                        cookieDel(cookie_name, 'perma_on', options.cookie_path, options.cookie_domain);
                        $('.social_share_privacy_area [id="' + click + '"]').prop('checked', false);
                        $('.social_share_privacy_area label[for=' + click + ']').removeClass('checked');
                    }
                });

                // Dienste automatisch einbinden, wenn entsprechendes Cookie vorhanden ist
                if (facebook_on && facebook_perma && cookies.socialSharePrivacy_facebook === 'perma_on') {
                    $('li.facebook span.switch', context).click();
                }
                if (twitter_on && twitter_perma && cookies.socialSharePrivacy_twitter === 'perma_on') {
                    $('li.twitter span.switch', context).click();
                }
                if (gplus_on && gplus_perma && cookies.socialSharePrivacy_gplus === 'perma_on') {
                    $('li.gplus span.switch', context).click();
                }
            }
        }); // this.each(function ()
    };      // $.fn.socialSharePrivacy = function (settings) {
}(jQuery));
