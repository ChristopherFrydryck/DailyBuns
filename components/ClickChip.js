import React from 'react'
import {View, Text, Linking, StyleSheet, TouchableOpacity, Styles, Dimensions} from 'react-native'


const ClickChip = ({fontColor, ...props}) => {
    const style = [styles.chip,  props.style || {}]
    const allProps = Object.assign({}, props,{style:style})  
    return(
        <TouchableOpacity {...allProps}>
            <Text style={{color: fontColor}}>{props.children}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    chip:{
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        marginVertical: 3,
        borderRadius: Dimensions.get('window').width/2,
    }
})

export default ClickChip;