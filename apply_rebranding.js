const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdir(dir, function(err, list) {
    if (err) return callback(err);
    let pending = list.length;
    if (!pending) return callback(null);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            if (!--pending) callback(null);
          });
        } else {
          const ext = path.extname(file);
          if (['.ts', '.tsx', '.css'].includes(ext)) {
            let content = fs.readFileSync(file, 'utf8');
            let originalContent = content;
            
            // 1. GOLD -> VIOLET / MAGENTA
            content = content.replace(/#D4AF37/gi, '#7C3CFF');
            content = content.replace(/#b08d24/gi, '#C94BFF');
            content = content.replace(/amber-600/g, 'lumi-violet');
            content = content.replace(/amber-700/g, 'lumi-magenta');
            content = content.replace(/rgba\(212,\s*175,\s*55/g, 'rgba(124, 60, 255');
            content = content.replace(/gradGold/g, 'gradLumi');
            content = content.replace(/grad-gold/g, 'grad-lumi');
            
            // 2. OLD CYAN -> LUMI-BLUE
            content = content.replace(/#00d2ff/gi, '#2BC8FF');
            content = content.replace(/rgba\(0,\s*210,\s*255/g, 'rgba(43, 200, 255');

            // 3. TEXT -> BRAND LOGO
            // This replaces <h1>LumiAds</h1> with LogoTexto.png but we don't need this if we do it manually.
            // Actually, we can just replace text "LumiAds" inside headers.
            content = content.replace(/<(span|h1|h2|h3)([^>]*)>LumiAds( v[0-9](\.[0-9])?)?<\/\1>/gi, (match, tag, attrs, version) => {
                const height = tag === 'h1' ? 'h-10' : (tag === 'h2' ? 'h-8' : 'h-6');
                return `<img src="/LogoTexto.png" alt="LumiAds" className="${height} w-auto inline-block${attrs.includes('className') ? ' ' + attrs.match(/className="([^"]*)"/)[1] : ''}" />${version ? ' <span className="text-[10px] opacity-50">' + version + '</span>' : ''}`;
            });

            if (content !== originalContent) {
              fs.writeFileSync(file, content, 'utf8');
            }
          }
          if (!--pending) callback(null);
        }
      });
    });
  });
}

walk('d:\\lumin\\src', function(err) {
  if (err) throw err;
  console.log('Rebranding applied.');
});
