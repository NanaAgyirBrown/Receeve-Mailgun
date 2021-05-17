function cleanResponse(raw, res){
    if(raw.IsSuccessful)
      res.status(200).json(raw.Data);
    else{
      if(!raw.HasError && !raw.HasException && !raw.IsSuccessful) res.status(417).json(raw.Data);
      else {
        if(raw.HasError) res.status(400).json(raw.ErrorMessage);
        else res.status(500).json(raw.Exception);
      }
    } 
  
    res.send();
}

module.exports.cleanResponse = cleanResponse;