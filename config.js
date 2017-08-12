module.exports = {
    URI : process.env.URI || 'localhost',
    MONGODB : 'mongodb://got1000:got1000@ds023465.mlab.com:23465/heroku_v4mchvr7',
    TOKEN_SECRET : process.env.TOKEN_SECRET || 'GOT1000',
    TMP : './app/static/tmp'
}