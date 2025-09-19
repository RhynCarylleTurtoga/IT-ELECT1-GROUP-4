import React, { useState } from "react";
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
} from "react-native";

export default function Comment() {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const handleLike = () => {
    setLikes(likes + 1);
  };

  const addComment = () => {
    if (text.trim() !== "") {
      setComments([...comments, { author: "rhyn", text }]);
      setText("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Post Section */}
      <View style={styles.post}>
        <Text style={styles.postText}>
          <Text style={styles.bold}>Arian</Text>: imissyouuu 
        </Text>

        {/* Like and Comment Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike}>
            <Text style={styles.button}>👍 Like ({likes})</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.button}>💬 Comment</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input */}
        <View style={styles.addComment}>
          <TextInput 
            style={styles.input} 
            placeholder="Write a comment..." 
            value={text} 
            onChangeText={setText} 
          />
          <TouchableOpacity style={styles.postButton} onPress={addComment}>
            <Text style={styles.postTextButton}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Comment List */}
        <FlatList 
          data={comments} 
          keyExtractor={(item, index) => index.toString()} 
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.commentAuthor}>{item.author}</Text>
              <Text>{item.text}</Text>
            </View>
          )} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  post: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  postText: {
    fontSize: 15,
  },
  bold: {
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 20,
  },
  button: {
    color: "#4267B2", 
    fontWeight: "bold",
  },
  addComment: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  postButton: {
    backgroundColor: "#4CAF50",       
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  postTextButton: {
    color: "#fff",
    fontWeight: "bold",
  },
  comment: {
    backgroundColor: "#f0f2f5",     
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginBottom: 2,
  },
});
