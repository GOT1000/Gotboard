module.exports = {
    URI : process.env.URI || 'localhost',
    MONGODB : 'mongodb://got1000:got1000@ds023465.mlab.com:23465/heroku_v4mchvr7',
    TOKEN_SECRET : process.env.TOKEN_SECRET || 'GOT1000',
    TMP : './app/static/tmp',

    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || '74c637d34f7c38fe281ce75e9bf7cbf5',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'Er3Dem0voAmPTrsKBmZ7CUnF'
}