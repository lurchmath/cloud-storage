function DropboxFileSystem(o){this.clientID=o}DropboxFileSystem.prototype.getAccess=function(o,t){if(this.dropbox)return o();var e=window.open("./dropbox-login.html"),n=this;this.installedEventHandler||(window.addEventListener("message",function(i){try{var r=JSON.parse(i.data);if(!(r instanceof Array))return;"dialogLogin"==r.shift()&&(e.close(),n.accountData=r.shift(),n.accountData.access_token?(n.dropbox=new Dropbox({accessToken:n.accountData.access_token}),o()):t(n.accountData))}catch(o){}}),this.installedEventHandler=!0),e.onload=function(){e.postMessage(["setClientID",n.clientID],"*")}},DropboxFileSystem.prototype.readFolder=function(o,t,e){this.dropbox||e("The user has not logged in to Dropbox."),this.dropbox.filesListFolder({path:o.join("/")}).then(function(o){for(var e=[],n=0;n<o.entries.length;n++)e.push({type:o.entries[n][".tag"],name:o.entries[n].name});t(e)}).catch(e)},DropboxFileSystem.prototype.readFile=function(o,t,e){this.dropbox||e("The user has not logged in to Dropbox."),this.dropbox.filesDownload({path:"/"+o.join("/")}).then(function(o){var n=o.fileBlob,i=new FileReader;i.onload=function(){t(i.result)},i.onerror=function(){e(i.error)},i.readAsText(n)}).catch(function(o){e(o)})},DropboxFileSystem.prototype.writeFile=function(o,t,e,n){this.dropbox||n("The user has not logged in to Dropbox.");var i={};i[".tag"]="overwrite",this.dropbox.filesUpload({contents:t,path:"/"+o.join("/"),mode:i,autorename:!1}).then(function(o){e(o)}).catch(function(o){n(o)})};