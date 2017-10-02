import React from 'react';
import { connect } from 'react-redux';

function fetchIfNecessary(fetchWithProps, hasRequiredProp) {
  function mapDispatchToProps(dispatch, props) {
    return { fetch: () => dispatch(fetchWithProps(props)) };
  }
  return (Component) => {
    class Fetcher extends React.Component {
      componentDidMount() {
        if (!hasRequiredProp(this.props)) {
          this.props.fetch();
        }
      }
      componentDidUpdate() {
        if (!hasRequiredProp(this.props)) {
          this.props.fetch();
        }
      }
      render() {
        return hasRequiredProp(this.props) && <Component {...this.props} />;
      }
    }
    const componentDisplayName = Component.displayName || Component.name || 'Component';
    Fetcher.displayName = `Fetcher(${componentDisplayName})`;
    return connect(null, mapDispatchToProps)(Fetcher);
  };
}

export default fetchIfNecessary;
