import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {
    constructor() {
      super();
      this.renderInventory = this.renderInventory.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.renderLogin = this.renderLogin.bind(this);
      this.authenticate = this.authenticate.bind(this);
      this.authHandler = this.authHandler.bind(this);
      this.logout = this.logout.bind(this);


      this.state = {
        uid: null,
        owner: null
      }
    }

    componentDidMount() {
      base.onAuth((user) => {
        if (user) {
          this.authHandler(null, { user });
        }
      });
    }

    handleChange(e, key) {
      const fish = this.props.fishes[key]

      //take a copy of the fish and update it with new data
      const updatedFish = {
        ...fish,
        [e.target.name]: e.target.value
      }

      this.props.updateFish(key, updatedFish);

    }

    renderLogin() {
      return(
        <nav className="login">
          <h2> Inventory</h2>
          <p>Sign in to manage Inventory</p>
          <button className="github" onClick={() => this.authenticate('github')}> Login With Github</button>
          <button className="facebook" onClick={() => this.authenticate('facebook')}> Login With Facebook</button>
          <button className="twitter" onClick={() => this.authenticate('twitter')}> Login With Twitter</button>
        </nav>
        )
    }

    authenticate(provider){
      base.authWithOAuthPopup(provider, this.authHandler);
    }

    authHandler(err, authData) {
      if (err) {
        console.log(err);
        return;
      }

      //grab store info
      const storeRef = base.database().ref(this.props.storeId)

      //query once for store data
      storeRef.once('value', (snapshot) => {
        const data = snapshot.val() || {};

        //claim it as our own if no owner
        if (!data.owner) {
          storeRef.set({
            owner: authData.user.uid
          });
        }

        this.setState({
          uid: authData.user.uid,
          owner: data.owner || authData.user.uid
        });
      });
    }

    logout() {
      base.unauth();
      this.setState({
        uid: null
      });
    }



  renderInventory(key) {
    const fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input
          type="text"
          name="name"
          value={fish.name}
          placeholder="Fish Name"
          onChange={(e) => this.handleChange(e, key)}
        />
        <input
          type="text"
          name="price"
          value={fish.price}
          placeholder="Fish price"
          onChange={(e) => this.handleChange(e, key)}
        />
        <select
          type="text"
          name="status"
          value={fish.status}
          placeholder="Fish status"
          onChange={(e) => this.handleChange(e, key)}>
            <option value="available"> Fresh! </option>
            <option value="unavailable"> Sold Out! </option>
        </select>
        <textarea
          type='text'
          name='desc'
          value={fish.desc}
          placeholder={fish.desc}
          onChange={(e) => this.handleChange(e, key)}
        />
        <input
          type="text"
          name="image"
          value={fish.image}
          placeholder="Fish image"
          onChange={(e) => this.handleChange(e, key)}
        />
      </div>
    )
  }

  render() {
    const logout = <button onClick={this.logout}> Log out </button>

    //check if they are NOT logged in
    if(!this.state.uid) {
      return <div> {this.renderLogin()} </div>
    }
    if(this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry you're not the store owner</p>
          {logout}
        </div>
      )
    }
    return (
      <div>
        <h2> Inventory </h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm
          addFish={ this.props.addFish }
        />
        <button onClick={this.props.loadSamples}> Load Sample Fishes </button>
      </div>
    );
  }
}

Inventory.propTypes = {
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  fishes: React.PropTypes.object.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired

}

export default Inventory;