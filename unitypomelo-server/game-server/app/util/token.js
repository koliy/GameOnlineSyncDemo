var crypto = require('crypto');
var CryptoJs = require('crypto-js');

module.exports.create = function(uid,timestamp,pwd){
	var msg = uid+'|'+timestamp;
	var cipher = crypto.createCipher('aes256',pwd);
	var enc = cipher.update(msg,'utf8','hex');
	enc += cipher.final('hex');
	return enc;
};

module.exports.parse = function(token,pwd){
	var decipher = crypto.createDecipher('aes256',pwd);
	var dec;
	try{
		dec = decipher.update(token,'hex','utf8');
		dec += decipher.final('utf8');
	}catch(err){
		console.error('[token] fail to decrypt token .%j',token);
		return null;
	}
	var ts = dec.split('|');
	if(ts.length !== 2) return null;
	return {uid:ts[0],timestamp:Number(ts[1])};
};
/**
 *
 * 对应c#的aes256加密
 * @param data
 * @param key
 * @returns {string}
 */
module.exports.getAesString = function(data,key){
	var key =CryptoJs.enc.Utf8.parse(key);
	var encrypted = CryptoJs.AES.encrypt(data,key,{
		mode:CryptoJs.mode.ECB,
		padding:CryptoJs.pad.Pkcs7
	});
	return encrypted.toString();
};

module.exports.getDAesString =function (token,key) {
	var key = CryptoJs.enc.Utf8.parse(key);
	var decrypted = CryptoJs.AES.decrypt(token,key,{
		mode:CryptoJs.mode.ECB,
		padding:CryptoJs.pad.Pkcs7
	});
	
	return decrypted.toString(CryptoJs.enc.Utf8);
};