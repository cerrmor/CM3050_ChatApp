import { StatusBar } from 'expo-status-bar';
import React, { useState, useLayoutEffect} from 'react';
import { StyleSheet, Text, View, Button, Image, KeyboardAvoidingView, TouchableOpacity, Platform} from 'react-native';
import { auth, storage, database,firebase } from '../config/firebase'
import * as ImagePicker from "expo-image-picker";



const SignUpScreen = ({navigation}) => {
  const [storagePermission, setStoragePermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [value, setValue] = useState({
    id: auth?.currentUser?.uid,
    email: auth?.currentUser?.email,
    password: '',
    firstname: auth?.currentUser?.displayName,
    file: auth?.currentUser?.photoURL,
    error: '',
    msg:''
  })

  const userData ={
    id: '',
    email: '',
    password: '',
    firstname: '',
    file: '',
    error: ''
  }
  
  //sets a custome style to the page header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: { backgroundColor: 'lightblue'},
      headerShadowVisible:false,
    })
  })

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted")
    //alert the user if no permissions granted
    if (cameraPermission === false) {
      alert("Sorry camera access has not been granted by the phone. This can be changed in the app settings menu of your phone");
      return;
    }
    //open the camera is permission is granted
    const result =await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4,3],
      quality:0.5
    });

    if (!result.canceled) {
      await setValue({...value, file:result.assets[0].uri})
    }
  }

  //This function is triggered when the open image button is pressed
  const pickImage = async () => {
    //ask the user for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setStoragePermission(status === "granted")
    //alert the user if no permissions granted
    if(storagePermission === false)
    {
      alert("Sorry image storage access has not been granted by the phone. This can be changed in the app settings menu of your phone");
      return;
    }
    //open the storage is permission is granted
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 0.5,
    });

    if(!result.canceled){
      await setValue({...value, file:result.assets[0].uri})
    }
  }

  //called when update image button is pressed. uploads and stors the new image file 
  const storeImage = async () => {
    let temp = null;
    if(value.file == null) return null;

    const img = await fetch(value.file) 
    let blob = await img.blob()
    
    const metadata = {
      contentType: 'image/jpeg'
    };
    
    const storageRef = storage.ref(`profile/${auth.currentUser.uid}`)
    var uploadTask = storageRef.child('image').put(blob, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      setValue({...value,msg:'Upload is ' + progress + '% done'});
      
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, 
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    }, 
    () => {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        temp = downloadURL;
        value.file = temp;
        updateUserProfile()
      });
    },
    (error)=>{console.log( 'something went wrong updating the user profile =>',error)}
    )
  }

  //updates the user refrence in firbase storage with the new image file
  const updateUserRef = async () =>{
    try{
      await database.collection('users').doc(value.id).set(userData.file)
      console.log('updataing the user ref', userData)
    }
    catch(err){console.log("somthing went wrong storing the user: ",err)}
  }

  //updates the user profile data
  const updateUserProfile= async ()=>{
    try{
      const userRef = database.collection('users')
      const query = userRef.where('id','==',auth?.currentUser?.uid)
      await query.onSnapshot(querySnapshot => {
        querySnapshot.forEach((doc)=>{
          
          userData.id = doc.data().id
          userData.email = doc.data().email
          userData.password = doc.data().password
          userData.firstname = value.firstname
          userData.file = value.file
          userData.error = doc.data().error
          
          if(auth.currentUser.photoURL == doc.data().file)
          {
            //console.log("updating the users profile data", userData.firstname,userData.file)
            auth.currentUser.updateProfile({
              photoURL: userData.file 
            }).then(() => {
              // Update successful
              // ...
              auth.currentUser.reload()
              updateUserRef();
              //console.log('the update was successful', auth.currentUser.displayName)
            }).catch((error) => {
              // An error occurred
              // ...
              console.log('something went wrong the user was not updated => ', error)
            });  
          }
        })
      })
    }
    catch(err){console.log(err)}
  }

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        keyboardVerticalOffset={-500}
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
    >
       
      <StatusBar style="dark" />
      <View style={styles.updateContainer}>
        <View style={styles.updateContainer}>
          <View>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>Click image to change profile pic</Text>
            </View>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.5} >
              <View style={styles.imageContainer}>
                  <Image style={styles.image} source={{uri: value.file || 'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-HD.png'}}/>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{position:'absolute',right:30,bottom:0}}>
            <TouchableOpacity onPress={openCamera}>
              <View style={styles.cameraImageContainer}>
                <Image style={styles.cameraImage} source={require("../assets/camera.png")}/>
              </View>
            </TouchableOpacity>
          </View>
                        
        </View>
        {!!value.error && <View style={styles.error}><Text>{value.error}</Text></View>}
        

        <View style={styles.controls}>
            <View style={styles.buttonContainer}>
                <Button raised
                    title={"Update Image"}
                    color={"#2C69D1"} 
                    onPress={storeImage}
                    style={styles.control} 
                />
                {!!value.msg && <View style={styles.uploading}><Text>{value.msg}</Text></View>}
            </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateContainer:{
    margin:'15%'
  },
  controls: {
    flex: 1,
    alignItems:'center',
    marginTop:'10%'
  },
  instructionText:{
    fontSize:15
  },
  instructionContainer:{
    alignItems:'center',
    marginBottom:'15%'
  },
  buttonContainer: {
    width:150
  },
  control: {
    flex:1,
    marginTop: 10
  },
  textFields:{
    height:50,
    width:200,
    borderWidth:1,
    backgroundColor:'lightgray',
    borderRadius:10,
    justifyContent:'center',
    paddingLeft:6,
    paddingRight:6,
    flexDirection:'row'
  },
  image:{
    width: 250, 
    height: 250, 
    borderRadius: 125
  },
  cameraImage:{
    width: 40, 
    height: 40
  },
  imageContainer:{
    alignItems: 'center',
    justifyContent:'center',
    borderWidth:3,
    borderRadius:125
  },
  cameraImageContainer:{
    width:45,
    height:45,
    borderRadius:25,
    backgroundColor:'lightgray',
    alignItems:'center',
    justifyContent:'center'
  },
  error: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  },
  uploading: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  }
});

export default SignUpScreen