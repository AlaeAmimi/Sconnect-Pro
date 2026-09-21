const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

function home(req, res) {

    console.log(req);

    const filepath = path.join(__dirname, "..", "..", "views", "pages", "home.ejs"
    );

    const template = fs.readFileSync(filepath, "utf-8");

    const html = ejs.render(template);

    res.writeHead(200, {"Content-Type": "text/html"});

    res.end(html);
}

module.exports = { home };