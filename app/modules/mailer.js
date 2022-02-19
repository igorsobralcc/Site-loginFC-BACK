const nodemailer = require('nodemailer')
const { host, port, user, pass } = require('../config/mail.json')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')



var transport = nodemailer.createTransport({
    host,
    port,
    auth: {
        user,
        pass
    }
});

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialDir: path.resolve('./app/resources/mail/')
    },
    viewPath: path.resolve('./app/resources/mail/'),
    extName: '.html',
}))

module.exports = transport
