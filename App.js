import React, { Component } from "react";
import Navbar from "./components/Navbar";

// Redux
import { Provider } from "react-redux";
import store from "./redux/store";

// Pages
import AboutPage from "./pages/AboutPage";
import TasksPage from "./pages/TasksPage";

// React Router
import { BrowserRouter as Router, Route } from "react-router-dom";

export class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Navbar />
          <Route exact path="/" component={TasksPage} />
          <Route exact path="/about" component={AboutPage} />
        </Router>
      </Provider>
    );
  }
}

export default App;
