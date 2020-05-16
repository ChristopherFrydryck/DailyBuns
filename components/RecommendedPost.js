import React from 'react'
import {View, Text, Image, Platform, Linking, StyleSheet, TouchableOpacity, Styles, Dimensions} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import Lightbox from 'react-native-lightbox'
import { TouchableHighlight, TouchableWithoutFeedback } from 'react-native-gesture-handler';


const Recommend = ({post, title, image, icon, onPress, ...props}) => {
    const style = [styles.container,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  
    return(
        <View {...allProps}>
            <Text style={styles.ymal}>You may also like...</Text>
            <View style={styles.box}>
            <TouchableWithoutFeedback>
            <Lightbox 
                    //   activeProps = {{ style:{ width: Dimensions.get('window').width, height: (Dimensions.get('window').width/post.data.images.fullSize.width) * post.data.images.fullSize.height, resizeMode: 'contain'}}}
                      renderContent={() => (
                          <Image source={post.data.isGif && post.data.gifs.fullSize.uri.length > 0 ?{uri: post.data.gifs.fullSize.uri} : post.data.images.fullSize.uri.length > 0 ? {uri: post.data.images.fullSize.uri} : require("../assets/images/ProfilePic-DailyBuns.jpg")} style={{width: Dimensions.get('window').width, height: (Dimensions.get('window').width/post.data.images.fullSize.width) * post.data.images.fullSize.height, resizeMode: 'contain'}}/>
                      )}
                      underlayColor="white"
                    
                    >
                <View>
                {post.data.isGif ?
                <Ionicons style={{position: 'absolute', top: 4, left: 4, zIndex: 10}} name={Platform.OS = 'ios' ? "ios-play-circle" : "md-play-circle"} size={16} color="white" />
                : null }
                 <Image source={post.data.images.thumbnail.uri && post.data.images.thumbnail.uri.split("").length > 0 ? {uri: post.data.images.thumbnail.uri} : post.data.images.fullSize.uri && post.data.images.fullSize.uri.split("").length > 0 ? {uri: post.data.images.fullSize.uri} : require("../assets/images/ProfilePic-DailyBuns.jpg")} style={{width: 64, height: 64, marginRight: 8}}/>
                 </View>
                </Lightbox>
                </TouchableWithoutFeedback>
                <Text numberOfLines={3} style={{flex: 1, paddingRight: 8}}>{post.data.title}</Text>
                <TouchableOpacity onPress={onPress}>
                    <Ionicons name={icon} size={26} style={{paddingHorizontal: 16}} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    ymal:{
        fontSize: 16,
        color: 'gray'
    },
    box:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginHorizontal: 4,
        marginVertical: 3,
        borderWidth: 2,
        borderColor: '#d1d3d7',
        borderRadius: 5,
    }
})

export default Recommend;