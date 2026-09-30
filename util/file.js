const fs=require('node:fs');exports.deleteFile=function(file){fs.unlink(file,error=>{if(error&&error.code!=='ENOENT')console.error('Could not delete uploaded file');});};
