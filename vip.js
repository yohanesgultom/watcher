const cheerio = require('cheerio')

module.exports = {
    currencyToNumber: (strcur) => {
        return Number(strcur.replace(/[^0-9.-]+/g,""))
    },

    parseVipRates: (data, date) => {
        date = date || new Date()
        let $ = cheerio.load(data)
        let res = []
        $('#rate-box td').each((i, td) => {
            let val = $(td).text()
            switch (i % 3) {
                case 0:
                    res.push({id: val, buy: null, sell: null, created_at: date.toISOString()})
                    break
                case 1:
                    res[res.length - 1].buy = module.exports.currencyToNumber(val)
                    break
                case 2:
                    res[res.length - 1].sell = module.exports.currencyToNumber(val)
                    break
            }
        })
        return res
    },
}
