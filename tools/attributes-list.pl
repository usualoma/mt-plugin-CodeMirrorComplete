#!/usr/bin/perl

use Web::Scraper;
use JSON;
use URI;

my %modifiers = ();

$modifiers{''} = {};
my $mods = scraper {
    process 'li a.entry-title', 'mods[]' => 'TEXT';
    result 'mods';
}
->scrape(
    new URI('http://www.movabletype.jp/documentation/appendices/modifiers/')
);

foreach my $m (@$mods) {
    $modifiers{''}{$m} = [];
}

my $tags = scraper {
    process 'li a.taggedlink',
        'tags[]' => { 'link' => '@href', 'text' => 'TEXT' };
    result 'tags';
}
->scrape(
    new URI('http://www.movabletype.jp/documentation/appendices/tags/') );

foreach my $t (@$tags) {
    ( my $tag = lc( $t->{text} ) ) =~ s/^mt//;

    my $mods = scraper {
        process '.content > .section dl dt', 'names[]'      => 'TEXT';
        process '.content > .section dl dd', 'candidates[]' => scraper {
            process 'ul li', 'list[]' => { text => 'TEXT', raw => 'raw' };
        };
    }
    ->scrape( $t->{link} );

    for ( my $i = 0; $i < scalar( @{ $mods->{names} } ); $i++ ) {
        my $name       = $mods->{names}->[$i];
        my $candidates = [
            map { $_->{text} }
                grep { $_->{raw} !~ /^\s*<a/i && $_->{text} ne 'ID' }
                @{ $mods->{candidates}->[$i]->{list} }
        ];

        if ( $candidates && ( scalar(@$candidates) >= 2 ) ) {
            for (@$candidates) {
                $_ =~ s/ .*//;
            }
        }
        elsif ( $name =~ m/="(.*\|.*)"/ ) {
            $candidates = [ split( /\s*\|\s*/, $1 ) ];
        }
        else {
            $candidates = [];
        }

        $name =~ s/=.*//;

        if ($name) {
            $modifiers{$tag}{$name} = $candidates;
        }
    }
}

print 'CodeMirrorComplete.modifiers=' . encode_json( \%modifiers );

exit();
