import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";

//custom list component for building the full user list in newChat
const UserList = ({...props}) =>{
  return(
    <TouchableOpacity onPress={() => props.createChat(props.id,props.name,props.image1,props.image2)}>
      <View style={styles.container}>
        <View>
          <Image style={styles.image} source={{uri: props.image1 || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}/>
        </View>
        <View>
          <Text>{props.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  container:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    margin:'0.25%',
    borderWidth:1,
    backgroundColor:'#D9F8C4',
    borderRadius:10
  },
  image:{
    width: 50,
    height: 50,
    borderRadius:40
  },
})
export default UserList
