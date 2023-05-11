import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { database } from "../config/firebase";

//custome list component for creating clickable chat room elements
const ChatList = ({id,chat,user,enterChat}) =>{
  const [chatMessages, setChatMessages] = useState([]);
  const [newestMessage, setNewestMessage] = useState(0);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() =>{
    //gets the most reasent message for displaying and populating element such as name 
    //listens for changes and updates in real time
    const fetchMessages = async () =>{
      const collectionRef = database.collection('chats').doc(id).collection('messages');
      const query = collectionRef.orderBy('timeStamp')

      const unsubscribe = await query.onSnapshot(querySnapshot => {
        let temp = []
        querySnapshot.forEach(doc=>{
          temp.push(doc.data())
        })
          setChatMessages(temp);
          setNewestMessage(temp.length - 1)
      },
      (error)=>{console.log("there was an error fetching messages",error )});
      
      return () => unsubscribe();
    }

    //sets the name of the chat to the room name
    const chatName =() => {
      if(typeof(chat?.chatName) !== 'object')
      {
        setName(chat?.chatName)
        setPhoto(chat?.photoURL)
      }
      else
      {
        if(chat?.chatName?.name1 == user?.displayName) 
        {
          setName(chat?.chatName?.name2)
          setPhoto(chat?.photoURL?.image2?.photo)
        }
        else 
        {
          setName(chat?.chatName?.name1)
          setPhoto(chat?.photoURL?.image1?.photo)
        }

      }
    }
    fetchMessages();
    chatName();
  }, [chat?.chatName,chat?.photoURL,id,user?.displayName]);
  
  //returns a loading message if the chats have not yet been populated
  if(chatMessages == []) return(<View><Text>still loading...</Text></View>)
  
  return(
    <TouchableOpacity onPress={() => enterChat(id, name, photo)}>
      <View style={styles.container}>
        <View style={styles.chatContainer}>
          <Image style={styles.image} 
                source={{uri: photo || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}
          />
          <View>
            <View>
              <Text style={styles.chatName}>{name}</Text>
            </View>
            <View style={styles.chatMsgContainer}>
              <Text>
                {newestMessage === -1 && "No Messages Here Yet"}
                {chatMessages[newestMessage]?.user?.name}
                {newestMessage !== -1 && ":"}
                {chatMessages[newestMessage]?.message}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  container:{
    flexDirection:"row", 
    borderBottomWidth:1, 
    backgroundColor:'#D9F8C4'
  },
  chatContainer:{
    flexDirection:"row"
  },
  chatMsgContainer:{
    marginRight:85
  },
  chatName: {
    fontWeight:'bold',
    fontSize:16
  },
  image:{
    width: 50, 
    height: 50, 
    borderRadius: 40
  },
});
export default ChatList