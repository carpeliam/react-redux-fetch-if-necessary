import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import fetchIfNecessary from '../src/fetchIfNecessary';

chai.use(chaiEnzyme());
chai.use(sinonChai);
const expect = chai.expect;

const TestComponent = () => <div />;

describe('fetchIfNecessary', () => {
  let store;
  let fakeAction;
  let Component;
  let wrapper;
  beforeEach(() => {
    store = createStore(state => state);
    sinon.spy(store, 'dispatch');
    fakeAction = sinon.stub().returns({ type: 'fake action' });
    Component = fetchIfNecessary(({ id }) => fakeAction(id), ({ isPresent }) => !!isPresent)(TestComponent);
  });

  it('wraps the component displayName', () => {
    wrapper = mount(<Component store={store} />);
    expect(wrapper.find('Fetcher(TestComponent)')).to.be.present();
  });

  context('when required prop is present', () => {
    beforeEach(() => {
      wrapper = mount(<Component store={store} isPresent={true} />);
    });

    it('renders the given component with props', () => {
      expect(wrapper.find(TestComponent)).to.be.present();
      expect(wrapper.find(TestComponent)).to.have.prop('isPresent', true);
    });
    it('does not dispatch the action on componentDidMount lifecycle method', () => {
      expect(fakeAction).not.to.have.been.called;
      expect(store.dispatch).not.to.have.been.called;
    });
    it('dispatches the action if required prop is not present on update', () => {
      wrapper.setProps({ id: 5, isPresent: false });
      expect(fakeAction).to.have.been.calledWith(5);
      expect(store.dispatch).to.have.been.calledWith({ type: 'fake action' });
    });
  });

  context('when required prop is not present', () => {
    beforeEach(() => {
      wrapper = mount(<Component store={store} id={1} isPresent={false} />);
    });
    it('does not render the given component', () => {
      expect(wrapper.find(TestComponent)).not.to.be.present();
    });
    it('dispatches the action on componentDidMount lifecycle method', () => {
      expect(fakeAction).to.have.been.calledWith(1);
      expect(store.dispatch).to.have.been.calledWith({ type: 'fake action' });
    });
    it('does not dispatch the action again if required prop is present on update', () => {
      wrapper.setProps({ isPresent: true });
      expect(fakeAction).to.have.been.calledOnce;
      expect(store.dispatch).to.have.been.calledOnce;
    });
  });
});
