function responseApi(hasError, errorMessaage, hasException, exception, isSuccessful, data) {
    this.HasError = hasError;
    this.ErrorMessage = errorMessaage;
    this.IsSuccessful = isSuccessful;
    this.HasException = hasException;
    this.Exception = exception;
    this.Data = data;
}

module.exports.responseApi = responseApi;