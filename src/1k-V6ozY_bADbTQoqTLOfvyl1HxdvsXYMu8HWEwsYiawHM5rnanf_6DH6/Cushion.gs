_Cushion = {}

_Cushion.urlPrefix = "https://amber.cloudant.com"

_Cushion.login = function (servername, username, password)
{
  var url       = 'https://' + servername + '.cloudant.com/_session'
  Synergy.url   = 'https://' + servername + '.cloudant.com/'
  
  var namePass = "name=" + encodeURI(username) + ( password ? "&password=" + encodeURI(password) : '')
  
  var params = {
    "method"  : "post", 
    "contentType":"application/x-www-form-urlencoded",
    "validateHttpsCertificates" :false,
    "payload" : namePass,
    "headers":{ 
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CouchDB-WWW-Authenticate": "Cookie"
    },
    muteHttpExceptions:false
  }
  
  var dataResponse;
  var cookies;
  try {
      dataResponse = UrlFetchApp.fetch(url, params)

      cookies = dataResponse.getAllHeaders()['Set-Cookie']
      Synergy.cookie(cookies)
      
      CacheService.getUserCache().put('cookies', cookies)
      
  } catch(e){
     Logger.log(e)
  }
  
  return dataResponse
}


_Cushion.allDbs = function()
{
  opt = {
    "method" : "get",
    "User-Agent" : "Mozilla/5.0",
    "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language" : "en-US,en;q=0.5",
    "headers": {
      "Cookie": Synergy.cookie()
    },
    "followRedirects" : false    
  };
  
  var url       =  Synergy.url + '_all_dbs'

  response = UrlFetchApp.fetch(url, opt);
  
  var dbs = JSON.parse(response.getContentText())

  return dbs
}

_Cushion.showDbs = function(dbs)
{
  var standardGetRequestOptions = {
    "method"  : "get",
    "contentType":"application/json",
    "validateHttpsCertificates" :false,
    //"payload" : JSON.stringify({"name":"amber", "source":"", "target" : "", "type":"user", "roles": [],     "_id": "org.couchdb.user:" + username }),
    //payload: "[]",
    
    "headers":{
      "Content-Type" : "application/json",
      "Cookie": Synergy.cookie()
      // "Authorization": "Basic " + Utilities.base64Encode(username + ":" + password)
    },
    muteHttpExceptions:false
  }
  for(var i in dbs)
  {
     Logger.log(dbs[i])

     url       = Synergy.url + dbs[i] + "/_all_docs?limit=20"
     
     Logger.log(url)

     response = UrlFetchApp.fetch(url, standardGetRequestOptions);

     jsonToSheet({name : dbs[i]})
     out = JSON.parse(response.getContentText())
     jsonToSheet(out.rows)
  }

}


_Cushion.logout = function ()
{
  return _Cushion.request("DELETE", "_session",
            {
                headers: {"Content-Type": "application/x-www-form-urlencoded",
                    "X-CouchDB-WWW-Authenticate": "Cookie"}
            }

         )
}


_Cushion.request = function (method, uri, options) {
  options = typeof (options) == 'object' ? options : {}
  options.headers = typeof (options.headers) == 'object' ? options.headers : {}
  options.headers["Content-Type"] = options.headers["Content-Type"] || options.headers["content-type"] || "application/json"
  options.headers["Accept"] = options.headers["Accept"] || options.headers["accept"] || "application/json"
  
  if (Synergy.cookie())
      options.headers["Cookie"] = Synergy.cookie()
  
  options["method"] = method

  var url       =  Synergy.url + uri

  return UrlFetchApp.fetch(url, options)
  
}


function test_login()
{
  var username  = PropertiesService.getScriptProperties().getProperty('user')
  var password  = PropertiesService.getScriptProperties().getProperty('pass')
  
  _Cushion.login(username, username, password)
  
  var dbs = _Cushion.allDbs(username)
  
  jsonToSheet(dbs)
  
  _Cushion.showDbs(dbs)
  
  var ret = _Cushion.logout()
  jsonToSheet({"logout":""})
  jsonToSheet(JSON.parse(ret))

  jsonToSheet({})
  jsonToSheet({"login":"test5"})
  ret = _Cushion.login('amber','test5','test4')
  jsonToSheet(JSON.parse(ret))
  jsonToSheet({"logout":""})         
  ret = _Cushion.logout()
  jsonToSheet(JSON.parse(ret))
}
