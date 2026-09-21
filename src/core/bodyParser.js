function parseBody(req, callback) {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
        try {
            const parsed = Object.fromEntries(new URLSearchParams(body));
            callback(null, parsed);
        } catch (err) {
            callback(err, null);
        }
    });
}

module.exports = parseBody;