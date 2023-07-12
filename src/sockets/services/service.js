 const customerService = require('./customerService');

module.exports = {
    //Customer log-in service.
    convertVinaCoin: (params, socketIO, io) => {
        return customerService.convertVinaCoin(params,socketIO, io)
    },
  

}