import { Component } from "react";
import { Menu, Layout, Avatar, Space } from "antd";
// import { signOut, onAuthStateChanged } from "firebase/auth";
// import { auth } from "../firebase/fbconfig";
import { Link } from "react-router-dom";

const { Content, Footer, Header } = Layout;

class PageWrapper extends Component {
  constructor(props) {
    super(props);
    // this.LoginLink = <Link to="/signup">Login</Link>;
    // this.Signout = <div onClick={this.FbSignOut}>Sign out</div>;

    // this.state = {
    //   firebaseUser: null,
    // };
  }

  items() {
    const menuItems = [
      { label: <Link to="/">Landmarkrr</Link>, key: "root" },
      //   { label: <Link to="/home">Home</Link>, key: "home" },
      //   {
      //     label: this.state.firebaseUser ? this.Signout : this.LoginLink,
      //     key: "login-out",
      //   },
    ];
    // if (this.state.firebaseUser)
    //   menuItems.push({
    //     label: this.state.firebaseUser.displayName,
    //     key: "username",
    //     icon: (
    //       <Space direction="horizontal" align="center">
    //         <Avatar
    //           src={<img src={this.state.firebaseUser.photoURL} alt="Profile" />}
    //           size={32}
    //         />
    //       </Space>
    //     ),
    //   });
    return menuItems;
  }

  //   componentDidMount() {
  //     onAuthStateChanged(auth, (user) => {
  //       console.log("onAuthStateChanged()", user);
  //       if (user) {
  //         // User is signed in, see docs for a list of available properties
  //         // https://firebase.google.com/docs/reference/js/auth.user
  //         // console.log("User found! Wrapper.js")
  //         // console.log(`Id: ${uid} Wrapper.js`)
  //         this.setState({ firebaseUser: user });
  //         console.log(user.photoURL);
  //         // ...
  //       } else {
  //         // User is signed out
  //         // ...
  //         // console.log("Signed out. Wrapper.js");
  //         this.setState({ firebaseUser: null });
  //       }
  //     });
  //   }

  //   FbSignOut() {
  //     signOut(auth)
  //       .then(() => {
  //         // Sign-out successful.
  //         console.log("Signed out");
  //       })
  //       .catch((error) => {
  //         // An error happened.
  //         console.log(error);
  //       });
  //   }

  componentWillUnmount() {
    console.log("Component will unmount");
  }

  render() {
    return (
      <div>
        <Layout>
          <Header
            style={{
              position: "sticky",

              width: "100%",
              padding: 0,
              alignItems: "center",
            }}
          >
            <Menu
              theme="dark"
              mode="horizontal"
              items={this.items()}
              defaultSelectedKeys={1}
            />
            ;
          </Header>

          <Content>{this.props.page}</Content>

          {/* <Footer
            style={{
              textAlign: "center",
            }}
          >
            Landmarkrr ©2023 Created by the Awesome Rutam!!
          </Footer> */}
        </Layout>
      </div>
    );
  }
}

export default PageWrapper;
