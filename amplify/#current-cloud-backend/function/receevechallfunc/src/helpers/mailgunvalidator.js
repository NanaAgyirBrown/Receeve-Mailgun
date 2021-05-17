const crypto = require('crypto')

require('dotenv').config({path: './.env'})

function validatePayload(timestamp, token, signature){
        const encodedToken = crypto
                .createHmac('sha256', process.env.SignKey)
                .update(timestamp.concat(token))
                .digest('hex');
        
        return (encodedToken === signature);
   } 

module.exports = validatePayload;