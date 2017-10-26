import React from 'react';
import Header from './Header';
import Order from './Order';
import Inventory from './Inventory.js';
import Fish from './Fish'
import sampleFishes from '../sample-fishes'

import base from '../base';

class App extends React.Component {

  constructor() {
    super();

    this.addFish = this.addFish.bind(this);
    this.loadSamples = this.loadSamples.bind(this);
    this.addToOrder = this.addToOrder.bind(this);

    this.state = {
      fishes: {},
      order: {},
    };
  }

  componentWillMount() {
    //this runs right beofre the app is rendered
    this.ref = base.syncState(`${this.props.params.storeId}/fishes`
      , {
        context: this,
        state: 'fishes',
      });

    //check if any order in local storage
    const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);
    if (localStorageRef) {
      //update app compoonenet order state
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
  }


  addFish(fish) {
    //update state
    const fishes = {...this.state.fishes};

    //add in new fish
    const timestamp = Date.now();
    fishes[`fish-${timestamp}`] = fish;

    //set state
    this.setState({ fishes });
  }

  loadSamples() {
    this.setState({
      fishes: sampleFishes,
    });
  }

  addToOrder(key) {
    const order = {...this.state.order};

    //update or add the new number of fish ordered
    order[key] = order[key] + 1 || 1;

    //update state
    this.setState({ order });
  }

  render() {
    return(
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"/>
          <ul className="list-of-fishes">
            {
              Object.keys(this.state.fishes).map(key =>
                <Fish
                  key={key}
                  index={key}
                  details={this.state.fishes[key]}
                  addToOrder={this.addToOrder}
                />)
            }
          </ul>
        </div>
        <Order
          fishes={this.state.fishes}
          order={this.state.order}
          params={this.props.params}
        />
        <Inventory
          addFish={ this.addFish }
          loadSamples={ this.loadSamples }
        />
      </div>
    );
  }
}

export default App;