const path=require('node:path');const fs=require('node:fs');const crypto=require('node:crypto');
const express=require('express');const mongoose=require('mongoose');const session=require('express-session');
const MongoDBStore=require('connect-mongodb-session')(session);const flash=require('connect-flash');const multer=require('multer');
const User=require('./models/user');const {offlineUri,online}=require('./offline-config');
async function start(port=Number(process.env.PORT||3000)){
 const uri=offlineUri();if(!process.env.SESSION_SECRET)throw new Error('SESSION_SECRET required');
 await mongoose.connect(uri,{serverSelectionTimeoutMS:5000});
 const store=new MongoDBStore({uri,collection:'sessions'});store.on('error',()=>console.error('Local session store error'));await store.initialConnectionPromise;
 const app=express();app.disable('x-powered-by');app.set('view engine','ejs');app.set('views',path.join(__dirname,'views'));
 app.use((req,res,next)=>{req.isApi=req.url.startsWith('/api/');if(req.isApi){req.url=req.url.slice(4);res.render=(view,model={})=>res.json({view,...model,isAuthenticated:!!req.session?.isLoggedIn,csrfToken:req.session?.csrfToken,onlineServices:online()});res.redirect=(url)=>res.json({redirect:url});}next();});
 app.use(express.json());app.use(express.urlencoded({extended:false}));
 const {fileStorage,fileFilter}=require('./middleware/multer');app.use(multer({storage:fileStorage,fileFilter,limits:{fileSize:5*1024*1024}}).single('image'));
 app.use('/images',express.static(path.join(__dirname,'images')));app.use(express.static(path.join(__dirname,'public')));
 app.use(session({secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,store,cookie:{httpOnly:true,sameSite:'lax'}}));app.use(flash());
 app.use((req,res,next)=>{req.session.csrfToken ||= crypto.randomBytes(32).toString('hex');res.locals.isAuthenticated=!!req.session.isLoggedIn;res.locals.csrfToken=req.session.csrfToken;
 if(!['GET','HEAD','OPTIONS'].includes(req.method)){const supplied=req.get('x-csrf-token')||req.body?._csrf||'';const expected=req.session.csrfToken;const a=Buffer.from(supplied),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(403).json({error:'Invalid CSRF token'});}next();});
 app.use(async(req,res,next)=>{try{if(req.session.user){req.user=await User.findById(req.session.user._id);}next();}catch(e){next(e);}});
 app.get('/session',(req,res)=>res.json({isAuthenticated:!!req.user,csrfToken:req.session.csrfToken,email:req.user?.email,onlineServices:online()}));
 const frontend=path.join(__dirname,'frontend/dist/risa/browser');const serveFrontend=express.static(frontend);app.use((req,res,next)=>req.isApi?next():serveFrontend(req,res,next));app.use((req,res,next)=>{if(!req.isApi&&req.method==='GET'&&!path.extname(req.path)&&fs.existsSync(path.join(frontend,'index.html')))return res.sendFile(path.join(frontend,'index.html'));next();});
 app.use('/admin',require('./routes/admin'));app.use(require('./routes/shop'));app.use(require('./routes/auth'));
 app.use((req,res)=>res.status(404).json({error:'Not found'}));app.use((err,req,res,next)=>{if(res.headersSent)return next(err);res.status(err.status||500).json({error:err.status?err.message:'Internal server error'});});
 const server=app.listen(port,'127.0.0.1');await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});console.log(`Risa listening at http://127.0.0.1:${server.address().port}`);
 return {app,server,store,async close(){await new Promise(r=>server.close(r));await store.client?.close();await mongoose.disconnect();}};
}
module.exports={start};if(require.main===module)start().catch(e=>{console.error(e.message);process.exitCode=1;});
