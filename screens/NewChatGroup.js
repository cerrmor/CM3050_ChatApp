import { StatusBar } from 'expo-status-bar';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from 'react-native';
import { database, auth, firebase } from '../config/firebase'
import UserList from '../components/UserList'

const NewChatGroupScreen = ({navigation}) => {
  const [chatGroup, setChatGroup] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState('');
  const [allUser, setAllUser] = useState([]);
  const [allUserBackup, setAllUserBackup] = useState([]);
  const [user, setUser] = useState([]);
  
  //rerenders elements on change
  useEffect(()=>{
    getAllUser();
    getCurrentTime();
  }, [])

  //sets a custome style to the page header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add a new Chat",
      headerBackTitle: "Chats",
      headerStyle: { backgroundColor: 'lightblue'},
    })
  })

  //querys the firebase database and creats 2 copies of a list of all current user
  const getAllUser = async () => {
    let temp = []
    let temp2 = []
    try{
      const userRef = database.collection('users')
      const query = userRef.where('id', '!=', auth?.currentUser?.uid)
      const query2 = userRef.where('id','==',auth?.currentUser?.uid)
      const unsubscribe = await query.get().then(querySnapshot => {
        querySnapshot.forEach((doc)=>{
          temp.push(doc.data())
        })
      })
      .then(()=>{
        query2.get().then(querySnapshot =>{
          temp2.push(querySnapshot.docs)
          setUser(temp2)
        })
      })
      .catch(err=>console.log('trouble getting all users => ',err))
      .then(()=>{
        setAllUser(temp);
        setAllUserBackup(temp);
      })
    }
    catch(err){console.log(err)}
  }

  // allows a user to search the list of all users based off entered values
  const searchUser = (val) =>{
    setSearch(val);
    setAllUser(allUserBackup.filter((it)=>it.firstname.toLowerCase().match(val.toLowerCase())))
  }

  //returns custome format of the local current time
  const getCurrentTime = () => {
    let today = new Date();
    let month = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"];
    let year = today.getFullYear();
    let monthIndex = today.getMonth();
    let day = (today.getDate() < 10 ? '0' : '') + today.getDate();
    let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
    let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
    let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
    setTime(`${year}/${month[monthIndex]}/${day} at ${hours}:${minutes}:${seconds}`);
  }

  //creates a unique id by joining two user ID's
  //used for creating private chat rooms
  const chatID = (chateeUID) => {
    const chatterID = auth?.currentUser?.uid;
    const chateeID = chateeUID;
    const chatIDpre = [];
    chatIDpre.push(chatterID);
    chatIDpre.push(chateeID);
    chatIDpre.sort();
    return chatIDpre.join('_');
  };
  
  //takes in the chat id, name and image of the intended chatee and the image of the current user
  //creates a refrence of the private chat linked to both chatter and chattee
  //returns the current user to the chat screen after creating the room with a welcome message
  const createPrivateChat = async (chateeID, name, image1, image2) => {
    let chatter = auth.currentUser.displayName
    getCurrentTime();
    let chatname = {name1:name, name2:chatter}
    
    try{
      const docRef = await database.collection("chats").doc(chatID(chateeID)).set({
        chatType: 'Private',
        chatName: chatname,
        chatId: chatID(chateeID),
        photoURL: {
          image1:{
            name: name,
            photo:image1
          },
          image2:{
            name: user[0][0].data().firstname,
            photo:image2
          }
        },
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(async () =>{
        const docRef2 = await database.collection('chats').doc(chatID(chateeID)).collection("messages").add({
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          message: `Welcome to this private chat created on ${time}`,
          user: { _id: "N/A",
                  name: "ChatApp",
                  email: "N/A",
                  photoURL: 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}
        })
      }).then(async () => {
        const chatterDocRef = await database.collection('users').doc(`${auth.currentUser.uid}`).collection('privateChats').add({
          chatId:chatID(chateeID)
        })
        const chateeDocRef = await database.collection('users').doc(`${chateeID}`).collection('privateChats').add({
          chatId:chatID(chateeID)
        })
      })
      .catch((err)=>console.log("something went wrong with creating the new chat",err))
      navigation.goBack()
    } catch(err){
      console.error("error adding document: ", err)
    }
  }

  //creates a public chat room discoverable to all users
  //returns the current user to the chat screen after creating the room with a welcome message
  const createGroupChat = async () => {
    getCurrentTime
    
    try{
      const docRef = await database.collection("chats").add({
        chatType: "GroupChat",
        chatName: chatGroup,
        createdBy: auth?.currentUser?.uid,
        photoURL: 'https://i.pravatar.cc/300',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(async (value) =>{
        const docRef2 = await database.collection('chats').doc(value.id).collection("messages").add({
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          message: `Welcome to the Group Chat "${chatGroup}" created on ${time}`,
          user: { _id: "N/A",
                  name: "ChatApp",
                  email: "N/A",
                  photoURL: 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}
        })
      })
      .catch(console.log("message is being added this make take a moment"))
      navigation.goBack()
    } catch(err){
      console.error("error adding document: ", err)
    }
  }
    
  //using a turnary statement return either a loading view while the user list is being populated
  //or the full view
  //populates the user list by calling the custome user list component
    return (
        <KeyboardAvoidingView keyboardVerticalOffset={-500}
                              behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                              style={styles.container}>
          <StatusBar style="dark" />
          <View style={styles.createContainer}>
              <View style={styles.textFields}>
              <TextInput 
                placeholder='New Chat Group Name...' 
                value={chatGroup} 
                onChangeText= {(text) => setChatGroup(text)} 
                />
              </View>
              <View style={styles.button}>
              <Button 
                title={"Create Chat"}
                onPress={createGroupChat}
                disabled={!chatGroup}/>
              </View>
          </View>
          { user.length !== 0?(
          <View style={styles.searchContainer}>
              <View style={styles.textFields}>
                <TextInput 
                  placeholder='Search For A User ... 🔎' 
                  onChangeText= {(text) => {searchUser(text)}}/>
              </View>
              <ScrollView style={styles.scrollContainer}>
              <View style={styles.userListContainer}>
              {
                allUser.map(doc =>( 
                    <UserList key={doc.id}
                              id={doc.id}
                              name={doc.firstname}
                              image1={doc.file}
                              image2={user[0][0].data().file}
                              createChat={createPrivateChat}
                    ></UserList>
                ))
              }
              </View>
              </ScrollView>
          </View>
          ):(
            <View style={styles.searchContainer}>
              <View style={styles.textFields}>
                <TextInput 
                  placeholder='Search For A User ... 🔎' 
                  onChangeText= {(text) => {searchUser(text)}}/>
              </View>
              <ScrollView style={styles.scrollContainer}>
              <View style={styles.userListContainer}>
              <Text>User List is loading...</Text>
              </View>
              </ScrollView>
          </View>
          )}
        </KeyboardAvoidingView>
    )
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FCFFE7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer:{
      flex:1,
      width:'100%',
      alignItems:'center',
    },
    createContainer:{
      height:Dimensions.get('window').height * 0.17,
      width:'100%',
      alignItems:'center',
      borderWidth:1,
      padding:10,
      justifyContent:'center'
    },
    button:{
      width:'90%'
    },
    userListContainer:{
      width:'100%'
    },
    scrollContainer:{
      flex:1,
      width:'95%',
      height:'100%',
      borderWidth:1, 
      padding:5,
      backgroundColor:'lightgray',
      marginBottom:5
    },
    textFields:{
      height:50,
      width:'90%',
      margin:'1%',
      borderWidth:1,
      backgroundColor:'lightgray',
      borderRadius:10,
      justifyContent:'center',
      paddingLeft:6,
      paddingRight:6,
      flexDirection:'row'
    },
  });
export default NewChatGroupScreen