use strict;
use warnings;
use JavaScript::Minifier qw(minify);
open(INFILE, 'jquery.socialshareprivacy.js') or die;
open(OUTFILE, '>jquery.socialshareprivacy.min.js') or die;
minify(input => *INFILE, outfile => *OUTFILE);
close(INFILE);
close(OUTFILE);
