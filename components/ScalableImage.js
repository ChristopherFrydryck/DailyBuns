import React from 'react'
import { StyleSheet, Dimensions, Image} from 'react-native';

const ScalableImage = ({post, underlayColor, ...props}) => {
    const style = [styles.img,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  

    var imageHandle = (post) => {
    
        var imgURL = null;
        var width = Dimensions.get('window').width;
        var fourEighty = post.data.images.resolutions.filter(x => x.width == 480);
        var sevenSixtyEight = post.data.images.resolutions.filter(x => x.width == 768);
  
        if(post.data.isGif && post.data.gifs.fullSize.uri != null && post.data.gifs.fullSize.uri.split('').length != 0){
        //   console.log("Post is full size gif")
          imgURL = post.data.gifs.fullSize.uri;
        }else{
          if(post.data.images.resolutions.length == 0 && post.data.images.fullSize.uri != null && post.data.images.fullSize.uri.split('').length != 0){
            // console.log("Post is full size img")
            imgURL = post.data.images.fullSize.uri;
          }else{
            if(width <= 520 && fourEighty.length == 1){
            //   console.log("Post is 480 img")
             imgURL = fourEighty[0].uri
            }else if(width <= 800 && sevenSixtyEight.length == 1){
            //   console.log("Post is 768 img")
              imgURL = sevenSixtyEight[0].uri
            }else{
            //   console.log("Post is errored")
              imgURL = null
            }
          }
        }
  
        if(imgURL){
          // console.log(`{uri: "${imgURL}"}`)
          return imgURL
        }else{
          return null;
        }
      }

    //   console.log(`image is : ${imageHandle(post)}`)

    return(
        <Image underlayColor={underlayColor}
        source={imageHandle(post) ? {uri: imageHandle(post)} : require("../assets/images/Error.jpg")} {...allProps}/>
    )
}

const styles = StyleSheet.create({
    img: {
        height: null,
        width:null,
        resizeMode: 'cover'
    }
})

export default ScalableImage;