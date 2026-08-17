Build scripts for the generated pages. Not published (Jekyll ignores _ dirs).

  node gen-grinders.js   -> out/grinders/*.html (18 pages) + specs.json + summary.json
  node gen-hub.js        -> out/grinders/index.html   (run gen-grinders.js first)
  node gen-tools.js      -> out/tools/grinder-converter.html
  node gen-sitemap.js    -> sitemap.xml
  node inject-beacon.js  -> adds the Cloudflare beacon to any page missing it

Then copy out/** over the repo equivalents.

The grinder maths in gen-grinders.js is a port of the app's
lib/services/grinder_specs.dart (settingFor / resolve / formatBand).
If those anchors change in the app, change them here and regenerate,
or the published charts stop matching what the app tells users.
