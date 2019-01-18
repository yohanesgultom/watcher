const https = require('https')
const nodemailer = require('nodemailer')
const config = require('./config')
const vip = require('./vip')

const crawl = (url, parser) => {
    console.log(`Crawling ${url}..`)
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = ''
            resp.on('data', (chunk) => { data += chunk })
            resp.on('end', () => {
                try {                    
                    let res = parser(data)
                    resolve(res)    
                } catch (err) {
                    reject(err.message)
                }
            })          
        }).on('error', (err) => {
            reject(err.message)
        })    
    })
}

const sendEmail = (to, subject, html) => {
    let message = { to: to, subject: subject, html: html}
    let transporter = nodemailer.createTransport(config.smtp)
    console.log(`Sending email to ${to}..`)
    return new Promise((resolve, reject) => {
        transporter.sendMail(message, (error, info) => {
            if (error) {
                reject(error.message)
            }
            console.log('Email sent')
            resolve(info)
        })    
    })
}

const main = () => {
    config.alerts.forEach((al) => {
        if (al.type == 'VIP.CO.ID') {
            crawl('https://www.vip.co.id', vip.parseVipRates)
                .then((rates) => {                    
                    if (al.validate(rates)) {
                        let msg = al.message(rates)
                        return sendEmail(al.email, msg, msg)
                    } else {
                        console.log('Condition not met. No alert sent')
                    }
                })
                .then()
                .catch(console.error)
        } else {
            // add more alert handler
        }
    })

}

main()