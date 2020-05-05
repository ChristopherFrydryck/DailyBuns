import React from 'react'
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Image, Text, Platform } from 'react-native'
import Lightbox from 'react-native-lightbox'
import { Ionicons } from '@expo/vector-icons'




const ProfilePicture = ({source, alt, onPress, width, height, edit, ...props}) => {
    const style = [styles.container,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  

    var defaultImage = require("../assets/images/ProfilePic-DailyBuns.jpg")

    if(source){
        return(
            <View {...allProps}>
              {props.editable ?
                <TouchableOpacity onPress={onPress} style={styles.overlay}> 
                  <Ionicons size={24} style={{padding: 24, color: 'white', position: 'absolute', zIndex: 999, backgroundColor: 'rgba(64, 64, 64, 0.4)', borderRadius: Dimensions.get('window').width/2}} name={Platform.OS = 'ios' ? 'ios-create' : 'md-create'} />
                  <Image source={source} 
                  style={{borderRadius: Dimensions.get('window').width/2, width: height, height: height}}
                  />
              </TouchableOpacity>
              :
            <Lightbox 
              renderContent = {() => (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image 
                        style={{borderRadius: Dimensions.get('window').width/2, width: Dimensions.get('window').width - 40, height: Dimensions.get('window').width - 40}}
                        source = {source}
                        resizeMode = "cover"
                        accessible={true}
                        loadingIndicatorSource={<ActivityIndicator />}
                    />
                    </View>
              )}
            >
              <Image source={source} 
              style={{borderRadius: Dimensions.get('window').width/2, width: height, height: height}}
              />
            </Lightbox>
            }
            </View>
        )
    }else{
        return(
            
            <View {...allProps}>
            {props.editable ?
              <TouchableOpacity onPress={onPress} style={styles.overlay}> 
              <Ionicons size={24} style={{padding: 24, color: 'white', position: 'absolute', zIndex: 999, backgroundColor: 'rgba(64, 64, 64, 0.4)', borderRadius: Dimensions.get('window').width/2}} name={Platform.OS = 'ios' ? 'ios-create' : 'md-create'} />
                <Image source={defaultImage} style={{borderRadius: Dimensions.get('window').width/2, width: height, height: height}}
                />
              </TouchableOpacity>
            :
            <Lightbox 
              renderContent = {() => (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image 
                        style={{borderRadius: Dimensions.get('window').width/2}}
                        source = {defaultImage}
                        resizeMode = "cover"
                        accessible={true}
                        loadingIndicatorSource={<ActivityIndicator />}
                    />
                    </View>
              )}
            >
              <Image source={defaultImage} 
              style={{borderRadius: Dimensions.get('window').width/2, width: height, height: height}}
              />
            </Lightbox>
            } 
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2,
    },
    editIcon:{
      
    },
    overlay: {
      borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
})

export default ProfilePicture;