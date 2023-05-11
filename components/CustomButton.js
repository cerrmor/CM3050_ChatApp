import { View, TouchableOpacity, Image } from "react-native";

const CustomButton = ({...props}) => {

  return(
    <View style= {{paddingRight:5}}>
      <TouchableOpacity onPress={()=>{props.nav}}>
        <Image style={{width: 50, height: 50, borderRadius: 40}} source={{uri: props.bImage}}/>
      </TouchableOpacity>
    </View>
  )
}

export default CustomButton