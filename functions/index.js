const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const {Storage} = require('@google-cloud/storage');
var serviceAccount = require("./serviceAccountKey.json");
const sharp = require ('sharp')
const path = require ('path')
const fs = require('fs-extra');
const {tmpdir} = require('os');
const gcs = new Storage();

const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient('e7bed9e20cdc26e81880275c380327a33abaf327');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dailybuns.firebaseio.com"
});
// admin.initializeApp()
const firestore = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket('dailybuns.appspot.com')


// exports.fetchRedditPosts = functions.pubsub.schedule('1 * * * *').timeZone('America/New_York').onRun((context) => {
//     console.log('Here it is!')
// })

var allFetchedPosts = [];
var imageOnlyPosts = []

var fetchedFullSize = "";
var fetchedThumbnail = "";
var fetchedGif = "";
var shortFullUrl = null;
var shortGifUrl = null;

var ref; 




async function shortenUrl(url){
    let res;
    try{
        res = await bitly.shorten(url)
        console.log("Shortened url.")
    }catch(e){
        res = null
        throw e
    }

    return res.link
}


function pushFullSize(post, id){

    const file = bucket.file('posts/'+id+'/fullSize.jpg')
    const writeStream = file.createWriteStream(
        {
            contentType: 'image/jpeg'
        }
    )

    return new Promise(function(resolve, reject) {
        console.log('started full size...')
        fetch(post.data.preview.images[0].source.url).then(res => {
            return res.body.pipe(writeStream)
        }).then(() => {
            // console.log('fetch worked...')
            try{
                return file.getSignedUrl({
                    action: 'read',
                    expires: '06-26-2222',
                    version: "v2"
                })
            }catch(e){
                console.log("Error signing URL")
                fetchedFullSize = null;
                shortFullUrl = null;
                throw(e)
            }
            
        }).then( async (signedUrls) => {
            // console.log('signed url worked...')
            try{
                fetchedFullSize = await signedUrls[0]
                shortFullUrl = await shortenUrl(fetchedFullSize)
                console.log("Pushed Full Size")
                resolve(fetchedFullSize)
                return(fetchedFullSize)
            }catch(e){
                console.log("Error setting URL")
                fetchedFullSize = null;
                shortFullUrl = null;
                throw(e)
            }
            
        }).catch(e => {
            // console.log(e);
            fetchedFullSize = null;
            shortFullUrl = null;
            reject(e)
        }) 
    }).catch(e => {
        console.log(e)
        throw(e)
    })
    
   
}


pushGif = (post, id) => {
const file = bucket.file('posts/'+id+'/fullSize.gif')
const writeStream = file.createWriteStream(
    {
        contentType: 'image/gif'
    }
)
console.log('started gif...')
      
return new Promise(function(resolve, reject){
    fetch(post.data.preview.images[0].variants.gif.source.url).then(res => {
        return res.body.pipe(writeStream)
    }).then(() => {
    try{
    return file.getSignedUrl({
        action: 'read',
        expires: '06-26-2222',
        version: "v2"
        })
    }catch(e){
        console.log("Error signing URL")
        fetchedFullSize = null;
        shortFullUrl = null;
        throw(e)
    }

      }).then(async signedUrls => {
        try{
            fetchedGif = await signedUrls[0]
            shortGifUrl = await shortenUrl(fetchedGif)
            console.log("Pushed Gif!")
            resolve('Pushed Gif!')
            return(fetchedGif)
        }catch(e){
            console.log("Error setting URL")
            fetchedFullSize = null;
            shortFullUrl = null;
            throw(e)
        }
    }).catch(e => {
        // console.log(e);
        fetchedGif = null;
        shortGifUrl = null;
        reject(e)
    })
})


}

// async function postImage(img){
//     var full = await pushFullSize(img, ref.id)
//     var thumb = await pushThumbnail(img, ref.id)
//     console.log(full)
//     console.log(thumb)
// }

// async function postGif(img){
//     var gif = await pushGif(img, ref.id)
//     var full = await pushFullSize(img, ref.id)
//     var thumb = await pushThumbnail(img, ref.id)
//     console.log(gif)
//     console.log(full)
//     console.log(thumb)
// }











