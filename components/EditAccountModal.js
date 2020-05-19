import React, {Component} from "react"
import {Modal, Platform, SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import ProfilePicture from '../components/ProfilePicture'
import { Ionicons } from '@expo/vector-icons';

import { inject, observer } from 'mobx-react';



@inject("UserStore")
@observer
class EditAccountModal extends Component{
constructor(props){
    super(props);
}


render(){
    var {UserStore} = this.props
    return(
        <Modal
            animationType="slide"
            title="Edit Account"
            visible={this.props.visible}
            transparent={false}
            onRequestClose={this.props.onRequestClose}
            closeAction = {this.props.closeAction}
          > 
            <SafeAreaView style={{flex: 1, paddingHorizontal: 9}}>
              <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', zIndex: 99, height: 48, alignItems: 'center', paddingHorizontal: 16}}>
                   <Text>Edit Account</Text>
                   <TouchableOpacity onPress={this.props.closeButtonPressed}>
                    <Ionicons size={48} style={{color: 'black'}} name={Platform.OS = 'ios' ? 'ios-close' : 'md-close'} />
                   </TouchableOpacity>
                </View>
                <View style={{display: "flex", flexDirection: 'row', paddingHorizontal: 8}}>
                {this.props.imageUploading ?
                  <View style={{width: 60, height: 60, marginRight: 16, elevation: 2}}>
                  <ActivityIndicator />
                </View>
                :UserStore.photo && this.props.imageUploading == false ?  
                  <ProfilePicture 
                    editable={true} 
                    onPress={this.props.imagePressed} 
                    style={{marginRight: 16}} 
                    source={{uri: UserStore.photo}} 
                    width={60} 
                    height={60}
                  />
                :
                  <ProfilePicture 
                    editable={true} 
                    onPress={this.props.imagePressed} 
                    style={{marginRight: 16}} 
                    width={60} 
                    height={60}
                  />
                }
            </View>
            <ScrollView style={{paddingHorizontal: 8, marginTop: 8,}} contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}>
            {this.props.children}
            </ScrollView>
              
            </SafeAreaView>
          </Modal>
    )
    }
}

const styles = StyleSheet.create({

})

export default EditAccountModal;