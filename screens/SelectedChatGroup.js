import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useLayoutEffect, useRef} from 'react';
import { StyleSheet, Text, TextInput, Keyboard, View, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { auth, database, firebase } from '../config/firebase'

const SelectedChatScreen = ({navigation, route}) => {
    const scrollViewRef = useRef();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  //sets a custome teams and layout to the page headder
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerBackTitle: false,
      headerTitleStyle:{ alignSelf: "flex-start"},
      headerTitleAlign:"center",
      headerStyle: { backgroundColor: 'lightblue'},
      headerTitle:() => (
        <View style={{alignItems:"center"}}>
          <Image 
            style={styles.headerStyle} 
            source={{uri: route.params.displayImage
            || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}
          />
          <Text>{route.params.chatName}</Text>
        </View>
      ),
  })
  }, [navigation,route.params.chatName,route.params.displayImage])

  //retrieves and updates sent and recieved messages in real time
  useEffect(() =>{
    const collectionRef = database.collection('chats').doc(route.params.id).collection("messages");
    const query = collectionRef.orderBy('timeStamp', 'asc');

    const unsubscribe = query.onSnapshot(querySnapshot => {
      setMessages(querySnapshot.docs);
    });
    return () => unsubscribe();
  }, [route.params.id]);

  //this function is triggered when the send button is clicked
  //posts a new document to the firebase database
  const sendMsg = async () => {
    Keyboard.dismiss();
    try{
        const docRef = await database.collection('chats').doc(route.params.id).collection("messages").add({
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: msg,
            user: { _id: auth.currentUser.uid,
                    name: auth.currentUser.displayName,
                    email: auth.currentUser.email,
                    photoURL: auth.currentUser.photoURL}
        })
    }
    catch(err){
        console.error("error when adding document: ", err)
    }
    setMsg("");
  };

  //using a turnary statment populates current user chat messages to the right and all
  //other messages to the left
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          keyboardVerticalOffset={-500}
          behavior={Platform.OS === 'android' ? 'padding' : 'height'}
          style={styles.container}
        >
            <ScrollView ref={scrollViewRef} style={styles.scrollViewStyle} onContentSizeChange={() => scrollViewRef.current.scrollToEnd({animated: true})}>
              {messages.map(message => message?.data()?.user?._id === auth.currentUser.uid?(
                <View
                  key={message.id}
                  style={styles.currentUserMsgContainer}
                >
                  <View style={styles.currentUserChatBubble}>
                    <Image 
                    style={styles.currentUserImage} 
                    source={{uri: message?.data()?.user.photoURL
                    || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}
                    />
                    <Text style={styles.messageText}>{message?.data()?.message}</Text>
                    <Text style={styles.currentUserNametext}>{auth.currentUser.displayName}</Text>
                  </View>
                  <Text></Text>
                </View>
                
                ) : (
                
                <View
                key={message.id}
                style={styles.otherUserMsgContainer}
                >
                  
                  <View style={styles.otherUserChatBubble}>
                    <Image 
                    style={styles.otherUserImage} 
                    source={{uri: message?.data()?.user.photoURL
                    || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}
                    />
                    <Text style={styles.messageText}>{message.data().message}</Text>
                    <Text style={styles.otherUserNameText}>{message.data().user.name}</Text>
                  </View>
                  <Text></Text>
                </View>
              )
              )}
            </ScrollView>
          
            <View style={styles.messagingContainer}>
              <View style={styles.newMessageContainer}>
                <TextInput
                  placeholder='Type Message...'
                  style={styles.textInputStyle}
                  textAlignVertical='center'
                  multiline={true}
                  onSubmitEditing={sendMsg}
                  value={msg}
                  onChangeText={(text) => {setMsg(text)}}
                />

                <TouchableOpacity onPress={sendMsg}>
                  <Image style={styles.sendButtonImage} source={require("../assets/send-icon-png-16.jpg")}></Image>
                </TouchableOpacity>
              </View>
            </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

    )
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'lightblue',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerStyle:{
      width: 30, 
      height: 30, 
      borderRadius: 15
    },
    scrollViewStyle:{
      flex:1, 
      borderWidth:1, 
      padding:5,
      backgroundColor:'lightgray'
    },
    currentUserMsgContainer:{
      flex:1, 
      alignItems:"flex-end", 
      margin:10
    },
    otherUserMsgContainer:{
      flex:1, 
      alignItems:"flex-start",
      margin:10
    },
    currentUserChatBubble:{
      borderRadius:15, 
      padding:5,
      marginRight:10, 
      marginLeft:150, 
      backgroundColor:'cyan'
    },
    currentUserImage:{
      width: 30, 
      height: 30, 
      borderRadius: 15, 
      position:'absolute',
      right:-18, 
      bottom:-18 
    },
    otherUserChatBubble:{
      borderRadius:15,
      padding:5,
      marginLeft:10, 
      marginRight:170,
      backgroundColor:'lightgreen'
    },
    otherUserImage:{
      width: 30, 
      height: 30, 
      borderRadius: 40, 
      position:'absolute',
      left:-18, 
      bottom:-18 
    },
    currentUserNametext:{
      position:'absolute',
      right:15, 
      bottom:-18
    },
    messageText:{
      padding:5
    },
    otherUserNameText:{
      position:'absolute',
      left:15, 
      bottom:-18
    },
    sendButtonImage:{
      width:50, 
      height:60, 
      marginBottom:5, 
      justifyContent:"center",
    },
    messagingContainer:{
      alignItems:"flex-end",
      backgroundColor:'#FFF'
    },
    newMessageContainer:{
      flexDirection:"row",
      alignItems:"flex-end", 
      width:"100%"
    },
    textInputStyle:{
      flex:1, 
      height:50, 
      backgroundColor:"lightblue", 
      borderColor:"lightgrey",
      borderWidth:1,
      borderRadius:10, 
      margin:10,
      paddingLeft:10,
      paddingRight:10
    },
  });
export default SelectedChatScreen
