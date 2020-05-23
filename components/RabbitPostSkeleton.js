import React from 'react'
import {View, Dimensions, StyleSheet} from 'react-native'
import { Card } from 'react-native-paper'
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'

const RabbitPostSkeleton = () => {
    return(
        <Card elevation={5} style={styles.container}>
          
          <ShimmerPlaceHolder 
            autoRun={true} 
            widthShimmer={.55} 
            width={Dimensions.get('window').width * 0.80} 
            height={245} 
            style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5}}
          />
          <View style={styles.sharePlaceholder}></View>

          <View style={{paddingHorizontal: 8, flex: 1, paddingBottom: 8}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <ShimmerPlaceHolder 
                autoRun={true} 
                widthShimmer={.55} 
                width={200} 
                height={24} 
                style={{ marginTop: 8}}
              />
              <View
                style={styles.favoritesPlaceholder}
              ></View>
            </View>
            <View style={{flex: 1, justifyContent: 'space-between'}}>
            <ShimmerPlaceHolder 
              autoRun={true} 
              widthShimmer={.55} 
              width={120} 
              height={16} 
              style={{ marginTop: 8}}
            />
            <ShimmerPlaceHolder 
                autoRun={true} 
                widthShimmer={.55} 
                height={32} 
                width={Dimensions.get('window').width * 0.8 - 16}
              />
              </View>
          </View>
          
     
          
            

        </Card>

    )
}

const styles = StyleSheet.create({
    container:{
        height: 360, 
        width: Dimensions.get('window').width * 0.80, 
        marginHorizontal: 12, 
        marginBottom: 12
    },
    sharePlaceholder:{
        width: 100, 
        height: 35, 
        backgroundColor: 'white', 
        position: "absolute", 
        top: 8, 
        right: 8, 
        borderRadius: 50
    },
    favoritesPlaceholder:{
        width: 60, 
        height: 60, 
        marginTop: -30, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.25, 
        shadowRadius: 5, 
        backgroundColor: 'white', 
        borderRadius: Dimensions.get("window").width/2
    }
})

export default RabbitPostSkeleton
