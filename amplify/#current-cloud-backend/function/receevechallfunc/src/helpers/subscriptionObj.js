function subscriptionType(protocol, topic, endpoint){
    this.Protocol = protocol;
    this.Topic = topic;
    this.EndPoint = endpoint;
}

module.exports.subscriptionType = subscriptionType;