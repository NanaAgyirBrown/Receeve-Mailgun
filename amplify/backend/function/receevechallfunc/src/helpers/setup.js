function setitup(Port, AwsARN, MailgunSignKey){
    this.PORT = Port;
    this.ARN = AwsARN;
    this.SIGNKEY = MailgunSignKey;
}

module.exports.setitup = setitup;