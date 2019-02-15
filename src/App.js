import React, { Component } from 'react';
import './App.css';

var wisdoms = [
  "Semper Ubi Sub Ubi. (Always wear underwear.)",
  "Floss your teeth every day.",
  "You will pay for your sins. If you have already paid, please disregard this message.",
  "Today is a day for firm decisions!! Or is it?",
  "Caution: Keep out of reach of children.",
  "You're growing out of some of your problems, but there are others that you're growing into.",
  "Every cloud engenders not a storm."
]

var authors = [
  "Anonymous",
  "Anonymous",
  "Anonymous",
  "Anonymous",
  "Anonymous",
  "Anonymous",
  "Anonymous"
]

var likes = [
  0,
  0,
  0,
  0,
  0,
  0,
  0
]


class App extends Component {
  constructor(props) {
    super(props);
    
    var index = Math.floor(Math.random() * wisdoms.length);
    
    this.state = {
      wisdom: wisdoms[index],
      author: authors[index]
    };
    
    this.setRandomWisdom = this.setRandomWisdom.bind(this);
    this.addWisdom = this.addWisdom.bind(this);
    this.like = this.like.bind(this);

    
    this.connectWebsocket();
  }
  
  connectWebsocket() {
    if (this.websocket) {
      this.websocket.close();
      delete this.websocket;
    }

    this.websocket = new WebSocket('ws://' + window.location.host  + '/comm');
    this.websocket.onmessage = this.handleMessage.bind(this);
    this.websocket.onclose = () => setTimeout(() => this.connectWebsocket(), 500);
    console.log("FUCK")
  }
  
  handleMessage(event) {
    // get the actual message data
    var message = JSON.parse(event.data);
    
    // add a new wisdom to the array, using the message's wisdom property
    var wisdom = message.wisdom;
    var author = message.author;
    // modify wisdom somehow before pushing?
    console.log(wisdoms.indexOf(wisdom))
    if(wisdoms.indexOf(wisdom) === -1){
      wisdoms.push(wisdom);
      authors.push(author);
      likes.push(0);
      // show the last wisdom
      this.setWisdom(wisdoms.length-1);
    } else {
      likes[wisdoms.indexOf(wisdom)] = message.likes;
      this.setWisdom(wisdoms.indexOf(this.state.wisdom));
    }
  }
  
  setRandomWisdom() {
    var index = Math.floor(Math.random() * wisdoms.length);
    
    this.setWisdom(index);
  }
  
  setWisdom(index) {
    // set wisdom based on an index
    this.setState({
      wisdom: wisdoms[index],
      author: authors[index],
      likes: likes[index]
    });
  }
  
  addWisdom() {
    // ask for wisdom
    var wisdom = prompt("What new wisdom do you offer?");
    var name = this.state.name

    if(wisdom.includes("happy")){
      wisdom = wisdom.replace("happy","😃")
    }
    
    // if there's no name set, ask for name
    while (name == null) {
        name = prompt("What is your name?")
    }
    //add the new names
    wisdoms.push(wisdom);
    authors.push(name);
    likes.push(0);
    //reset names
    this.setState({
      name: name,
    });
    // make a message object
    var message = {
      type: "broadcast", 
      wisdom: wisdom,
      author: name
    };

    // send it as a string to all other browsers
    this.websocket.send(JSON.stringify(message));
    this.setWisdom(wisdoms.length-1);
  }
  
  lastListItems(count = wisdoms.length) {
    // wrap last five wisdoms + authors each in a <li> element
    var lastFiveAuthors = authors.slice(authors.length-count);
    var lastFiveWisdoms = wisdoms.slice(wisdoms.length-count);
    var lastFiveLikes = likes.slice(likes.length-count);
    
    return lastFiveWisdoms.map((wisdom, index) => 
      <div>
        <span className="wisdoms">{wisdom}</span>
        <span className="authors"> -- {lastFiveAuthors[index]} : </span>
        <span className="hearts">{this.addLikes(lastFiveLikes[index])}</span>
      </div>);
  }

  like(){
    var index = wisdoms.indexOf(this.state.wisdom);
    likes[index] = likes[index] + 1;
    this.setWisdom(index)

    var message = {
      type: "broadcast", 
      wisdom: this.state.wisdom,
      author: this.state.name,
      likes: likes[index]
    };

    // send it as a string to all other browsers
    this.websocket.send(JSON.stringify(message));
  }
    
  removeCurrentWisdom() {
    var index = wisdoms.indexOf(this.state.wisdom);
    wisdoms.splice(index, 1);
  }

  addLikes(number){
    var heartString = "";
    for(let i = 0; i < number; i ++){
      heartString += "♥";
    }
    return heartString;
  }
  
  render() {
    return (
      <div className="App">
        <div>
        <span className="wisdom" > 
        {this.state.wisdom} 
        </span>
        <span className="author" > -- {this.state.author} : </span> <span className="hearts">{this.addLikes(this.state.likes)} </span>
        </div>
        <div className="list">
          {this.lastListItems()}
        </div>
        <button className="more" onClick={this.setRandomWisdom}>Another</button>
        <button className="new-wisdom" onClick={this.addWisdom}>New</button>
        <button className="like" onClick={this.like}> ♥ </button>
      </div>
    );
  }
}

export default App;
