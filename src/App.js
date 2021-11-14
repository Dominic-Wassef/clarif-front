import React, { Component } from 'react';
import Particles from 'react-tsparticles';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
 apiKey: '6d57335e1ddd49fe9af8e91e4aea82b4'
});

const particlesOptions = {
  interactivity: {
    events: {
      onClick: {
        mode: "push",
      },
      onDiv: {
        selectors: "#repulse-div",
        enable: true,
        mode: "repulse",
      },
      onHover: {
        mode: "repulse",
      },
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.5,
        size: 40,
      },
      grab: {
        distance: 400,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: {
        value: "#ffffff",
      },
      distance: 150,
      enable: true,
      opacity: 0.5,
    },
    move: {
      attract: {
        rotate: {
          x: 600,
          y: 1200,
        },
      },
      enable: true,
      outModes: {
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
      },
    },
    number: {
      density: {
        enable: true,
      },
      value: 120,
    },
    opacity: {
      random: {
        enable: true,
      },
      value: {
        min: 0.1,
        max: 0.5,
      },
      animation: {
        enable: true,
        speed: 3,
        minimumValue: 0.1,
      },
    },
    size: {
      random: {
        enable: true,
      },
      value: {
        min: 0.1,
        max: 5,
      },
      animation: {
        enable: true,
        speed: 20,
        minimumValue: 0.1,
      },
    },
  },
};

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
  } 
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
    // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
    // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
    // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
    // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
    // is to use a different version of their model that works like the ones found here: https://github.com/Clarifai/clarifai-javascript/blob/master/src/index.js
    // so you would change from:
    // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    // to:
    // .predict('53e1df302c079b3db8a0a36033ed2d15', this.state.input)
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
        if (response) {
          fetch('https://pacific-thicket-24536.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
         <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;

// import React, { Component } from 'react';
// import Particles from 'react-tsparticles';
// import FaceRecognition from './components/FaceRecognition/FaceRecognition';
// import Navigation from './components/Navigation/Navigation';
// import Signin from './components/Signin/Signin';
// import Register from './components/Register/Register';
// import Logo from './components/Logo/Logo';
// import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
// import Rank from './components/Rank/Rank';
// import './App.css';
// import Clarifai from 'clarifai';

// const app = new Clarifai.App({
//  apiKey: '6d57335e1ddd49fe9af8e91e4aea82b4'
// });
 
// const particlesOptions = {
//   interactivity: {
//     events: {
//       onClick: {
//         mode: "push",
//       },
//       onDiv: {
//         selectors: "#repulse-div",
//         enable: true,
//         mode: "repulse",
//       },
//       onHover: {
//         mode: "repulse",
//       },
//     },
//     modes: {
//       bubble: {
//         distance: 400,
//         duration: 2,
//         opacity: 0.5,
//         size: 40,
//       },
//       grab: {
//         distance: 400,
//       },
//     },
//   },
//   particles: {
//     color: {
//       value: "#ffffff",
//     },
//     links: {
//       color: {
//         value: "#ffffff",
//       },
//       distance: 150,
//       enable: true,
//       opacity: 0.5,
//     },
//     move: {
//       attract: {
//         rotate: {
//           x: 600,
//           y: 1200,
//         },
//       },
//       enable: true,
//       outModes: {
//         bottom: "out",
//         left: "out",
//         right: "out",
//         top: "out",
//       },
//     },
//     number: {
//       density: {
//         enable: true,
//       },
//       value: 120,
//     },
//     opacity: {
//       random: {
//         enable: true,
//       },
//       value: {
//         min: 0.1,
//         max: 0.5,
//       },
//       animation: {
//         enable: true,
//         speed: 3,
//         minimumValue: 0.1,
//       },
//     },
//     size: {
//       random: {
//         enable: true,
//       },
//       value: {
//         min: 0.1,
//         max: 5,
//       },
//       animation: {
//         enable: true,
//         speed: 20,
//         minimumValue: 0.1,
//       },
//     },
//   },
// };

// const initialState = {
//   input: '',
//   imageUrl: '',
//   box: {},
//   route: 'signin',
//   isSignedIn: false,
//   user: {
//     id: '',
//     name: '',
//     email: '',
//     entries: 0,
//     joined: ''
//   }
// }

// class App extends Component {
//   constructor() {
//     super();
//     this.state = initialState;
//   }

//   loadUser = (data) => {
//     this.setState({user: {
//       id: data.id,
//       name: data.name,
//       email: data.email,
//       entries: data.entries,
//       joined: data.joined
//     }})
//   }

//   calculateFaceLocation = (data) => {
//     const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
//     const image = document.getElementById('inputimage');
//     const width = Number(image.width);
//     const height = Number(image.height);
//     return {
//       leftCol: clarifaiFace.left_col * width,
//       topRow: clarifaiFace.top_row * height,
//       rightCol: width - (clarifaiFace.right_col * width),
//       bottomRow: height - (clarifaiFace.bottom_row * height)
//     }
//   }

//   displayFaceBox = (box) => {
//     this.setState({box: box});
//   }

//   onInputChange = (event) => {
//     this.setState({input: event.target.value});
//   }

//   onButtonSubmit = () => {
//     this.setState({imageUrl: this.state.input});
//       fetch('http://localhost:3000/imageurl', {
//         method: 'post',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({
//           input: this.state.input
//         })
//       })
//       .then(response => response.json())
//       .then(response => {
//         if (response) {
//           fetch('http://localhost:3000/image', {
//             method: 'put',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({
//               id: this.state.user.id
//             })
//           })
//             .then(response => response.json())
//             .then(count => {
//               this.setState(Object.assign(this.state.user, { entries: count}))
//             })
//             .catch(console.log)

//         }
//         this.displayFaceBox(this.calculateFaceLocation(response))
//       })
//       .catch(err => console.log(err));
//   }

//   onRouteChange = (route) => {
//     if (route === 'signout') {
//       this.setState(initialState)
//     } else if (route === 'home') {
//       this.setState({isSignedIn: true})
//     }
//     this.setState({route: route});
//   }

//   render() {
//     const { isSignedIn, imageUrl, route, box } = this.state;
//     return (
//       <div className="App">
//          <Particles className='particles'
//           params={particlesOptions}
//         />
//         <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
//         { route === 'home'
//           ? <div>
//               <Logo />
//               <Rank
//                 name={this.state.user.name}
//                 entries={this.state.user.entries}
//               />
//               <ImageLinkForm
//                 onInputChange={this.onInputChange}
//                 onButtonSubmit={this.onButtonSubmit}
//               />
//               <FaceRecognition box={box} imageUrl={imageUrl} />
//             </div>
//           : (
//              route === 'signin'
//              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
//              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
//             )
//         }
//       </div>
//     );
//   }
// }

// export default App;