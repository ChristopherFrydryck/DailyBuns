import React, { PureComponent } from 'react'
import {View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions, Platform, Image, Share} from 'react-native';
import { Card, Button} from 'react-native-paper';
import Lightbox from 'react-native-lightbox';
import { Ionicons } from '@expo/vector-icons';
import { inject, observer } from 'mobx-react';
import Colors from '../constants/Colors'
import ScalableImage from '../components/ScalableImage'

//Firebase Imports
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from '../firebaseConfig';


// Initlialized FB Vars
if (!firebase.apps.length) {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
    const firebaseAppAuth = firebaseApp.auth();
  }

@inject("UserStore", "PostStore")
@observer
class RabbitPost extends PureComponent {
  

    constructor(props){
        super(props)

        this.state = {
            rerender: false,
        }

        this.onShare = this.onShare.bind(this)
        this.toggleFavorite = this.toggleFavorite.bind(this)

       

    }

   

    onShare = async (post) => {
      var uri = "";

      if(post.data.isGif){
        if(post.data.gifs.fullSize.shortUri){
          uri = post.data.gifs.fullSize.shortUri;
        }else{
          uri = post.data.gifs.fullSize.uri;
        }
      }else{
        if(post.data.images.fullSize.shortUri){
          uri = post.data.images.fullSize.shortUri;
        }else{
          uri = post.data.images.fullSize.uri;
        }
      }
      
        try {
          const result = await Share.share({
            title: 'Check out this post from DailyBuns!',
            message: post.data.title + ": " + uri,
            url: post.data.permalink,
          });
    
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          alert(error.message);
        }
    
  

      };


      toggleFavorite = (post) => {
        let ident = post.id
        var d = new Date().getTime();
    
        // force rerender
        this.setState({reRender: !this.state.reRender})
    
        let {favorites} = this.props.UserStore
        let postsFavorited = [];
        let postsFavoritedID = [];
    
        const db = firebase.firestore();
        const users = db.collection('users');
    
        favorites.map(x => {
          postsFavorited.push(x)
        })
    
        postsFavorited.map(x => {
          postsFavoritedID.push(x.id)
        })
    
    
        if (postsFavoritedID.includes(ident)){
          console.log('already favorited')
          var index = postsFavoritedID.indexOf(ident);
          if(index !== -1){
            postsFavorited.splice(index, 1)
            favorites.clear();
            for(let i = 0; i < postsFavorited.length; i++){
              favorites.push(postsFavorited[i])
            }
            users.doc(this.props.UserStore.userID).set({
              favorites: favorites
            }, {merge: true})
          }
        }else{
          
       
          
          console.log('favoriting...')
          favorites.push({time: d, id: ident, data: post.data})
          
          users.doc(this.props.UserStore.userID).set({
            favorites: favorites
          }, {merge: true})
    
          
    
          
    
        }
    
       
    
    
        // console.log(this.props.UserStore.favorites.includes(id))
    
        // console.log(this.props.UserStore.favorites[0].id)
        
    
    
      }


      

    render(){
        let {favorites} = this.props.UserStore;
        let favoriteIDs = [];

      
        
        
       

        for(let i = 0; i < favorites.length; i++){
            favoriteIDs.push(favorites[i].id)
        }
        
        return(
          
            // <Text>{this.props.author}</Text>
        <Card
        elevation={5}
        style={{ maxHeight: 480, width: Dimensions.get('window').width * 0.80, marginHorizontal: 12, marginBottom: 12}}
        >
        <View style={styles.shareContainer}>
          <Text style={this.props.UserStore.viewed.includes(this.props.item.id) ? styles.viewed : null}>{this.props.UserStore.viewed.includes(this.props.item.id) ? 'Viewed' : null}</Text>
          <TouchableOpacity onPress={() => this.onShare(this.props.item)} style={styles.shareContainerTO}>
            <Text style={{color: 'white', marginRight: 8}}>Share</Text>
          <Ionicons name={Platform.OS = 'ios' ? "ios-share-alt" : "md-share-alt"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        
        
   
        <Lightbox 
          renderContent = {() => (
            <Image 
            style={{width: Dimensions.get('window').width, height: (Dimensions.get('window').width/this.props.item.data.images.fullSize.width) * this.props.item.data.images.fullSize.height, resizeMode: 'contain'}} 
            source={{uri: this.props.item.data.isGif ? this.props.item.data.gifs.fullSize.uri : this.props.item.data.images.fullSize.uri}}/>
          )}
          underlayColor="white"
        >
          
          <ScalableImage style={{borderTopLeftRadius: 5, borderTopRightRadius: 5, height: 245}} post={this.props.item}/>
          {/* <Card.Cover style={{borderTopLeftRadius: 5, borderTopRightRadius: 5, height: 245}} 
          source= {this.state.imgSuccess ? {uri: this.state.imgUrl} : require("../assets/images/Error.jpg")}
          // defaultSource={require("../assets/images/ProfilePic-DailyBuns.jpg")}
          // source={this.props.item.data.isGif && this.props.item.data.gifs.fullSize.uri.length > 0 ?{uri: this.props.item.data.gifs.fullSize.uri} : this.props.item.data.images.fullSize.uri.length > 0 ? {uri: this.props.item.data.images.fullSize.uri} : require("../assets/images/ProfilePic-DailyBuns.jpg")}
          /> */}
          </Lightbox>
        <Card.Content>

          <View style={{display: 'flex', flexDirection: "row"}}>
          <Text numberOfLines={3} ellipsizeMode="tail" style={styles.title}>{this.props.item.data.title}</Text>
            <TouchableOpacity onPress={() => this.toggleFavorite(this.props.item)} activeOpacity={0.8}>
                <View style={styles.circle}>
                 <Ionicons name={favoriteIDs.includes(this.props.item.id) ?"ios-heart" : "ios-heart-empty"} size={26} color="red" />
                </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.subTitle}>Posted {this.props.item.data.dateToday} by u/{this.props.item.data.author}</Text>

      
          
        </Card.Content>
        <Card.Actions style={{position: 'absolute', bottom: 0}}>
            <Button onPress={()=>{ Linking.openURL(`https://www.${this.props.item.data.permalink}`)}} icon="reddit" mode="contained" style={{backgroundColor: Colors.tintColor, justifyContent: 'flex-end', width: '100%'}}>View {this.props.item.data.numComments}+ Comments</Button>
        </Card.Actions>
        
        
      </Card>
      
    )
        
    }
}

const styles = StyleSheet.create({
    shareContainer:{
        display: "flex",
        width: Dimensions.get("window").width * 0.80,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute', 
        zIndex: 1,
      },
      shareContainerTO:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(66, 66, 66, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginRight: 8,
        marginTop: 8,
        borderRadius: 50,
      },
      viewed: {
        backgroundColor: 'rgba(66, 66, 66, 0.6)',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
      },
      title: {
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 8,
        flex: 8,
        marginRight: 8,
      },
      subTitle: {
        fontSize: 12,
        color: '#b0b0b0',
        marginTop: 2,
        marginBottom: 60,
      },
      circle: {
        width: 60, 
        height: 60, 
        backgroundColor: 'white', 
        borderRadius: Dimensions.get("window").width/2,
        marginTop: -20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,  
        display: "flex",
        alignItems: "center",
        justifyContent: 'center',
      }
})

export default RabbitPost