exports.getDailyBuns = functions.pubsub.schedule('0 8 * * *').timeZone('America/New_York').onRun(context => {
    allFetchedPosts.length = 0;
    ref = firestore.collection('rabbits').doc()
    fetch('https://www.reddit.com/r/rabbits/top.json?t=day&raw_json=1&limit=10')
    
        .then(res => res.json())
        .then(res => res.data.children)
        .then(res => res.map(post => allFetchedPosts.push(post)))
        .then(() => {
        imageOnlyPosts =  allFetchedPosts.filter((x) => x.data.is_video === false);
        post = imageOnlyPosts[0]
        
        
        // console.log(ref.id)
        console.log(post)
        return post

        })
        .then( async(post) => {
            try{
                if(post.data.preview.images[0].variants.gif){
                    await pushGif(post, ref.id)
                }
                    // console.log('started image writing process...')
                    await pushFullSize(post, ref.id)
                    // console.log('ended image writing process...')
                    return post;

            }catch(e){
                console.log("Error at uploading images to storage: " + e)
                return null
            }

           
            
            
                
        }).then((post) => {
            if(post.data.preview.images[0].variants.gif){
                ref.set({ 
                    id: ref.id,
                    title: post.data.title,
                    body: post.data.body ? post.data.body : null,
                    score: post.data.score,
                    permalink: `reddit.com${post.data.permalink}`,
                    numComments: post.data.num_comments,
                    author: post.data.author,
                    dateAddedToDB: new Date,
                    dateAddedToDBMS: Date.now(),
                    subreddit: post.data.subreddit,
                    dateAddedToRedditMS: post.data.created_utc + '000',
                    isLandscape: post.data.preview.images[0].source.width > post.data.preview.images[0].source.height,
                    isVideo: post.data.is_video,
                    isGif: true,
                    images: {
                        photoID: post.data.preview.images[0].id,
                        thumbnail: {uri: null},
                        
                        fullSize: {uri: fetchedFullSize, shortUri: shortFullUrl, width: post.data.preview.images[0].source.width, height: post.data.preview.images[0].source.height, downloadUri: `https://storage.cloud.google.com/dailybuns.appspot.com/posts/${ref.id}/fullSize.jpg`},
                        resolutions: [],            
                    },
                    gifs: {
                        fullSize: {uri: fetchedGif, shortUri: shortGifUrl, width: post.data.preview.images[0].variants.gif.source.width, height: post.data.preview.images[0].variants.gif.source.height, downloadUri: `https://storage.cloud.google.com/dailybuns.appspot.com/posts/${ref.id}/fullSize.gif`},
                        resolutions: []
            
                    }
                }, {merge: true})
            }else{
                ref.set({ 
                    id: ref.id,
                    title: post.data.title,
                    body: post.data.body ? post.data.body : null,
                    score: post.data.score,
                    permalink: `reddit.com${post.data.permalink}`,
                    numComments: post.data.num_comments,
                    author: post.data.author,
                    dateAddedToDB: new Date,
                    dateAddedToDBMS: Date.now(),
                    subreddit: post.data.subreddit,
                    dateAddedToRedditMS: post.data.created_utc + '000',
                    isLandscape: post.data.preview.images[0].source.width > post.data.preview.images[0].source.height,
                    isVideo: post.data.is_video,
                    isGif: false,
                    images: {
                        photoID: post.data.preview.images[0].id,
                        thumbnail: {uri: null},
                        
                        fullSize: {uri: fetchedFullSize, shortUri: shortFullUrl, width: post.data.preview.images[0].source.width, height: post.data.preview.images[0].source.height, downloadUri: `https://storage.cloud.google.com/dailybuns.appspot.com/posts/${ref.id}/fullSize.jpg`},
                        resolutions: [],            
                    }
               }, {merge: true})
            }
                
              return post;
                                    
      



    }).then(() => console.log("Successfully uploaded " + ref.id))
    .catch(err => console.log(err))

        return null
})


exports.generateSubImages = functions.runWith({memory: '2GB', timeoutSeconds: 120}).storage.bucket('dailybuns.appspot.com').object().onFinalize(async (object) => {

        var fileBucket = object.bucket;
        var filePath = object.name;
        var contentType = object.contentType;

        var folder = filePath.split('/')[0];
        var postID = filePath.split('/')[1];
        var fileName = filePath.split('/')[2];

        var ref = firestore.collection('rabbits').doc(postID)
    

    if(contentType.startsWith('image/') && folder === 'posts' && fileName.startsWith('fullSize.jpg')){
        //download file from bucket
        // var bucket = gcs.bucket(fileBucket)
        const metadata = {
            contentType: contentType,
        };
        


        // Sizes of image you want to upload in px
        const sizes = [140, 480, 768];

        const uploadPromises = sizes.map(size => {
            // Create name and path for new image to be created
            var imageUrl = "";
            const newFileName = `resized/jpg/${size}_image.jpg`
            var newFilePath = path.join(path.dirname(filePath), newFileName);
            var file = bucket.file(newFilePath)

            // Created writestream for new image to be saved to
            const newFileUploadStream = bucket.file(newFilePath).createWriteStream({metadata})

            // define pipeline of Sharp that will be addeded to filepath
            const pipeline = sharp()
            
            if(size === 140){
                pipeline.jpeg({
                    quality: 40,
                }).resize(size, size, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.attention
                }).pipe(newFileUploadStream)
            }else{
                pipeline.jpeg({
                    quality: 40,
                }).resize({
                    width: size,
                    fit: sharp.fit.inside
                }).pipe(newFileUploadStream)
            }
            

            

            

  
            
            bucket.file(filePath).createReadStream().pipe(pipeline)

            const streamPromise = new Promise((resolve, reject) => {
                newFileUploadStream.on('finish', resolve).on('error', reject);
            })

            streamPromise.then(() => {
                console.log(`successfully resized ${size}`)
                return file.getSignedUrl({
                    action: 'read',
                    expires: '06-26-2222',
                    version: "v2"
                })
            }).then(url => {
                imageUrl = url[0];
                if(size === 140){
                    return ref.set({
                        images: {
                            resolutions: admin.firestore.FieldValue.arrayUnion({
                                name: `resized_@${size}`, 
                                uri: imageUrl, 
                                width: size}),
                            thumbnail: {
                                width: size,
                                height: size,
                                uri: imageUrl
                            }
                        }
                    }, {merge: true})
                }else{
                    return ref.set({
                        images: {
                            resolutions: admin.firestore.FieldValue.arrayUnion({
                                name: `resized_@${size}`, 
                                uri: imageUrl, 
                                width: size})
                        }
                    }, {merge: true})
                }
                
            }).catch(e => {
                console.log(e)
            })
            
           
                

            

            

                 

            

        })

        await Promise.all(uploadPromises)
        

    
    
    }else{
        return null
        // return console.log("This post has been ignored.")
    }
  });
